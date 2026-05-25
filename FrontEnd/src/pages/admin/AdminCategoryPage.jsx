import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Plus } from 'lucide-react';
import axios from 'axios';

const AdminCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', slug: '', parent_id: '' });

  const fetchCategories = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories?page=${page}&limit=10`);
      if (res.data.data) {
        setCategories(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setCategories(res.data);
      }
    } catch (err) {
      alert("Lỗi tải danh mục");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const openModal = (category = null) => {
    if (category) {
      setFormData({ 
        id: category.id, 
        name: category.name, 
        slug: category.slug, 
        parent_id: category.parent_id || '' 
      });
    } else {
      setFormData({ id: null, name: '', slug: '', parent_id: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData, parent_id: formData.parent_id || null };
      
      if (formData.id) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchCategories(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu danh mục");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa");
    }
  };

  // Tạo URL an toàn từ tên
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setFormData({ ...formData, name, slug });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách phân loại sản phẩm</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-orange-600 transition shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" />
          Thêm Danh Mục
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Tên danh mục</th>
                    <th className="p-4 font-semibold">Đường dẫn (Slug)</th>
                    <th className="p-4 font-semibold">Danh mục cha</th>
                    <th className="p-4 font-semibold text-center w-28">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 text-gray-600 font-medium">#{cat.id}</td>
                      <td className="p-4 text-gray-800 font-semibold">{cat.name}</td>
                      <td className="p-4 text-gray-500 text-sm">{cat.slug}</td>
                      <td className="p-4">
                        {cat.parent_name ? (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">{cat.parent_name}</span>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Không có</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <button onClick={() => openModal(cat)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-lg transition" title="Sửa">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-lg transition" title="Xóa">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">Chưa có danh mục nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Modal form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-5">{formData.id ? 'Sửa Danh mục' : 'Thêm Danh mục mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={handleNameChange} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn URL (Slug)</label>
                <input 
                  required 
                  type="text" 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục cha (Tùy chọn)</label>
                <select 
                  value={formData.parent_id} 
                  onChange={e => setFormData({...formData, parent_id: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                >
                  <option value="">-- Không có danh mục cha --</option>
                  {/* Danh sách categories để chọn parent (Loại trừ category đang sửa) */}
                  {categories.filter(c => c.id !== formData.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 font-medium shadow-sm">{formData.id ? 'Cập nhật' : 'Tạo mới'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategoryPage;
