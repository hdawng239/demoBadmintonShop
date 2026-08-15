import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/productService';
import { 
  Flame, 
  Zap, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Sparkles,
  Camera,
  Truck,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

const BRANDS = [
  { name: 'YONEX', country: 'Japan', desc: 'Công nghệ vượt trội, số 1 thế giới', color: 'from-blue-600 to-sky-500' },
  { name: 'VICTOR', country: 'Taiwan', desc: 'Uy lực và tốc độ đỉnh cao', color: 'from-blue-700 to-indigo-600' },
  { name: 'LI-NING', country: 'China', desc: 'Thiết kế mạnh mẽ, vật liệu carbon đỉnh', color: 'from-red-600 to-orange-500' },
  { name: 'MIZUNO', country: 'Japan', desc: 'Độ chính xác và độ bền huyền thoại', color: 'from-blue-900 to-cyan-700' },
  { name: 'KUMPOO', country: 'Japan', desc: 'Dễ chơi, bền bỉ cho phong trào', color: 'from-amber-600 to-yellow-500' }
];

// Top 5 Highlight Slides for Hero Right Card
const HERO_SLIDES = [
  {
    tag: 'YONEX JAPAN • PRO EDITION',
    status: 'IN STOCK',
    name: 'Vợt Cầu Lông Yonex Astrox 88D Pro',
    image: 'https://shopvnb.com//uploads/gallery/vot-cau-long-yonex-astrox-88d-game-2024-chinh-hang_1710988566.webp',
    link: '/category/1?brand=1'
  },
  {
    tag: 'VICTOR TAIWAN • SIGNATURE SERIES',
    status: 'AUTHENTIC',
    name: 'Vợt Cầu Lông Victor Thruster Ryuga',
    image: 'https://cdn.shopvnb.com/uploads/gallery/vot-cau-long-victor-thruster-ryuga-cls-c-chinh-hang_1744251266.webp',
    link: '/category/1?brand=5'
  },
  {
    tag: 'LI-NING RACING • FLAGSHIP',
    status: 'TOP PICK',
    name: 'Vợt Cầu Lông Li-Ning Halbertec 8000',
    image: 'https://caulong360.com/wp-content/uploads/2023/02/SET-Vot-Cau-Long-Lining-Halbertec-8000-4.png',
    link: '/category/1?brand=2'
  },
  {
    tag: 'YONEX FOOTWEAR • POWER CUSHION',
    status: 'BEST SELLER',
    name: 'Giày Cầu Lông Yonex Power Cushion 65Z3',
    image: 'https://shopvnb.com//uploads/gallery/giay-cau-long-yonex-65z3-trang-do-jp-noi-dia-nhat-_1726081176.webp',
    link: '/category/2?brand=1'
  },
  {
    tag: 'VICTOR PRO • TTY EDITION',
    status: 'LIMITED',
    name: 'Giày Cầu Lông Victor P9200 Chuyên Dụng',
    image: 'https://shopvnb.com//uploads/gallery/giay-cau-long-victor-p9200-tty-trang-chinh-hang_1697423636.webp',
    link: '/category/2?brand=5'
  }
];

// 4 Golden Pro Guarantees & Marketing Pillars
const PRO_MARKETING_SERVICES = [
  {
    icon: Award,
    tag: 'Kỹ Thuật BWF Chuẩn Quốc Tế',
    title: 'Căng Vợt Điện Tử 4 Nút Chuẩn',
    desc: 'Hệ thống máy đan cước điện tử công nghệ cao. Kỹ thuật viên tay nghề đan chuẩn từng 0.1 lbs, bảo vệ khung vợt chống méo gãy tuyệt đối.',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-400/10 border-amber-200 dark:border-amber-400/20',
    link: '/guide',
    linkText: 'Xem cẩm nang đan cước'
  },
  {
    icon: Camera,
    tag: 'Công Nghệ Đột Phá AI',
    title: 'AI Visual Search & Tư Vấn Chuẩn',
    desc: 'Tìm kiếm sản phẩm tức thì qua hình ảnh chụp từ sân. Hệ thống gợi ý dòng vợt theo thông số 3U/4U và lực cổ tay của bạn.',
    color: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-400/10 border-lime-200 dark:border-lime-400/20',
    link: '/search-image',
    linkText: 'Trải nghiệm AI Search'
  },
  {
    icon: ShieldCheck,
    tag: 'An Tâm Mua Sắm 100%',
    title: 'Cam Kết Đền Bù 200% Hàng Giả',
    desc: '100% sản phẩm có tem chống giả và bảo hành chính hãng từ 3 - 6 tháng. Đổi size giày, áo thể thao miễn phí trong 7 ngày.',
    color: 'text-[#ea580c] bg-orange-50 dark:bg-orange-400/10 border-orange-200 dark:border-orange-400/20',
    link: '/chinh-sach-bao-hanh',
    linkText: 'Quy định bảo hành'
  },
  {
    icon: Truck,
    tag: 'Vận Chuyển Toàn Quốc GHN',
    title: 'Đóng Gói 3 Lớp Chống Va Đập',
    desc: 'Bọc xốp bóng khí 360° kết hợp hộp carton chịu lực định hình chuyên dụng. Khách hàng được kiểm tra hàng trước khi nhận.',
    color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-400/10 border-sky-200 dark:border-sky-400/20',
    link: '/chinh-sach-van-chuyen',
    linkText: 'Chính sách vận chuyển'
  }
];

const HomePage = () => {
  const [rackets, setRackets] = useState([]);
  const [shoes, setShoes] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero Slide State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play Hero Slides every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [racketRes, shoeRes, accRes] = await Promise.all([
          productService.getAllProducts(1, 8, 1, null, null, null, null, 'newest'),
          productService.getAllProducts(1, 8, 2, null, null, null, null, 'newest'),
          productService.getAllProducts(1, 8, 5, null, null, null, null, 'newest'),
        ]);

        const extractList = (res) => {
          const raw = res?.products || res?.data || res || [];
          return Array.isArray(raw) ? raw : (Array.isArray(res?.data) ? res.data : []);
        };

        setRackets(extractList(racketRes));
        setShoes(extractList(shoeRes));
        setAccessories(extractList(accRes));
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const activeSlideData = HERO_SLIDES[currentSlide];

  const QUICK_MOBILE_CATEGORIES = [
    { name: '🔥 Vợt Cầu Lông', link: '/category/1', bg: 'from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400' },
    { name: '👟 Giày Chuyên Dụng', link: '/category/2', bg: 'from-lime-500/10 to-emerald-500/10 text-lime-600 dark:text-lime-400' },
    { name: '👕 Áo Thi Đấu', link: '/category/13', bg: 'from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400' },
    { name: '🎒 Túi & Balo', link: '/category/7', bg: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400' },
    { name: '🏸 Cước Đan BWF', link: '/category/9', bg: 'from-rose-500/10 to-orange-500/10 text-rose-600 dark:text-rose-400' },
    { name: '🏆 Yonex Astrox', link: '/category/1?brand=1', bg: 'from-zinc-500/10 to-zinc-500/10 text-zinc-800 dark:text-zinc-200' },
    { name: '⚡ Victor Thruster', link: '/category/1?brand=5', bg: 'from-zinc-500/10 to-zinc-500/10 text-zinc-800 dark:text-zinc-200' },
    { name: '💥 Li-Ning Axforce', link: '/category/1?brand=2', bg: 'from-zinc-500/10 to-zinc-500/10 text-zinc-800 dark:text-zinc-200' },
  ];

  return (
    <MainLayout>
      {/* 1. Hero Showcase Banner */}
      <section className="relative bg-gradient-to-b from-orange-50/50 via-white to-zinc-50/50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 text-zinc-900 dark:text-white overflow-hidden border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 sm:py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] sm:text-xs font-bold text-[#ea580c] dark:text-lime-400 uppercase tracking-wider shadow-xs">
                <Sparkles size={13} /> Bộ sưu tập Vợt Thi Đấu 2026
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-zinc-950 dark:text-white">
                BỨC PHÁ <span className="text-[#ea580c]">TỐC ĐỘ</span>.<br />
                LÀM CHỦ MỌI ĐƯỜNG CẦU.
              </h1>

              <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-base lg:text-lg leading-relaxed max-w-xl">
                Khám phá thế hệ vợt cầu lông Carbon cao cấp từ Yonex, Victor, Li-Ning. Tư vấn thông số chuẩn 3U/4U, sức căng cước chuẩn BWF cho mọi trình độ.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  to="/category/1"
                  className="px-6 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Mua vợt ngay <ArrowRight size={17} />
                </Link>

                <Link
                  to="/search-image"
                  className="px-5 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  <Camera size={17} className="text-[#ea580c] dark:text-lime-400" /> Tìm bằng ảnh AI
                </Link>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 sm:pt-6 border-t border-zinc-200 dark:border-zinc-800/80 max-w-md">
                <div>
                  <p className="text-xl sm:text-3xl font-black text-zinc-950 dark:text-white">100%</p>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Chính hãng</p>
                </div>
                <div>
                  <p className="text-xl sm:text-3xl font-black text-zinc-950 dark:text-white">5.000+</p>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Vợt xuất kho</p>
                </div>
                <div>
                  <p className="text-xl sm:text-3xl font-black text-[#ea580c] dark:text-lime-400">24/7</p>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">AI Tư vấn</p>
                </div>
              </div>
            </div>

            {/* Right Hero Product Carousel */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-950 p-4 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl sm:shadow-2xl transition-colors duration-300">
                
                {/* Slide Top Badge */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-3 pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[10px] sm:text-[11px] truncate pr-2">
                    {activeSlideData.tag}
                  </span>
                  <span className="px-2 py-0.5 bg-lime-50 dark:bg-lime-400/20 text-lime-700 dark:text-lime-400 font-bold text-[9px] sm:text-[10px] rounded uppercase shrink-0 border border-lime-200 dark:border-transparent">
                    {activeSlideData.status}
                  </span>
                </div>

                {/* Product Image Slide Frame */}
                <Link to={activeSlideData.link} className="block">
                  <div className="aspect-square bg-zinc-50 dark:bg-zinc-900/90 rounded-2xl p-4 sm:p-6 flex items-center justify-center relative overflow-hidden border border-zinc-100 dark:border-zinc-800">
                    <img
                      key={currentSlide}
                      src={activeSlideData.image}
                      alt={activeSlideData.name}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500'; }}
                      className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-lighten transition-all duration-700 hover:scale-105 animate-in fade-in zoom-in-95"
                    />
                  </div>
                </Link>

                {/* Product Name Slide */}
                <div className="mt-4 space-y-2.5">
                  <Link to={activeSlideData.link}>
                    <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1 hover:text-[#ea580c] transition-colors">
                      {activeSlideData.name}
                    </h3>
                  </Link>

                  {/* Navigation Dots and Slide Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center gap-1.5">
                      {HERO_SLIDES.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentSlide === idx ? 'w-5 sm:w-6 bg-[#ea580c]' : 'w-1.5 sm:w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500'
                          }`}
                          title={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={handlePrevSlide}
                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Trước"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Tiếp"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Mobile Category Carousel (Lướt nhanh danh mục trên điện thoại) */}
      <div className="bg-white dark:bg-[#0f1015] border-b border-zinc-200/80 dark:border-zinc-800/80 py-3.5 px-4 overflow-x-auto scrollbar-none transition-colors">
        <div className="flex items-center gap-2 max-w-7xl mx-auto min-w-max">
          {QUICK_MOBILE_CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              to={cat.link}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border border-zinc-200 dark:border-zinc-800 bg-gradient-to-r ${cat.bg} hover:border-[#ea580c] transition-all shrink-0 active:scale-95 shadow-xs`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Top Brands Strip */}
      <section className="bg-white dark:bg-[#0c0d10] py-6 sm:py-8 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Đại lý ủy quyền chính thức
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-5">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                to={`/search?keyword=${encodeURIComponent(brand.name)}`}
                className="p-3 sm:p-4 min-w-[140px] sm:min-w-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfd] dark:bg-[#13141b] hover:border-zinc-900 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-[#181922] transition-all group shadow-xs shrink-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-base sm:text-lg text-zinc-900 dark:text-white tracking-tight group-hover:text-[#ea580c] transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase">
                    {brand.country}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{brand.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Rackets Grid */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#ea580c] mb-1">
              <Flame size={15} /> Tiêu Điểm Bán Chạy
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Top Vợt Cầu Lông Được Ưa Chuộng Nhất
            </h2>
          </div>

          <Link
            to="/category/1"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#ea580c] transition-colors self-start sm:self-auto"
          >
            <span>Xem tất cả vợt</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 sm:h-80 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl sm:rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {rackets.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. High-Impact Marketing Ecosystem Section */}
      <section className="bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-white py-12 sm:py-16 border-y border-zinc-200 dark:border-zinc-800 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 space-y-8 sm:space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[#ea580c] dark:text-lime-400 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-widest shadow-xs">
              <Sparkles size={13} /> Chuẩn Mực Dịch Vụ 5 Sao
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
              Hệ Sinh Thái Cầu Lông Chuyên Nghiệp
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Trang bị toàn diện từ máy móc đan cước quốc tế đến công nghệ AI hỗ trợ lựa chọn thông số chuẩn xác.
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {PRO_MARKETING_SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  className="min-w-[260px] sm:min-w-0 snap-center bg-white dark:bg-zinc-900/90 p-5 sm:p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 sm:space-y-4 group shadow-xs shrink-0"
                >
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border font-bold ${srv.color}`}>
                      <Icon size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                      {srv.tag}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white group-hover:text-[#ea580c] transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  <Link
                    to={srv.link}
                    className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-[#ea580c] dark:hover:text-white transition-colors"
                  >
                    <span>{srv.linkText}</span>
                    <ArrowRight size={14} className="text-[#ea580c]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Shoes Grid */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2 sm:gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-lime-600 mb-1">
              <Zap size={15} /> Mới Lên Kệ
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Giày Cầu Lông Chuyên Dụng Mới Nhất
            </h2>
          </div>

          <Link
            to="/category/2"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#ea580c] transition-colors self-start sm:self-auto"
          >
            <span>Xem tất cả giày</span>
            <ChevronRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 sm:h-80 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl sm:rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {shoes.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Accessories & String Grid */}
      {accessories.length > 0 && (
        <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 lg:px-6 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-2 sm:gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-1">
                <Sparkles size={15} /> Phụ Kiện & Cước Đan
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Túi Vợt, Cước & Phụ Kiện Chính Hãng
              </h2>
            </div>

            <Link
              to="/category/5"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#ea580c] transition-colors self-start sm:self-auto"
            >
              <span>Xem tất cả phụ kiện</span>
              <ChevronRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 sm:h-80 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-2xl sm:rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {accessories.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </MainLayout>
  );
};

export default HomePage;
