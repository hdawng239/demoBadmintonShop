import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { 
  Truck, 
  PackageCheck, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Search, 
  CheckCircle2, 
  HelpCircle,
  Sparkles,
  PhoneCall
} from 'lucide-react';

const SHIPPING_TIMES = [
  { region: 'Nội thành Hà Nội & TP. Hồ Chí Minh', time: '12 - 24 Giờ', note: 'Giao hỏa tốc trong ngày hoặc sáng hôm sau' },
  { region: 'Các tỉnh thành Miền Bắc & Miền Trung', time: '2 - 3 Ngày', note: 'Giao tận nhà qua đường bay & xe tải GHN Express' },
  { region: 'Các tỉnh thành Miền Nam & Tây Nam Bộ', time: '3 - 4 Ngày', note: 'Tối ưu lộ trình, đảm bảo an toàn tuyệt đối' },
  { region: 'Vùng sâu vùng xa, huyện đảo', time: '4 - 5 Ngày', note: 'Phối hợp bưu cục địa phương chuyển phát tận tay' },
];

const PACKING_STEPS = [
  {
    step: '1',
    title: 'Bọc Màng Xốp Khí 360°',
    desc: 'Khung vợt và thân đũa được quấn 2-3 lớp bubble wrap giảm chấn đa điểm, chống trầy xước nước sơn bóng.'
  },
  {
    step: '2',
    title: 'Hộp Carton 3 Lớp Chuyên Dụng',
    desc: 'Sử dụng hộp carton định hình tam giác chịu lực ép lớn, chống bẹp méo khi xếp dỡ hàng hóa trên xe tải.'
  },
  {
    step: '3',
    title: 'Dán Tem Cảnh Báo & Niêm Phong',
    desc: 'Dán tem hàng dễ vỡ (Fragile) màu đỏ nổi bật và tem niêm phong an ninh của Naro Badminton Shop.'
  },
  {
    step: '4',
    title: 'Tạo Vận Đơn & Bàn Giao GHN',
    desc: 'Tự động đồng bộ mã vận đơn GHN Express lên hệ thống để khách hàng theo dõi lộ trình thời gian thực.'
  }
];

const ShippingPolicyPage = () => {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-10 space-y-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Link to="/" className="hover:text-[#ea580c]">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Chính sách vận chuyển GHN</span>
        </nav>

        {/* Hero Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-[#ea580c] rounded-full text-xs font-black uppercase tracking-widest">
            <Truck size={14} /> GHN Express Logistics
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Chính Sách Vận Chuyển & Giao Nhận Toàn Quốc
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
            Hợp tác cùng đơn vị vận chuyển hàng đầu <strong>Giao Hàng Nhanh (GHN Express)</strong>, đảm bảo đóng gói an toàn và giao nhanh tận tay trên khắp 63 tỉnh thành.
          </p>
        </div>

        {/* 1. Delivery Timeline */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-[#ea580c]" />
            1. Thời Gian Giao Hàng Dự Kiến
          </h2>

          <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-[#181a24] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Khu Vực Giao Hàng</th>
                    <th className="p-4 text-center">Thời Gian Dự Kiến</th>
                    <th className="p-4">Ghi Chú Vận Hành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {SHIPPING_TIMES.map((st, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-zinc-900 dark:text-white">{st.region}</td>
                      <td className="p-4 text-center font-mono font-black text-[#ea580c]">{st.time}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300 leading-relaxed">{st.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 2. Professional Packaging Process */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <PackageCheck size={20} className="text-[#ea580c]" />
              2. Quy Trình Đóng Gói Chuyên Dụng Cho Vợt Cầu Lông
            </h2>
            <span className="text-xs font-bold text-lime-700 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-900/40 px-2.5 py-0.5 rounded-full">
              An toàn 100% không gãy vỡ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKING_STEPS.map((ps, i) => (
              <div key={i} className="bg-white dark:bg-[#12131a] p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2 transition-colors duration-300">
                <span className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] font-black text-sm flex items-center justify-center font-mono">
                  {ps.step}
                </span>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{ps.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{ps.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Inspection & Freeship Policy */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 transition-colors duration-300">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#ea580c]" />
              Chính Sách Đồng Kiểm Khi Nhận Hàng
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Nhằm bảo vệ tối đa quyền lợi khách hàng, Naro Badminton áp dụng chính sách <strong>cho phép đồng kiểm</strong>:
            </p>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-lime-600 dark:text-lime-400 shrink-0 mt-0.5" />
                <span>Quý khách được mở hộp kiểm tra đúng mẫu mã, màu sắc, tem bảo hành và tình trạng khung vợt trước khi thanh toán.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-lime-600 dark:text-lime-400 shrink-0 mt-0.5" />
                <span>Nếu phát hiện hàng bị móp méo do vận chuyển, quý khách có quyền từ chối nhận hàng và không mất bất kỳ chi phí nào.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 transition-colors duration-300">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles size={20} className="text-[#ea580c]" />
              Chính Sách Miễn Phí Vận Chuyển (Freeship)
            </h3>
            <div className="p-4 bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-2xl space-y-1.5 text-xs text-orange-950 dark:text-orange-200">
              <p className="font-bold text-sm text-[#ea580c]">Freeship Toàn Quốc cho đơn từ 1.500.000 ₫</p>
              <p className="text-zinc-600 dark:text-zinc-400">Tự động áp dụng khi thanh toán trên website hoặc khi áp dụng mã voucher Freeship hàng tháng.</p>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Đối với các đơn hàng dưới 1.500.000 ₫, phí ship được tính tự động theo biểu phí thực tế của GHN Express dựa trên khoảng cách và kích thước gói hàng.
            </p>
          </div>
        </section>

        {/* 4. Tracking guide */}
        <div className="bg-zinc-950 dark:bg-[#12131a] text-white rounded-3xl p-8 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Search size={18} className="text-[#ea580c]" /> Tra Cứu Tình Trạng Đơn Hàng?
            </h3>
            <p className="text-xs text-zinc-400">Xem lộ trình đơn hàng thời gian thực trong mục tài khoản hoặc liên hệ hotline để kiểm tra.</p>
          </div>

          <div className="flex gap-3 shrink-0">
            <Link
              to="/my-orders"
              className="px-5 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Xem Đơn Hàng Của Tôi
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ShippingPolicyPage;
