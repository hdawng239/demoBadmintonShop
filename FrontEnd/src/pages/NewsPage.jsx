import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { postService } from '../services/postService';
import { Calendar, ChevronRight } from 'lucide-react';

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postService.getAllPosts(1, 100); // Lấy đủ bài để phân trang ở FE
        setPosts(data.data || []);
      } catch (error) {
        console.error("Lỗi tải tin tức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-3 border-b border-gray-200 text-sm">
        <div className="container mx-auto px-4">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-medium">Tin tức</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Tin tức & Khuyến mãi</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Cập nhật những thông tin mới nhất về sản phẩm cầu lông, kỹ thuật đánh cầu và các chương trình khuyến mãi siêu hấp dẫn từ NaviShop.</p>
        </div>

        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage).map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                <Link to={`/news/${post.id}`} className="block relative overflow-hidden aspect-[4/3]">
                  {post.thumbnail_url ? (
                    <img 
                      src={post.thumbnail_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      Chưa có ảnh
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase">
                    Tin tức
                  </div>
                </Link>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-gray-500 mb-3 font-medium">
                    <Calendar className="w-4 h-4 mr-1.5 text-primary" />
                    {new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </div>
                  
                  <Link to={`/news/${post.id}`} className="block mb-4">
                    <h2 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <div className="mt-auto">
                    <Link 
                      to={`/news/${post.id}`} 
                      className="inline-flex items-center text-sm font-bold text-primary hover:text-orange-700 transition-colors"
                    >
                      Đọc tiếp <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Phân trang */}
            {Math.ceil(posts.length / postsPerPage) > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white hover:border-primary'
                  }`}
                >
                  &lt;
                </button>
                
                {Array.from({ length: Math.ceil(posts.length / postsPerPage) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentPage(index + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      currentPage === index + 1
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-primary hover:border-orange-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button 
                  onClick={() => {
                    setCurrentPage(prev => Math.min(prev + 1, Math.ceil(posts.length / postsPerPage)));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === Math.ceil(posts.length / postsPerPage)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    currentPage === Math.ceil(posts.length / postsPerPage)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white hover:border-primary'
                  }`}
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa có bài viết nào!</h2>
            <p className="text-gray-500">Tin tức mới nhất sẽ được cập nhật sớm. Vui lòng quay lại sau.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewsPage;
