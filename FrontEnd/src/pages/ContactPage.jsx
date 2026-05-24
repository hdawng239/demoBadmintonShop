import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const ContactPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Liên hệ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Thông tin liên hệ</h2>
            <ul className="space-y-4 text-gray-600">
              <li><strong>Địa chỉ:</strong> 123 Đường Cầu Lông, Quận Thể Thao, Hà Nội</li>
              <li><strong>Điện thoại:</strong> 0977 508 430</li>
              <li><strong>Email:</strong> hotro@navishop.com</li>
              <li><strong>Giờ làm việc:</strong> 8:00 - 22:00 tất cả các ngày trong tuần</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Gửi lời nhắn</h2>
            <form className="space-y-4">
              <div>
                <input type="text" placeholder="Họ và tên" className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <input type="email" placeholder="Email" className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <textarea rows="4" placeholder="Nội dung" className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"></textarea>
              </div>
              <button type="button" className="bg-primary text-white px-6 py-3 rounded hover:bg-orange-600 transition-colors">Gửi đi</button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
