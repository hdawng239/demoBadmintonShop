import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { authService } from '../services/authService';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import { 
  Star, 
  ShoppingBag, 
  CheckCircle2, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles,
  Share2,
  AlertCircle
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = authService.getCurrentUser();

  // Variant Selection State
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const prodData = await productService.getProductById(id);
        setProduct(prodData);

        // Fetch related products
        if (prodData?.category_id) {
          const relRes = await productService.getAllProducts(1, 5, prodData.category_id);
          const list = (relRes?.products || relRes?.data || []).filter(p => p.id !== parseInt(id)).slice(0, 4);
          setRelatedProducts(list);
        }

        // Fetch reviews
        const revData = await reviewService.getProductReviews(id, 1, 50);
        setReviews(revData?.reviews || revData?.data || revData || []);

        // Initial Wishlist status
        if (currentUser?.id) {
          wishlistService.getProductIds().then(ids => {
            setIsFavorite(ids.includes(parseInt(id)));
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Build attributesMap from variants
  const attributesMap = {};
  if (product && product.variants) {
    product.variants.forEach(variant => {
      if (variant.attributes) {
        try {
          const attrs = typeof variant.attributes === 'string' ? JSON.parse(variant.attributes) : variant.attributes;
          Object.keys(attrs).forEach(key => {
            if (!attributesMap[key]) attributesMap[key] = new Set();
            attributesMap[key].add(attrs[key]);
          });
        } catch (e) {}
      }
    });
  }

  // Handle Attribute Option Click
  const handleSelectOption = (key, value) => {
    let newOptions = { ...selectedOptions };
    if (newOptions[key] === value) {
      delete newOptions[key];
    } else {
      newOptions[key] = value;
    }

    // Match exact variant
    const exactMatch = product.variants?.find(v => {
      if (!v.attributes) return false;
      try {
        const attrs = typeof v.attributes === 'string' ? JSON.parse(v.attributes) : v.attributes;
        const attrKeys = Object.keys(attrs);
        const newKeys = Object.keys(newOptions);
        return attrKeys.length === newKeys.length && attrKeys.every(k => attrs[k] === newOptions[k]);
      } catch (e) {
        return false;
      }
    });

    setSelectedOptions(newOptions);
    setSelectedVariant(exactMatch || null);
  };

  // Add to Cart handler
  const handleAddToCart = async (isBuyNow = false) => {
    const user = authService.getCurrentUser();
    if (!user) {
      alert('Vui lòng đăng nhập trước khi mua hoặc thêm vào giỏ hàng!');
      navigate('/login');
      return;
    }

    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      alert('Vui lòng chọn đầy đủ thuộc tính / phân loại sản phẩm trước khi mua!');
      return;
    }

    const availableStock = selectedVariant 
      ? (selectedVariant.stock_quantity !== undefined ? selectedVariant.stock_quantity : 999) 
      : (product?.stock_quantity !== undefined ? product.stock_quantity : 999);

    if (availableStock <= 0) {
      alert('Phân loại này hiện đã hết hàng trong kho!');
      return;
    }

    if (quantity > availableStock) {
      alert(`Số lượng bạn chọn (${quantity}) vượt quá tồn kho còn lại (${availableStock} sản phẩm). Hệ thống đã tự động điều chỉnh về ${availableStock}!`);
      setQuantity(availableStock);
      return;
    }

    try {
      await cartService.addToCart(product, quantity, selectedVariant);
      window.dispatchEvent(new Event('cartUpdated'));

      if (isBuyNow) {
        navigate('/cart');
      } else {
        showToast('Đã thêm sản phẩm vào giỏ hàng thành công!');
      }
    } catch (err) {
      console.error('Lỗi thêm giỏ hàng:', err);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
      return;
    }

    const prev = isFavorite;
    setIsFavorite(!prev);
    try {
      const res = await wishlistService.toggle(product.id);
      setIsFavorite(res.isFavorite);
      window.dispatchEvent(new Event('favoritesUpdated'));
      showToast(res.isFavorite ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
    } catch (err) {
      setIsFavorite(prev);
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Vui lòng đăng nhập để gửi đánh giá!');
      return;
    }

    if (!comment.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        user_id: currentUser.id,
        product_id: parseInt(id),
        rating,
        comment
      });
      setComment('');
      showToast('Cảm ơn bạn đã gửi đánh giá sản phẩm!');
      const revData = await reviewService.getProductReviews(id, 1, 50);
      setReviews(revData?.reviews || revData?.data || revData || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Không tìm thấy sản phẩm!</h2>
          <Link to="/" className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl font-bold inline-block">
            Quay về trang chủ
          </Link>
        </div>
      </MainLayout>
    );
  }

  // Price calculations
  const basePrice = parseInt(product.base_price) || 0;
  const modifier = selectedVariant?.price_modifier ? parseInt(selectedVariant.price_modifier) : 0;
  const effectivePrice = basePrice + modifier;
  const salePrice = product.sale_price ? (parseInt(product.sale_price) + modifier) : null;

  // Technical Specs parsing
  let specs = {};
  if (product.technical_specs) {
    try {
      specs = typeof product.technical_specs === 'string' ? JSON.parse(product.technical_specs) : product.technical_specs;
    } catch (e) {}
  }

  const validReviews = Array.isArray(reviews) ? reviews : [];
  const avgRating = validReviews.length > 0 
    ? (validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1)
    : '5.0';

  return (
    <MainLayout>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 px-5 py-3 bg-zinc-950 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 border border-zinc-800 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        
        {/* Breadcrumbs */}
        <nav className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to={`/category/${product.category_id}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            {product.category_name || 'Danh mục'}
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{product.name}</span>
        </nav>

        {/* Top Product Section (Dark/Light Fully Styled) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white dark:bg-[#12131a] p-6 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 mb-12 shadow-sm transition-colors duration-300">
          
          {/* Left: Product Image */}
          <div className="lg:col-span-5">
            <div className="aspect-square bg-[#f8f9fa] dark:bg-[#181a24] rounded-2xl p-8 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center relative overflow-hidden transition-colors duration-300">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-lighten hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-zinc-400 dark:text-zinc-600 font-bold uppercase text-xs">Chưa có ảnh</span>
              )}

              {/* Brand Tag */}
              {product.brand_name && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-zinc-950 dark:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-md border border-zinc-800">
                  {product.brand_name}
                </span>
              )}
            </div>
          </div>

          {/* Right: Product Info & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">
                  {product.category_name || 'Sản phẩm Cầu Lông'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-1 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating & Brand */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={15} className="fill-current" />
                  <span>{avgRating}</span>
                  <span className="text-zinc-400 dark:text-zinc-500 font-normal">({validReviews.length} đánh giá)</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  Thương hiệu: <strong className="text-zinc-900 dark:text-white uppercase">{product.brand_name || 'Chính hãng'}</strong>
                </span>
              </div>

              {/* Price Stage */}
              <div className="p-4 bg-zinc-50 dark:bg-[#181924] rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-baseline gap-3 transition-colors duration-300">
                <span className="text-3xl font-black text-[#ea580c]">
                  {(salePrice || effectivePrice).toLocaleString('vi-VN')} ₫
                </span>
                {salePrice && (
                  <span className="text-sm text-zinc-400 line-through">
                    {effectivePrice.toLocaleString('vi-VN')} ₫
                  </span>
                )}
                <span className="ml-auto text-[11px] font-bold text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-400/10 border border-lime-200 dark:border-lime-400/20 px-2.5 py-1 rounded-md">
                  Chính hãng 100%
                </span>
              </div>

              {/* Variant Matrix Picker */}
              {Object.keys(attributesMap).length > 0 ? (
                <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {Object.keys(attributesMap).map(key => (
                    <div key={key}>
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">{key}:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(attributesMap[key]).map(val => {
                          const isSelected = selectedOptions[key] === val;
                          return (
                            <button
                              key={val}
                              onClick={() => handleSelectOption(key, val)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#ea580c] text-white border-[#ea580c] shadow-xs'
                                  : 'bg-white dark:bg-[#181a24] text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Stock Feedback */}
                  {selectedVariant ? (
                    selectedVariant.stock_quantity > 0 ? (
                      <p className="text-xs font-semibold text-lime-600 dark:text-lime-400 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Sẵn hàng: {selectedVariant.stock_quantity} sản phẩm ({selectedVariant.variant_name})
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-rose-500">
                        Phiên bản này hiện đã tạm hết hàng.
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                      * Vui lòng chọn phân loại để xem tình trạng tồn kho.
                    </p>
                  )}
                </div>
              ) : product.variants && product.variants.length > 0 ? (
                /* Flat Variant fallback */
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Phân loại:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedVariant?.id === v.id
                            ? 'bg-[#ea580c] text-white border-[#ea580c]'
                            : 'bg-white dark:bg-[#181a24] text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {v.variant_name} ({v.stock_quantity > 0 ? `Còn ${v.stock_quantity}` : 'Hết'})
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Quantity & Actions */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-[#181a24]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-zinc-800 dark:text-zinc-200">{quantity}</span>
                  <button
                    onClick={() => {
                      const maxStock = selectedVariant 
                        ? (selectedVariant.stock_quantity !== undefined ? selectedVariant.stock_quantity : 999) 
                        : (product?.stock_quantity !== undefined ? product.stock_quantity : 999);
                      if (quantity >= maxStock) {
                        showToast(`Kho chỉ còn tối đa ${maxStock} sản phẩm!`, 'warning');
                        return;
                      }
                      setQuantity(quantity + 1);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Inactive & Stock Status Warning */}
                {product.is_active === false ? (
                  <div className="w-full p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>Sản phẩm này hiện đã ngừng kinh doanh (Dừng bán).</span>
                  </div>
                ) : (
                  selectedVariant && selectedVariant.stock_quantity <= 0 && (
                    <div className="w-full p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>Phân loại này hiện đã hết hàng trong kho.</span>
                    </div>
                  )
                )}

                {/* Add to Cart */}
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={product.is_active === false || (selectedVariant && selectedVariant.stock_quantity <= 0)}
                  className="flex-1 w-full py-3 px-6 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingBag size={17} />
                  {product.is_active === false 
                    ? 'Ngừng kinh doanh' 
                    : (selectedVariant && selectedVariant.stock_quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ')}
                </button>

                {/* Buy Now */}
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={product.is_active === false || (selectedVariant && selectedVariant.stock_quantity <= 0)}
                  className="flex-1 w-full py-3 px-6 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {product.is_active === false 
                    ? 'Ngừng kinh doanh' 
                    : (selectedVariant && selectedVariant.stock_quantity <= 0 ? 'Hết hàng' : 'Mua ngay')}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={product.is_active === false}
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                    product.is_active === false ? 'opacity-40 cursor-not-allowed' : ''
                  } ${
                    isFavorite
                      ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-500'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title="Yêu thích"
                >
                  <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Guarantee Bar */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} className="text-lime-600 dark:text-lime-400 shrink-0" /> Chính hãng 100%
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Truck size={16} className="text-[#ea580c] shrink-0" /> Giao hàng GHN
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <RotateCcw size={16} className="text-sky-600 dark:text-sky-400 shrink-0" /> Đổi size 7 ngày
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Section 2: Technical Specifications & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
          {/* Description */}
          <div className="lg:col-span-7 bg-white dark:bg-[#12131a] p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors duration-300">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Mô tả chi tiết sản phẩm
            </h3>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {product.description || 'Sản phẩm cầu lông chính hãng chất lượng cao, đáp ứng đầy đủ tiêu chuẩn thi đấu và tập luyện chuyên nghiệp.'}
            </div>
          </div>

          {/* Technical Specs Table */}
          <div className="lg:col-span-5 bg-white dark:bg-[#12131a] p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 transition-colors duration-300">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-3">
              Thông số kỹ thuật
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Thương hiệu:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100 uppercase">{product.brand_name || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Danh mục:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-100">{product.category_name || 'N/A'}</span>
              </div>
              {specs.flex && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Độ cứng thân vợt:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{specs.flex}</span>
                </div>
              )}
              {specs.balance && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Điểm cân bằng:</span>
                  <span className="font-bold text-[#ea580c]">{specs.balance}</span>
                </div>
              )}
              {specs.weight && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Trọng lượng / Cán:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{specs.weight}</span>
                </div>
              )}
              {specs.tension && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Sức căng tối đa (lbs):</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{specs.tension}</span>
                </div>
              )}
              {specs.length && (
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Chiều dài (mm):</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{specs.length} mm</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Customer Reviews */}
        <div className="bg-white dark:bg-[#12131a] p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 mb-14 space-y-6 transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                Đánh giá từ khách hàng ({validReviews.length})
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Nhận xét thực tế từ người chơi đã trải nghiệm</p>
            </div>
          </div>

          {/* Add Review Form */}
          {currentUser ? (
            <form onSubmit={handleReviewSubmit} className="bg-zinc-50 dark:bg-[#181924] p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Viết đánh giá của bạn:</p>
              
              {/* Star Rating Picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 cursor-pointer"
                  >
                    <Star size={20} className={star <= rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-600'} />
                  </button>
                ))}
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-2">{rating} sao</span>
              </div>

              <textarea
                required
                rows="3"
                placeholder="Chia sẻ cảm nhận về độ đầm tay, cảm giác cầu, độ bền..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 bg-white dark:bg-[#12131a] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-zinc-50 dark:bg-[#181924] rounded-2xl text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
              <span>Đăng nhập để gửi đánh giá về sản phẩm này.</span>
              <Link to="/login" className="font-bold text-[#ea580c] hover:underline">Đăng nhập ngay</Link>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {validReviews.map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#181a24] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center justify-center font-bold text-xs">
                      {rev.user_name ? rev.user_name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{rev.user_name || 'Khách hàng'}</span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={13} className={s <= rev.rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-600'} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
            {validReviews.length === 0 && (
              <p className="text-xs text-zinc-400 py-4 text-center">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            )}
          </div>
        </div>

        {/* Section 4: Related Products */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Sản phẩm cùng phân khúc</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {product && (
        <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-30 bg-white/95 dark:bg-[#12131a]/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 p-2.5 px-3 flex items-center gap-2 shadow-[0_-4px_25px_rgba(0,0,0,0.12)]">
          <button
            onClick={() => handleFavoriteClick()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              isFavorite 
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 text-rose-500' 
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
            }`}
            title="Yêu thích"
          >
            <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
          </button>

          <button
            onClick={() => handleAddToCart(false)}
            disabled={product.is_active === false || (selectedVariant && selectedVariant.stock_quantity <= 0)}
            className="flex-1 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <ShoppingBag size={15} />
            <span>Thêm giỏ</span>
          </button>

          <button
            onClick={() => handleAddToCart(true)}
            disabled={product.is_active === false || (selectedVariant && selectedVariant.stock_quantity <= 0)}
            className="flex-1 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Mua ngay</span>
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default ProductDetailPage;
