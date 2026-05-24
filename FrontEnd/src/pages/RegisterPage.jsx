import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

    if (!emailRegex.test(formData.email)) {
      setError('Vui lòng nhập đúng định dạng email (vd: abc@gmail.com)!');
      return;
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Số điện thoại không hợp lệ (Phải đủ 10 số và bắt đầu bằng 0)!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      await authService.register(formData.full_name, formData.email, formData.phone, formData.password);
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-16 min-h-[70vh] flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-6 relative">
            <h1 className="text-3xl font-bold text-gray-800 uppercase">ĐĂNG KÝ</h1>
            <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded"></div>
          </div>

          <div className="text-center text-sm text-gray-500 mb-8">
            Đã có tài khoản? <Link to="/login" className="text-primary font-semibold hover:underline">Đăng nhập tại đây</Link>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-6 text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded mb-6 text-sm text-center border border-green-100">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input 
                type="text" 
                name="full_name"
                placeholder="Nhập tên của bạn (*)" 
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <input 
                type="email" 
                name="email"
                placeholder="Nhập email của bạn (*)" 
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <input 
                type="text" 
                name="phone"
                placeholder="Số điện thoại" 
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                name="password"
                placeholder="Mật khẩu" 
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu" 
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 mt-4 uppercase font-bold text-white rounded transition-colors ${isLoading ? 'bg-orange-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-600'}`}
            >
              {isLoading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
