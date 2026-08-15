import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Shield, ShieldOff, Plus, Search, UserCheck } from 'lucide-react';
import axios from 'axios';

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '', role: 'customer' });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataList = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsers(dataList);
      setPagination(res.data?.pagination || res.data?.meta || null);
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa user");
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Bạn có chắc muốn đổi quyền của ${user.full_name || user.email} thành ${newRole}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${user.id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(currentPage);
    } catch (err) {
      alert("Lỗi cập nhật quyền");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editUser) {
        // Edit
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // không đổi pass nếu rỗng
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/${editUser.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi lưu dữ liệu");
    }
  };

  const openAddModal = () => {
    setEditUser(null);
    setFormData({ full_name: '', email: '', phone: '', password: '', role: 'customer' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setFormData({ full_name: user.full_name || '', email: user.email || '', phone: user.phone || '', password: '', role: user.role || 'customer' });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Quản lý Khách hàng</h1>
          <p className="text-zinc-500 text-xs mt-1">Xem danh sách, phân quyền và quản lý tài khoản.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-5 py-2.5 rounded-xl flex items-center transition-all shadow-md shadow-orange-500/20 font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          <Plus size={18} className="mr-1.5" /> Thêm mới
        </button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex max-w-md bg-white border border-zinc-300 rounded-xl overflow-hidden shadow-xs">
          <input 
            type="text" 
            placeholder="Tìm kiếm người dùng (Tên, Email)..." 
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
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ea580c]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Họ tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">SĐT</th>
                  <th className="p-4">Quyền</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="p-4 text-zinc-400 font-mono">#{user.id}</td>
                      <td className="p-4 font-bold text-zinc-900">{user.full_name || '—'}</td>
                      <td className="p-4 text-zinc-600">{user.email}</td>
                      <td className="p-4 text-zinc-600">{user.phone || '—'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin' 
                            ? 'bg-orange-50 text-[#ea580c] border border-orange-200' 
                            : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => handleToggleRole(user)}
                          className="p-1.5 text-zinc-400 hover:text-[#ea580c] hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                          title="Đổi quyền"
                        >
                          {user.role === 'admin' ? <ShieldOff size={16} /> : <Shield size={16} />}
                        </button>
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
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
                    <td colSpan="6" className="p-12 text-center text-zinc-400">
                      Chưa có người dùng nào.
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

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
            <h2 className="text-lg font-black text-zinc-900 mb-4">
              {editUser ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold uppercase mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold uppercase mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold uppercase mb-1">
                  {editUser ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}
                </label>
                <input 
                  type="password" 
                  required={!editUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-bold uppercase mb-1">Vai trò</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 outline-none focus:border-[#ea580c]"
                >
                  <option value="customer">Khách hàng (Customer)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#ea580c] text-white rounded-xl hover:bg-[#c2410c] shadow-md shadow-orange-500/20 font-bold uppercase tracking-wider cursor-pointer"
                >
                  {editUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUserPage;
