import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Store, 
  Users, 
  DollarSign, 
  Sparkles, 
  PhoneCall, 
  Send, 
  ArrowRight,
  PieChart,
  Layers,
  Clock
} from 'lucide-react';

const MODELS = [
  {
    name: 'Standard Pro Shop',
    area: '30 - 50 m²',
    capital: '350 - 500 Triệu',
    roi: '6 - 9 Tháng',
    badge: 'Phổ biến nhất',
    popular: true,
    features: [
      'Phù hợp vị trí gần cụm sân cầu lông, trường học, khu dân cư đông đúc',
      'Đầy đủ các mặt hàng vợt, giày, quần áo và phụ kiện bán chạy',
      '01 Máy đan vợt điện tử cao cấp & đào tạo kỹ thuật viên 4 nút',
      'Phần mềm bán hàng POS & đồng bộ tồn kho website tự động'
    ]
  },
  {
    name: 'Flagship Showroom',
    area: '60 - 100 m²',
    capital: '700 - 950 Triệu',
    roi: '8 - 12 Tháng',
    badge: 'Quy mô lớn',
    popular: false,
    features: [
      'Showroom mặt tiền lớn, trung tâm quận huyện hoặc thành phố trực thuộc',
      'Đầy đủ 100% các dòng vợt cao cấp, limited edition của Yonex, Victor, Lining',
      '02 Máy đan vợt điện tử công suất lớn phục vụ mùa giải cao điểm',
      'Khu vực Test vợt chuyên nghiệp & Đo lực cổ tay chuẩn BWF'
    ]
  },
  {
    name: 'Badminton Complex (Sân + Shop)',
    area: '300 - 1000 m²',
    capital: '1.2 - 2 Tỷ',
    roi: '10 - 15 Tháng',
    badge: 'Dòng tiền bền vững',
    popular: false,
    features: [
      'Tích hợp cụm 4 - 8 sân cầu lông tiêu chuẩn thi đấu cùng Pro Shop tại sảnh',
      'Dòng tiền kép: Thu tiền thuê sân cố định hàng ngày + Doanh số bán dụng cụ',
      'Tổ chức giải đấu phong trào định kỳ tài trợ độc quyền bởi các hãng vợt',
      'Dịch vụ căng cước, thuê vợt, bán nước giải khát & phụ kiện thể thao liên tục'
    ]
  }
];

const PERKS = [
  {
    icon: DollarSign,
    title: 'Chiết Khấu Nguồn Hàng Tối Đa',
    desc: 'Được nhập trực tiếp nguồn hàng chính hãng từ Yonex, Victor, Li-Ning với mức chiết khấu đại lý cấp 1 cao nhất thị trường.',
    color: 'text-[#ea580c] bg-orange-50 dark:bg-orange-950/40'
  },
  {
    icon: Award,
    title: 'Đào Tạo Kỹ Thuật Đan BWF',
    desc: 'Đào tạo kỹ thuật viên đan vợt chuẩn 4 nút BWF, kỹ năng tư vấn thông số vợt theo lối đánh giúp giữ chân khách hàng 99%.',
    color: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/40'
  },
  {
    icon: ShieldCheck,
    title: 'Bảo Hộ Độc Quyền Khu Vực',
    desc: 'Cam kết bán kính bảo hộ độc quyền từ 3 - 5km. Không mở thêm chi nhánh cùng hệ thống gây cạnh tranh nội bộ.',
    color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
  },
  {
    icon: TrendingUp,
    title: 'Hỗ Trợ Marketing Đa Kênh',
    desc: 'Hệ thống Marketing tổng lực từ trụ sở, định vị showroom trên Google Maps, chạy quảng cáo khai trương và kéo khách đến cửa hàng.',
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
  },
  {
    icon: Layers,
    title: 'Chuyển Giao Công Nghệ & AI',
    desc: 'Cài đặt hệ thống quản lý bán hàng POS, AI tư vấn trực tuyến và liên kết đơn hàng giao nhanh tự động qua GHN Express.',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
  },
  {
    icon: Store,
    title: 'Thiết Kế 3D Showroom Miễn Phí',
    desc: 'Đội ngũ kiến trúc sư hỗ trợ khảo sát mặt bằng, lên bản vẽ phối cảnh 3D nhận diện thương hiệu hiện đại, thu hút ngay từ ngày đầu.',
    color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40'
  }
];

const STEPS = [
  { step: '01', title: 'Đăng Ký & Tư Vấn', desc: 'Điền form thông tin hoặc liên hệ hotline. Chuyên viên nhượng quyền sẽ phân tích ngân sách và thị trường mục tiêu.' },
  { step: '02', title: 'Khảo Sát Mặt Bằng', desc: 'Thẩm định vị trí kinh doanh, phân tích mật độ người chơi cầu lông và lưu lượng giao thông tại địa phương.' },
  { step: '03', title: 'Ký Kết & Lên Thiết Kế', desc: 'Ký hợp đồng nhượng quyền, bàn giao bản vẽ thiết kế 3D showroom và kế hoạch thi công trọn gói.' },
  { step: '04', title: 'Đào Tạo & Nhập Hàng', desc: 'Chuyển giao máy móc, đào tạo căng cước BWF, hướng dẫn quản lý kho POS và nhập danh mục sản phẩm.' },
  { step: '05', title: 'Khai Trương & Đồng Hành', desc: 'Triển khai chiến dịch truyền thông khai trương, hỗ trợ quản trị và cập nhật mẫu vợt hot trend liên tục.' }
];

const FranchisePage = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', budget: '300-500' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', phone: '', email: '', city: '', budget: '300-500' });
    }, 4000);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 space-y-16">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Link to="/" className="hover:text-[#ea580c]">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Hợp tác nhượng quyền</span>
        </nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-[#ea580c] rounded-full text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} /> Cơ Hội Kinh Doanh Đỉnh Cao
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Nhượng Quyền Thương Hiệu <span className="text-[#ea580c]">Naro Badminton</span>
            </h1>
            <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed">
              Gia nhập hệ thống chuỗi cửa hàng cầu lông chính hãng phát triển nhanh nhất tại Việt Nam. Tận dụng sức mạnh thương hiệu, nguồn hàng tận gốc và giải pháp vận hành tự động để sở hữu mô hình kinh doanh có lợi nhuận bền vững.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="#register-form"
                className="px-6 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Nhận hồ sơ nhượng quyền</span>
                <ArrowRight size={16} />
              </a>
              <a
                href="tel:0338780204"
                className="px-6 py-3.5 bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-400 text-zinc-900 dark:text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall size={16} className="text-[#ea580c]" />
                <span>Hotline: 0338 780 204</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-zinc-950 dark:bg-[#12131a] text-white p-8 rounded-3xl border border-zinc-800 shadow-2xl space-y-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <PieChart className="text-[#ea580c]" size={22} />
                Tiềm Năng Thị Trường Cầu Lông
              </h3>
              <div className="space-y-4 text-xs text-zinc-300">
                <div className="p-3.5 bg-zinc-900 dark:bg-[#181a24] rounded-xl border border-zinc-800 space-y-1">
                  <p className="font-bold text-white text-sm text-[#ea580c]">10+ Triệu Người Chơi Thường Xuyên</p>
                  <p className="text-zinc-400">Môn thể thao phong trào có số lượng người chơi lớn nhất tại Việt Nam.</p>
                </div>
                <div className="p-3.5 bg-zinc-900 dark:bg-[#181a24] rounded-xl border border-zinc-800 space-y-1">
                  <p className="font-bold text-white text-sm text-lime-400">Tần Suất Tiêu Dùng Cao & Ổn Định</p>
                  <p className="text-zinc-400">Căng cước 1-2 tháng/lần, thay quấn cán, cầu lông, giày thể thao liên tục quanh năm.</p>
                </div>
                <div className="p-3.5 bg-zinc-900 dark:bg-[#181a24] rounded-xl border border-zinc-800 space-y-1">
                  <p className="font-bold text-white text-sm text-sky-400">Tỷ Suất Lợi Nhuận Gộp 30% - 45%</p>
                  <p className="text-zinc-400">Mô hình kinh doanh không bị ảnh hưởng bởi mùa vụ, rủi ro tồn kho cực thấp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Franchise Perks */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">Quyền lợi đối tác</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Gói Hỗ Trợ Toàn Diện 360 Độ Cho Đối Tác
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Naro Badminton đồng hành từ giai đoạn chọn mặt bằng cho đến khi cửa hàng vận hành sinh lời ổn định.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERKS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="bg-white dark:bg-[#12131a] rounded-3xl p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3 transition-colors duration-300">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${p.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3 Franchise Investment Models */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">Mô hình đầu tư</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Lựa Chọn Gói Nhượng Quyền Phù Hợp
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Được thiết kế linh hoạt phù hợp với từng mức vốn đầu tư và quy mô mặt bằng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {MODELS.map((m, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-[#12131a] rounded-3xl p-8 border-2 ${
                  m.popular ? 'border-[#ea580c] shadow-xl relative' : 'border-zinc-200/80 dark:border-zinc-800 shadow-sm'
                } flex flex-col justify-between space-y-6 transition-colors duration-300`}
              >
                {m.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#ea580c] text-white text-[10px] font-black uppercase px-4 py-1 rounded-full shadow-sm">
                    {m.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-xl text-zinc-900 dark:text-white">{m.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1">Diện tích đề xuất: <strong className="text-zinc-700 dark:text-zinc-200">{m.area}</strong></p>
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-[#181a24] rounded-2xl space-y-2 border border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">Vốn dự kiến:</span>
                      <span className="font-black text-[#ea580c]">{m.capital}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">Thời gian hoàn vốn:</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{m.roi}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Đặc quyền gói:</p>
                    <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                      {m.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-[#ea580c] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <a
                  href="#register-form"
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-center transition-colors ${
                    m.popular
                      ? 'bg-[#ea580c] hover:bg-[#c2410c] text-white shadow-md'
                      : 'bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white'
                  }`}
                >
                  Đăng Ký Gói Này
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 5-Step Process */}
        <section className="bg-zinc-50 dark:bg-[#181a24] rounded-3xl p-8 sm:p-12 border border-zinc-200/80 dark:border-zinc-800 space-y-8 transition-colors duration-300">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">Quy trình 5 bước</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Hành Trình Trở Thành Đại Lý Nhượng Quyền
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {STEPS.map((st, i) => (
              <div key={i} className="bg-white dark:bg-[#12131a] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2 relative transition-colors">
                <span className="text-2xl font-black font-mono text-[#ea580c]">{st.step}</span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{st.title}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Registration Form Card */}
        <div id="register-form" className="bg-white dark:bg-[#12131a] rounded-3xl p-8 sm:p-12 border border-zinc-200/80 dark:border-zinc-800 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-10 transition-colors duration-300">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">Đăng ký trực tuyến</span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Liên Hệ Nhận Bản Kế Hoạch Kinh Doanh
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Điền thông tin của bạn, Giám đốc phát triển kinh doanh Naro Badminton sẽ liên hệ tư vấn trực tiếp trong vòng 24 giờ làm việc.
            </p>
            <div className="p-4 bg-orange-50 dark:bg-orange-950/40 rounded-2xl border border-orange-200 dark:border-orange-900/40 space-y-1 text-xs text-orange-950 dark:text-orange-200">
              <p className="font-bold">Hotline Tư Vấn Trực Tiếp 24/7:</p>
              <p className="text-base font-black text-[#ea580c]">0338 780 204</p>
              <p className="text-[11px] text-orange-800 dark:text-orange-300">Email: franchise@narobadminton.vn</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            {sent ? (
              <div className="p-8 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-800 rounded-3xl text-center space-y-3">
                <CheckCircle2 size={36} className="text-lime-600 dark:text-lime-400 mx-auto" />
                <h3 className="text-lg font-bold text-lime-900 dark:text-lime-200">Đăng Ký Thành Công!</h3>
                <p className="text-xs text-lime-700 dark:text-lime-300">Cảm ơn bạn. Chúng tôi sẽ gửi hồ sơ chi tiết và liên hệ lại trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0912 345 678"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Khu vực / Tỉnh thành dự kiến *</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Hà Nội, Đà Nẵng, Cần Thơ..."
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">Vốn đầu tư dự kiến</label>
                  <select
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-xl outline-none focus:border-[#ea580c]"
                  >
                    <option value="300-500">Từ 300 - 500 Triệu (Standard Pro Shop)</option>
                    <option value="500-1000">Từ 500 Triệu - 1 Tỷ (Flagship Showroom)</option>
                    <option value="1000+">Trên 1 Tỷ (Badminton Complex Sân + Shop)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <Send size={15} />
                  <span>Gửi Yêu Cầu Tư Vấn Nhượng Quyền</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FranchisePage;
