import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { CheckCircle2, Package, ArrowRight, Home } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const order = location.state?.order;
  const orderId = order?.id || location.state?.orderId;

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-[#12131a] p-8 sm:p-12 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6 transition-colors duration-300">
          <div className="w-20 h-20 rounded-full bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 border border-lime-200 dark:border-lime-800 flex items-center justify-center mx-auto">
            <CheckCircle2 size={44} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              Đặt Hàng Thành Công!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Cảm ơn bạn đã tin tưởng lựa chọn Naro Badminton. Đơn hàng của bạn đã được ghi nhận vào hệ thống.
            </p>
          </div>

          {orderId && (
            <div className="p-4 bg-zinc-50 dark:bg-[#181a24] rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Mã đơn hàng:</span>
              <p className="text-base font-black text-zinc-900 dark:text-white font-mono mt-0.5">#{orderId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              to="/my-orders"
              className="w-full sm:w-auto px-6 py-3 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ea580c] dark:hover:bg-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Package size={16} /> Xem đơn hàng của tôi
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Home size={16} /> Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderSuccessPage;
