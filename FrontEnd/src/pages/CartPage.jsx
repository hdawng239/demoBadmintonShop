import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { cartService } from '../services/cartService';
import { authService } from '../services/authService';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, XCircle, CheckCircle } from 'lucide-react';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3500);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getMyCart();
      setCart(data);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
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
  }, [navigate]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const item = cart.items.find(i => i.id === itemId);
    if (item && newQuantity > item.stock_quantity) {
      showToast(`Sản phẩm "${item.product_name} (${item.variant_name || 'Mặc định'})" chỉ còn ${item.stock_quantity} cái trong kho!`, 'error');
      return;
    }
    try {
      await cartService.updateItemQuantity(itemId, newQuantity);
      // Tạm thời update local state để nhanh
      setCart(prev => {
        const newItems = prev.items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        return { ...prev, items: newItems };
      });
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      showToast("Có lỗi xảy ra khi cập nhật số lượng.", "error");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;
    try {
      await cartService.removeItem(itemId);
      setCart(prev => {
        const newItems = prev.items.filter(item => item.id !== itemId);
        return { ...prev, items: newItems };
      });
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      showToast("Có lỗi xảy ra khi xóa sản phẩm.", "error");
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseInt(item.base_price) + (item.price_modifier ? parseInt(item.price_modifier) : 0);
        return total + (price * item.quantity);
    }, 0);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cart.items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      showToast("Vui lòng chọn ít nhất một sản phẩm để thanh toán!", "error");
      return;
    }
    const selectedCartItems = cart.items.filter(item => selectedItems.includes(item.id));
    const outOfStockItems = selectedCartItems.filter(item => item.quantity > item.stock_quantity);
    if (outOfStockItems.length > 0) {
      showToast(`Sản phẩm "${outOfStockItems[0].product_name} (${outOfStockItems[0].variant_name || 'Mặc định'})" chỉ còn ${outOfStockItems[0].stock_quantity} cái trong kho!`, "error");
      return;
    }
    navigate('/checkout', { state: { selectedItems: selectedCartItems } });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const hasItems = cart && cart.items && cart.items.length > 0;

  return (
    <MainLayout>
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-24 right-4 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center transition-all duration-300 animate-bounce ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.type === 'error' ? <XCircle className="w-6 h-6 mr-3" /> : <CheckCircle className="w-6 h-6 mr-3" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800 uppercase mb-8 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-3 text-primary" />
            Giỏ Hàng Của Bạn
          </h1>

          {!hasItems ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
              <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy quay lại mua sắm nhé!</p>
              <Link to="/" className="inline-block bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cart Items List */}
              <div className="w-full lg:w-2/3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase">
                    <div className="col-span-6 flex items-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 mr-3 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                        onChange={handleSelectAll}
                        checked={cart.items.length > 0 && selectedItems.length === cart.items.length}
                      />
                      Sản phẩm
                    </div>
                    <div className="col-span-2 text-center">Đơn giá</div>
                    <div className="col-span-2 text-center">Số lượng</div>
                    <div className="col-span-2 text-center">Thành tiền</div>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {cart.items.map(item => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 items-center">
                        <div className="col-span-1 md:col-span-6 flex items-center relative">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 mr-3 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer hidden md:block"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                          />
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute -top-2 -left-2 md:static md:mr-4 w-6 h-6 md:w-8 md:h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          
                          <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center p-2 mr-4">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain mix-blend-multiply" />
                            ) : (
                              <span className="text-xs text-gray-300">No Img</span>
                            )}
                          </div>
                          
                          <div>
                            <Link to={`/product/${item.product_id}`} className="font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2 text-sm md:text-base">
                              {item.product_name}
                            </Link>
                            <div className="text-xs text-gray-500 mt-1">Phân loại: {item.variant_name || 'Mặc định'}</div>
                          </div>
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 text-center hidden md:block font-medium text-gray-600">
                          {(parseInt(item.base_price) + (item.price_modifier ? parseInt(item.price_modifier) : 0)).toLocaleString()} ₫
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 flex justify-start md:justify-center">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-md transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <div className="w-10 h-8 flex items-center justify-center text-sm font-medium text-gray-800 border-x border-gray-300">
                              {item.quantity}
                            </div>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-md transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="col-span-1 md:col-span-2 text-left md:text-center font-bold text-primary">
                          <span className="md:hidden text-gray-500 font-normal mr-2">Tổng:</span>
                          {((parseInt(item.base_price) + (item.price_modifier ? parseInt(item.price_modifier) : 0)) * item.quantity).toLocaleString()} ₫
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4 uppercase">Thông tin đơn hàng</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
                      <span className="font-medium text-gray-800">{calculateTotal().toLocaleString()} ₫</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí giao hàng</span>
                      <span className="text-gray-400 italic">Tính ở bước thanh toán</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-8">
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-gray-800">Tổng cộng</span>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary block">{calculateTotal().toLocaleString()} ₫</span>
                        <span className="text-xs text-gray-500">(Đã bao gồm VAT)</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl uppercase flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                  >
                    Tiến hành thanh toán
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                  
                  <div className="mt-4 text-center">
                    <Link to="/" className="text-sm text-primary hover:underline">
                      Tiếp tục mua sắm
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;
