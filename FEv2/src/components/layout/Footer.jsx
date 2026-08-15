import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Award, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-sm mt-16 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      {/* Brand Value Pillars */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 py-10 bg-zinc-50/70 dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">100% Chính Hãng</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Cam kết bồi thường 200% nếu phát hiện hàng giả, hàng nhái.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 text-[#ea580c] flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">Giao Hàng Toàn Quốc</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Tích hợp vận chuyển nhanh GHN, kiểm tra hàng trước khi nhận.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">Đổi Size 7 Ngày</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Hỗ trợ đổi trả, đổi size giày/áo linh hoạt và thuận tiện.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <Award size={24} />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-base">Căng Vợt Điện Tử Chuẩn</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Kỹ thuật căng 4 nút / 2 nút chuẩn thi đấu quốc tế BWF.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand Info (Matching Image 1 perfectly) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black text-lg shadow-sm">
                N
              </div>
              <span className="font-extrabold text-xl tracking-tight text-zinc-950 dark:text-white">
                NARO <span className="text-[#ea580c]">BADMINTON</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              Hệ thống bán lẻ dụng cụ cầu lông chuyên nghiệp. Đại lý phân phối chính thức các dòng sản phẩm Yonex, Victor, Li-Ning, Mizuno, Kumpoo tại Việt Nam.
            </p>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-[#ea580c] shrink-0" /> Số 123 Đường Cầu Lông, Cầu Giấy, Hà Nội
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-[#ea580c] shrink-0" /> Hotline / Zalo: 0338 780 204
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-[#ea580c] shrink-0" /> cskh@narobadminton.vn
              </p>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wider mb-4">Danh mục chính</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/category/1?brand=1" className="hover:text-[#ea580c] transition-colors">Vợt cầu lông Yonex</Link></li>
              <li><Link to="/category/1?brand=5" className="hover:text-[#ea580c] transition-colors">Vợt cầu lông Victor</Link></li>
              <li><Link to="/category/1?brand=2" className="hover:text-[#ea580c] transition-colors">Vợt cầu lông Li-Ning</Link></li>
              <li><Link to="/category/2" className="hover:text-[#ea580c] transition-colors">Giày cầu lông chuyên dụng</Link></li>
              <li><Link to="/category/13" className="hover:text-[#ea580c] transition-colors">Quần áo cầu lông</Link></li>
              <li><Link to="/category/5" className="hover:text-[#ea580c] transition-colors">Phụ kiện & Túi vợt</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wider mb-4">Hỗ trợ khách hàng</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/guide" className="hover:text-[#ea580c] transition-colors">Hướng dẫn chọn vợt phù hợp</Link></li>
              <li><Link to="/chinh-sach-bao-hanh" className="hover:text-[#ea580c] transition-colors">Quy định bảo hành & Đổi trả</Link></li>
              <li><Link to="/chinh-sach-van-chuyen" className="hover:text-[#ea580c] transition-colors">Chính sách vận chuyển GHN</Link></li>
              <li><Link to="/he-thong-cua-hang" className="hover:text-[#ea580c] transition-colors">Tìm showroom gần nhất</Link></li>
              <li><Link to="/contact" className="hover:text-[#ea580c] transition-colors">Liên hệ tư vấn</Link></li>
            </ul>
          </div>

          {/* Col 4: Corporate */}
          <div>
            <h5 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wider mb-4">Về Naro Shop</h5>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-[#ea580c] transition-colors">Giới thiệu thương hiệu</Link></li>
              <li><Link to="/franchise" className="hover:text-[#ea580c] transition-colors">Hợp tác nhượng quyền</Link></li>
              <li><Link to="/news" className="hover:text-[#ea580c] transition-colors">Tin tức & Hướng dẫn</Link></li>
              <li><Link to="/search-image" className="text-lime-600 dark:text-lime-400 hover:underline">AI Visual Search</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-900 py-6 text-center text-xs text-zinc-500 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Naro Badminton Shop. All rights reserved.</p>
          <p className="flex items-center gap-4 text-zinc-500 dark:text-zinc-500">
            <span>Bảo mật</span> • <span>Điều khoản</span> • <span>Sitemap</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
