import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', parent_id: '' });

  const fetchCategories = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setCategories(dataList);
      setPagination(res.data?.pagination || res.data?.meta || null);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParentCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`);
      const all = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setParentCategories(all.filter(c => !c.parent_id));
    } catch (err) {
      console.error('Lỗi lấy danh mục cha:', err);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
    fetchParentCategories();
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCategories(1);
  };

  const openModal = (category = null) => {
    if (category) {
      setFormData({
        id: category.id,
        name: category.name,
        parent_id: category.parent_id || ''
      });
    } else {
      setFormData({ id: null, name: '', parent_id: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ id: null, name: '', parent_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null
      };

      if (formData.id) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      closeModal();
      fetchCategories(currentPage);
      fetchParentCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu danh mục");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories(currentPage);
      fetchParentCategories();
    } catch (err) {
      alert("Lỗi khi xóa");
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Quản lý Danh mục</h1>
          <p className="text-zinc-500 text-xs mt-1">Danh sách phân loại sản phẩm toàn hệ thống</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="flex items-center px-5 py-2.5 bg-[#ea580c] text-white rounded-xl hover:bg-[#c2410c] transition shadow-md shadow-orange-500/20 font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <Plus size={18} className="mr-1.5" />
          Thêm Danh Mục
        </button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex max-w-md bg-white border border-zinc-300 rounded-xl overflow-hidden shadow-xs">
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs text-zinc-800 outline-none"
          />
          <button type="submit" className="bg-[#ea580c] text-white px-5 py-2.5 hover:bg-[#c2410c] transition font-bold text-xs uppercase tracking-wider cursor-pointer">
            Tìm kiếm
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea580c]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Tên Danh Mục</th>
                  <th className="p-4">Danh Mục Cha</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-4 text-zinc-400 font-mono">#{c.id}</td>
                      <td className="p-4 font-bold text-zinc-900">{c.name}</td>
                      <td className="p-4 text-zinc-600">
                        {c.parent_name ? (
                          <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 rounded-md font-medium text-[11px]">
                            {c.parent_name}
                          </span>
                        ) : (
                          <span className="text-zinc-400 italic">Danh mục gốc</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => openModal(c)}
                          className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-zinc-400">
                      Chưa có danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="p-4 border-t border-zinc-100">
              <Pagination 
                pagination={pagination} 
                onPageChange={(page) => setCurrentPage(page)} 
              />
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-black text-zinc-900 mb-4">
              {formData.id ? 'Chỉnh sửa Danh Mục' : 'Thêm Danh Mục Mới'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold uppercase mb-1">Tên Danh Mục *</label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Vợt Cầu Lông..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold uppercase mb-1">Danh Mục Cha (Tùy chọn)</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                >
                  <option value="">-- Không có (Là danh mục gốc) --</option>
                  {parentCategories
                    .filter(p => p.id !== formData.id)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#ea580c] text-white rounded-xl hover:bg-[#c2410c] font-bold uppercase tracking-wider shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {formData.id ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategoryPage;
