import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { 
  Sparkles, 
  Award, 
  ShieldCheck, 
  HelpCircle, 
  Flame, 
  Zap, 
  Target, 
  ChevronRight, 
  ArrowRight,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';

const WEIGHT_SPECS = [
  {
    code: '3U',
    gram: '85 - 89g',
    badge: 'Tấn công mạnh mẽ',
    color: 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300',
    suitable: 'Người chơi có lực cổ tay khỏe, thể lực tốt, chơi lâu năm, thích đập cầu smash ghi điểm.',
    pros: 'Trợ lực đánh cực đầm tay, smash cầu cắm sân uy lực, phông cầu sâu cuối sân nhẹ nhàng.',
    cons: 'Nhanh mỏi tay nếu cổ tay chưa đủ khỏe, xoay trở phòng thủ chậm hơn một chút.'
  },
  {
    code: '4U',
    gram: '80 - 84g',
    badge: 'Phổ biến nhất (90% phong trào)',
    color: 'border-lime-500 bg-lime-50/50 dark:bg-lime-950/20 text-lime-700 dark:text-lime-300',
    popular: true,
    suitable: 'Phù hợp với hầu hết người chơi phong trào, từ người mới chơi đến bán chuyên tại Việt Nam.',
    pros: 'Cân bằng hoàn hảo giữa lực đập và tốc độ xoay chuyển linh hoạt, không gây đau mỏi cổ tay.',
    cons: 'Lực đập smash không quá nặng bằng bản 3U.'
  },
  {
    code: '5U / 6U',
    gram: '75 - 79g',
    badge: 'Siêu nhẹ & Tốc độ',
    color: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300',
    suitable: 'Phái nữ, người mới bắt đầu, người cổ tay yếu, người thích đánh đôi chuyên bắt lưới và phản tạt.',
    pros: 'Vung vợt siêu nhanh, thủ cầu và bắt lưới cực kỳ thanh thoát, linh hoạt tối đa.',
    cons: 'Lực smash không nặng, khi đón các cú đập uy lực dễ bị rung khung vợt.'
  }
];

const BALANCE_POINTS = [
  {
    type: 'Nặng Đầu (Head Heavy)',
    spec: '> 295mm',
    sub: 'Smash Power - Thiên Công',
    icon: Flame,
    color: 'text-[#ea580c] bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/40',
    desc: 'Đầu vợt có trọng lượng nặng hơn cán, tạo lực quán tính cực lớn khi vung tay. Thích hợp cho người chơi có lối đánh tấn công dồn dập, smash cầu cuối sân.',
    rackets: 'Yonex Astrox 88D Pro, 100ZZ, 77 Pro, Lining Axforce 90, Victor Thruster Ryuga'
  },
  {
    type: 'Cân Bằng (Even Balance)',
    spec: '285 - 295mm',
    sub: 'All-Round - Công Thủ Toàn Diện',
    icon: Activity,
    color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40',
    desc: 'Trọng lượng phân bố đồng đều toàn cây vợt. Mang lại sự ổn định, vừa tấn công tốt, vừa thủ cầu và điều cầu chính xác theo ý muốn.',
    rackets: 'Yonex Arcsaber 11 Pro, 7 Pro, Lining Halbertec 8000, Victor DriveX'
  },
  {
    type: 'Nhẹ Đầu (Head Light)',
    spec: '< 285mm',
    sub: 'Speed & Defense - Tốc Độ & Thủ Cầu',
    icon: Zap,
    color: 'text-lime-600 dark:text-lime-400 bg-lime-50 dark:bg-lime-950/40 border-lime-200 dark:border-lime-900/40',
    desc: 'Đầu vợt thanh mảnh, nhẹ nhàng, giảm tối đa sức cản gió. Tối ưu cho các pha tì đè trên lưới, chụp cầu và phản tạt tốc độ cao trong đánh đôi.',
    rackets: 'Yonex Nanoflare 800 Pro, 700, 1000Z, Victor Auraspeed 100X, 90K'
  }
];

const TENSION_LEVELS = [
  { level: 'Người mới tập chơi / Nữ', kg: '9.0 - 9.5 kg', lbs: '20 - 21 lbs', note: 'Mặt cước chùng trợ lực cực tốt, nảy cầu dễ dàng, không gây chấn thương cổ tay.' },
  { level: 'Phong trào trung bình (1-2 năm)', kg: '10.0 - 10.5 kg', lbs: '22 - 23 lbs', note: 'Độ nảy và kiểm soát hài hòa, tiếng nổ thanh giòn, phổ biến nhất.' },
  { level: 'Phong trào khá / Thể lực tốt', kg: '10.8 - 11.5 kg', lbs: '24 - 25 lbs', note: 'Kiểm soát đường cầu chuẩn xác, yêu cầu lực phát cổ tay đúng kỹ thuật.' },
  { level: 'Bán chuyên / Vận động viên', kg: '12.0 - 13.5 kg', lbs: '26 - 30 lbs', note: 'Mặt cước rất căng như mặt gỗ, lực kiểm soát tuyệt đối, đòi hỏi kỹ thuật phát lực hoàn hảo.' }
];

const GuidePage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 space-y-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          <Link to="/" className="hover:text-[#ea580c]">Trang chủ</Link>
          <span>/</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">Cẩm nang chọn vợt</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-[#ea580c] rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Cẩm Nang Chuyên Sâu BWF
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            Hướng Dẫn Chọn Vợt Cầu Lông Chuẩn 100%
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Giải mã chi tiết các thông số kỹ thuật (3U/4U, Điểm cân bằng, Độ cứng đũa, Sức căng cước) giúp bạn chọn được cây vợt hoàn hảo nhất cho lối chơi của mình.
          </p>
        </div>

        {/* Anatomy of a Badminton Racket (Visual Card) */}
        <div className="bg-zinc-950 dark:bg-[#12131a] text-white rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#ea580c]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl space-y-4 relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ea580c]">
              Kiến thức nền tảng
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cấu Tạo & 4 Thông Số Vàng Của Vợt
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Mỗi cây vợt chuyên nghiệp được thiết kế với 4 thông số cốt lõi quyết định 100% cảm giác đánh: <strong>Trọng lượng (U)</strong>, <strong>Điểm cân bằng (BP)</strong>, <strong>Độ cứng thân vợt (Flex)</strong> và <strong>Chu vi cán cầm (G)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10">
            <div className="bg-zinc-900/90 dark:bg-[#181a24] border border-zinc-800 p-5 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-lg bg-[#ea580c] text-white flex items-center justify-center font-black text-xs">1</span>
              <h4 className="font-bold text-sm text-white">Trọng lượng (U)</h4>
              <p className="text-xs text-zinc-400">Số U càng lớn thì vợt càng nhẹ (4U nhẹ hơn 3U). Quyết định độ mỏi tay và lực vung.</p>
            </div>

            <div className="bg-zinc-900/90 dark:bg-[#181a24] border border-zinc-800 p-5 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-lg bg-[#ea580c] text-white flex items-center justify-center font-black text-xs">2</span>
              <h4 className="font-bold text-sm text-white">Điểm cân bằng (BP)</h4>
              <p className="text-xs text-zinc-400">Khoảng cách từ chuôi đến điểm thăng bằng. Xác định vợt nặng đầu (Smash) hay nhẹ đầu (Thủ).</p>
            </div>

            <div className="bg-zinc-900/90 dark:bg-[#181a24] border border-zinc-800 p-5 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-lg bg-[#ea580c] text-white flex items-center justify-center font-black text-xs">3</span>
              <h4 className="font-bold text-sm text-white">Độ cứng đũa (Flex)</h4>
              <p className="text-xs text-zinc-400">Đũa dẻo giúp trợ lực tốt cho người mới, đũa cứng cho cú đập cầu chuẩn xác không rung lắc.</p>
            </div>

            <div className="bg-zinc-900/90 dark:bg-[#181a24] border border-zinc-800 p-5 rounded-2xl space-y-2">
              <span className="w-7 h-7 rounded-lg bg-[#ea580c] text-white flex items-center justify-center font-black text-xs">4</span>
              <h4 className="font-bold text-sm text-white">Sức căng cước (Lbs)</h4>
              <p className="text-xs text-zinc-400">Số cân kéo mặt lưới. Quyết định diện tích điểm ngọt (Sweet Spot) và lực phát huy khi chạm cầu.</p>
            </div>
          </div>
        </div>

        {/* Section 1: Trọng Lượng Vợt (Weight: 3U vs 4U vs 5U) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2">
            <div>
              <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">Thông số #1</span>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Cách Chọn Trọng Lượng Vợt (Weight)</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Đo lường bằng ký hiệu U (Số U càng lớn, vợt càng nhẹ)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WEIGHT_SPECS.map((w, idx) => (
              <div key={idx} className={`bg-white dark:bg-[#12131a] rounded-3xl p-6 sm:p-7 border-2 ${w.color} shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden transition-colors`}>
                {w.popular && (
                  <span className="absolute top-4 right-4 bg-[#84cc16] text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Khuyên dùng
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black font-mono text-zinc-900 dark:text-white">{w.code}</span>
                    <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400 font-mono">({w.gram})</span>
                  </div>

                  <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                    {w.badge}
                  </span>

                  <div className="text-xs text-zinc-600 dark:text-zinc-300 space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p><strong>Dành cho ai:</strong> {w.suitable}</p>
                    <p className="text-emerald-700 dark:text-emerald-400"><strong>Ưu điểm:</strong> {w.pros}</p>
                    <p className="text-amber-700 dark:text-amber-400"><strong>Lưu ý:</strong> {w.cons}</p>
                  </div>
                </div>

                <Link
                  to={`/category/1`}
                  className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ea580c] dark:hover:bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Xem vợt {w.code}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Điểm Cân Bằng (Balance Point) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2">
            <div>
              <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">Thông số #2</span>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Điểm Cân Bằng (Balance Point)</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Xác định phong cách chơi: Tấn công, Phòng thủ hay Toàn diện</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BALANCE_POINTS.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="bg-white dark:bg-[#12131a] rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 flex flex-col justify-between transition-colors duration-300">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center border font-bold">
                      <Icon size={22} className={b.color.split(' ')[0]} />
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-zinc-900 dark:text-white">{b.type}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-black text-xs text-[#ea580c] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded">{b.spec}</span>
                        <span className="text-xs text-zinc-400">{b.sub}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {b.desc}
                    </p>

                    <div className="p-3 bg-zinc-50 dark:bg-[#181a24] rounded-xl text-[11px] text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800">
                      <strong>Dòng vợt tiêu biểu:</strong> {b.rackets}
                    </div>
                  </div>

                  <Link
                    to="/category/1"
                    className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-[#ea580c] hover:underline"
                  >
                    <span>Khám phá sản phẩm</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Bảng Căng Cước Chuẩn BWF (Tension Guide) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-2">
            <div>
              <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">Thông số #3</span>
              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Mức Căng Cước Khuyến Nghị (Lbs & Kg)</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Căng đúng số kg giúp tối đa hóa sức mạnh và bảo vệ khớp cổ tay</p>
          </div>

          <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-[#181a24] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Trình độ & Đối tượng</th>
                    <th className="p-4 text-center">Độ căng (Kg)</th>
                    <th className="p-4 text-center">Độ căng (Lbs)</th>
                    <th className="p-4">Đặc tính kỹ thuật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {TENSION_LEVELS.map((row, i) => (
                    <tr key={i} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-4 font-bold text-zinc-900 dark:text-white">{row.level}</td>
                      <td className="p-4 text-center font-mono font-black text-[#ea580c]">{row.kg}</td>
                      <td className="p-4 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">{row.lbs}</td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-300 leading-relaxed">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 4: Lời Khuyên & Căng Vợt Tại Naro Badminton */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-[#12131a] dark:to-zinc-900 text-white rounded-3xl p-8 sm:p-10 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Award className="text-[#ea580c]" size={24} />
              Dịch Vụ Đan Cước Chuẩn 4 Nút BWF
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Mọi sản phẩm vợt mua tại Naro Badminton đều được hỗ trợ đan cước bằng máy điện tử cao cấp Victor/Yonex, chuẩn kỹ thuật 4 nút không làm méo khung hay giảm tuổi thọ vợt.
            </p>
          </div>

          <Link
            to="/category/1"
            className="px-6 py-3.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 shrink-0"
          >
            Mua Vợt Chính Hãng Ngay
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default GuidePage;
