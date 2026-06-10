import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import { Eye, EyeOff, RefreshCw, ArrowLeft, Mail, KeyRound } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Gửi yêu cầu OTP, 2: Đặt lại mật khẩu
  const [email, setEmail] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Thông tin hỗ trợ test mode (nếu chạy local chưa cấu hình Gmail)
  const [testModeOtp, setTestModeOtp] = useState('');

  const navigate = useNavigate();

  // Tải Captcha khi vào trang
  const fetchCaptcha = async () => {
    try {
      setError('');
      setCaptchaAnswer('');
      const data = await authService.getCaptcha();
      setCaptchaQuestion(data.question);
      setCaptchaToken(data.captchaToken);
    } catch (err) {
      setError(err.message || 'Không thể tải mã Captcha, vui lòng tải lại trang!');
    }
  };

  useEffect(() => {
    if (step === 1) {
      fetchCaptcha();
    }
  }, [step]);

  // Bước 1: Gửi yêu cầu OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Vui lòng nhập Email của bạn!');
      return;
    }
    if (!captchaAnswer) {
      setError('Vui lòng điền đáp án Captcha!');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.forgotPassword(email, captchaAnswer, captchaToken);
      setSuccess(data.message);
      
      // Nếu ở chế độ test (chưa cấu hình email), lưu OTP để hiện giao diện
      if (data.testMode && data.otp) {
        setTestModeOtp(data.otp);
      } else {
        setTestModeOtp('');
      }

      // Chuyển sang bước 2 sau 1.5 giây
      setTimeout(() => {
        setSuccess('');
        setStep(2);
      }, 1500);

    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu!');
      // Tải lại captcha mới nếu sai
      fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Mã OTP phải có độ dài đúng 6 số!');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.resetPassword(email, otp, newPassword);
      setSuccess(data.message || 'Khôi phục mật khẩu thành công!');
      
      // Chuyển hướng về đăng nhập sau 2.5 giây
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Mã xác nhận OTP không đúng hoặc đã hết hạn!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-16 min-h-[75vh] flex items-center justify-center">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          
          {/* Nút quay lại */}
          <div className="mb-4">
            {step === 1 ? (
              <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Quay lại Đăng nhập
              </Link>
            ) : (
              <button 
                type="button" 
                onClick={() => { setStep(1); setError(''); setSuccess(''); }} 
                className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors focus:outline-none"
              >
                <ArrowLeft size={16} className="mr-1" /> Quay lại Bước 1
              </button>
            )}
          </div>

          <div className="text-center mb-8 relative">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 uppercase">QUÊN MẬT KHẨU</h1>
            <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded"></div>
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

          {/* CHẾ ĐỘ THỬ NGHIỆM (DEVELOPMENT ONLY ALERT) */}
          {step === 2 && testModeOtp && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded mb-6 text-sm">
              <p className="font-semibold mb-1">📢 Chế độ thử nghiệm:</p>
              <p>Hệ thống phát hiện chưa cấu hình email thật. Mã OTP của bạn là:</p>
              <div className="flex items-center mt-2 justify-between bg-white px-3 py-2 border border-orange-300 rounded font-mono font-bold text-lg text-center tracking-widest text-primary">
                <span>{testModeOtp}</span>
                <button 
                  onClick={() => setOtp(testModeOtp)}
                  className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-orange-600 font-sans tracking-normal transition-colors"
                >
                  Tự động điền
                </button>
              </div>
            </div>
          )}

          {step === 1 ? (
            /* BƯỚC 1: NHẬP EMAIL & CAPTCHA */
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                Vui lòng điền Email đã đăng ký tài khoản. Hệ thống sẽ gửi một mã xác minh (OTP) về hòm thư này để đặt lại mật khẩu.
              </p>

              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Nhập email của bạn (*)" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>

              {/* Giao diện Captcha */}
              <div className="bg-gray-50 p-4 rounded border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Xác thực Captcha</label>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 bg-white px-4 py-2 border border-gray-200 rounded font-mono font-bold text-lg text-gray-700 select-none shadow-sm min-w-[120px] justify-center tracking-widest bg-gradient-to-r from-orange-50 to-gray-50 italic select-none">
                    {captchaQuestion || '...'}
                  </div>
                  <button 
                    type="button" 
                    onClick={fetchCaptcha}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-all focus:outline-none"
                    title="Đổi mã khác"
                  >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Nhập mã" 
                    maxLength={6}
                    required
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-bold font-mono text-lg shadow-sm uppercase"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 uppercase font-bold text-white rounded transition-colors ${isLoading ? 'bg-orange-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-600'}`}
              >
                {isLoading ? 'Đang gửi yêu cầu...' : 'GỬI MÃ XÁC NHẬN'}
              </button>
            </form>
          ) : (
            /* BƯỚC 2: NHẬP OTP & ĐẶT LẠI MẬT KHẨU */
            <form onSubmit={handleResetPassword} className="space-y-6">
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                Hệ thống đã gửi mã xác minh về email <b className="text-gray-700">{email}</b>. Vui lòng nhập mã và mật khẩu mới bên dưới.
              </p>

              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nhập mã xác minh (OTP)" 
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono tracking-widest text-center text-lg font-bold"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Mật khẩu mới" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Nhập lại mật khẩu mới" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 uppercase font-bold text-white rounded transition-colors ${isLoading ? 'bg-orange-400 cursor-not-allowed' : 'bg-primary hover:bg-orange-600'}`}
              >
                {isLoading ? 'Đang thực hiện đổi...' : 'XÁC NHẬN KHÔI PHỤC'}
              </button>
            </form>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;
