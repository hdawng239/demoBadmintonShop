import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const ContactPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 border-b-4 border-primary inline-block pb-2">Liên Hệ Với NaviShop</h1>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4">Bạn có câu hỏi, góp ý hay cần tư vấn? Hãy để lại thông tin, đội ngũ NaviShop luôn sẵn sàng lắng nghe và phản hồi bạn trong thời gian sớm nhất.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            
            {/* Thông tin liên hệ */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-10 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-8 flex items-center">
                  Thông Tin Liên Hệ
                </h2>
                <ul className="space-y-8">
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mr-4">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <div>
                      <strong className="block text-gray-300 font-medium mb-1">Trụ sở chính:</strong>
                      <span className="text-gray-400">123 Đường Cầu Lông, Phường Thể Thao, Quận Cầu Giấy, Hà Nội</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mr-4">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    </div>
                    <div>
                      <strong className="block text-gray-300 font-medium mb-1">Hotline tư vấn:</strong>
                      <span className="text-xl font-bold text-white">0977 508 430</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mr-4">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                      <strong className="block text-gray-300 font-medium mb-1">Email hỗ trợ:</strong>
                      <span className="text-gray-400">cskh@navishop.com</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mr-4">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                      <strong className="block text-gray-300 font-medium mb-1">Giờ mở cửa:</strong>
                      <span className="text-gray-400">8:00 - 22:00 (Tất cả các ngày trong tuần)</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-12 flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">FB</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">YT</a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">IG</a>
              </div>
            </div>

            {/* Form gửi tin nhắn */}
            <div className="md:col-span-3 p-10 bg-gray-50">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Gửi lời nhắn cho chúng tôi</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Nguyễn Văn A" className="w-full border border-gray-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-white shadow-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                    <input type="tel" placeholder="09xx xxx xxx" className="w-full border border-gray-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-white shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Tùy chọn)</label>
                  <input type="email" placeholder="example@gmail.com" className="w-full border border-gray-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung cần hỗ trợ <span className="text-red-500">*</span></label>
                  <textarea rows="5" placeholder="Bạn cần NaviShop giúp gì..." className="w-full border border-gray-300 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors bg-white shadow-sm resize-none"></textarea>
                </div>
                <button type="button" className="w-full bg-primary text-white font-bold text-lg px-6 py-4 rounded-xl hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Gửi Yêu Cầu
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
