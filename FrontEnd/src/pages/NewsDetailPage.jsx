import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { postService } from '../services/postService';
import { Calendar, User, ArrowLeft, Share2, Link2 } from 'lucide-react';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const data = await postService.getPostById(id);
        setPost(data);
      } catch (error) {
        console.error("Lỗi tải chi tiết tin tức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy bài viết!</h2>
          <Link to="/news" className="text-primary hover:underline mt-4 inline-block">Quay về trang Tin tức</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-3 border-b border-gray-200 text-sm">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/" className="hover:text-primary">Trang chủ</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/news" className="hover:text-primary">Tin tức</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-medium truncate max-w-[200px] md:max-w-md inline-block align-bottom">{post.title}</span>
        </div>
      </div>

      <div className="bg-white py-12">
        <article className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-block bg-orange-100 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Tin tức NaviShop
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center justify-center text-sm text-gray-500 space-x-6">
              <div className="flex items-center font-medium">
                <User className="w-4 h-4 mr-1.5 text-primary" />
                {post.author_name || 'Admin'}
              </div>
              <div className="flex items-center font-medium">
                <Calendar className="w-4 h-4 mr-1.5 text-primary" />
                {new Date(post.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </header>

          {/* Thumbnail */}
          {post.thumbnail_url && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <img 
                src={post.thumbnail_url} 
                alt={post.title} 
                className="w-full h-auto object-cover max-h-[600px]"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none text-gray-700 
            prose-headings:text-gray-900 prose-headings:font-bold 
            prose-a:text-primary hover:prose-a:text-orange-600
            prose-img:rounded-xl prose-img:shadow-md
            mb-16 border-b border-gray-200 pb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer (Share & Back) */}
          <footer className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <Link 
              to="/news" 
              className="inline-flex items-center font-bold text-gray-600 hover:text-primary transition-colors bg-gray-100 hover:bg-gray-200 px-5 py-2.5 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
            </Link>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mr-2">Chia sẻ:</span>
              <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Đã copy link bài viết!');
                }}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-600 hover:text-white transition-colors"
              >
                <Link2 className="w-5 h-5" />
              </button>
            </div>
          </footer>
        </article>
      </div>
    </MainLayout>
  );
};

export default NewsDetailPage;
