import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '../../services/authService';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFillDemo = (email, pass) => {
    setFormData({ email, password: pass });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await authService.login(formData.email.trim(), formData.password);
      const user = data.user || data.data?.user;
      
      if (user && user.role === 'admin') {
        window.dispatchEvent(new Event('userUpdated'));
        window.dispatchEvent(new Event('authChange'));
        navigate('/admin');
      } else {
        await authService.logout();
        setError("Tài khoản của bạn không có quyền truy cập trang quản trị!");
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c2410c] to-[#ea580c] text-white font-black text-2xl shadow-lg shadow-orange-500/20 mb-2">
          N
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          Naro Badminton <span className="text-[#ea580c]">ADMIN</span>
        </h2>
        <p className="text-xs text-zinc-500">
          Đăng nhập hệ thống quản trị cửa hàng
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-zinc-200/80 shadow-sm space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Email quản trị
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all"
                  placeholder="haimanh@gmail.com"
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs outline-none focus:bg-white focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] transition-all"
                  placeholder="••••••••"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#ea580c] hover:bg-[#c2410c] active:scale-[0.99] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Đang xác thực...</span>
                ) : (
                  <>
                    <span>Đăng nhập Quản trị</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
