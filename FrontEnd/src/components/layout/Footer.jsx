import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#222222] text-gray-300 text-sm">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-gray-700">
        
        {/* Cột 1 */}
        <div>
          <h3 className="text-white font-bold uppercase mb-4">Thông tin chung</h3>
          <p className="mb-4 text-justify"><strong>NaviShop</strong> là hệ thống cửa hàng cầu lông, pickleball với hơn 80 chi nhánh trên toàn quốc, cung cấp sỉ và lẻ các mặt hàng dụng cụ cầu lông, pickleball từ phong trào tới chuyên nghiệp.</p>
          <p className="mb-4 text-justify"><strong>Với sứ mệnh:</strong> "NaviShop cam kết mang đến những sản phẩm, dịch vụ chất lượng tốt nhất phục vụ cho người chơi thể thao để nâng cao sức khỏe của chính mình."</p>
          <p className="text-justify"><strong className="text-primary">Tầm nhìn:</strong> "Trở thành nhà phân phối và sản xuất thể thao lớn nhất Việt Nam"</p>
        </div>

        {/* Cột 2 */}
        <div>
          <h3 className="font-bold text-lg mb-4 text-primary">THÔNG TIN LIÊN HỆ</h3>
          <p className="mb-4 text-primary hover:underline cursor-pointer">Xem tất cả các cửa hàng NaviShop</p>
          <p className="mb-2">Hotline: 0977508430</p>
          <p className="mb-2">Email: info@navishop.com</p>
          <p className="mb-2">Hợp tác kinh doanh: 0947342259 (Ms. Thảo)</p>
          <p className="mb-4">Nhượng quyền thương hiệu: <span className="text-primary">0334.741.141</span> (Mr. Hậu)</p>
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center font-bold hover:text-primary hover:border-primary cursor-pointer transition-colors">
              FB
            </div>
            <div className="w-8 h-8 rounded-full border border-gray-500 flex items-center justify-center font-bold hover:text-primary hover:border-primary cursor-pointer transition-colors">
              YT
            </div>
          </div>
        </div>

        {/* Cột 3 */}
        <div>
          <h3 className="text-white font-bold uppercase mb-4">Chính sách</h3>
          <ul className="space-y-2">
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Thông tin về vận chuyển và giao nhận</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Chính sách đổi trả/hoàn tiền</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Chính sách bảo hành</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Chính sách xử lý khiếu nại</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Chính sách vận chuyển</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Điều khoản sử dụng</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Chính Sách Bảo Mật Thông Tin</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Chính sách nhượng quyền</li>
          </ul>
        </div>

        {/* Cột 4 */}
        <div>
          <h3 className="text-white font-bold uppercase mb-4">Hướng dẫn</h3>
          <ul className="space-y-2">
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Cách chọn vợt Pickleball dành cho người mới</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Hướng dẫn cách chọn vợt cầu lông</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Hướng dẫn thanh toán</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Kiểm tra bảo hành</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>Kiểm tra đơn hàng</li>
            <li className="hover:text-primary cursor-pointer transition-colors flex items-center"><span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>HƯỚNG DẪN MUA HÀNG</li>
          </ul>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="bg-primary text-white py-6 text-center text-xs">
        <p className="font-bold uppercase mb-1">Công ty TNHH NaviShop</p>
        <p>Địa chỉ: 390/2 Hà Huy Giáp, Phường Thạnh Lộc, Quận 12, TPHCM - Email: info@navishop.com</p>
        <p>GPKD số 0314496879 do Sở KH và ĐT TP Hồ Chí Minh cấp ngày 05/07/2017</p>
        <div className="flex justify-center mt-3">
          <div className="bg-white text-primary flex items-center px-3 py-1 rounded-md font-bold">
            <ShieldCheck className="w-5 h-5 mr-1" />
            ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
