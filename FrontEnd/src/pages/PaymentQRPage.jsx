import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { CheckCircle, ArrowRight, Copy, Check } from 'lucide-react';
import axios from 'axios';

const PaymentQRPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const orderId = location.state?.orderId;
  const totalAmount = location.state?.totalAmount;

  useEffect(() => {
    if (!orderId || !totalAmount) {
      navigate('/');
    }
  }, [orderId, totalAmount, navigate]);

  useEffect(() => {
    if (!orderId) return;

    const intervalId = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        
        const res = await axios.get(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.payment_status === 'paid') {
          clearInterval(intervalId);
          navigate('/order-success', { state: { orderId: orderId } });
        }
      } catch (error) {
        console.error("Lỗi kiểm tra trạng thái thanh toán:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [orderId, navigate]);

  if (!orderId || !totalAmount) return null;

  // Lấy cấu hình bank từ .env, hoặc dùng giá trị mặc định của bạn nếu chưa thêm tiền tố VITE_
  const bankAccount = import.meta.env.VITE_BANK_STK || '0338780204';
  const bankId = import.meta.env.VITE_BANK_ID || 'MB';
  const bankName = import.meta.env.VITE_BANK_NAME || 'DO HAI DANG';
  const content = `DH${orderId}`;

  // API tạo QR của SEPAY
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankId}&amount=${totalAmount}&des=${content}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="bg-primary/10 border-b border-primary/20 p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-md text-white">
                <CheckCircle size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Đặt hàng thành công!</h1>
              <p className="text-gray-600 mt-2">Đơn hàng <span className="font-bold text-primary">#{orderId}</span> của bạn đã được ghi nhận.</p>
              <p className="text-gray-600">Vui lòng quét mã QR dưới đây để hoàn tất thanh toán.</p>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-8">
              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center border-r-0 md:border-r border-gray-100 pr-0 md:pr-8">
                <h3 className="font-bold text-gray-800 mb-4 uppercase">Quét mã QR để thanh toán</h3>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4 inline-block">
                  <img src={qrUrl} alt="QR Code Payment" className="w-64 h-64 object-contain rounded-xl" />
                </div>
                <p className="text-sm text-gray-500 text-center italic">Mã QR đã chứa sẵn số tiền và nội dung.<br/>Sử dụng App Ngân hàng hoặc Momo/VNPay để quét.</p>
              </div>

              {/* Manual Info Section */}
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-gray-800 mb-4 uppercase">Hoặc chuyển khoản thủ công</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Ngân hàng</p>
                    <p className="font-bold text-gray-800 text-lg">{bankId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Chủ tài khoản</p>
                    <p className="font-bold text-gray-800 uppercase">{bankName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Số tài khoản</p>
                    <p className="font-bold text-blue-600 text-xl tracking-wider">{bankAccount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Số tiền</p>
                    <p className="font-bold text-orange-600 text-xl">{totalAmount.toLocaleString()} ₫</p>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Nội dung chuyển khoản</p>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-3">
                      <span className="font-mono font-bold text-lg text-gray-800 tracking-widest">{content}</span>
                      <button 
                        onClick={() => copyToClipboard(content)}
                        className={`p-2 rounded-lg transition ${copied ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-primary'}`}
                        title="Sao chép nội dung"
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                    {copied && <p className="text-green-600 text-xs mt-1 font-medium">Đã sao chép nội dung!</p>}
                    <p className="text-xs text-red-500 mt-2 font-medium italic">* Vui lòng ghi chính xác nội dung trên để hệ thống gạch nợ tự động.</p>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
              <Link to="/profile" className="inline-flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm">
                Quản lý đơn hàng <ArrowRight size={20} className="ml-2" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">Hệ thống sẽ tự động cập nhật trạng thái đơn hàng (Mất khoảng 1-3 phút) sau khi bạn thanh toán thành công.</p>
            </div>
            
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentQRPage;
