import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import { authService } from '../../services/authService';

const ProductCard = ({ product, isFavoriteInitial = false, onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [isTogglingFav, setIsTogglingFav] = useState(false);

  if (!product) return null;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      alert('Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
      return;
    }

    if (isTogglingFav) return;
    setIsTogglingFav(true);
    const prev = isFavorite;
    setIsFavorite(!prev);

    try {
      const res = await wishlistService.toggle(product.id);
      setIsFavorite(res.isFavorite);
      if (onFavoriteChange) onFavoriteChange(product.id, res.isFavorite);
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error(err);
      setIsFavorite(prev);
    } finally {
      setIsTogglingFav(false);
    }
  };

  // Parse technical specs for badge display
  let specs = null;
  if (product.technical_specs) {
    try {
      specs = typeof product.technical_specs === 'string' ? JSON.parse(product.technical_specs) : product.technical_specs;
    } catch (e) {}
  }

  // Weight / Spec snippet
  const weightBadge = specs?.weight || specs?.weight_class || (product.category_id === 1 ? '3U / 4U' : null);

  const basePrice = parseInt(product.base_price) || 0;
  const salePrice = product.sale_price ? parseInt(product.sale_price) : null;
  const discountPercent = salePrice && basePrice > salePrice ? Math.round(((basePrice - salePrice) / basePrice) * 100) : null;

  return (
    <div className="group relative bg-white dark:bg-[#12131a] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col h-full card-hover-effect transition-all duration-300 shadow-xs hover:shadow-md">
      {/* Product Image Stage */}
      <Link to={`/product/${product.id}`} className="relative block aspect-square bg-[#f8f9fa] dark:bg-[#181a24] overflow-hidden p-3 sm:p-4 transition-colors duration-300">
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.brand_name && (
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-zinc-900/90 dark:bg-zinc-800/90 backdrop-blur-xs text-white rounded-md shadow-xs">
              {product.brand_name}
            </span>
          )}
          {discountPercent && (
            <span className="px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold bg-[#ea580c] text-white rounded-md shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isFavorite 
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-500 shadow-sm' 
              : 'bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xs text-zinc-400 hover:text-rose-500 hover:bg-white dark:hover:bg-zinc-700 shadow-xs'
          }`}
          title={isFavorite ? 'Xóa khỏi yêu thích' : 'Lưu vào yêu thích'}
        >
          <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
        </button>

        {/* Image */}
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-lighten group-hover:scale-108 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 text-xs font-semibold uppercase tracking-wider">
            Chưa có hình ảnh
          </div>
        )}
      </Link>

      {/* Product Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Quick Spec Tag */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 mb-1">
            <span className="truncate max-w-[90px] sm:max-w-none">{product.category_name || 'Cầu lông'}</span>
            {weightBadge && (
              <span className="font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] shrink-0">
                {weightBadge}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-xs sm:text-sm md:text-base leading-snug line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-[#ea580c] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-2.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-1">
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
              <span className="text-xs sm:text-base md:text-lg font-black text-[#ea580c] truncate">
                {(salePrice || basePrice).toLocaleString('vi-VN')} ₫
              </span>
              {salePrice && (
                <span className="text-[10px] sm:text-xs text-zinc-400 line-through truncate">
                  {basePrice.toLocaleString('vi-VN')} ₫
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 group-hover:bg-[#ea580c] group-hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
            title="Xem chi tiết"
          >
            <ArrowRight size={14} className="sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
