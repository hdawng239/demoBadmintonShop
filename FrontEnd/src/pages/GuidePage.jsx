import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const GuidePage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900">Hướng Dẫn Mua Hàng</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Chỉ với vài thao tác đơn giản, bạn có thể dễ dàng sở hữu những dụng cụ cầu lông chất lượng cao từ NaviShop.</p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
          
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-orange-100 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">1</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Tìm kiếm sản phẩm</h2>
              <p className="text-gray-600">Sử dụng thanh công cụ tìm kiếm thông minh hoặc duyệt qua các danh mục được phân chia rõ ràng (Vợt, Giày, Quần Áo, Phụ kiện) trên thanh menu để nhanh chóng tìm thấy món đồ mong muốn.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">2</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Chọn phân loại & Thêm vào giỏ</h2>
              <p className="text-gray-600">Click vào sản phẩm để xem chi tiết thông số. Tại đây, hãy chọn kích cỡ, màu sắc phù hợp và nhấn <strong className="text-gray-800">"Thêm vào giỏ"</strong> hoặc <strong className="text-primary">"Mua ngay"</strong> để đến thẳng trang thanh toán.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">3</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Xác nhận Đơn hàng</h2>
              <p className="text-gray-600">Mở Giỏ hàng của bạn ở góc phải màn hình, kiểm tra kỹ lại danh sách sản phẩm. Sau đó nhấn <strong className="text-gray-800">"Tiến hành thanh toán"</strong>.</p>
            </div>
          </div>

          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-purple-100 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">4</div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Thanh toán & Nhận hàng</h2>
              <p className="text-gray-600">Điền đầy đủ thông tin giao hàng (Tên, SĐT, Địa chỉ). Chọn phương thức thanh toán linh hoạt (Ship COD hoặc Chuyển khoản QR). Hoàn tất đặt hàng và chờ shipper giao hàng tận cửa nhà bạn!</p>
            </div>
          </div>

        </div>
        
        <div className="mt-12 text-center bg-gray-50 p-6 rounded-xl border border-gray-100">
          <p className="text-gray-600">Nếu bạn gặp bất kỳ khó khăn nào trong quá trình đặt hàng, đừng ngần ngại gọi cho bộ phận CSKH của chúng tôi.</p>
          <p className="font-bold text-lg text-gray-800 mt-2">Hotline Hỗ Trợ: <span className="text-primary">0977.508.430</span></p>
        </div>
      </div>
    </MainLayout>
  );
};

export default GuidePage;
