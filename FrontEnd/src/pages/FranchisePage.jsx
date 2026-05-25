import React from 'react';
import MainLayout from '../components/layout/MainLayout';

const FranchisePage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 min-h-[60vh] max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 border-b-4 border-primary inline-block pb-2">Chính sách nhượng quyền NaviShop</h1>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          <p className="text-xl text-gray-600 font-medium mb-8">
            Kính chào Quý đối tác, chào mừng bạn đến với hệ sinh thái nhượng quyền của <strong className="text-primary">NaviShop</strong>. Với sứ mệnh mang đến những trải nghiệm thể thao đẳng cấp, chúng tôi không ngừng mở rộng hệ thống và tìm kiếm những nhà đầu tư chung chí hướng.
          </p>

          <div className="bg-orange-50 p-6 rounded-2xl border-l-4 border-primary mb-10 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-primary text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-3 text-sm">1</span>
              Vì sao chọn NaviShop?
            </h2>
            <p className="mb-4">Chúng tôi tự hào là hệ thống phân phối dụng cụ cầu lông hàng đầu, với nguồn khách hàng trung thành rộng lớn và quy trình vận hành tối ưu. Hợp tác cùng chúng tôi, bạn sẽ nhận được:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong className="text-gray-900">Sức mạnh thương hiệu:</strong> Thừa hưởng uy tín và định vị vững chắc của NaviShop trên thị trường.</li>
              <li><strong className="text-gray-900">Nguồn hàng ổn định:</strong> Cam kết phân phối hàng chính hãng (Yonex, Lining, Victor) với mức chiết khấu cực kỳ cạnh tranh.</li>
              <li><strong className="text-gray-900">Hỗ trợ toàn diện:</strong> Đội ngũ chuyên gia của chúng tôi sẽ đồng hành cùng bạn từ khâu chọn mặt bằng, setup cửa hàng, đến đào tạo nhân sự bài bản.</li>
              <li><strong className="text-gray-900">Chiến lược Marketing:</strong> Hỗ trợ truyền thông trên các kênh chính thức của tổng công ty, mang lượng khách đổ về liên tục.</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-4 flex items-center">
            <span className="bg-primary text-white w-8 h-8 rounded-full inline-flex items-center justify-center mr-3 text-sm">2</span>
            Yêu cầu đối tác
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-primary mb-2 text-lg">Mặt bằng kinh doanh</h3>
              <p>Yêu cầu diện tích tối thiểu 50m², nằm trên các tuyến đường đông đúc hoặc gần các cụm sân cầu lông tập trung đông người chơi.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-primary mb-2 text-lg">Tài chính & Quản lý</h3>
              <p>Cần chuẩn bị nguồn vốn đầu tư ban đầu theo quy chuẩn hệ thống. Đối tác cần có đam mê thể thao và tuân thủ chặt chẽ quy trình quản lý.</p>
            </div>
          </div>

          <div className="text-center mt-12 bg-gray-900 text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Sẵn sàng đồng hành cùng chúng tôi?</h3>
            <p className="mb-6 opacity-80">Hãy để lại thông tin hoặc gọi ngay cho chúng tôi để được tư vấn chi tiết về gói nhượng quyền.</p>
            <div className="inline-block bg-primary text-white font-bold text-xl py-3 px-8 rounded-full shadow-lg hover:bg-orange-600 transition-colors">
              Hotline: 0977.508.430
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FranchisePage;
