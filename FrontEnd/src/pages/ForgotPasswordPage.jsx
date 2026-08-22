import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import { Mail, Key, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !email.trim()) {
      setFieldErrors({ email: 'Vui lòng nhập địa chỉ email đã đăng ký!' });
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setMessage('Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!');
      setStep(2);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi gửi mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const errors = {};
    if (!otp || !otp.trim()) {
      errors.otp = 'Vui lòng nhập mã OTP!';
    } else if (otp.trim().length !== 6) {
      errors.otp = 'Mã OTP phải có đúng 6 chữ số!';
    }

    if (!newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới!';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Mật khẩu mới phải có tối thiểu 6 ký tự!';
    } else if (newPassword.length > 50) {
      errors.newPassword = 'Mật khẩu mới không được vượt quá 50 ký tự!';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await authService.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
      setMessage('Đổi mật khẩu thành công! Đang chuyển đến đăng nhập...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
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
              Quên Mật Khẩu
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {step === 1 ? 'Nhập email để nhận mã xác thực OTP' : 'Nhập OTP và đặt mật khẩu mới'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-3.5 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-800 rounded-xl text-xs text-lime-700 dark:text-lime-300 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === 1 ? (
            <form noValidate onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Email đăng ký
                </label>
                <div className="relative">
                  <input
                    type="email"
                    maxLength={100}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearFieldError('email');
                    }}
                    placeholder="email@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none transition-all ${
                      fieldErrors.email 
                        ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                    }`}
                  />
                  <Mail size={16} className="absolute left-3 top-3 text-zinc-400" />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                {loading ? 'Đang gửi mã...' : 'Gửi mã xác nhận'}
              </button>
            </form>
          ) : (
            <form noValidate onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Mã xác nhận OTP *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(onlyNums);
                    clearFieldError('otp');
                  }}
                  placeholder="123456"
                  className={`w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-center text-base tracking-widest font-mono font-bold outline-none transition-all ${
                    fieldErrors.otp 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                {fieldErrors.otp && (
                  <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{fieldErrors.otp}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Mật khẩu mới *
                </label>
                <input
                  type="password"
                  maxLength={50}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    clearFieldError('newPassword');
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none transition-all ${
                    fieldErrors.newPassword 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                {fieldErrors.newPassword && (
                  <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{fieldErrors.newPassword}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ea580c] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <Link to="/login" className="font-bold text-zinc-600 dark:text-zinc-400 hover:text-[#ea580c] dark:hover:text-[#ea580c]">
              Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
