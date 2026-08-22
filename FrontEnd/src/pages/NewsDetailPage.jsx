import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { postService } from '../services/postService';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';

const NewsDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await postService.getPostById(id);
        setPost(res?.data || res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Không tìm thấy bài viết!</h2>
          <Link to="/news" className="text-[#ea580c] font-bold hover:underline">Quay lại tin tức</Link>
        </div>
      </MainLayout>
    );
  }

  const img = post.thumbnail_url || post.image_url;

  return (
    <MainLayout>
      <article className="max-w-3xl mx-auto px-4 lg:px-6 py-10">
        <Link to="/news" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-[#ea580c] dark:hover:text-[#ea580c] mb-6 transition-colors">
          <ArrowLeft size={14} /> Quay lại danh sách tin
        </Link>

        <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8">
          <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
            <User size={14} /> {post.author_name || 'Naro Badminton Editor'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={14} /> {new Date(post.created_at || Date.now()).toLocaleDateString('vi-VN')}
          </span>
        </div>

        {img && (
          <div className="rounded-3xl overflow-hidden mb-8 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 max-h-96">
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Formatted article body */}
        <div 
          className="article-content prose dark:prose-invert max-w-none text-base leading-relaxed text-zinc-700 dark:text-zinc-300 space-y-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </MainLayout>
  );
};

export default NewsDetailPage;
