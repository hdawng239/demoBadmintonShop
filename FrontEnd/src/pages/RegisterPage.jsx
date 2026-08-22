import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import { Lock, Mail, User, Phone, MapPin, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateFullName, validateEmail, validatePhone, validateAddress, validatePassword } from '../utils/validation';

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);

    const errors = {};
    const nameErr = validateFullName(formData.full_name);
    if (nameErr) errors.full_name = nameErr;

    const emailErr = validateEmail(formData.email, { requireGmail: true });
    if (emailErr) errors.email = emailErr;

    const phoneErr = validatePhone(formData.phone, { required: true });
    if (phoneErr) errors.phone = phoneErr;

    const addrErr = validateAddress(formData.address);
    if (addrErr) errors.address = addrErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errors.password = passErr;

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu!';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await authService.register(
        formData.full_name.trim(),
        formData.email.trim(),
        formData.phone.trim(),
        formData.address.trim(),
        formData.password
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setServerError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản!');
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

          {serverError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-800 rounded-xl text-xs text-lime-700 dark:text-lime-300 flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>Đăng ký thành công! Đang chuyển hướng đến đăng nhập...</span>
            </div>
          )}

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Họ và tên *
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={50}
                  value={formData.full_name}
                  onChange={(e) => {
                    setFormData({ ...formData, full_name: e.target.value });
                    clearFieldError('full_name');
                  }}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none transition-all ${
                    fieldErrors.full_name 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                <User size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
              {fieldErrors.full_name && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.full_name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Email (@gmail.com) *
              </label>
              <div className="relative">
                <input
                  type="email"
                  maxLength={100}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    clearFieldError('email');
                  }}
                  placeholder="badminton_pro@gmail.com"
                  className={`w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none transition-all ${
                    fieldErrors.email 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                <Mail size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Số điện thoại *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.phone}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: onlyNums });
                    clearFieldError('phone');
                  }}
                  placeholder="0912345678"
                  className={`w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none font-mono transition-all ${
                    fieldErrors.phone 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                <Phone size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Địa chỉ nhận hàng *
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={255}
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    clearFieldError('address');
                  }}
                  placeholder="Số 123 Đường Cầu Giấy, Hà Nội"
                  className={`w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none transition-all ${
                    fieldErrors.address 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                <MapPin size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
              {fieldErrors.address && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.address}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Mật khẩu *
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={50}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    clearFieldError('password');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none transition-all ${
                    fieldErrors.password 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                <Lock size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                Xác nhận mật khẩu *
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={50}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    clearFieldError('confirmPassword');
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border rounded-xl text-xs outline-none transition-all ${
                    fieldErrors.confirmPassword 
                      ? 'border-rose-500 ring-2 ring-rose-500/10 text-zinc-900 dark:text-white' 
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:border-[#ea580c]'
                  }`}
                />
                <Lock size={15} className="absolute left-3 top-3 text-zinc-400" />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <AlertCircle size={13} className="shrink-0" />
                  <span>{fieldErrors.confirmPassword}</span>
                </p>
              )}
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
