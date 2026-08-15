import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { postService } from '../services/postService';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

const NewsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await postService.getAllPosts(1, 12);
        const list = res?.posts || res?.data || (Array.isArray(res) ? res : []);
        setPosts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Lỗi tải tin tức:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">
            Kiến thức & Tin tức Naro Shop
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Cẩm Nang Cầu Lông
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Cập nhật tin tức giải đấu, kinh nghiệm chọn vợt, hướng dẫn kỹ thuật đập cầu và review dụng cụ.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-72 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-[#12131a] p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md mx-auto">
            <BookOpen size={28} className="mx-auto text-zinc-400 mb-2" />
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200">Chưa có bài viết nào</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => {
              const snippet = stripHtml(post.content).substring(0, 140) + '...';
              const img = post.thumbnail_url || post.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=60';

              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-[#12131a] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col justify-between shadow-xs hover:border-[#ea580c] dark:hover:border-[#ea580c] transition-all duration-300"
                >
                  <Link to={`/news/${post.id}`} className="aspect-[16/9] block overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                    <img
                      src={img}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=60';
                      }}
                    />
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} /> {new Date(post.created_at || Date.now()).toLocaleDateString('vi-VN')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User size={13} /> {post.author_name || 'Naro Editor'}
                        </span>
                      </div>

                      <Link to={`/news/${post.id}`}>
                        <h3 className="font-bold text-base text-zinc-900 dark:text-white line-clamp-2 hover:text-[#ea580c] dark:hover:text-[#ea580c] transition-colors leading-snug">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {snippet}
                      </p>
                    </div>

                    <Link
                      to={`/news/${post.id}`}
                      className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-[#ea580c] hover:underline"
                    >
                      <span>Đọc tiếp</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default NewsPage;
