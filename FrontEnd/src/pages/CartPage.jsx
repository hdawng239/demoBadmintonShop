import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { cartService } from '../services/cartService';
import { voucherService } from '../services/voucherService';
import { authService } from '../services/authService';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Ticket, 
  ShieldCheck, 
  AlertCircle,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Tag
} from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [vouchers, setVouchers] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const c = await cartService.getMyCart();
      const loadedCart = c || { items: [] };
      setCart(loadedCart);
      
      // Default: select all active items
      if (loadedCart.items && loadedCart.items.length > 0) {
        const activeItemIds = loadedCart.items.filter(i => i.is_active !== false).map(i => i.id);
        setSelectedIds(new Set(activeItemIds));
      } else {
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    fetchCart();

    const fetchVouchers = async () => {
      try {
        const vList = await voucherService.getActiveVouchers();
        const raw = Array.isArray(vList) ? vList : (vList?.data || []);
        setVouchers(Array.isArray(raw) ? raw : []);
      } catch (err) {
        console.error('Lỗi tải voucher:', err);
      }
    };
    fetchVouchers();
  }, [navigate]);

  const handleToggleSelectAll = () => {
    const activeItems = (cart?.items || []).filter(i => i.is_active !== false);
    if (selectedIds.size === activeItems.length && activeItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeItems.map(i => i.id)));
    }
  };

  const handleToggleItem = (item) => {
    if (item.is_active === false) {
      showToast(`Sản phẩm "${item.product_name || item.name}" đã ngừng kinh doanh, không thể chọn thanh toán!`, 'error');
      return;
    }
    const next = new Set(selectedIds);
    if (next.has(item.id)) {
      next.delete(item.id);
    } else {
      next.add(item.id);
    }
    setSelectedIds(next);
  };

  const handleUpdateQty = async (itemId, newQty, maxStock = 999) => {
    if (newQty < 1) {
      handleRemoveItem(itemId);
      return;
    }
    if (newQty > maxStock) {
      showToast(`Kho chỉ còn tối đa ${maxStock} sản phẩm!`, 'error');
      return;
    }

    // Optimistic update
    setCart(prev => {
      if (!prev || !prev.items) return prev;
      return {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, quantity: newQty } : i)
      };
    });

    try {
      const updated = await cartService.updateQuantity(itemId, newQty);
      if (updated && updated.items) {
        setCart(updated);
      }
    } catch (err) {
      console.error('Lỗi cập nhật số lượng:', err);
      showToast('Có lỗi xảy ra khi cập nhật số lượng', 'error');
      fetchCart();
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) return;

    // Optimistic remove
    setCart(prev => {
      if (!prev || !prev.items) return prev;
      return {
        ...prev,
        items: prev.items.filter(i => i.id !== itemId)
      };
    });

    const next = new Set(selectedIds);
    next.delete(itemId);
    setSelectedIds(next);

    try {
      const updated = await cartService.removeFromCart(itemId);
      if (updated && updated.items) {
        setCart(updated);
      }
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch (err) {
      console.error('Lỗi xóa sản phẩm:', err);
      showToast('Có lỗi xảy ra khi xóa sản phẩm', 'error');
      fetchCart();
    }
  };

  // Correct calculation of item unit price (base_price + price_modifier)
  const getItemPrice = (item) => {
    const base = parseFloat(item.base_price || item.price || 0);
    const mod = parseFloat(item.price_modifier || 0);
    return base + mod;
  };

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const selectedItems = items.filter(i => selectedIds.has(i.id));

  const handleApplyVoucher = (codeParam) => {
    const code = (codeParam || voucherCode).trim().toUpperCase();
    setVoucherError(null);

    if (!code) {
      setVoucherError('Vui lòng nhập hoặc chọn mã giảm giá!');
      return;
    }

    const found = vouchers.find(v => v.code.toUpperCase() === code);
    if (!found) {
      setVoucherError('Mã giảm giá không tồn tại hoặc đã hết hạn!');
      return;
    }

    const currentSubtotal = selectedItems.reduce((sum, item) => sum + (getItemPrice(item) * (item.quantity || 1)), 0);
    const minOrder = parseInt(found.min_order_value !== undefined ? found.min_order_value : (found.min_order_amount || 0));

    if (currentSubtotal < minOrder) {
      setVoucherError(`Đơn các sản phẩm đã chọn phải đạt tối thiểu ${minOrder.toLocaleString('vi-VN')} ₫ để dùng mã này!`);
      return;
    }

    setAppliedVoucher(found);
    setVoucherCode(code);
    showToast(`Đã áp dụng mã giảm giá "${code}"!`);
  };

  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + (getItemPrice(item) * (item.quantity || 1)), 0);

  let discountAmount = 0;
  const isFreeshipVoucher = appliedVoucher && (appliedVoucher.discount_type === 'shipping' || appliedVoucher.discount_type === 'freeship' || appliedVoucher.discount_type === 'free_shipping');

  if (appliedVoucher && selectedSubtotal > 0) {
    if (appliedVoucher.discount_type === 'percentage') {
      discountAmount = (selectedSubtotal * parseFloat(appliedVoucher.discount_value)) / 100;
      const maxDiscount = appliedVoucher.max_discount !== undefined ? appliedVoucher.max_discount : appliedVoucher.max_discount_amount;
      if (maxDiscount) {
        discountAmount = Math.min(discountAmount, parseFloat(maxDiscount));
      }
    } else if (isFreeshipVoucher) {
      discountAmount = 0; // Sẽ được trừ vào phí ship ở bước Checkout
    } else {
      discountAmount = parseFloat(appliedVoucher.discount_value || 0);
    }
  }

  const finalTotal = Math.max(0, selectedSubtotal - discountAmount);

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      showToast('Vui lòng tích chọn ít nhất 1 sản phẩm trong giỏ để thanh toán!', 'error');
      return;
    }

    // Check if any selected item is out of stock
    const outOfStock = selectedItems.find(i => i.stock_quantity !== undefined && i.quantity > i.stock_quantity);
    if (outOfStock) {
      showToast(`Sản phẩm "${outOfStock.product_name}" chỉ còn ${outOfStock.stock_quantity} cái trong kho!`, 'error');
      return;
    }

    navigate('/checkout', {
      state: {
        selectedItems: selectedItems,
        appliedVoucher,
        discountAmount
      }
    });
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Giỏ Hàng Của Bạn ({items.length} mặt hàng)
          </h1>
          {items.length > 0 && (
            <span className="text-xs font-bold text-[#ea580c] bg-orange-50 dark:bg-orange-950/40 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-900/40">
              Đã chọn: {selectedItems.length} / {items.length}
            </span>
          )}
        </div>

        {toastMessage && (
          <div className={`p-4 mb-6 rounded-2xl text-xs flex items-center gap-2 border shadow-xs animate-in fade-in ${
            toastMessage.type === 'error' 
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' 
              : 'bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800 text-lime-800 dark:text-lime-300'
          }`}>
            {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
            <span>{toastMessage.msg}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white dark:bg-[#12131a] p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/30 text-[#ea580c] flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Giỏ hàng đang trống</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Hãy thêm những cây vợt và phụ kiện chất lượng vào giỏ hàng ngay!</p>
            <Link to="/category/1" className="inline-block px-6 py-3 bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#c2410c] transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Items List with Select All */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Select All Bar */}
              <div className="bg-white dark:bg-[#12131a] px-6 py-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between text-xs font-bold shadow-xs">
                <button
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200 hover:text-[#ea580c] cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={() => {}} // Handled by button click
                    className="w-4 h-4 accent-[#ea580c] rounded cursor-pointer"
                  />
                  <span>Chọn tất cả ({items.length} sản phẩm)</span>
                </button>
                <span className="text-zinc-400 font-normal">
                  Đã chọn {selectedItems.length} món để thanh toán
                </span>
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                {items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const price = getItemPrice(item);
                  const maxStock = item.stock_quantity !== undefined ? item.stock_quantity : 999;

                  return (
                    <div 
                      key={item.id} 
                      className={`bg-white dark:bg-[#12131a] p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                        isSelected 
                          ? 'border-zinc-300 dark:border-zinc-700 shadow-xs' 
                          : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-80'
                      }`}
                    >
                      {/* Checkbox */}
                      <button 
                        onClick={() => handleToggleItem(item)}
                        disabled={item.is_active === false}
                        className="p-1 text-zinc-400 hover:text-[#ea580c] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0 mt-1 sm:mt-0"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected && item.is_active !== false}
                          disabled={item.is_active === false}
                          onChange={() => {}} // Handled by button
                          className="w-4 h-4 accent-[#ea580c] rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                      </button>

                      {/* Product Thumbnail */}
                      <Link to={`/product/${item.product_id}`} className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f8f9fa] dark:bg-[#181a24] rounded-xl p-2 shrink-0 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.product_name} 
                            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-lighten"
                          />
                        ) : (
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">No Img</span>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${item.product_id}`} 
                          className="font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#ea580c] transition-colors text-sm line-clamp-1"
                        >
                          {item.product_name || item.name}
                        </Link>
                        
                        {item.is_active === false ? (
                          <div className="mt-1">
                            <span className="inline-block px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold">
                              Đã ngừng kinh doanh (Dừng bán)
                            </span>
                          </div>
                        ) : (
                          item.variant_name && (
                            <span className="inline-block mt-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              Phân loại: {item.variant_name}
                            </span>
                          )
                        )}

                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-sm font-black text-[#ea580c]">
                            {price.toLocaleString('vi-VN')} ₫
                          </span>
                          {item.is_active !== false && item.stock_quantity !== undefined && item.stock_quantity <= 10 && (
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                              (Kho còn: {item.stock_quantity})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 rounded-xl p-1">
                          <button
                            onClick={() => handleUpdateQty(item.id, (item.quantity || 1) - 1, maxStock)}
                            className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                            title="Giảm số lượng"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center font-bold text-xs text-zinc-900 dark:text-white">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.id, (item.quantity || 1) + 1, maxStock)}
                            disabled={item.quantity >= maxStock}
                            className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-30 cursor-pointer"
                            title="Tăng số lượng"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="font-mono font-black text-sm text-zinc-900 dark:text-white sm:w-28 text-right">
                          {((price * (item.quantity || 1))).toLocaleString('vi-VN')} ₫
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Column: Voucher & Checkout Summary */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Voucher Box */}
              <div className="bg-white dark:bg-[#12131a] p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Ticket size={16} className="text-[#ea580c]" /> Mã Giảm Giá Khuyến Mãi
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã voucher..."
                    className="flex-1 px-3.5 py-2 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs uppercase font-mono outline-none focus:border-[#ea580c]"
                  />
                  <button
                    onClick={() => handleApplyVoucher()}
                    className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-wider cursor-pointer"
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
                      Đã áp dụng: <strong>{appliedVoucher.code}</strong> {isFreeshipVoucher ? '(Freeship khi thanh toán)' : `(-${discountAmount.toLocaleString('vi-VN')} ₫)`}
                    </span>
                    <button onClick={() => { setAppliedVoucher(null); setVoucherCode(''); }} className="text-zinc-400 hover:text-rose-600 font-bold ml-2 cursor-pointer">✕</button>
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

              {/* Order Summary Card */}
              <div className="bg-white dark:bg-[#12131a] p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
                <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  Tóm Tắt Đơn Hàng ({selectedItems.length} món chọn)
                </h3>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Tạm tính các món đã chọn:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{selectedSubtotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-lime-600 dark:text-lime-400">
                      <span>Giảm giá Voucher:</span>
                      <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="text-zinc-400 italic">Tính khi thanh toán (GHN)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">Tổng thanh toán:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#ea580c]">
                      {finalTotal.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full py-4 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Tiến hành thanh toán ({selectedItems.length})</span>
                  <ArrowRight size={16} />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 pt-2">
                  <ShieldCheck size={14} className="text-lime-600" />
                  <span>Bảo mật đơn hàng & Giao tận tay người nhận</span>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
