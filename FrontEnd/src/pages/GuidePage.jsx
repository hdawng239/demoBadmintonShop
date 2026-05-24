import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const GuidePage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Hướng dẫn mua hàng</h1>
        <div className="prose max-w-none text-gray-600">
          <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Bước 1: Tìm kiếm sản phẩm</h2>
          <p className="mb-4">Bạn có thể sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục trên thanh menu để tìm sản phẩm mong muốn.</p>
          
          <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Bước 2: Thêm vào giỏ hàng</h2>
          <p className="mb-4">Khi đã tìm thấy sản phẩm, hãy chọn số lượng, kích thước (nếu có) và bấm "Thêm vào giỏ hàng".</p>

          <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-800">Bước 3: Thanh toán</h2>
          <p className="mb-4">Truy cập giỏ hàng ở góc phải màn hình, kiểm tra lại đơn hàng và bấm "Tiến hành thanh toán". Nhập thông tin giao hàng và chọn phương thức thanh toán để hoàn tất.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default GuidePage;
