import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { userService } from '../services/userService';
import { authService } from '../services/authService';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await userService.getUserProfile(currentUser.id);
        setUser(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          password: '' 
        });
      } catch (err) {
        console.error("Lỗi lấy thông tin:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: 'Email bắt buộc phải là định dạng @gmail.com!' });
      setSaving(false);
      return;
    }

    const phoneRegex = /^0(3|5|7|8|9)\d{8}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Số điện thoại không hợp lệ (Phải đủ 10 số và bắt đầu bằng 0)!' });
      setSaving(false);
      return;
    }

    try {
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) delete dataToUpdate.password;

      await userService.updateUserProfile(user.id, dataToUpdate);
      
      // Update local storage
      const currentUser = authService.getCurrentUser();
      currentUser.full_name = formData.full_name;
      currentUser.email = formData.email;
      localStorage.setItem('user', JSON.stringify(currentUser));
      window.dispatchEvent(new Event('userUpdated'));

      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Cập nhật thất bại. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 min-h-[70vh]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-2xl font-bold uppercase text-gray-800 border-b border-gray-100 pb-4 mb-6">Thông Tin Cá Nhân</h1>
            
            {message.text && (
              <div className={`p-4 mb-6 rounded text-sm font-medium border ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ Email (*)</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ giao hàng</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu mới nếu muốn đổi"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className={`w-full font-bold py-3 px-8 rounded transition-colors shadow-md ${saving ? 'bg-orange-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-600 text-white'}`}
              >
                {saving ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
