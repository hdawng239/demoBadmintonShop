import React, { useState } from 'react';
import axios from 'axios';
import MainLayout from '../components/layout/MainLayout';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSent(false);

    try {
      await axios.post(`${API_BASE}/contact`, formData);
      setSent(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi lời nhắn. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-12">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">Hỗ trợ & Liên hệ</span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Liên Hệ Với Naro Badminton
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 bg-zinc-950 dark:bg-[#181a24] text-white p-8 rounded-3xl space-y-6 border border-zinc-800 shadow-xl">
            <h3 className="text-xl font-bold text-white">Thông tin liên hệ</h3>
            <div className="space-y-4 text-xs text-zinc-300">
              <p className="flex items-start gap-3">
                <MapPin size={18} className="text-[#ea580c] shrink-0 mt-0.5" />
                <span className="leading-relaxed">Số 123 Đường Cầu Giấy, Q. Cầu Giấy, Hà Nội</span>
              </p>
              <p className="flex items-center gap-3">
                <Phone size={18} className="text-[#ea580c] shrink-0" />
                <span>Hotline: <strong className="font-mono text-white">0338 780 204</strong></span>
              </p>
              <p className="flex items-center gap-3">
                <Mail size={18} className="text-[#ea580c] shrink-0" />
                <span>cskh@narobadminton.vn</span>
              </p>
              <p className="flex items-center gap-3">
                <Clock size={18} className="text-[#ea580c] shrink-0" />
                <span>Mở cửa: 08:00 - 21:30 (Cả T7 & CN)</span>
              </p>
            </div>
          </div>

          <div className="md:col-span-7 bg-white dark:bg-[#12131a] p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">Gửi lời nhắn cho chúng tôi</h3>

            {sent && (
              <div className="p-3.5 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-800 rounded-xl text-xs text-lime-700 dark:text-lime-300 flex items-center gap-2">
                <CheckCircle2 size={16} /> Cảm ơn bạn! Chúng tôi đã nhận được lời nhắn và sẽ phản hồi sớm nhất có thể.
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input 
                  required 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Họ và tên *" 
                  className="px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]" 
                />
                <input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel" 
                  placeholder="Số điện thoại" 
                  className="px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]" 
                />
              </div>
              <input 
                required 
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email" 
                placeholder="Địa chỉ Email *" 
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]" 
              />
              <textarea 
                required 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4" 
                placeholder="Nội dung lời nhắn..." 
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]" 
              />
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Gửi liên hệ</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
