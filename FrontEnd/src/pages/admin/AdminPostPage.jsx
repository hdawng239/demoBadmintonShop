import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Sparkles, Check, AlertCircle, BookOpen } from 'lucide-react';
import axios from 'axios';

const AdminPostPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', summary: '', content: '', thumbnail_url: '', is_published: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/posts?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setPosts(dataList);
      setPagination(res.data?.pagination || res.data?.meta || null);
    } catch (err) {
      console.error('Lỗi tải danh sách tin tức:', err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Đã xóa bài viết thành công!");
      fetchPosts(currentPage);
    } catch (err) {
      showToast("Lỗi khi xóa bài viết", "error");
    }
  };

  const handleTogglePublish = async (post) => {
    const newStatus = !post.is_published;
    // Optimistic update
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: newStatus } : p));
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/posts/${post.id}`, { is_published: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(newStatus ? "Đã xuất bản bài viết lên website!" : "Đã chuyển bài viết về bản nháp!");
    } catch (err) {
      // Revert on error
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_published: post.is_published } : p));
      showToast("Lỗi cập nhật trạng thái xuất bản", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (editPost) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/posts/${editPost.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Cập nhật bài viết thành công!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/posts`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast("Tạo bài viết mới thành công!");
      }
      setShowModal(false);
      fetchPosts(currentPage);
    } catch (err) {
      showToast(err.response?.data?.message || "Lỗi lưu bài viết", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditPost(null);
    setFormData({ title: '', summary: '', content: '', thumbnail_url: '', is_published: true });
    setShowModal(true);
  };

  const openEditModal = (post) => {
    setEditPost(post);
    setFormData({
      title: post.title,
      summary: post.summary || '',
      content: post.content,
      thumbnail_url: post.thumbnail_url || '',
      is_published: post.is_published !== undefined ? post.is_published : true
    });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-[#ea580c]" size={24} /> Quản lý Tin tức & Bài viết
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Đăng tải, chỉnh sửa bài viết hướng dẫn chọn vợt và tin tức cầu lông</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-5 py-2.5 rounded-xl flex items-center justify-center transition shadow-md shadow-orange-500/20 font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
        >
          <Plus size={18} className="mr-1.5" /> Viết bài mới
        </button>
      </div>

      {toastMessage && (
        <div className={`p-4 mb-6 rounded-2xl text-xs flex items-center gap-2 border shadow-xs animate-in fade-in ${
          toastMessage.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' 
            : 'bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800 text-lime-800 dark:text-lime-300'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex max-w-md bg-white dark:bg-[#12131a] border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden shadow-xs">
          <input 
            type="text" 
            placeholder="Tìm kiếm bài viết..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 bg-transparent outline-none"
          />
          <button type="submit" className="bg-[#ea580c] text-white px-5 py-2.5 hover:bg-[#c2410c] transition font-bold text-xs uppercase tracking-wider cursor-pointer">
            Tìm kiếm
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea580c]"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#12131a] rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-[#181a24] border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Hình ảnh</th>
                  <th className="p-4">Tiêu đề</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4">Ngày đăng</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 text-zinc-400 dark:text-zinc-500 font-mono">#{post.id}</td>
                      <td className="p-4">
                        {post.thumbnail_url ? (
                          <img src={post.thumbnail_url} alt="" className="w-12 h-12 object-cover rounded-xl border border-zinc-200 dark:border-zinc-700" />
                        ) : (
                          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 font-bold text-[10px]">NO IMG</div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-zinc-900 dark:text-white max-w-xs truncate">
                        <p className="truncate">{post.title}</p>
                        {post.summary && (
                          <p className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{post.summary}</p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          title="Bấm để chuyển đổi giữa Đã xuất bản và Bản nháp"
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-all cursor-pointer ${
                            post.is_published 
                              ? 'bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-400 border border-lime-200 dark:border-lime-800 hover:bg-lime-100' 
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200'
                          }`}
                        >
                          {post.is_published ? (
                            <>
                              <Eye size={12} />
                              <span>Đã xuất bản</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} />
                              <span>Bản nháp</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-zinc-500 dark:text-zinc-400">
                        {new Date(post.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleTogglePublish(post)}
                          className="p-1.5 text-zinc-400 hover:text-[#ea580c] hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-lg transition-colors cursor-pointer"
                          title={post.is_published ? "Chuyển thành bản nháp" : "Xuất bản công khai"}
                        >
                          {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => openEditModal(post)}
                          className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Sửa bài viết"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center text-zinc-400 dark:text-zinc-500">
                      Chưa có bài viết nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
              <Pagination 
                pagination={pagination} 
                onPageChange={(page) => setCurrentPage(page)} 
              />
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#12131a] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-black text-zinc-900 dark:text-white mb-4">
              {editPost ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Tiêu đề bài viết *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Nhập tiêu đề bài viết..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Link ảnh thumbnail (URL)</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Tóm tắt ngắn</label>
                <textarea 
                  rows="2"
                  placeholder="Tóm tắt ngắn gọn 1-2 câu về nội dung bài viết..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-bold uppercase mb-1">Nội dung chi tiết *</label>
                <textarea 
                  rows="8"
                  required
                  placeholder="Nội dung chi tiết của bài viết (hỗ trợ định dạng HTML)..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-[#181a24] border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="checkbox" 
                  id="p_publish"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="w-4 h-4 accent-[#ea580c] cursor-pointer"
                />
                <label htmlFor="p_publish" className="text-zinc-700 dark:text-zinc-300 font-bold select-none cursor-pointer">
                  Xuất bản công khai ngay lên website
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#ea580c] text-white rounded-xl hover:bg-[#c2410c] shadow-md shadow-orange-500/20 font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (editPost ? 'Lưu thay đổi' : 'Đăng bài')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPostPage;
