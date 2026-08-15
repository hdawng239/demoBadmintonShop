import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { MapPin, Phone, Clock, Store, Navigation, CheckCircle2 } from 'lucide-react';

const STORES = [
  { 
    city: 'Hà Nội', 
    name: 'Showroom Cầu Giấy (Flagship)', 
    address: 'Số 123 Đường Cầu Giấy, Q. Cầu Giấy, Hà Nội', 
    phone: '0338 780 204', 
    time: '08:00 - 21:30 (Cả tuần)',
    features: ['Máy đan điện tử Victor C-7032 Pro', 'Sân test vợt mini', 'Đầy đủ vợt thử Pro']
  },
  { 
    city: 'Hà Nội', 
    name: 'Showroom Thanh Xuân', 
    address: 'Số 456 Đường Nguyễn Trãi, Q. Thanh Xuân, Hà Nội', 
    phone: '0338 780 205', 
    time: '08:00 - 21:30 (Cả tuần)',
    features: ['Kỹ thuật đan 4 nút BWF', 'Dịch vụ thay quấn cán, dán bảo vệ', 'Thanh toán thẻ/QR']
  },
  { 
    city: 'TP. Hồ Chí Minh', 
    name: 'Showroom Quận 10', 
    address: 'Số 789 Đường Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM', 
    phone: '0338 780 206', 
    time: '08:00 - 22:00 (Cả tuần)',
    features: ['Trung tâm bảo hành Yonex & Lining', 'Máy đan Yonex Precision 9.0', 'Khu vực thử giày chuyên dụng']
  },
  { 
    city: 'Đà Nẵng', 
    name: 'Showroom Hải Châu', 
    address: 'Số 102 Đường Nguyễn Văn Linh, Q. Hải Châu, Đà Nẵng', 
    phone: '0338 780 207', 
    time: '08:00 - 21:00 (Cả tuần)',
    features: ['Căng cước lấy ngay trong 15 phút', 'Đầy đủ phụ kiện chính hãng', 'Bãi đỗ xe ô tô']
  }
];

const StoreSystemPage = () => {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-[#ea580c] rounded-full text-xs font-black uppercase tracking-widest">
            <Store size={14} /> Hệ thống Showroom Naro
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Danh Sách Cửa Hàng
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            Ghé thăm trực tiếp các showroom của Naro Badminton để được test vợt, căng cước điện tử chuẩn 4 nút BWF và tư vấn chuyên sâu theo lối đánh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STORES.map((store, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-[#12131a] p-6 sm:p-7 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 space-y-4 shadow-sm hover:border-[#ea580c] dark:hover:border-[#ea580c] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#ea580c] uppercase">{store.city}</span>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white mt-0.5">{store.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-900/40 px-2.5 py-1 rounded-full uppercase shrink-0">
                    Đang mở cửa
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <p className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#ea580c] shrink-0 mt-0.5" /> 
                    <span className="leading-relaxed">{store.address}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[#ea580c] shrink-0" /> 
                    <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="font-mono font-bold hover:text-[#ea580c] transition-colors">{store.phone}</a>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock size={16} className="text-[#ea580c] shrink-0" /> 
                    <span>{store.time}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                  <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Dịch vụ tại showroom:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {store.features.map((feat, fIdx) => (
                      <span key={fIdx} className="inline-flex items-center gap-1 text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200/80 dark:border-zinc-700/80 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 size={11} className="text-lime-600 dark:text-lime-400" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-zinc-50 dark:bg-[#181a24] hover:bg-[#ea580c] dark:hover:bg-[#ea580c] text-zinc-800 dark:text-zinc-200 hover:text-white dark:hover:text-white border border-zinc-200 dark:border-zinc-700 hover:border-[#ea580c] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Navigation size={14} />
                  <span>Chỉ đường trên Google Maps</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default StoreSystemPage;
