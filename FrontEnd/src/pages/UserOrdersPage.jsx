import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { authService } from '../services/authService';
import axios from 'axios';
import { Package, Clock, CheckCircle2, Truck, XCircle, ArrowRight, ExternalLink, Printer, MapPin, CreditCard } from 'lucide-react';
import { printInvoice } from '../utils/printInvoice';

const STATUS_MAP = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: Clock },
  processing: { label: 'Đang chuẩn bị', color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: Clock },
  shipping: { label: 'Đang giao hàng (GHN)', color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: Truck },
  completed: { label: 'Giao thành công', color: 'bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', icon: XCircle }
};

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = res.data?.data || res.data || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Lỗi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã hủy đơn hàng thành công.');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const handlePrint = async (order) => {
    try {
      printInvoice(order);
    } catch (e) {
      console.error('Lỗi in hóa đơn:', e);
    }
  };

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === activeFilter);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Package size={26} className="text-[#ea580c]" /> Đơn Hàng Của Tôi ({orders.length})
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Theo dõi hành trình đơn hàng và lịch sử mua sắm trực tuyến.</p>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'pending', label: 'Chờ xử lý' },
              { key: 'shipping', label: 'Đang giao' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === tab.key
                    ? 'bg-[#ea580c] text-white shadow-xs'
                    : 'bg-white dark:bg-[#181a24] border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#12131a] p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Package size={28} />
            </div>
            <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-200">Không có đơn hàng nào</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Bạn chưa có đơn hàng nào trong mục này.</p>
            <Link to="/category/1" className="inline-block px-6 py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => {
              const statusCfg = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const StatusIcon = statusCfg.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 transition-colors duration-300"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                      <span className="font-black text-sm text-zinc-900 dark:text-white font-mono">#NARO-{order.id}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">
                        PT: <strong className="uppercase">{order.payment_method === 'store' ? 'Showroom' : order.payment_method}</strong>
                      </span>
                      <span className="text-zinc-400">•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.payment_status === 'paid' ? 'bg-lime-50 dark:bg-lime-950/40 text-lime-700 dark:text-lime-300' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      }`}>
                        {order.payment_status === 'paid' ? 'Đã TT' : 'Chưa TT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusCfg.color}`}>
                        <StatusIcon size={13} /> {statusCfg.label}
                      </span>

                      <button
                        onClick={() => handlePrint(order)}
                        className="p-1.5 text-zinc-500 hover:text-[#ea580c] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="In hóa đơn"
                      >
                        <Printer size={15} />
                      </button>

                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-xs font-semibold text-rose-500 hover:underline px-2 py-1 cursor-pointer"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>

                  {/* GHN Tracking Section */}
                  {order.tracking_code && (
                    <div className="p-4 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sky-900 dark:text-sky-200">Đơn hàng đang được vận chuyển bởi Giao Hàng Nhanh (GHN)</p>
                          <p className="text-zinc-600 dark:text-zinc-400">
                            Mã vận đơn: <strong className="font-mono font-bold text-sky-700 dark:text-sky-300 text-sm">{order.tracking_code}</strong>
                          </p>
                        </div>
                      </div>

                      <a
                        href={`https://tracking.ghn.dev/?order_code=${order.tracking_code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <span>Tra cứu hành trình GHN</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="divide-y divide-zinc-50 dark:divide-zinc-800/60 text-xs">
                    {order.items?.map((item, i) => (
                      <div key={i} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={item.image_url || 'https://via.placeholder.com/50'}
                            alt=""
                            className="w-12 h-12 object-contain bg-zinc-50 dark:bg-[#181a24] rounded-xl p-1 shrink-0 border border-zinc-100 dark:border-zinc-800"
                          />
                          <div className="truncate">
                            <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.product_name || item.name}</p>
                            <p className="text-zinc-400 dark:text-zinc-500">SL: {item.quantity} {item.variant_name ? `• Phân loại: ${item.variant_name}` : ''}</p>
                          </div>
                        </div>

                        <span className="font-bold text-zinc-800 dark:text-zinc-200 shrink-0">
                          {(parseFloat(item.price_at_time || item.price || item.unit_price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Bottom Total */}
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                    <p className="text-zinc-500 dark:text-zinc-400 truncate max-w-xl">
                      Địa chỉ nhận: <strong className="text-zinc-700 dark:text-zinc-200">{order.shipping_address}</strong>
                    </p>
                    <div className="text-right shrink-0">
                      <span className="text-zinc-500 dark:text-zinc-400 mr-2">Tổng thanh toán:</span>
                      <span className="text-base font-black text-[#ea580c]">
                        {parseFloat(order.total_amount || 0).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserOrdersPage;
