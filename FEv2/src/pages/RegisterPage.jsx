import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import { Lock, Mail, User, Phone, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const phoneRegex = /^0(3|5|7|8|9)\d{8}$/;

    if (!emailRegex.test(formData.email)) {
      setError('Email bắt buộc phải có định dạng @gmail.com!');
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setError('Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0 (Ví dụ: 0912345678)!');
      return;
    }

    if (!formData.address || formData.address.trim() === '') {
      setError('Vui lòng nhập địa chỉ giao hàng của bạn!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);
    try {
      await authService.register(
        formData.full_name,
        formData.email,
        formData.phone,
        formData.address,
        formData.password
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white dark:bg-[#12131a] rounded-3xl p-8 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 transition-colors duration-300">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Đăng Ký Tài Khoản
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Gia nhập cộng đồng Naro Badminton Shop</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-800 rounded-xl text-xs text-lime-700 dark:text-lime-300 flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>Đăng ký thành công! Đang chuyển hướng đến đăng nhập...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
                <User size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Email Gmail (@gmail.com) *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="badminton_pro@gmail.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
                <Mail size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Số điện thoại (10 số) *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912345678"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
                <Phone size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Địa chỉ nhận hàng *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Số 123 Đường Cầu Giấy, Hà Nội"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
                <MapPin size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Mật khẩu (Tối thiểu 6 ký tự) *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
                <Lock size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
                <Lock size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản ngay'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-[#ea580c] hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
