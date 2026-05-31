import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const AdminPostPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', slug: '', content: '', thumbnail_url: '' });

  const fetchPosts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/posts?page=${page}&limit=10&search=${searchQuery}`);
      if (res.data.data) {
        setPosts(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setPosts(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách tin tức");
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
      await axios.delete(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa bài viết");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Token chứa thông tin user id, Backend sẽ dùng author_id là user_id nếu cần, 
      // nhưng tốt nhất truyền từ Frontend nếu Backend yêu cầu, ở đây ta sẽ truyền 1 auth user từ localStorage nếu Backend không tự lấy từ token.
      // Dựa theo db, bảng posts cần author_id.
      // Để đơn giản, decode token tạm ở client hoặc backend tự xử lý. Ta sẽ truyền author_id = 1 (Tạm) nếu backend lỗi.
      // Thực tế ta nên lấy từ context. Tạm lấy từ decoded JWT:
      const payload = JSON.parse(atob(token.split('.')[1]));
      const dataToSave = { ...formData, author_id: payload.id };

      if (editPost) {
        // Cập nhật
        await axios.put(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/posts/${editPost.id}`, dataToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Thêm mới
        await axios.post(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/posts`, dataToSave, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchPosts(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu bài viết");
    }
  };

  const openAddModal = () => {
    setEditPost(null);
    setFormData({ title: '', slug: '', content: '', thumbnail_url: '' });
    setShowModal(true);
  };

  const openEditModal = (post) => {
    setEditPost(post);
    setFormData({ title: post.title, slug: post.slug, content: post.content || '', thumbnail_url: post.thumbnail_url || '' });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Tin tức</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý, thêm, sửa, xóa các bài viết tin tức.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl flex items-center transition-colors shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" /> Viết bài mới
        </button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex max-w-md">
          <input 
            type="text" 
            placeholder="Tìm kiếm tin tức..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-300 rounded-l-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-r-xl hover:bg-orange-600 transition font-medium">
            Tìm kiếm
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="p-4 font-semibold w-16">ID</th>
                    <th className="p-4 font-semibold w-24">Hình ảnh</th>
                    <th className="p-4 font-semibold">Tiêu đề</th>
                    <th className="p-4 font-semibold">Đường dẫn (Slug)</th>
                    <th className="p-4 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 text-gray-600 font-medium">#{post.id}</td>
                      <td className="p-4">
                        <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {post.thumbnail_url ? (
                            <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-800">
                        <div className="line-clamp-2" title={post.title}>{post.title}</div>
                      </td>
                      <td className="p-4 text-gray-500 truncate max-w-[200px]">{post.slug}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => openEditModal(post)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition" title="Sửa bài viết">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Xóa bài viết">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có bài viết nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 flex flex-col max-h-[90vh]">
            <h2 className="text-xl font-bold mb-5 text-gray-800">{editPost ? 'Sửa bài viết' : 'Viết bài mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn (Slug) <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="bai-viet-hay" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình thu nhỏ (URL)</label>
                <input type="text" value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  rows={8}
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" 
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 shadow-sm font-medium transition">{editPost ? 'Lưu thay đổi' : 'Đăng bài'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminPostPage;
