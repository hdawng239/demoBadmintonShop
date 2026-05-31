import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Edit, Trash2, Shield, ShieldOff, Plus } from 'lucide-react';
import axios from 'axios';

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '', password: '', role: 'customer' });

  const fetchUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/users?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa user này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa user");
    }
  };

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (!window.confirm(`Xác nhận đổi quyền của ${user.full_name} thành ${newRole.toUpperCase()}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/users/${user.id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(currentPage);
    } catch (err) {
      alert("Lỗi cập nhật quyền");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editUser) {
        // Cập nhật
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password; // Không gửi pass rỗng
        await axios.put(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/users/${editUser.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Thêm mới
        await axios.post(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/users`, formData, {
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
    setFormData({ full_name: user.full_name, email: user.email, phone: user.phone || '', password: '', role: user.role });
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
          <p className="text-gray-500 text-sm mt-1">Xem danh sách, phân quyền và quản lý tài khoản.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-primary hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl flex items-center transition-colors shadow-sm font-medium"
        >
          <Plus size={20} className="mr-2" /> Thêm mới
        </button>
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
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Họ tên</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">SĐT</th>
                    <th className="p-4 font-semibold text-center">Quyền</th>
                    <th className="p-4 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 text-gray-600 font-medium">#{user.id}</td>
                      <td className="p-4 font-bold text-gray-800">{user.full_name}</td>
                      <td className="p-4 text-gray-500">{user.email}</td>
                      <td className="p-4 text-gray-500">{user.phone || '-'}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleToggleRole(user)} 
                            title="Đổi quyền Admin"
                            className={`p-2 rounded-lg transition-colors ${user.role === 'admin' ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-purple-600'}`}
                          >
                            {user.role === 'admin' ? <Shield size={18} /> : <ShieldOff size={18} />}
                          </button>
                          <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition" title="Sửa thông tin">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Xóa tài khoản">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">Chưa có người dùng nào.</td>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-5 text-gray-800">{editUser ? 'Sửa thông tin tài khoản' : 'Thêm tài khoản mới'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input 
                  required 
                  type="email" 
                  pattern="[a-zA-Z0-9._%+-]+@gmail\.com$"
                  title="Vui lòng nhập đúng định dạng @gmail.com"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" 
                  placeholder="example@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  type="tel" 
                  pattern="0[0-9]{9}"
                  title="Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" 
                  placeholder="0xxxxxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu {editUser && <span className="text-gray-400 font-normal">(Bỏ trống nếu không đổi)</span>}</label>
                <input required={!editUser} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phân quyền</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-white">
                  <option value="customer">Customer (Khách hàng)</option>
                  <option value="admin">Admin (Quản trị viên)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium transition">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 shadow-sm font-medium transition">{editUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUserPage;
