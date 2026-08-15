import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { 
  ShieldCheck, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  PhoneCall, 
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const WARRANTY_PERIODS = [
  { category: 'Vợt Cầu Lông (Yonex, Victor, Li-Ning, Mizuno)', period: '90 Ngày (3 Tháng)', scope: 'Bảo hành nứt, gãy khung, sụp lún gen do lỗi kỹ thuật sản xuất' },
  { category: 'Giày Cầu Lông Chuyên Dụng', period: '180 Ngày (6 Tháng)', scope: 'Bảo hành bung keo, đứt chỉ may, lỗi đệm giảm chấn Power Cushion' },
  { category: 'Túi Vợt, Balo Cầu Lông', period: '90 Ngày (3 Tháng)', scope: 'Bảo hành lỗi khóa kéo, bung chỉ quai đeo chịu lực' },
  { category: 'Cước Đan Vợt & Quấn Cán', period: 'Kiểm tra tại chỗ', scope: 'Bảo hành đan chuẩn số lbs và kiểm tra trước khi nhận hàng' },
];

const STEPS = [
  { step: '1', title: 'Tiếp Nhận Yêu Cầu', desc: 'Mang sản phẩm đến showroom gần nhất hoặc đóng gói gửi bưu điện kèm phiếu mua hàng / SĐT đặt hàng.' },
  { step: '2', title: 'Thẩm Định Sơ Bộ', desc: 'Kỹ thuật viên Naro kiểm tra tình trạng khung vợt, vết xước, mức căng và lập biên bản tiếp nhận.' },
  { step: '3', title: 'Gửi Giám Định Hãng', desc: 'Sản phẩm được chuyển về trung tâm bảo hành chính hãng (Sunrise Yonex, Victor VN, Li-Ning VN).' },
  { step: '4', title: 'Đổi Mới / Hoàn Tất', desc: 'Nếu hãng duyệt bảo hành, quý khách được đổi ngay 01 sản phẩm mới 100% nguyên seal cùng mã.' }
];

const WarrantyPage = () => {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-10 space-y-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Link to="/" className="hover:text-[#ea580c]">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Quy định bảo hành & Đổi trả</span>
        </nav>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-[#ea580c] rounded-full text-xs font-black uppercase tracking-widest">
            <ShieldCheck size={14} /> Minh Bạch & Uy Tín
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Chính Sách Bảo Hành & Đổi Trả Sản Phẩm
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Cam kết bảo vệ 100% quyền lợi của khách hàng khi mua sắm tại Naro Badminton Shop theo đúng tiêu chuẩn phân phối chính hãng.
          </p>
        </div>

        {/* 1. Warranty Periods Table */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-[#ea580c]" />
            1. Thời Hạn Bảo Hành Chính Hãng
          </h2>

          <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-[#181a24] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Nhóm Sản Phẩm</th>
                    <th className="p-4 text-center">Thời Gian Bảo Hành</th>
                    <th className="p-4">Phạm Vi Áp Dụng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {WARRANTY_PERIODS.map((w, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-zinc-900 dark:text-white">{w.category}</td>
                      <td className="p-4 text-center font-mono font-black text-[#ea580c]">{w.period}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300 leading-relaxed">{w.scope}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 2. Conditions & Non-warranty (2 Column Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Approved conditions */}
          <div className="bg-lime-50/30 dark:bg-lime-950/20 p-6 sm:p-8 rounded-3xl border border-lime-200 dark:border-lime-900/40 space-y-4">
            <div className="flex items-center gap-2 text-lime-700 dark:text-lime-400 font-bold text-base">
              <CheckCircle2 size={22} className="text-lime-600 dark:text-lime-400 shrink-0" />
              <span>Điều Kiện Được Bảo Hành Khung Vợt</span>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0 mt-1.5" />
                <span>Khung vợt bị nứt, gãy tự nhiên do lỗi vật liệu carbon hoặc sụp lún gen khi căng cước đúng số kg quy định.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0 mt-1.5" />
                <span>Còn nguyên vẹn tem bảo hành của nhà phân phối chính thức (Sunrise, Hải Nam, CMT...).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0 mt-1.5" />
                <span>Vợt chưa từng qua sửa chữa, hàn nối carbon hay can thiệp kết cấu.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500 shrink-0 mt-1.5" />
                <span>Được mua tại hệ thống Showroom hoặc Website Naro Badminton.</span>
              </li>
            </ul>
          </div>

          {/* Rejected conditions */}
          <div className="bg-rose-50/30 dark:bg-rose-950/20 p-6 sm:p-8 rounded-3xl border border-rose-200 dark:border-rose-900/40 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-base">
              <XCircle size={22} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Các Trường Hợp Từ Chối Bảo Hành</span>
            </div>
            <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>Khung vợt bị gãy do va chạm trực tiếp (đấu vợt với đồng đội, đập vợt xuống sàn sân hoặc va vào trụ lưới).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>Căng cước vượt quá mức căng tối đa (Max Tension) được nhà sản xuất in dập chìm trên thân vợt.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>Vợt để trong cốp xe máy, tiếp xúc nguồn nhiệt cao làm nóng chảy keo liên kết carbon.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                <span>Tem bảo hành bị cạo rách, tẩy xóa hoặc chắp vá.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* 3. 7-Day Return / Exchange Policy */}
        <section className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 transition-colors duration-300">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <RotateCcw size={20} className="text-[#ea580c]" />
            2. Chính Sách Đổi Size & Đổi Trả Trong 07 Ngày
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-300 pt-2">
            <div className="p-4 bg-zinc-50 dark:bg-[#181a24] rounded-2xl space-y-2 border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-bold text-zinc-900 dark:text-white">Đổi Size Giày & Quần Áo</h4>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">Hỗ trợ đổi size miễn phí trong 7 ngày nếu không vừa. Quý khách vui lòng thử giày trên mặt thảm sạch.</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-[#181a24] rounded-2xl space-y-2 border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-bold text-zinc-900 dark:text-white">Điều Kiện Hàng Hóa</h4>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">Sản phẩm còn nguyên tem mác, nguyên hộp, chưa qua giặt tẩy. Đối với vợt mới: cán vợt còn nguyên màng co seal nilon.</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-[#181a24] rounded-2xl space-y-2 border border-zinc-100 dark:border-zinc-800">
              <h4 className="font-bold text-zinc-900 dark:text-white">Chi Phí Vận Chuyển Đổi</h4>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">Naro miễn phí ship 100% nếu giao nhầm size/mẫu. Trường hợp khách muốn đổi theo sở thích, phí ship 1 chiều được áp dụng.</p>
            </div>
          </div>
        </section>

        {/* 4. 4-Step Warranty Process */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-[#ea580c]" />
            3. Quy Trình Tiếp Nhận & Xử Lý Bảo Hành
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((st, i) => (
              <div key={i} className="bg-white dark:bg-[#12131a] p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2 transition-colors duration-300">
                <span className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] font-black text-sm flex items-center justify-center font-mono">
                  {st.step}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{st.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Support Hotline */}
        <div className="bg-zinc-950 dark:bg-[#12131a] text-white rounded-3xl p-8 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <PhoneCall size={18} className="text-[#ea580c]" /> Cần Hỗ Trợ Kỹ Thuật & Bảo Hành?
            </h3>
            <p className="text-xs text-zinc-400">Liên hệ trực tiếp phòng bảo hành để được kiểm tra tình trạng hồ sơ nhanh nhất.</p>
          </div>

          <a
            href="tel:0338780204"
            className="px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            Hotline: 0338 780 204
          </a>
        </div>
      </div>
    </MainLayout>
  );
};

export default WarrantyPage;
