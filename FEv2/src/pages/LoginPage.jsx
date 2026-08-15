import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authService.login(email.trim(), password);
      setSuccess(true);
      window.dispatchEvent(new Event('userUpdated'));
      window.dispatchEvent(new Event('authChange'));
      setTimeout(() => {
        navigate(redirect);
      }, 500);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white dark:bg-[#12131a] rounded-3xl p-8 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 transition-colors duration-300">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Đăng Nhập
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Truy cập tài khoản Naro Badminton để mua sắm</p>
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
              <span>Đăng nhập thành công! Đang chuyển hướng...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Email / Số điện thoại
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email (@gmail.com) hoặc SĐT..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-medium outline-none focus:border-[#ea580c]"
                />
                <Mail size={16} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Mật khẩu
                </label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-[#ea580c] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs font-medium outline-none focus:border-[#ea580c]"
                />
                <Lock size={16} className="absolute left-3 top-3 text-zinc-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-[#ea580c] hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;
