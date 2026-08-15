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
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
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
        const [prodRes] = await Promise.all([
          productService.getAllProducts(1, 12)
        ]);

        const raw = prodRes?.products || prodRes?.data || prodRes || [];
        const allProds = Array.isArray(raw) ? raw : (Array.isArray(prodRes?.data) ? prodRes.data : []);
        setFeaturedProducts(allProds.slice(0, 8));
        setNewArrivals(allProds.slice(4, 12));
      } catch (err) {
        console.error('Lỗi tải trang chủ:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const activeSlideData = HERO_SLIDES[currentSlide];

  return (
    <MainLayout>
      {/* 1. Hero Showcase Banner */}
      <section className="relative bg-gradient-to-b from-orange-50/50 via-white to-zinc-50/50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 text-zinc-900 dark:text-white overflow-hidden border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-[#ea580c] dark:text-lime-400 uppercase tracking-wider shadow-xs">
                <Sparkles size={14} /> Bộ sưu tập Vợt Thi Đấu 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-zinc-950 dark:text-white">
                BỨC PHÁ <span className="text-[#ea580c]">TỐC ĐỘ</span>.<br />
                LÀM CHỦ MỌI ĐƯỜNG CẦU.
              </h1>

              <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl">
                Khám phá thế hệ vợt cầu lông Carbon cao cấp từ Yonex, Victor, Li-Ning. Tư vấn thông số chuẩn 3U/4U, sức căng cước chuẩn BWF cho mọi trình độ.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/category/1"
                  className="px-7 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Mua vợt ngay <ArrowRight size={18} />
                </Link>

                <Link
                  to="/search-image"
                  className="px-6 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 font-bold text-sm rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                >
                  <Camera size={18} className="text-[#ea580c] dark:text-lime-400" /> Tìm bằng ảnh AI
                </Link>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 max-w-md">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">100%</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Chính hãng</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">5.000+</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Vợt đã xuất kho</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#ea580c] dark:text-lime-400">24/7</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">AI Tư vấn</p>
                </div>
              </div>
            </div>

            {/* Right Hero Product Carousel */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white dark:bg-gradient-to-b dark:from-zinc-900 dark:to-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-colors duration-300">
                
                {/* Slide Top Badge */}
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] truncate pr-2">
                    {activeSlideData.tag}
                  </span>
                  <span className="px-2 py-0.5 bg-lime-50 dark:bg-lime-400/20 text-lime-700 dark:text-lime-400 font-bold text-[10px] rounded uppercase shrink-0 border border-lime-200 dark:border-transparent">
                    {activeSlideData.status}
                  </span>
                </div>

                {/* Product Image Slide Frame */}
                <Link to={activeSlideData.link} className="block">
                  <div className="aspect-square bg-zinc-50 dark:bg-zinc-900/90 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden border border-zinc-100 dark:border-zinc-800">
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
                <div className="mt-5 space-y-3">
                  <Link to={activeSlideData.link}>
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1 hover:text-[#ea580c] transition-colors">
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
                            currentSlide === idx ? 'w-6 bg-[#ea580c]' : 'w-2 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-500'
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

      {/* 2. Top Brands Strip */}
      <section className="bg-white dark:bg-[#0c0d10] py-8 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
              Đại lý ủy quyền chính thức
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                to={`/search?keyword=${encodeURIComponent(brand.name)}`}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-[#fbfcfd] dark:bg-[#13141b] hover:border-zinc-900 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-[#181922] transition-all group shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-lg text-zinc-900 dark:text-white tracking-tight group-hover:text-[#ea580c] transition-colors">
                    {brand.name}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase">
                    {brand.country}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{brand.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Featured Rackets Grid */}
      <section className="py-14 max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#ea580c] mb-1">
              <Flame size={16} /> Tiêu Điểm Bán Chạy
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Top Vợt Cầu Lông Được Ưa Chuộng Nhất
            </h2>
          </div>

          <Link
            to="/category/1"
            className="inline-flex items-center gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#ea580c] transition-colors"
          >
            <span>Xem tất cả vợt</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. High-Impact Marketing Ecosystem Section */}
      <section className="bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-white py-16 border-y border-zinc-200 dark:border-zinc-800 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[#ea580c] dark:text-lime-400 rounded-full text-xs font-black uppercase tracking-widest shadow-xs">
              <Sparkles size={14} /> Chuẩn Mực Dịch Vụ 5 Sao
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
              Hệ Sinh Thái Cầu Lông Chuyên Nghiệp
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Trang bị toàn diện từ máy móc đan cước quốc tế đến công nghệ AI hỗ trợ lựa chọn thông số chuẩn xác.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRO_MARKETING_SERVICES.map((srv, idx) => {
              const Icon = srv.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900/90 p-7 rounded-3xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold ${srv.color}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 block">
                      {srv.tag}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-[#ea580c] transition-colors">
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
                    <ArrowRight size={15} className="text-[#ea580c]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Grid */}
      <section className="py-14 max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-lime-600 mb-1">
              <Zap size={16} /> Mới Lên Kệ
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Dụng Cụ Cầu Lông Mới Nhất
            </h2>
          </div>

          <Link
            to="/category/2"
            className="inline-flex items-center gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#ea580c] transition-colors"
          >
            <span>Xem giày & phụ kiện</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default HomePage;
