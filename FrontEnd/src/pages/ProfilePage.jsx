import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { User, Lock, Phone, Mail, MapPin, CheckCircle2, AlertCircle, SlidersHorizontal, ArrowRight, LogOut, ShoppingBag } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [profile, setProfile] = useState({
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    username: currentUser?.username || '',
    address: currentUser?.address || ''
  });

  // Fetch latest profile on mount
  useEffect(() => {
    if (currentUser?.id) {
      userService.getUserById(currentUser.id)
        .then(res => {
          const u = res?.data || res;
          if (u) {
            setProfile(prev => ({
              ...prev,
              full_name: u.full_name || prev.full_name,
              phone: u.phone || prev.phone,
              email: u.email || prev.email,
              address: u.address || prev.address
            }));
            const updated = { ...currentUser, ...u };
            authService.setCurrentUser(updated);
          }
        })
        .catch(() => {});
    }
  }, [currentUser?.id]);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    if (profile.phone && profile.phone.trim() !== '') {
      const phoneRegex = /^0(3|5|7|8|9)\d{8}$/;
      if (!phoneRegex.test(profile.phone.trim())) {
        setMsg({ type: 'error', text: 'Số điện thoại phải có đúng 10 số và bắt đầu bằng số 0 (Ví dụ: 0912345678)!' });
        setLoading(false);
        return;
      }
    }

    try {
      await userService.updateUser(currentUser.id, {
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim()
      });

      const updatedUser = {
        ...currentUser,
        full_name: profile.full_name.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim()
      };
      authService.setCurrentUser(updatedUser);
      window.dispatchEvent(new CustomEvent('userUpdated'));

      setMsg({ type: 'success', text: 'Cập nhật thông tin và địa chỉ giao hàng thành công!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin!' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }
    if (passwordForm.newPassword.length > 50) {
      setMsg({ type: 'error', text: 'Mật khẩu mới không được vượt quá 50 ký tự!' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await userService.updateUser(currentUser.id, {
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword
      });
      setMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Mật khẩu hiện tại không đúng!' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.dispatchEvent(new CustomEvent('authChange'));
    navigate('/login');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Tài Khoản Của Tôi
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Quản lý thông tin hồ sơ, địa chỉ giao hàng và mật khẩu
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/my-orders"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-2xl transition-colors"
            >
              <ShoppingBag size={14} />
              <span>Đơn hàng của tôi</span>
            </Link>

            {currentUser?.role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ea580c] dark:hover:bg-[#ea580c] text-white text-xs font-bold rounded-2xl shadow-sm transition-colors"
              >
                <SlidersHorizontal size={14} />
                <span>Trang Admin</span>
                <ArrowRight size={13} />
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
              title="Đăng xuất tài khoản khỏi thiết bị"
            >
              <LogOut size={14} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 mb-6 border ${
            msg.type === 'success' 
              ? 'bg-lime-50 dark:bg-lime-950/40 border-lime-200 dark:border-lime-800 text-lime-800 dark:text-lime-300' 
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Info */}
          <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
            <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <User size={16} className="text-[#ea580c]" /> Thông tin cá nhân & Địa chỉ
            </h3>

            <form noValidate onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.username}
                  className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={profile.phone}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setProfile({ ...profile, phone: onlyNums });
                  }}
                  placeholder="0912345678"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Địa chỉ nhận hàng mặc định
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={255}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Số 123 Đường Cầu Giấy, Hà Nội"
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                  />
                  <MapPin size={15} className="absolute left-3 top-3 text-zinc-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
            <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Lock size={16} className="text-[#ea580c]" /> Đổi mật khẩu
            </h3>

            <form noValidate onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  required
                  maxLength={50}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  maxLength={50}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  maxLength={50}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl text-xs outline-none focus:border-[#ea580c]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ea580c] dark:hover:bg-[#ea580c] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
