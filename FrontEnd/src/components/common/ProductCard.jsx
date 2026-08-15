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
    <div className="group relative bg-white dark:bg-[#12131a] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col h-full card-hover-effect transition-colors duration-300">
      {/* Product Image Stage */}
      <Link to={`/product/${product.id}`} className="relative block aspect-[4/3] bg-[#f8f9fa] dark:bg-[#181a24] overflow-hidden p-4 transition-colors duration-300">
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.brand_name && (
            <span className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-zinc-900 dark:bg-zinc-800 text-white rounded-md shadow-xs">
              {product.brand_name}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 text-[11px] font-bold bg-[#ea580c] text-white rounded-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isFavorite 
              ? 'bg-rose-50 dark:bg-rose-950 text-rose-500 shadow-sm' 
              : 'bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xs text-zinc-400 hover:text-rose-500 hover:bg-white dark:hover:bg-zinc-700 shadow-xs'
          }`}
          title={isFavorite ? 'Xóa khỏi yêu thích' : 'Lưu vào yêu thích'}
        >
          <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
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
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Quick Spec Tag */}
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 mb-1.5">
            <span>{product.category_name || 'Cầu lông'}</span>
            {weightBadge && (
              <span className="font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px]">
                {weightBadge}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm md:text-base leading-snug line-clamp-2 group-hover:text-[#ea580c] transition-colors">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base md:text-lg font-black text-[#ea580c]">
                {(salePrice || basePrice).toLocaleString('vi-VN')} ₫
              </span>
              {salePrice && (
                <span className="text-xs text-zinc-400 line-through">
                  {basePrice.toLocaleString('vi-VN')} ₫
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white dark:text-zinc-200 flex items-center justify-center group-hover:bg-[#ea580c] dark:group-hover:bg-[#ea580c] transition-colors"
            title="Xem chi tiết"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
