import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  HeartHandshake, 
  Zap, 
  ArrowRight,
  Store,
  Clock
} from 'lucide-react';

const STATS = [
  { value: '50,000+', label: 'Khách hàng tin chọn', desc: 'Tay vợt phong trào & chuyên nghiệp' },
  { value: '100,000+', label: 'Cây vợt đã đan', desc: 'Chuẩn kỹ thuật thi đấu BWF' },
  { value: '100%', label: 'Sản phẩm chính hãng', desc: 'Đầy đủ tem cào & mã phân phối' },
  { value: '99.8%', label: 'Độ hài lòng dịch vụ', desc: 'Đánh giá 5 sao từ cộng đồng' },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: '100% Chính Hãng Cam Kết',
    desc: 'Tuyệt đối không bán hàng giả, hàng nhái, hàng dựng. Đền bù gấp 2 lần giá trị sản phẩm nếu phát hiện vi phạm bản quyền thương hiệu.',
    color: 'text-[#ea580c] bg-orange-50 dark:bg-orange-950/40'
  },
  {
    icon: Award,
    title: 'Kỹ Thuật Đan Vợt BWF',
    desc: 'Hệ thống máy đan điện tử hiện đại cùng đội ngũ kỹ thuật viên tay nghề cao. Đan 4 nút / 2 nút chuẩn lực cân, bảo vệ khung vợt tối đa.',
    color: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/40'
  },
  {
    icon: Zap,
    title: 'Tư Vấn Thông Số Chuẩn AI',
    desc: 'Ứng dụng công nghệ phân tích lối đánh, điểm cân bằng, trọng lượng (3U/4U) giúp người chơi chọn đúng cây vợt phù hợp thể lực.',
    color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
  },
  {
    icon: HeartHandshake,
    title: 'Đồng Hành & Hậu Mãi Tận Tâm',
    desc: 'Chính sách bảo hành chính hãng từ 3 - 6 tháng, đổi size trong 7 ngày và hỗ trợ kiểm tra khung vợt, thay quấn cán trọn đời.',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
  }
];

const BRANDS = [
  { name: 'YONEX', origin: 'Nhật Bản', role: 'Đại lý ủy quyền chính thức' },
  { name: 'VICTOR', origin: 'Đài Loan', role: 'Đối tác chiến lược cao cấp' },
  { name: 'LI-NING', origin: 'Trung Quốc', role: 'Phân phối dụng cụ thi đấu' },
  { name: 'MIZUNO', origin: 'Nhật Bản', role: 'Đối tác giày & phụ kiện' }
];

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 space-y-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Link to="/" className="hover:text-[#ea580c]">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Về chúng tôi</span>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-[#ea580c] rounded-full text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} /> Khởi Nguồn Đam Mê
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Kiến Tạo Chuẩn Mực Mới Cho Trải Nghiệm <span className="text-[#ea580c]">Cầu Lông</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              Thành lập từ tình yêu mãnh liệt với quả cầu lông và mong muốn đem đến cho người chơi thể thao Việt Nam những trang thiết bị chính hãng tiêu chuẩn quốc tế. <strong>Naro Badminton</strong> không chỉ là một cửa hàng, mà là điểm hẹn kết nối những người đam mê tốc độ, sự chính xác và tinh thần thể thao bền bỉ.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/category/1"
                className="px-6 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/he-thong-cua-hang"
                className="px-6 py-3.5 bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-400 text-zinc-900 dark:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Store size={16} />
                <span>Hệ thống Showroom</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-950 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80"
                alt="Naro Badminton Showroom"
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#ea580c] font-black">Chuyên nghiệp & Tận tâm</span>
                <p className="font-bold text-sm">Hệ thống máy đan điện tử chuẩn BWF Quốc tế</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impressive Stats */}
        <div className="bg-zinc-950 dark:bg-[#12131a] text-white rounded-3xl p-8 sm:p-12 border border-zinc-800 shadow-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
            {STATS.map((s, i) => (
              <div key={i} className={`pt-4 lg:pt-0 ${i !== 0 ? 'lg:pl-8' : ''} space-y-1`}>
                <p className="text-3xl sm:text-4xl font-black font-mono text-[#ea580c] tracking-tight">{s.value}</p>
                <p className="font-bold text-sm text-white">{s.label}</p>
                <p className="text-xs text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Core Value Pillars */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">Giá trị cốt lõi</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Tại Sao Hàng Vạn VĐV Tin Chọn Naro Badminton?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Chúng tôi không chỉ bán một cây vợt, chúng tôi trao giải pháp giúp nâng tầm trình độ của bạn trên từng set cầu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-white dark:bg-[#12131a] rounded-3xl p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between transition-colors duration-300">
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${val.color}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">{val.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Official Brand Partnerships */}
        <section className="bg-zinc-50 dark:bg-[#181a24] rounded-3xl p-8 sm:p-12 border border-zinc-200/80 dark:border-zinc-800 space-y-8 transition-colors duration-300">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">Đối tác chiến lược</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Phân Phối Chính Hãng Các Thương Hiệu Hàng Đầu
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Nguồn hàng nhập khẩu trực tiếp, đầy đủ hóa đơn chứng từ và bảo hành toàn diện.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BRANDS.map((b, i) => (
              <div key={i} className="bg-white dark:bg-[#12131a] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-center space-y-2 transition-colors">
                <p className="text-xl font-black text-zinc-900 dark:text-white tracking-wider uppercase font-mono">{b.name}</p>
                <span className="inline-block text-[11px] font-bold text-[#ea580c] bg-orange-50 dark:bg-orange-950/40 px-2.5 py-0.5 rounded-full">{b.origin}</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{b.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 dark:from-[#12131a] dark:to-zinc-900 text-white rounded-3xl p-8 sm:p-12 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-[#ea580c]" size={24} />
              Trải Nghiệm Trực Tiếp Tại Showroom
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Hãy đến các chi nhánh Naro Badminton để được cầm thử vợt trên tay, kiểm tra độ cân bằng và nhận tư vấn chuyên sâu từ chuyên gia.
            </p>
          </div>

          <Link
            to="/he-thong-cua-hang"
            className="px-6 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 shrink-0"
          >
            Xem Địa Chỉ Showroom
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
