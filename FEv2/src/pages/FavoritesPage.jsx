import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/common/ProductCard';
import { wishlistService } from '../services/wishlistService';
import { authService } from '../services/authService';
import { Heart, ShoppingBag } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  const fetchFavorites = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await wishlistService.getWishlist();
      const list = res?.data || res?.wishlist || res || [];
      setFavorites(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi tải yêu thích:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteChange = (productId, isFav) => {
    if (!isFav) {
      setFavorites(prev => prev.filter(p => p.id !== productId));
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Heart size={26} className="text-rose-500 fill-current" /> Danh Sách Yêu Thích ({favorites.length})
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Các sản phẩm bạn đã lưu để theo dõi và mua sau.</p>
          </div>
        </div>

        {!currentUser ? (
          <div className="bg-white dark:bg-[#12131a] p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Vui lòng đăng nhập</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Đăng nhập tài khoản để đồng bộ danh sách sản phẩm yêu thích của bạn.</p>
            <Link to="/login" className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
              Đăng nhập ngay
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-80 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white dark:bg-[#12131a] p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
              <Heart size={28} />
            </div>
            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Chưa có sản phẩm yêu thích</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Bấm vào biểu tượng trái tim trên bất kỳ sản phẩm nào để lưu lại tại đây.</p>
            <Link to="/category/1" className="inline-block px-6 py-3 bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#c2410c] transition-colors">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {favorites.map(prod => (
              <ProductCard
                key={prod.id}
                product={prod}
                isFavoriteInitial={true}
                onFavoriteChange={handleFavoriteChange}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;
