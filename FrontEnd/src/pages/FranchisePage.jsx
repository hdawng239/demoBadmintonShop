import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const FranchisePage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Chính sách nhượng quyền</h1>
        <div className="prose max-w-none text-gray-600">
          <p className="mb-4">Chào mừng bạn đến với chương trình nhượng quyền của NaviShop. Chúng tôi mang đến cơ hội hợp tác kinh doanh tuyệt vời với thương hiệu đồ cầu lông uy tín.</p>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Quyền lợi khi tham gia</h2>
          <ul className="list-disc pl-5 mb-4">
            <li>Được sử dụng thương hiệu NaviShop.</li>
            <li>Hỗ trợ setup cửa hàng, đào tạo nhân viên.</li>
            <li>Nguồn hàng chính hãng, giá gốc nhập tận xưởng.</li>
          </ul>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">2. Yêu cầu cơ bản</h2>
          <ul className="list-disc pl-5 mb-4">
            <li>Mặt bằng kinh doanh thuận lợi.</li>
            <li>Vốn đầu tư ban đầu theo quy định.</li>
            <li>Tuân thủ các nguyên tắc của hệ thống.</li>
          </ul>
          <p className="mt-8 italic">Mọi thông tin chi tiết xin vui lòng liên hệ Hotline: 0977508430.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default FranchisePage;
