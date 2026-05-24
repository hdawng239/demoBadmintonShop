import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Giới thiệu về NaviShop</h1>
        <div className="prose max-w-none text-gray-700">
          <p className="mb-4">NaviShop là hệ thống cửa hàng cầu lông lớn nhất Việt Nam, chuyên cung cấp các sản phẩm cầu lông chính hãng từ các thương hiệu nổi tiếng thế giới như Yonex, Victor, Lining...</p>
          <p className="mb-4">Được thành lập với sứ mệnh mang đến cho cộng đồng yêu cầu lông Việt Nam những sản phẩm chất lượng nhất với giá cả phải chăng, chúng tôi luôn không ngừng nỗ lực hoàn thiện dịch vụ và đa dạng hóa sản phẩm.</p>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Tầm nhìn</h2>
          <p className="mb-4">Trở thành chuỗi cửa hàng thể thao số 1 Đông Nam Á.</p>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Sứ mệnh</h2>
          <p className="mb-4">Đồng hành cùng đam mê thể thao của người Việt, nâng tầm sức khỏe cộng đồng.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
