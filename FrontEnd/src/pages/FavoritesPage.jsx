import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import Pagination from '../components/Pagination';
import { Trash2, Heart, Eye } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const key = `favorites_${user.id}`;
    try {
      const favs = JSON.parse(localStorage.getItem(key)) || [];
      setFavorites(favs);
    } catch (e) {
      setFavorites([]);
    }
  }, [navigate]);

  const handleRemoveFavorite = (productId) => {
    const user = authService.getCurrentUser();
    if (!user) return;
    const key = `favorites_${user.id}`;
    try {
      const updated = favorites.filter(item => item.id !== productId);
      localStorage.setItem(key, JSON.stringify(updated));
      setFavorites(updated);
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (e) {
      console.error("Lỗi xóa yêu thích:", e);
    }
  };

  const totalPages = Math.ceil(favorites.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [favorites, totalPages, currentPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = favorites.slice(indexOfFirstItem, indexOfLastItem);

  const hasItems = favorites.length > 0;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800 uppercase mb-8 flex items-center">
            <Heart className="w-6 h-6 mr-3 text-red-500 fill-current animate-pulse" />
            Sản Phẩm Yêu Thích Của Bạn
          </h1>

          {!hasItems ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 fill-current" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Danh sách yêu thích trống</h2>
              <p className="text-gray-500 mb-8">Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy quay lại mua sắm nhé!</p>
              <Link to="/" className="inline-block bg-primary hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-3 text-center">Giá bán</div>
                <div className="col-span-3 text-center">Thao tác</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {currentItems.map(item => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 items-center">
                    {/* Sản phẩm */}
                    <div className="col-span-1 md:col-span-6 flex items-center">
                      <button 
                        onClick={() => handleRemoveFavorite(item.id)}
                        className="mr-4 w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 rounded-full flex items-center justify-center transition-colors shrink-0"
                        title="Xóa khỏi danh sách yêu thích"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <Link to={`/product/${item.id}`} className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center p-2 mr-4 hover:opacity-85 transition-opacity">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <span className="text-xs text-gray-300">No Img</span>
                        )}
                      </Link>
                      
                      <div>
                        <Link to={`/product/${item.id}`} className="font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2 text-sm md:text-base">
                          {item.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 mt-1 text-xs text-gray-500">
                          {item.brand_name && (
                            <span>Thương hiệu: <span className="font-semibold uppercase text-primary">{item.brand_name}</span></span>
                          )}
                          {item.brand_name && item.category_name && <span>•</span>}
                          {item.category_name && (
                            <span>Danh mục: <span className="font-medium text-gray-700">{item.category_name}</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Giá bán */}
                    <div className="col-span-1 md:col-span-3 text-left md:text-center">
                      <span className="md:hidden text-gray-500 font-semibold mr-2">Giá:</span>
                      {item.sale_price ? (
                        <div className="inline-block md:block">
                          <span className="font-bold text-primary text-base md:text-lg block md:inline">
                            {parseInt(item.sale_price).toLocaleString()} ₫
                          </span>
                          <span className="text-xs text-gray-400 line-through md:ml-2">
                            {parseInt(item.base_price).toLocaleString()} ₫
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-primary text-base md:text-lg">
                          {item.base_price ? parseInt(item.base_price).toLocaleString() : 0} ₫
                        </span>
                      )}
                    </div>
                    
                    {/* Thao tác */}
                    <div className="col-span-1 md:col-span-3 flex justify-start md:justify-center items-center">
                      <Link 
                        to={`/product/${item.id}`}
                        className="bg-primary hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg text-sm flex items-center justify-center transition-colors shadow-sm w-full md:w-auto"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem sản phẩm
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Pagination 
                    pagination={{ currentPage, totalPages }} 
                    onPageChange={setCurrentPage} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FavoritesPage;
