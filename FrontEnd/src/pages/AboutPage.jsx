import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900 border-b-4 border-primary inline-block pb-2">Về Chúng Tôi</h1>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-lg">Khơi nguồn đam mê, chắp cánh tài năng - Naro Shop luôn đồng hành cùng bạn trên mọi mặt sân.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-12">
          <p className="text-lg text-gray-700 leading-relaxed mb-6 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
            <strong className="text-primary">Naro Shop</strong> tự hào là hệ thống cửa hàng dụng cụ cầu lông uy tín và quy mô lớn nhất Việt Nam. Khởi nguồn từ tình yêu cháy bỏng với trái cầu lông vũ, chúng tôi không chỉ là một nhà bán lẻ, mà còn là điểm tựa vững chắc cho cộng đồng đam mê thể thao nước nhà.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Chúng tôi cam kết cung cấp 100% sản phẩm chính hãng từ các thương hiệu đình đám toàn cầu như <strong className="text-gray-900">Yonex, Victor, Lining, Mizuno...</strong> Với đội ngũ tư vấn viên am hiểu sâu sắc về kỹ thuật, Naro Shop tự tin mang đến cho bạn những sự lựa chọn tối ưu nhất, phù hợp nhất với lối đánh và thể trạng của riêng bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-3xl border border-orange-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 relative z-10 flex items-center">
              <span className="w-2 h-8 bg-primary rounded-full mr-3"></span> Tầm Nhìn
            </h2>
            <p className="text-gray-700 text-lg relative z-10 leading-relaxed">
              Trở thành chuỗi bán lẻ đồ thể thao số 1 Đông Nam Á vào năm 2030, mở rộng mạng lưới phân phối và tiên phong trong việc áp dụng công nghệ số vào trải nghiệm mua sắm đồ thể thao.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl border border-blue-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 relative z-10 flex items-center">
              <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span> Sứ Mệnh
            </h2>
            <p className="text-gray-700 text-lg relative z-10 leading-relaxed">
              Đồng hành cùng đam mê thể thao của người Việt. Chúng tôi khao khát nâng tầm sức khỏe cộng đồng và mang lại những giá trị tích cực thông qua từng sản phẩm trao tay khách hàng.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
