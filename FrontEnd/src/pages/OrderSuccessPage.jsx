import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-[70vh] flex items-center justify-center py-12">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 max-w-lg w-full text-center mx-4">
          
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-gray-800 mb-2 uppercase">Đặt Hàng Thành Công!</h1>
          <p className="text-gray-500 mb-8">
            Cảm ơn bạn đã mua sắm tại NaviShop. Đơn hàng của bạn {orderId && <span className="font-bold text-gray-800">#{orderId}</span>} đang được xử lý và sẽ sớm được giao đến bạn.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">Bước tiếp theo:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></div>
                Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 24h tới.
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></div>
                Vui lòng chú ý điện thoại từ nhân viên giao hàng của GHN.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/" 
              className="px-6 py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl uppercase transition-colors flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Tiếp tục mua sắm
            </Link>
            {/* Tạm thời ẩn nút Xem Đơn Hàng vì chưa làm trang Lịch Sử Đơn Hàng */}
            {/* <Link 
              to="/profile" 
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-bold border border-gray-200 rounded-xl uppercase transition-colors flex items-center justify-center"
            >
              Xem đơn hàng
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link> */}
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccessPage;
