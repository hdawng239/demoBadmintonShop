import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import { Star, ShoppingCart, CheckCircle, Gift, ArrowLeft, ArrowRight, XCircle } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentUser = authService.getCurrentUser();

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Variant selection (grouped by attributes)
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Giới hạn số lượng theo tồn kho nếu đổi phân loại
  useEffect(() => {
    if (selectedVariant && selectedVariant.stock_quantity > 0 && quantity > selectedVariant.stock_quantity) {
      setQuantity(selectedVariant.stock_quantity);
    }
  }, [selectedVariant]);

  // Parse attributes Map at component level
  const attributesMap = {};
  if (product && product.variants) {
    product.variants.forEach(variant => {
      if (variant.attributes) {
        const attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
        Object.keys(attrs).forEach(key => {
          if (!attributesMap[key]) attributesMap[key] = new Set();
          attributesMap[key].add(attrs[key]);
        });
      }
    });
  }

  // Toast notification
  const [toast, setToast] = useState({ message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  // Helper to render dynamic offers based on category
  const renderDynamicOffers = () => {
    // Vợt Cầu Lông (1)
    if (product.category_id === 1) {
      return (
        <ul className="mt-2 space-y-3 text-sm text-gray-700">
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Tặng 2 Quấn cán vợt Cầu Lông: <span className="text-primary font-medium ml-1">NaviShop 001, VS002</span> hoặc <span className="text-primary font-medium">Joto 001</span></li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Sản phẩm cam kết chính hãng</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Một số sản phẩm sẽ được tặng bao đơn hoặc bao nhung bảo vệ vợt</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Thanh toán sau khi kiểm tra và nhận hàng (Giao khung vợt)</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Bảo hành chính hãng theo nhà sản xuất (Trừ hàng nội địa, xách tay)</li>
        </ul>
      );
    }
    // Giày Cầu Lông (2)
    if (product.category_id === 2) {
      return (
        <ul className="mt-2 space-y-3 text-sm text-gray-700">
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Tặng 1 đôi vớ cầu lông cao cấp (tùy đợt KM)</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Sản phẩm cam kết chính hãng 100%</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> <span className="text-primary font-medium">Miễn phí đổi size</span> trong vòng 7 ngày (nếu chưa sử dụng)</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Thanh toán sau khi kiểm tra và nhận hàng</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Bảo hành keo đế lên tới 3 tháng</li>
        </ul>
      );
    }
    // Quần áo Cầu Lông (6, 8)
    if (product.category_id === 6 || product.category_id === 8) {
      return (
        <ul className="mt-2 space-y-3 text-sm text-gray-700">
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> <span className="text-primary font-medium">Miễn phí đổi size</span> trong vòng 7 ngày (còn nguyên tem mác)</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Sản phẩm cam kết đúng chất liệu như mô tả, siêu thoáng mát</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Mua từ 3 bộ trở lên tặng thêm 1 đôi vớ hoặc quấn cán</li>
          <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Thanh toán sau khi kiểm tra và nhận hàng</li>
        </ul>
      );
    }
    // Mặc định (Phụ kiện, Túi, balo...)
    return (
      <ul className="mt-2 space-y-3 text-sm text-gray-700">
        <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Sản phẩm cam kết chính hãng chất lượng cao</li>
        <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Hỗ trợ giao hàng hỏa tốc trong nội thành</li>
        <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Thanh toán sau khi kiểm tra và nhận hàng</li>
        <li className="flex items-start"><CheckCircle className="w-5 h-5 text-purple-500 mr-2 shrink-0" /> Hỗ trợ đổi trả miễn phí nếu lỗi từ nhà sản xuất</li>
      </ul>
    );
  };

  const fetchReviewsData = async (productId) => {
    try {
      const revData = await reviewService.getProductReviews(productId, 1, 50); // Get up to 50 reviews for now
      setReviews(revData?.reviews || revData?.data || revData || []);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        // Fetch Product
        const prodData = await productService.getProductById(id);
        setProduct(prodData);

        if (prodData && prodData.category_id) {
          // Fetch Related Products
          const related = await productService.getAllProducts(1, 5, prodData.category_id);
          // Filter out current product
          const filteredRelated = (related?.products || related?.data || []).filter(p => p.id !== parseInt(id)).slice(0, 4);
          setRelatedProducts(filteredRelated);
        }

        // Fetch Reviews
        fetchReviewsData(id);

      } catch (error) {
        console.error("Lỗi tải chi tiết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewMessage({ type: 'error', text: 'Vui lòng nhập nội dung đánh giá!' });
      return;
    }
    
    setSubmittingReview(true);
    setReviewMessage({ type: '', text: '' });

    try {
      await reviewService.createReview({
        user_id: currentUser.id,
        product_id: parseInt(id),
        rating,
        comment
      });
      setReviewMessage({ type: 'success', text: 'Cảm ơn bạn đã đánh giá!' });
      setComment('');
      setRating(5);
      // Reload reviews
      fetchReviewsData(id);
    } catch (error) {
      setReviewMessage({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.' });
    } finally {
      setSubmittingReview(false);
    }
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

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy sản phẩm!</h2>
          <Link to="/" className="text-primary hover:underline mt-4 inline-block">Quay về trang chủ</Link>
        </div>
      </MainLayout>
    );
  }

  const validReviews = Array.isArray(reviews) ? reviews : [];
  const totalReviews = validReviews.length;
  const avgRating = totalReviews > 0 
    ? (validReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  validReviews.forEach(r => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++;
    }
  });

  return (
    <MainLayout>
      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-24 right-4 z-[9999] px-6 py-4 rounded-xl shadow-2xl flex items-center transition-all duration-300 animate-bounce ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.type === 'error' ? <XCircle className="w-6 h-6 mr-3" /> : <CheckCircle className="w-6 h-6 mr-3" />}
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b border-gray-200 text-sm">
        <div className="container mx-auto px-4">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/category/${product.category_id}`} className="hover:text-primary">{product.category_name || 'Danh mục'}</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Section 1: Product Details */}
        <div className="flex flex-col md:flex-row gap-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
          {/* Image */}
          <div className="w-full md:w-5/12">
            <div className="border border-gray-200 rounded-xl overflow-hidden p-4 flex items-center justify-center bg-gray-50 aspect-square">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <span className="font-bold uppercase text-xl">Chưa có ảnh</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="w-full md:w-7/12">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center text-yellow-400 text-sm">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="text-gray-600 ml-2">({validReviews.length} đánh giá)</span>
              </div>
              <div className="text-gray-400">|</div>
              <div className="text-sm text-gray-600">Thương hiệu: <span className="font-bold text-primary uppercase">{product.brand_name || 'Khác'}</span></div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-end space-x-4">
                {product.sale_price ? (
                  <>
                    <span className="text-3xl font-bold text-primary">{(parseInt(product.sale_price) + (selectedVariant?.price_modifier ? parseInt(selectedVariant.price_modifier) : 0)).toLocaleString()} ₫</span>
                    <span className="text-lg text-gray-400 line-through mb-1">{(parseInt(product.base_price) + (selectedVariant?.price_modifier ? parseInt(selectedVariant.price_modifier) : 0)).toLocaleString()} ₫</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">{(parseInt(product.base_price) + (selectedVariant?.price_modifier ? parseInt(selectedVariant.price_modifier) : 0)).toLocaleString()} ₫</span>
                )}
              </div>
            </div>

            {/* Phân loại Mới (Grouped by Attributes) */}
            <div className="mb-8 border-b border-gray-100 pb-8">
              {(() => {
                if (!product.variants || product.variants.length === 0) {
                  return (
                    <button disabled className="relative border border-gray-300 rounded-lg px-5 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed bg-gray-100">
                      Sản phẩm chưa cập nhật màu/size
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none rounded-lg">
                        <div className="w-full h-[1.5px] bg-gray-400 rotate-[-10deg]"></div>
                      </div>
                    </button>
                  );
                }

                const handleSelectOption = (key, value) => {
                  const newOptions = { ...selectedOptions, [key]: value };
                  setSelectedOptions(newOptions);
                  
                  // Find matching variant
                  const match = product.variants.find(v => {
                    const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
                    return Object.keys(newOptions).every(k => attrs[k] === newOptions[k]);
                  });
                  
                  // Only set if fully matched (all keys selected)
                  if (Object.keys(attributesMap).every(k => newOptions[k])) {
                    setSelectedVariant(match || null);
                  } else {
                    setSelectedVariant(null);
                  }
                };

                return Object.keys(attributesMap).map(key => (
                  <div key={key} className="mb-4">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">{key}:</h4>
                    <div className="flex flex-wrap gap-3">
                      {Array.from(attributesMap[key]).map(value => {
                        const isSelected = selectedOptions[key] === value;
                        return (
                          <button 
                            key={value}
                            onClick={() => handleSelectOption(key, value)}
                            className={`relative border rounded-lg px-5 py-2 text-sm font-medium transition-all ${isSelected ? 'border-primary text-primary bg-orange-50 ring-1 ring-primary' : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'}`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
              
              {selectedVariant && selectedVariant.stock_quantity > 0 ? (
                <p className="text-green-600 text-sm mt-3 font-medium">Còn {selectedVariant.stock_quantity} sản phẩm (Bản: {selectedVariant.variant_name})</p>
              ) : (
                Object.keys(selectedOptions).length > 0 && !selectedVariant && (
                   <p className="text-red-500 text-sm mt-3 font-medium">Phiên bản này đã hết hàng hoặc không tồn tại.</p>
                )
              )}
            </div>

            {/* Số lượng */}
            <div className="mb-8 border-b border-gray-100 pb-8">
              <h4 className="text-sm font-bold text-gray-800 mb-3">Số lượng:</h4>
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-l-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-lg"
                >
                  -
                </button>
                <input 
                  type="number"
                  min="1"
                  max={selectedVariant ? selectedVariant.stock_quantity : 99}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const maxStock = selectedVariant ? selectedVariant.stock_quantity : 99;
                    if (!isNaN(val)) {
                      if (val > maxStock) {
                        setQuantity(maxStock);
                        showToast(`Chỉ còn ${maxStock} sản phẩm trong kho!`, 'error');
                      } else {
                        setQuantity(val);
                      }
                    } else {
                      setQuantity('');
                    }
                  }}
                  onBlur={() => {
                    if (quantity === '' || isNaN(quantity) || quantity < 1) setQuantity(1);
                  }}
                  className="w-14 h-10 border-t border-b border-gray-300 flex items-center justify-center font-semibold text-gray-800 bg-white text-center outline-none focus:ring-2 focus:ring-primary/50 m-0 p-0 appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button 
                  onClick={() => {
                    const maxStock = selectedVariant ? selectedVariant.stock_quantity : 99;
                    if (quantity < maxStock) setQuantity(quantity + 1);
                    else showToast(`Chỉ còn ${maxStock} sản phẩm trong kho!`, 'error');
                  }}
                  className="w-10 h-10 border border-gray-300 rounded-r-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Offers Box (Dynamic) */}
            <div className="border border-primary rounded-lg p-5 mb-8 relative bg-orange-50/30">
              <div className="absolute -top-4 left-4 bg-white border border-primary px-3 py-1 rounded-full text-primary font-bold flex items-center shadow-sm">
                <Gift className="w-4 h-4 mr-1" />
                ƯU ĐÃI
              </div>
              
              {renderDynamicOffers()}
              
              <div className="mt-5 pt-4 border-t border-dashed border-gray-300">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center text-sm">
                  <Gift className="w-4 h-4 text-primary mr-2" /> Ưu đãi thêm khi mua sản phẩm tại <span className="text-primary ml-1 uppercase">NaviShop Premium</span>
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" /> <span className="text-primary font-medium">Sơn logo mặt vợt</span> miễn phí</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" /> <span className="text-primary font-medium">Bảo hành lưới đan</span> trong 72 giờ</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" /> <span className="text-primary font-medium">Thay gen vợt</span> miễn phí trọn đời</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" /> <span className="text-primary font-medium">Tích luỹ điểm thành viên</span> Premium</li>
                  <li className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0 mt-0.5" /> <span className="text-primary font-medium">Voucher giảm giá</span> cho lần mua hàng tiếp theo</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={async () => {
                  if (!currentUser) return showToast('Vui lòng đăng nhập trước khi mua!', 'error');
                  if (Object.keys(attributesMap).length > 0 && !selectedVariant) return showToast('Vui lòng chọn đầy đủ phân loại!', 'error');
                  
                  try {
                    // Cần lấy cart_id. Sẽ xử lý bằng cách getMyCart, nếu lỗi 404 thì tạo mới
                    let cartId;
                    const cart = await cartService.getMyCart();
                    if (cart && cart.id) {
                      cartId = cart.id;
                    } else {
                      // Tạo giỏ hàng mới
                      const newCart = await cartService.createCart(currentUser.id);
                      cartId = newCart.id;
                    }
                    
                    await cartService.addItemToCart({
                      cart_id: cartId,
                      variant_id: selectedVariant ? selectedVariant.id : null,
                      quantity: quantity
                    });
                    
                    showToast('Đã thêm ' + (selectedVariant ? selectedVariant.variant_name : product.name) + ' vào giỏ hàng!', 'success');
                    // Trigger a custom event to update header cart count
                    window.dispatchEvent(new Event('cartUpdated'));
                  } catch (error) {
                    console.error("Lỗi thêm vào giỏ:", error);
                    showToast("Có lỗi xảy ra khi thêm vào giỏ hàng.", 'error');
                  }
                }}
                className="w-full bg-orange-50 hover:bg-orange-100 text-primary border border-primary font-bold py-3 rounded-xl uppercase flex items-center justify-center transition-colors shadow-sm"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm Giỏ Hàng
              </button>
              <button 
                onClick={async () => {
                  if (!currentUser) return showToast('Vui lòng đăng nhập!', 'error');
                  if (Object.keys(attributesMap).length > 0 && !selectedVariant) return showToast('Vui lòng chọn đầy đủ phân loại!', 'error');
                  
                  try {
                    let cartId;
                    const cart = await cartService.getMyCart();
                    if (cart && cart.id) {
                      cartId = cart.id;
                    } else {
                      const newCart = await cartService.createCart(currentUser.id);
                      cartId = newCart.id;
                    }
                    
                    await cartService.addItemToCart({
                      cart_id: cartId,
                      variant_id: selectedVariant ? selectedVariant.id : null,
                      quantity: quantity
                    });
                    
                    window.dispatchEvent(new Event('cartUpdated'));
                    window.location.href = '/cart'; // Chuyển sang giỏ hàng
                  } catch (error) {
                    console.error("Lỗi mua ngay:", error);
                    showToast("Có lỗi xảy ra.", 'error');
                  }
                }}
                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-xl uppercase flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
              >
                Mua Ngay
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Ratings & Reviews */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-10 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Đánh giá & nhận xét {product.name}</h2>
          </div>
          
          <div className="p-6">
            <div className="border border-gray-200 rounded-xl mb-8 overflow-hidden">
              <div className="flex flex-col md:flex-row p-6 items-center">
                {/* Rating Summary Left */}
                <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 md:pr-6 mb-6 md:mb-0">
                  <div className="text-5xl font-bold text-gray-800 mb-2">{avgRating}/5</div>
                  <div className="flex text-yellow-400 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(avgRating)) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm font-medium">{totalReviews} đánh giá và nhận xét</p>
                </div>

                {/* Rating Summary Right */}
                <div className="w-full md:w-2/3 md:pl-8">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = ratingCounts[star];
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center text-sm mb-2 text-gray-600 font-medium">
                        <span className="w-4">{star}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current mx-1" />
                        <div className="flex-1 h-2 mx-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gray-300 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="w-20 text-right">{count} đánh giá</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-col items-center justify-center text-center">
                <p className="text-gray-600 mb-3 text-sm">Bạn đánh giá sao sản phẩm này?</p>
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-8 rounded text-sm transition-colors"
                >
                  Đánh giá ngay
                </button>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-8 border border-gray-200 rounded-xl p-6 bg-orange-50/20">
                {currentUser ? (
                  <form onSubmit={handleReviewSubmit}>
                    <h4 className="font-bold text-gray-800 mb-3">Gửi đánh giá của bạn</h4>
                    
                    {reviewMessage.text && (
                      <div className={`p-3 mb-4 rounded text-sm ${reviewMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {reviewMessage.text}
                      </div>
                    )}

                    <div className="flex items-center mb-4">
                      <span className="text-sm font-medium text-gray-700 mr-3">Chất lượng:</span>
                      <div className="flex text-yellow-400 cursor-pointer">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            onClick={() => setRating(star)}
                            className={`w-6 h-6 hover:scale-110 transition-transform ${star <= rating ? 'fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none min-h-[100px] mb-3"
                      placeholder="Mời bạn chia sẻ cảm nhận về sản phẩm..."
                    ></textarea>
                    <div className="flex justify-end space-x-3">
                      <button 
                        type="button" 
                        onClick={() => setShowReviewForm(false)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded-lg transition-colors text-sm"
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit" 
                        disabled={submittingReview}
                        className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-lg">
                    <p className="text-gray-600 mb-4">Vui lòng đăng nhập để gửi đánh giá và bình luận về sản phẩm này.</p>
                    <Link to="/login" className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 transition-colors">Đăng nhập ngay</Link>
                  </div>
                )}
              </div>
            )}

            {/* List Reviews */}
            <div className="space-y-6">
              {validReviews.length > 0 ? (
                validReviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase mr-3">
                          {(review.reviewer_name || 'K').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-800">{review.reviewer_name || 'Khách hàng'}</p>
                          <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('vi-VN')} lúc {new Date(review.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg ml-13">
                      {review.comment}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8 italic">
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 relative inline-block">
                Có thể bạn sẽ thích
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"></div>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative group">
              {relatedProducts.map(rel => (
                <Link to={`/product/${rel.id}`} key={rel.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all-300">
                  <div className="aspect-square bg-gray-50 relative flex items-center justify-center p-4">
                    {rel.image_url ? (
                      <img src={rel.image_url} alt={rel.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <span className="text-gray-300 text-xs">No Image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {rel.name}
                    </h3>
                    {rel.sale_price ? (
                      <p className="text-primary font-bold text-lg">{parseInt(rel.sale_price).toLocaleString()} ₫</p>
                    ) : (
                      <p className="text-primary font-bold text-lg">{rel.base_price ? parseInt(rel.base_price).toLocaleString() : 0} ₫</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
