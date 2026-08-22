import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { Check, Copy, AlertCircle, Clock, QrCode, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import axios from 'axios';

const PaymentQRPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams();

  const orderFromState = location.state?.order;
  const orderId = paramOrderId || orderFromState?.id || location.state?.orderId;
  
  const [totalAmount, setTotalAmount] = useState(
    orderFromState?.total_amount || location.state?.totalAmount || 0
  );
  const [copiedField, setCopiedField] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút đếm ngược
  const [isLoading, setIsLoading] = useState(!totalAmount && !!orderId);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Order details if accessed directly or reloaded
  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ord = res.data?.data || res.data;
        if (ord) {
          setTotalAmount(parseFloat(ord.total_amount || 0));
          if (ord.payment_status === 'paid') {
            navigate('/order-success', { state: { order: ord } });
          }
        }
      } catch (err) {
        console.error('Lỗi tải chi tiết đơn hàng:', err);
        setErrorMessage('Không thể tải thông tin đơn hàng hoặc đơn hàng không tồn tại.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!totalAmount) {
      fetchOrderDetails();
    }
  }, [orderId, totalAmount, navigate]);

  // 2. Countdown timer
  useEffect(() => {
    if (!orderId) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [orderId]);

  // 3. Polling check order status every 3 seconds
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const ord = res.data?.data || res.data;
        if (ord?.payment_status === 'paid') {
          clearInterval(interval);
          navigate('/order-success', { state: { order: ord } });
        }
      } catch (err) {
        // Silent polling error
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, navigate]);

  const bankStk = '0338780204';
  const bankName = 'DO HAI DANG';
  const bankId = 'MB';
  const content = `NARO${orderId}`;

  const qrUrl = `https://qr.sepay.vn/img?acc=${bankStk}&bank=${bankId}&amount=${totalAmount}&des=${content}`;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <Loader2 size={36} className="animate-spin text-[#ea580c] mx-auto" />
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">Đang khởi tạo mã thanh toán VietQR...</p>
        </div>
      </MainLayout>
    );
  }

  if (errorMessage) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
          <AlertCircle size={44} className="text-rose-500 mx-auto" />
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">Không tìm thấy đơn hàng</h2>
          <p className="text-xs text-zinc-500">{errorMessage}</p>
          <Link to="/" className="inline-block px-5 py-2.5 bg-[#ea580c] text-white rounded-xl text-xs font-bold">
            Về trang chủ
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-10">
        <div className="bg-white dark:bg-[#12131a] rounded-3xl p-6 sm:p-10 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-8 transition-colors duration-300">
          
          {/* Header */}
          <div className="text-center space-y-2 border-b border-zinc-100 dark:border-zinc-800 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] rounded-full text-xs font-bold uppercase tracking-wider">
              <QrCode size={15} /> Thanh toán tự động SePay VietQR
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Quét Mã QR Để Thanh Toán
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Mở ứng dụng ngân hàng bất kỳ (MB, VCB, Techcombank, Momo...) và quét mã để hệ thống tự động xác nhận đơn hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* QR Code Stage */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-3xl shadow-xs relative">
                {timeLeft > 0 ? (
                  <img
                    src={qrUrl}
                    alt="VietQR Payment"
                    className="w-64 h-64 object-contain rounded-2xl"
                  />
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-center p-4 bg-zinc-50 rounded-2xl">
                    <AlertCircle size={36} className="text-rose-500 mb-2" />
                    <p className="text-xs font-bold text-zinc-800">Mã QR đã hết hạn</p>
                    <p className="text-[10px] text-zinc-500 mt-1">Vui lòng tải lại hoặc tạo đơn hàng mới</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-3 px-3 py-1.5 bg-[#ea580c] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw size={13} /> Làm mới mã
                    </button>
                  </div>
                )}
              </div>

              {/* Countdown */}
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-full">
                <Clock size={15} className="text-[#ea580c] animate-spin" />
                <span>Thời gian giữ mã: <strong className="font-mono text-zinc-900 dark:text-white text-sm">{formatTime(timeLeft)}</strong></span>
              </div>
            </div>

            {/* Transfer Details */}
            <div className="md:col-span-6 space-y-3 bg-zinc-50 dark:bg-[#181a24] p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-xs">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider mb-2">
                Thông tin chuyển khoản thủ công
              </h3>

              {/* Bank */}
              <div className="flex justify-between items-center bg-white dark:bg-[#12131a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase">Ngân hàng</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">MB Bank (Quân Đội)</span>
                </div>
              </div>

              {/* STK */}
              <div className="flex justify-between items-center bg-white dark:bg-[#12131a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase">Số tài khoản</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm font-mono">{bankStk}</span>
                </div>
                <button
                  onClick={() => handleCopy(bankStk, 'stk')}
                  className="p-2 text-zinc-500 hover:text-[#ea580c] transition-colors cursor-pointer"
                  title="Sao chép"
                >
                  {copiedField === 'stk' ? <Check size={16} className="text-lime-600" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Account Holder */}
              <div className="flex justify-between items-center bg-white dark:bg-[#12131a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase">Chủ tài khoản</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-sm">{bankName}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="flex justify-between items-center bg-white dark:bg-[#12131a] p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500 block text-[10px] uppercase">Số tiền</span>
                  <span className="font-black text-[#ea580c] text-base">{parseInt(totalAmount || 0).toLocaleString('vi-VN')} ₫</span>
                </div>
                <button
                  onClick={() => handleCopy(String(totalAmount), 'amount')}
                  className="p-2 text-zinc-500 hover:text-[#ea580c] transition-colors cursor-pointer"
                >
                  {copiedField === 'amount' ? <Check size={16} className="text-lime-600" /> : <Copy size={16} />}
                </button>
              </div>

              {/* Transfer Content */}
              <div className="flex justify-between items-center bg-orange-50/70 dark:bg-orange-950/40 p-3 rounded-xl border border-orange-200 dark:border-orange-900/50">
                <div>
                  <span className="text-[#ea580c] block text-[10px] uppercase font-bold">Nội dung chuyển khoản (Bắt buộc)</span>
                  <span className="font-black text-zinc-950 dark:text-white text-sm font-mono">{content}</span>
                </div>
                <button
                  onClick={() => handleCopy(content, 'content')}
                  className="p-2 text-[#ea580c] hover:bg-orange-100 dark:hover:bg-orange-900/60 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedField === 'content' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

            </div>

          </div>

          {/* Polling Notice */}
          <div className="p-4 bg-zinc-900 dark:bg-[#181a24] text-zinc-300 rounded-2xl text-xs flex items-center justify-between border border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
              <span>Hệ thống đang tự động lắng nghe giao dịch chuyển khoản...</span>
            </div>
            <Link to="/my-orders" className="font-bold text-white hover:text-[#ea580c] flex items-center gap-1">
              Xem đơn hàng <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentQRPage;
