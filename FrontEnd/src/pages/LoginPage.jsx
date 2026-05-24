import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const isEmail = email.includes('@');
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isEmail && !emailRegex.test(email)) {
      setError('Vui lòng nhập đúng định dạng email!');
      return;
    } else if (!isEmail && !phoneRegex.test(email)) {
      setError('Tài khoản phải là Email hợp lệ hoặc Số điện thoại (10 số)!');
      return;
    }

    setIsLoading(true);

    try {
      await authService.login(email, password);
      navigate('/'); // Đăng nhập xong về trang chủ
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-16 min-h-[70vh] flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8 relative">
            <h1 className="text-3xl font-bold text-gray-800 uppercase">ĐĂNG NHẬP</h1>
            <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded"></div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded mb-6 text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="email" 
                placeholder="Email/Số ĐT" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Mật khẩu" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 uppercase font-bold text-white rounded transition-colors ${isLoading ? 'bg-orange-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-600'}`}
            >
              {isLoading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
            </button>
          </form>

          <div className="mt-6 flex justify-between text-sm text-gray-500">
            <Link to="#" className="hover:text-primary transition-colors">Quên mật khẩu?</Link>
            <div className="flex space-x-1">
              <span>Chưa có tài khoản?</span>
              <Link to="/register" className="text-primary font-semibold hover:underline">Đăng ký tại đây</Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
