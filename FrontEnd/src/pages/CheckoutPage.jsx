import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import axios from 'axios';
import { cartService } from '../services/cartService';
import { ghnService } from '../services/ghnService';
import { XCircle, CheckCircle, Ticket, Tag } from 'lucide-react';
import { voucherService } from '../services/voucherService';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4500);
  };

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // GHN State
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');

  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const items = location.state?.selectedItems;
    if (!items || items.length === 0) {
      navigate('/cart');
      return;
    }
    setSelectedItems(items);
    if (user.full_name || user.name) setName(user.full_name || user.name);
    if (user.phone) setPhone(user.phone);

    // Fetch Provinces & Vouchers
    fetchProvinces();
    fetchActiveVouchers();
  }, [navigate, location.state]);

  // Handle payment method changes (reset shipping fee if store pickup)
  useEffect(() => {
    if (paymentMethod === 'store') {
      setShippingFee(0);
      if (appliedVoucher && appliedVoucher.discountType === 'shipping') {
        setDiscountAmount(0);
      }
    } else {
      if (selectedDistrict && selectedWard) {
        calculateShippingFee(parseInt(selectedDistrict), selectedWard);
      } else {
        setShippingFee(0);
        if (appliedVoucher && appliedVoucher.discountType === 'shipping') {
          setDiscountAmount(0);
        }
      }
    }
  }, [paymentMethod, selectedDistrict, selectedWard, appliedVoucher?.code]);

  const fetchProvinces = async () => {
    try {
      const resData = await ghnService.getProvinces();
      if (resData && resData.data) {
        setProvinces(resData.data);
      }
    } catch (error) {
      console.error("Lỗi lấy tỉnh thành:", error);
    }
  };

  const fetchActiveVouchers = async () => {
    try {
      const list = await voucherService.getActiveVouchers();
      setActiveVouchers(list);
    } catch (error) {
      console.error("Lỗi lấy danh sách voucher hoạt động:", error);
    }
  };

  const handleApplyVoucher = async (codeToApply) => {
    const code = codeToApply || voucherCode;
    if (!code) {
      showToast("Vui lòng nhập mã giảm giá!", "error");
      return;
    }
    
    try {
      const subTotal = calculateSubTotal();
      const res = await voucherService.applyVoucher(code, subTotal);
      
      let calculatedDiscount = res.discountAmount;
      if (res.discountType === 'shipping') {
        calculatedDiscount = Math.min(res.discountAmount, shippingFee);
      }

      setAppliedVoucher({
        code: res.code,
        discountType: res.discountType,
        discountValue: res.discountValue,
        discountAmount: calculatedDiscount,
        minOrderValue: res.minOrderValue
      });
      setDiscountAmount(calculatedDiscount);
      setVoucherCode(res.code);
      showToast(res.message, "success");
    } catch (error) {
      console.error("Lỗi áp dụng mã:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Mã giảm giá không hợp lệ.";
      showToast(errorMsg, "error");
      setAppliedVoucher(null);
      setDiscountAmount(0);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedWard('');
    setWards([]);
    setShippingFee(0);
    
    if (provinceId) {
      try {
        const resData = await ghnService.getDistricts(provinceId);
        if (resData && resData.data) {
          setDistricts(resData.data);
        }
      } catch (error) {
        console.error("Lỗi lấy quận huyện:", error);
      }
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrict(districtId);
    setSelectedWard('');
    setShippingFee(0);
    
    if (districtId) {
      try {
        const resData = await ghnService.getWards(districtId);
        if (resData && resData.data) {
          setWards(resData.data);
        }
      } catch (error) {
        console.error("Lỗi lấy phường xã:", error);
      }
    } else {
      setWards([]);
    }
  };

  const handleWardChange = async (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);
    
    if (wardCode && selectedDistrict) {
      calculateShippingFee(parseInt(selectedDistrict), wardCode);
    } else {
      setShippingFee(0);
    }
  };

  const calculateShippingFee = async (districtId, wardCode) => {
    try {
      // Calculate max dimensions and total weight from selectedItems
      let totalWeight = 0;
      let maxLength = 0;
      let maxWidth = 0;
      let maxHeight = 0;

      selectedItems.forEach(item => {
        let weight = 500; // default
        let length = 20;
        let width = 20;
        let height = 10;
        
        if (item.technical_specs) {
            let specs = typeof item.technical_specs === 'string' ? JSON.parse(item.technical_specs) : item.technical_specs;
            if (specs.weight_g) weight = parseInt(specs.weight_g);
            if (specs.length) length = parseInt(specs.length);
            if (specs.width) width = parseInt(specs.width);
            if (specs.height) height = parseInt(specs.height);
        }
        
        totalWeight += weight * item.quantity;
        maxLength = Math.max(maxLength, length);
        maxWidth = Math.max(maxWidth, width);
        maxHeight += height * item.quantity; // Stack items roughly
      });

      // Avoid too large max dimensions
      if (maxHeight > 200) maxHeight = 200;

      const payload = {
        to_district_id: districtId,
        to_ward_code: wardCode,
        weight: totalWeight || 1000,
        length: maxLength || 20,
        width: maxWidth || 20,
        height: maxHeight || 10
      };
      
      const resData = await ghnService.calculateShippingFee(payload);

      if (resData && resData.data && resData.data.total) {
        const newFee = resData.data.total;
        setShippingFee(newFee);
        
        // Recalculate shipping discount if applied
        if (appliedVoucher && appliedVoucher.discountType === 'shipping') {
          const newDiscount = Math.min(appliedVoucher.discountValue, newFee);
          setDiscountAmount(newDiscount);
          setAppliedVoucher(prev => ({ ...prev, discountAmount: newDiscount }));
        }
      }
    } catch (error) {
      console.error("Lỗi tính phí ship:", error);
      const fallbackFee = 30000;
      setShippingFee(fallbackFee);
      if (appliedVoucher && appliedVoucher.discountType === 'shipping') {
        const newDiscount = Math.min(appliedVoucher.discountValue, fallbackFee);
        setDiscountAmount(newDiscount);
        setAppliedVoucher(prev => ({ ...prev, discountAmount: newDiscount }));
      }
    }
  };

  const calculateSubTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = parseInt(item.base_price) + (item.price_modifier ? parseInt(item.price_modifier) : 0);
      return total + (price * item.quantity);
    }, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
        showToast("Vui lòng nhập đầy đủ Họ tên và Số điện thoại!", "error");
        return;
    }

    if (paymentMethod !== 'store') {
        if (!selectedProvince || !selectedDistrict || !selectedWard || !addressDetail) {
            showToast("Vui lòng nhập đầy đủ thông tin giao hàng!", "error");
            return;
        }
    }

    if (!/^0(3|5|7|8|9)\d{8}$/.test(phone)) {
        showToast("Số điện thoại không hợp lệ (Phải đủ 10 số và bắt đầu bằng 0)!", "error");
        return;
    }

    let fullAddress = "Nhận tại cửa hàng";
    if (paymentMethod !== 'store') {
        const provinceName = provinces.find(p => String(p.ProvinceID) === selectedProvince)?.ProvinceName || '';
        const districtName = districts.find(d => String(d.DistrictID) === selectedDistrict)?.DistrictName || '';
        const wardName = wards.find(w => String(w.WardCode) === selectedWard)?.WardName || '';
        fullAddress = `${addressDetail}, ${wardName}, ${districtName}, ${provinceName}`;
    }

    const subTotal = calculateSubTotal();
    const totalAmount = subTotal + (paymentMethod === 'store' ? 0 : shippingFee) - discountAmount;

    const user = authService.getCurrentUser();
    const orderData = {
        user_id: user.id,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        shipping_name: name,
        shipping_phone: phone,
        shipping_address: fullAddress,
        to_district_id: paymentMethod !== 'store' ? parseInt(selectedDistrict) : null,
        to_ward_code: paymentMethod !== 'store' ? selectedWard : null,
        voucher_code: appliedVoucher ? appliedVoucher.code : null,
        discount_amount: discountAmount,
        cartItems: selectedItems.map(item => ({
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: parseInt(item.base_price) + (item.price_modifier ? parseInt(item.price_modifier) : 0),
            cart_item_id: item.id // To delete from cart later
        }))
    };

    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.post(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/orders`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        // After placing order, remove these items from cart
        for (const item of selectedItems) {
            try {
                await cartService.removeItem(item.id);
            } catch (err) {
                console.error("Lỗi xóa khỏi giỏ:", err);
            }
        }

        // Sau khi đặt thành công, chuyển hướng
        if (paymentMethod === 'qr') {
            navigate('/payment-qr', { state: { orderId: res.data.orderId, totalAmount } });
        } else {
            navigate('/order-success', { state: { orderId: res.data.orderId } });
        }
    } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        const errorMsg = error.response?.data?.error || error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng.";
        showToast(errorMsg, "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-24 right-4 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center transition-all duration-300 animate-bounce ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.type === 'error' ? <XCircle className="w-6 h-6 mr-3" /> : <CheckCircle className="w-6 h-6 mr-3" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}
      <div className="bg-gray-50 py-8 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-bold text-gray-800 uppercase mb-8">Thanh Toán</h1>
          
          <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-2/3 space-y-6">
              
              {/* Thông tin giao hàng */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                  {paymentMethod === 'store' ? 'Thông tin người nhận hàng' : 'Thông tin giao hàng'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Họ và tên</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                    <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                  </div>
                </div>

                {paymentMethod !== 'store' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tỉnh/Thành phố</label>
                        <select required={paymentMethod !== 'store'} value={selectedProvince} onChange={handleProvinceChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary">
                          <option value="">Chọn Tỉnh/Thành</option>
                          {provinces.map(p => (
                            <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Quận/Huyện</label>
                        <select required={paymentMethod !== 'store'} value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary">
                          <option value="">Chọn Quận/Huyện</option>
                          {districts.map(d => (
                            <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Phường/Xã</label>
                        <select required={paymentMethod !== 'store'} value={selectedWard} onChange={handleWardChange} disabled={!selectedDistrict} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary">
                          <option value="">Chọn Phường/Xã</option>
                          {wards.map(w => (
                            <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Địa chỉ cụ thể (Số nhà, tên đường)</label>
                      <input type="text" required={paymentMethod !== 'store'} value={addressDetail} onChange={e => setAddressDetail(e.target.value)} placeholder="VD: 123 Đường Nguyễn Văn Linh" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary" />
                    </div>
                  </>
                )}
              </div>

              {/* Phương thức thanh toán */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-orange-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                    <span className="ml-3 font-medium text-gray-700">Thanh toán khi nhận hàng (Ship COD)</span>
                  </label>
                  
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'qr' ? 'border-primary bg-orange-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                    <span className="ml-3 font-medium text-gray-700">Chuyển khoản QR (SePay)</span>
                  </label>

                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'store' ? 'border-primary bg-orange-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="payment" value="store" checked={paymentMethod === 'store'} onChange={() => setPaymentMethod('store')} className="w-5 h-5 text-primary border-gray-300 focus:ring-primary" />
                    <span className="ml-3 font-medium text-gray-700">Nhận hàng tại cửa hàng (Thanh toán tại quầy)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Cột Tổng Kết Đơn Hàng */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Đơn hàng của bạn</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {selectedItems.map(item => {
                    const price = parseInt(item.base_price) + (item.price_modifier ? parseInt(item.price_modifier) : 0);
                    return (
                      <div key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1 pr-4">
                          <p className="font-medium text-gray-800 line-clamp-2">{item.product_name}</p>
                          <p className="text-gray-500">Phân loại: {item.variant_name || 'Mặc định'} x {item.quantity}</p>
                        </div>
                        <div className="font-medium text-gray-800">
                          {(price * item.quantity).toLocaleString()} ₫
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Voucher Input */}
                <div className="border-t pt-4 mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nhập mã giảm giá</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="MÃ VOUCHER..."
                      value={voucherCode}
                      onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none uppercase font-mono"
                    />
                    <button 
                      type="button"
                      onClick={() => handleApplyVoucher()}
                      className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer shrink-0"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>

                {/* Available Vouchers List */}
                {activeVouchers.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                      <Tag size={12} className="mr-1 text-primary" /> Mã giảm giá có thể áp dụng:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {activeVouchers.map(v => {
                        const subTotal = calculateSubTotal();
                        const isNotEnough = subTotal < parseFloat(v.min_order_value);
                        
                        return (
                          <div 
                            key={v.id} 
                            className={`border rounded-lg p-3 flex flex-col justify-between transition-colors ${
                              appliedVoucher?.code === v.code
                                ? 'border-primary bg-orange-50/20'
                                : isNotEnough 
                                  ? 'border-gray-100 bg-gray-50/50 opacity-60'
                                  : 'border-gray-200 hover:border-primary/50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1 pr-2">
                                <span className="bg-red-50 text-red-500 border border-red-100 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                  MÃ: {v.code}
                                </span>
                                <p className="text-xs font-semibold text-gray-700 mt-1.5">{v.description}</p>
                                {isNotEnough && (
                                  <p className="text-[10px] text-red-500 font-semibold mt-1">
                                    (Chưa đủ điều kiện - Đơn tối thiểu {parseFloat(v.min_order_value).toLocaleString()} ₫)
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={isNotEnough}
                                onClick={() => handleApplyVoucher(v.code)}
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  appliedVoucher?.code === v.code
                                    ? 'bg-primary text-white border-primary animate-pulse'
                                    : isNotEnough
                                      ? 'bg-gray-100 text-gray-400 border-gray-150 cursor-not-allowed'
                                      : 'bg-white text-primary border-primary/20 hover:bg-orange-50/50'
                                }`}
                              >
                                {appliedVoucher?.code === v.code ? 'Đang dùng' : 'Dùng ngay'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-medium">{calculateSubTotal().toLocaleString()} ₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium">{shippingFee > 0 ? `${shippingFee.toLocaleString()} ₫` : '---'}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold text-sm">
                      <span>Giảm giá {appliedVoucher?.discountType === 'shipping' ? '(Vận chuyển)' : ''}</span>
                      <span>-{discountAmount.toLocaleString()} ₫</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-gray-800 text-lg">Tổng cộng</span>
                    <span className="text-2xl font-black text-primary block">{(calculateSubTotal() + shippingFee - discountAmount).toLocaleString()} ₫</span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl uppercase transition-colors shadow-md"
                >
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
