import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import { ghnService } from '../services/ghnService';
import { voucherService } from '../services/voucherService';
import axios from 'axios';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  QrCode, 
  Ticket, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  MapPin,
  User,
  Phone,
  Store,
  Tag
} from 'lucide-react';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('qr'); // 'qr', 'cod', 'store'

  // GHN Address State
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // Voucher State
  const [vouchers, setVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState(location.state?.appliedVoucher?.code || '');
  const [appliedVoucher, setAppliedVoucher] = useState(location.state?.appliedVoucher || null);
  const [discountAmount, setDiscountAmount] = useState(location.state?.discountAmount || 0);
  const [voucherError, setVoucherError] = useState('');

  useEffect(() => {
    const initCheckout = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/login?redirect=/checkout');
        return;
      }

      let items = location.state?.selectedItems;
      if (!items || items.length === 0) {
        try {
          const cart = await cartService.getMyCart();
          items = cart?.items || [];
        } catch (err) {
          items = [];
        }
      }

      if (!items || items.length === 0) {
        navigate('/cart');
        return;
      }

      setCartItems(items);
      if (user.full_name) setRecipientName(user.full_name);
      if (user.phone) setRecipientPhone(user.phone);
      if (user.address) setAddressDetail(user.address);

      // Fetch fresh profile from API to ensure address is always accurate
      if (user.id) {
        userService.getUserById(user.id).then(res => {
          const freshUser = res?.data || res;
          if (freshUser) {
            if (freshUser.full_name) setRecipientName(freshUser.full_name);
            if (freshUser.phone) setRecipientPhone(freshUser.phone);
            if (freshUser.address) setAddressDetail(freshUser.address);
          }
        }).catch(() => {});
      }

      // Fetch GHN Provinces
      ghnService.getProvinces().then(res => {
        if (res?.data) setProvinces(res.data);
      }).catch(() => {});

      // Fetch active vouchers
      try {
        const vList = await voucherService.getActiveVouchers();
        const raw = Array.isArray(vList) ? vList : (vList?.data || []);
        setVouchers(Array.isArray(raw) ? raw : []);
      } catch (err) {
        console.error('Lỗi tải voucher:', err);
      }
    };

    initCheckout();
  }, [navigate]);

  // Province change
  const handleProvinceChange = async (e) => {
    const pId = e.target.value;
    setSelectedProvince(pId);
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    setShippingFee(0);

    if (pId) {
      try {
        const res = await ghnService.getDistricts(pId);
        if (res?.data) setDistricts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // District change
  const handleDistrictChange = async (e) => {
    const dId = e.target.value;
    setSelectedDistrict(dId);
    setSelectedWard('');
    setWards([]);
    setShippingFee(0);

    if (dId) {
      try {
        const res = await ghnService.getWards(dId);
        if (res?.data) setWards(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const calculateShippingFee = async (dId, wCode) => {
    if (!dId || !wCode) {
      setShippingFee(0);
      return;
    }

    setIsCalculatingFee(true);
    try {
      let totalWeight = 0;
      let maxLength = 20;
      let maxWidth = 20;
      let maxHeight = 10;

      cartItems.forEach(item => {
        let weight = 500;
        let length = 20;
        let width = 20;
        let height = 10;

        if (item.technical_specs) {
          try {
            const specs = typeof item.technical_specs === 'string' ? JSON.parse(item.technical_specs) : item.technical_specs;
            if (specs.weight_g) weight = parseInt(specs.weight_g);
            if (specs.length) length = parseInt(specs.length);
            if (specs.width) width = parseInt(specs.width);
            if (specs.height) height = parseInt(specs.height);
          } catch (e) {}
        }
        totalWeight += weight * (item.quantity || 1);
        maxLength = Math.max(maxLength, length);
        maxWidth = Math.max(maxWidth, width);
        maxHeight += height * (item.quantity || 1);
      });

      if (maxHeight > 200) maxHeight = 200;

      const payload = {
        to_district_id: parseInt(dId),
        to_ward_code: String(wCode),
        weight: totalWeight || 1000,
        length: maxLength || 20,
        width: maxWidth || 20,
        height: maxHeight || 10
      };

      const resData = await ghnService.calculateFee(payload);
      if (resData && resData.data && resData.data.total) {
        setShippingFee(resData.data.total);
      }
    } catch (err) {
      console.error('Lỗi tính phí vận chuyển GHN:', err);
    } finally {
      setIsCalculatingFee(false);
    }
  };

  // Ward change -> Calculate shipping fee
  const handleWardChange = async (e) => {
    const wCode = e.target.value;
    setSelectedWard(wCode);

    if (selectedDistrict && wCode) {
      calculateShippingFee(selectedDistrict, wCode);
    } else {
      setShippingFee(0);
    }
  };

  // Calculate item price
  const getItemPrice = (item) => {
    const base = parseFloat(item.base_price || item.price || 0);
    const mod = parseFloat(item.price_modifier || 0);
    return base + mod;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (getItemPrice(item) * (item.quantity || 1)), 0);

  // Apply Voucher
  const handleApplyVoucher = (codeParam) => {
    const code = (codeParam || voucherCode).trim().toUpperCase();
    setVoucherError('');

    if (!code) {
      setVoucherError('Vui lòng nhập hoặc chọn mã giảm giá!');
      return;
    }

    const found = vouchers.find(v => v.code.toUpperCase() === code);
    if (!found) {
      setVoucherError('Mã giảm giá không tồn tại hoặc đã hết hạn!');
      return;
    }

    const minOrder = parseInt(found.min_order_value !== undefined ? found.min_order_value : (found.min_order_amount || 0));
    if (subtotal < minOrder) {
      setVoucherError(`Đơn hàng phải đạt tối thiểu ${minOrder.toLocaleString('vi-VN')} ₫ để dùng mã này!`);
      return;
    }

    let calculatedDiscount = 0;
    const isFreeship = found.discount_type === 'shipping' || found.discount_type === 'freeship' || found.discount_type === 'free_shipping';

    if (found.discount_type === 'percentage') {
      calculatedDiscount = (subtotal * parseFloat(found.discount_value)) / 100;
      const maxDiscount = found.max_discount !== undefined ? found.max_discount : found.max_discount_amount;
      if (maxDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, parseFloat(maxDiscount));
      }
    } else if (isFreeship) {
      const shipVal = parseFloat(found.discount_value || 0);
      calculatedDiscount = shipVal > 0 ? Math.min(shippingFee, shipVal) : shippingFee;
    } else {
      calculatedDiscount = parseFloat(found.discount_value || 0);
    }

    setAppliedVoucher(found);
    setVoucherCode(code);
    setDiscountAmount(calculatedDiscount);
  };

  const isFreeshipVoucher = appliedVoucher && (appliedVoucher.discount_type === 'shipping' || appliedVoucher.discount_type === 'freeship' || appliedVoucher.discount_type === 'free_shipping');
  
  const rawShippingFee = paymentMethod === 'store' ? 0 : shippingFee;
  const shippingDiscount = isFreeshipVoucher 
    ? (parseFloat(appliedVoucher.discount_value || 0) > 0 ? Math.min(rawShippingFee, parseFloat(appliedVoucher.discount_value)) : rawShippingFee)
    : 0;
  
  const orderDiscount = isFreeshipVoucher ? 0 : discountAmount;
  const actualShippingFee = Math.max(0, rawShippingFee - shippingDiscount);
  const finalTotal = Math.max(0, subtotal - Math.min(subtotal, orderDiscount) + actualShippingFee);

  // Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!recipientName.trim() || !recipientPhone.trim()) {
      setErrorMessage('Vui lòng nhập họ tên và số điện thoại người nhận hàng!');
      return;
    }

    if (paymentMethod !== 'store') {
      if (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail.trim()) {
        setErrorMessage('Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã và Số nhà nhận hàng!');
        return;
      }
    }

    // Check stock for every item
    for (const item of cartItems) {
      if (item.stock_quantity !== undefined && item.quantity > item.stock_quantity) {
        setErrorMessage(`Sản phẩm "${item.product_name || item.name}" chỉ còn ${item.stock_quantity} cái trong kho, bạn đang đặt ${item.quantity} cái. Vui lòng điều chỉnh lại!`);
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const fullAddress = paymentMethod === 'store' 
        ? 'Nhận trực tiếp tại Showroom Naro Badminton' 
        : `${addressDetail}, ${wards.find(w => w.WardCode === selectedWard)?.WardName || ''}, ${districts.find(d => d.DistrictID === parseInt(selectedDistrict))?.DistrictName || ''}, ${provinces.find(p => p.ProvinceID === parseInt(selectedProvince))?.ProvinceName || ''}`;

      const payload = {
        payment_method: paymentMethod,
        shipping_name: recipientName.trim(),
        shipping_phone: recipientPhone.trim(),
        shipping_address: fullAddress,
        to_district_id: selectedDistrict ? parseInt(selectedDistrict) : null,
        to_ward_code: selectedWard ? String(selectedWard) : null,
        voucher_code: appliedVoucher ? appliedVoucher.code : null,
        cartItems: cartItems.map(item => ({
          variant_id: item.variant_id || item.id,
          quantity: item.quantity || 1
        }))
      };

      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderResult = res.data?.data || res.data;
      const createdOrderId = orderResult.orderId || orderResult.id;

      // Clear purchased items from backend cart
      try {
        for (const item of cartItems) {
          if (item.id && typeof item.id === 'number') {
            await cartService.removeFromCart(item.id).catch(() => {});
          }
        }
        localStorage.removeItem('guest_cart');
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (e) {}

      if (paymentMethod === 'qr') {
        navigate(`/payment-qr/${createdOrderId}`, {
          state: {
            orderId: createdOrderId,
            totalAmount: finalTotal
          }
        });
      } else {
        navigate('/order-success', {
          state: {
            order: {
              id: createdOrderId,
              total_amount: finalTotal,
              shipping_name: recipientName,
              payment_method: paymentMethod
            }
          }
        });
      }
    } catch (err) {
      console.error('Lỗi đặt hàng:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-8">
          Tiến Hành Thanh Toán
        </h1>

        {errorMessage && (
          <div className="p-4 mb-6 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form noValidate onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Customer & Delivery & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Customer Info */}
            <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <User size={16} className="text-[#ea580c]" /> Thông tin người nhận
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-medium outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="0987654321"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-medium outline-none focus:border-[#ea580c] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <MapPin size={16} className="text-[#ea580c]" /> Địa chỉ giao hàng (GHN Đồng Kiểm)
              </h3>

              {paymentMethod === 'store' ? (
                <div className="p-4 bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-[#ea580c] flex items-center gap-1.5">
                    <Store size={15} /> Nhận hàng tại Showroom Naro Badminton:
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    Showroom 1: Số 68 Cầu Giấy, Quận Cầu Giấy, Hà Nội (Hotline: 0338 780 204)
                  </p>
                  <p className="text-[11px] text-lime-700 dark:text-lime-400 font-semibold mt-1">
                    Miễn phí vận chuyển 100% khi nhận tại cửa hàng!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Tỉnh / Thành *</label>
                      <select
                        value={selectedProvince}
                        onChange={handleProvinceChange}
                        required
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-medium outline-none focus:border-[#ea580c]"
                      >
                        <option value="">Chọn Tỉnh/Thành</option>
                        {provinces.map(p => (
                          <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Quận / Huyện *</label>
                      <select
                        value={selectedDistrict}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvince}
                        required
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-medium outline-none focus:border-[#ea580c] disabled:opacity-50"
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map(d => (
                          <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Phường / Xã *</label>
                      <select
                        value={selectedWard}
                        onChange={handleWardChange}
                        disabled={!selectedDistrict}
                        required
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-medium outline-none focus:border-[#ea580c] disabled:opacity-50"
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map(w => (
                          <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                      Số nhà, tên đường chi tiết *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={255}
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      placeholder="Số 45 ngõ 12..."
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white font-medium outline-none focus:border-[#ea580c]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Ghi chú cho shipper / Yêu cầu căng cước (Tùy chọn)
                </label>
                <textarea
                  rows="2"
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Căng cước Yonex BG65 10.5kg, gọi trước khi giao..."
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-[#ea580c]"
                />
              </div>
            </div>

            {/* 3. Payment Methods (Full 3 Options) */}
            <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <CreditCard size={16} className="text-[#ea580c]" /> Phương thức thanh toán
              </h3>

              <div className="space-y-3">
                {/* 1. VietQR SePay */}
                <label className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  paymentMethod === 'qr'
                    ? 'border-[#ea580c] bg-orange-50/40 dark:bg-orange-950/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-white dark:bg-[#181a24]'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={() => setPaymentMethod('qr')}
                    className="accent-[#ea580c] mt-1 cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                      <QrCode size={17} className="text-[#ea580c]" /> Quét mã VietQR chuyển khoản tự động (SePay)
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Xác nhận thanh toán tự động trong 3 giây. Hỗ trợ tất cả app ngân hàng (MB, VCB, Techcom, BIDV...) & Ví Momo.
                    </p>
                  </div>
                </label>

                {/* 2. COD */}
                <label className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-[#ea580c] bg-orange-50/40 dark:bg-orange-950/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-white dark:bg-[#181a24]'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#ea580c] mt-1 cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                      <Truck size={17} className="text-[#ea580c]" /> Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Đồng kiểm hàng với shipper GHN trước khi thanh toán tiền mặt an tâm 100%.
                    </p>
                  </div>
                </label>

                {/* 3. Store Pickup */}
                <label className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition-all ${
                  paymentMethod === 'store'
                    ? 'border-[#ea580c] bg-orange-50/40 dark:bg-orange-950/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 bg-white dark:bg-[#181a24]'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="store"
                    checked={paymentMethod === 'store'}
                    onChange={() => setPaymentMethod('store')}
                    className="accent-[#ea580c] mt-1 cursor-pointer"
                  />
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                      <Store size={17} className="text-[#ea580c]" /> Nhận hàng & Thanh toán tại Showroom Naro
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Nhận vợt trực tiếp tại cửa hàng, được kỹ thuật viên căng cước và tư vấn miễn phí.
                    </p>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Order Review & Voucher Selector */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Voucher Card */}
            <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Ticket size={16} className="text-[#ea580c]" /> Mã Giảm Giá Khuyến Mãi
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã voucher..."
                  className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs uppercase font-mono outline-none focus:border-[#ea580c]"
                />
                <button
                  type="button"
                  onClick={() => handleApplyVoucher()}
                  className="px-4 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>

              {voucherError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{voucherError}</p>
              )}

              {appliedVoucher && (
                <div className="p-3 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-800 rounded-xl text-xs flex items-center justify-between text-lime-800 dark:text-lime-300 font-medium">
                  <span>
                    Đã áp dụng: <strong>{appliedVoucher.code}</strong> {isFreeshipVoucher ? `(Freeship -${shippingDiscount.toLocaleString('vi-VN')} ₫)` : `(-${orderDiscount.toLocaleString('vi-VN')} ₫)`}
                  </span>
                  <button type="button" onClick={() => { setAppliedVoucher(null); setVoucherCode(''); setDiscountAmount(0); }} className="text-zinc-400 hover:text-rose-600 font-bold ml-2 cursor-pointer">✕</button>
                </div>
              )}

              {/* Available Vouchers List */}
              {vouchers.length > 0 && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag size={12} className="text-[#ea580c]" /> Mã giảm giá sẵn có:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {vouchers.map((v) => {
                      const isCurrent = appliedVoucher?.code === v.code;
                      const isFreeship = v.discount_type === 'shipping' || v.discount_type === 'freeship' || v.discount_type === 'free_shipping';
                      const minOrder = Number(v.min_order_value !== undefined ? v.min_order_value : (v.min_order_amount || 0));

                      return (
                        <div 
                          key={v.id || v.code}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                            isCurrent 
                              ? 'bg-orange-50 dark:bg-orange-950/40 border-[#ea580c]' 
                              : 'bg-zinc-50 dark:bg-[#181a24] border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-xs text-[#ea580c]">{v.code}</span>
                              {isFreeship && (
                                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 uppercase">
                                  Freeship
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {isFreeship 
                                ? (Number(v.discount_value) > 0 ? `Miễn phí ship tối đa ${Number(v.discount_value).toLocaleString()} ₫` : 'Miễn phí 100% ship')
                                : v.discount_type === 'percentage' 
                                ? `Giảm ${v.discount_value}% ${(v.max_discount || v.max_discount_amount) ? `(Tối đa ${Number(v.max_discount || v.max_discount_amount).toLocaleString()} ₫)` : ''}` 
                                : `Giảm ${Number(v.discount_value).toLocaleString()} ₫`}
                              {minOrder > 0 && ` • Đơn từ ${minOrder.toLocaleString()} ₫`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyVoucher(v.code)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                              isCurrent 
                                ? 'bg-[#ea580c] text-white' 
                                : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-[#ea580c] hover:text-white hover:border-[#ea580c]'
                            }`}
                          >
                            {isCurrent ? 'Đã chọn' : 'Áp dụng'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Order Review Card */}
            <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
                Đơn Hàng ({cartItems.length} sản phẩm)
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 pr-1">
                {cartItems.map((item) => {
                  const price = getItemPrice(item);
                  return (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3 text-xs">
                      <div className="w-12 h-12 bg-zinc-50 dark:bg-[#181a24] rounded-xl p-1 shrink-0 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                        <img 
                          src={item.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=100'} 
                          alt="" 
                          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-lighten"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.product_name || item.name}</p>
                        {item.variant_name && (
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Phân loại: {item.variant_name}</p>
                        )}
                        <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">SL: x{item.quantity || 1}</p>
                      </div>
                      <div className="font-bold text-zinc-900 dark:text-white text-right">
                        {(price * (item.quantity || 1)).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                {orderDiscount > 0 && (
                  <div className="flex justify-between text-lime-600 dark:text-lime-400">
                    <span>Giảm giá Voucher:</span>
                    <span className="font-bold">-{orderDiscount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Phí giao hàng:</span>
                  <div className="text-right">
                    {paymentMethod === 'store' ? (
                      <span className="font-bold text-lime-600 dark:text-lime-400">Miễn phí (Tại showroom)</span>
                    ) : !selectedDistrict || !selectedWard ? (
                      <span className="text-zinc-400 italic text-[11px]">Chọn Phường/Xã để tính phí GHN</span>
                    ) : isCalculatingFee ? (
                      <span className="text-[#ea580c] animate-pulse font-medium text-[11px]">Đang tính phí GHN...</span>
                    ) : shippingDiscount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-zinc-400 text-[11px]">{rawShippingFee.toLocaleString('vi-VN')} ₫</span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">
                          {actualShippingFee === 0 ? 'Freeship (0 ₫)' : `${actualShippingFee.toLocaleString('vi-VN')} ₫`}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-zinc-900 dark:text-white">{actualShippingFee.toLocaleString('vi-VN')} ₫</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                <span className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-[#ea580c]">
                  {finalTotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <span>Đang xử lý đơn hàng...</span>
                ) : (
                  <>
                    <span>{paymentMethod === 'qr' ? 'Thanh toán VietQR ngay' : 'Xác nhận đặt hàng'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 pt-2">
                <ShieldCheck size={14} className="text-lime-600" />
                <span>Bảo mật đơn hàng & Cam kết chính hãng 100%</span>
              </div>
            </div>

          </div>

        </form>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
