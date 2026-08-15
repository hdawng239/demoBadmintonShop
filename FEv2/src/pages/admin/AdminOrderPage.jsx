import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Eye, Trash2, X, Package, Printer, Clock, CheckCircle2, Truck, AlertCircle, ExternalLink, Check } from 'lucide-react';
import axios from 'axios';
import { printInvoice } from '../../utils/printInvoice';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý (Pending)', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  { value: 'processing', label: 'Đang chuẩn bị (Processing)', color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' },
  { value: 'shipping', label: 'Đang giao GHN (Shipping)', color: 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' },
  { value: 'completed', label: 'Hoàn thành (Completed)', color: 'text-lime-700 bg-lime-50 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-800' },
  { value: 'cancelled', label: 'Đã hủy (Cancelled)', color: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Chưa TT (Unpaid)', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  { value: 'paid', label: 'Đã TT (Paid)', color: 'text-lime-700 bg-lime-50 border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-800' },
  { value: 'refunded', label: 'Đã hoàn tiền (Refunded)', color: 'text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' }
];

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal Detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rawOrders = Array.isArray(res.data?.data) 
        ? res.data.data 
        : (Array.isArray(res.data) ? res.data : []);
      setOrders(rawOrders);
      setPagination(res.data?.meta || res.data?.pagination || { currentPage: page, totalPages: Math.ceil(rawOrders.length / 10) || 1 });
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  // Inline Update status with optimistic UI update
  const handleUpdateStatus = async (orderId, field, value) => {
    // Optimistically update UI so dropdown & badge change instantly
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, [field]: value } : o));

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderId}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res.data?.data || res.data;
      
      // Update with full server response (e.g. tracking_code if shipping created)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated, [field]: value } : o));
      showToast(`Cập nhật đơn hàng #${orderId} thành công!`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi cập nhật đơn hàng';
      showToast(errorMsg, 'error');
      fetchOrders(currentPage); // revert on failure
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cảnh báo: Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`Đã xóa đơn hàng #${id}`);
      fetchOrders(currentPage);
    } catch (err) {
      showToast('Lỗi xóa đơn hàng', 'error');
    }
  };

  const viewOrderDetails = async (id) => {
    setShowDetailModal(true);
    setIsLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrderDetails(res.data?.data || res.data);
    } catch (err) {
      showToast('Lỗi tải chi tiết đơn hàng', 'error');
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePrint = async (orderInfo) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${orderInfo.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      printInvoice(res.data?.data || res.data);
    } catch (err) {
      showToast('Lỗi in hóa đơn', 'error');
    }
  };

  const getOrderStatusBadgeClass = (status) => {
    const found = ORDER_STATUS_OPTIONS.find(o => o.value === status);
    return found ? found.color : 'text-zinc-700 bg-zinc-50 border-zinc-200';
  };

  const getPaymentStatusBadgeClass = (status) => {
    const found = PAYMENT_STATUS_OPTIONS.find(o => o.value === status);
    return found ? found.color : 'text-zinc-700 bg-zinc-50 border-zinc-200';
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Quản Lý Đơn Hàng ({orders.length})
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
            Xem danh sách, cập nhật trạng thái đơn hàng & kết nối trực tiếp tạo vận đơn GHN.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className={`p-4 mb-6 rounded-2xl text-xs flex items-center gap-2 border shadow-xs animate-in fade-in ${
          toastMessage.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300' 
            : 'bg-lime-50 dark:bg-lime-950/50 border-lime-200 dark:border-lime-800 text-lime-800 dark:text-lime-300'
        }`}>
          {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-[#12131a] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/70 dark:bg-[#181a24] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Mã ĐH</th>
                    <th className="p-4">Khách hàng</th>
                    <th className="p-4">Ngày đặt</th>
                    <th className="p-4 text-right">Tổng tiền</th>
                    <th className="p-4 text-center">Phương thức</th>
                    <th className="p-4 text-center">Trạng thái TT</th>
                    <th className="p-4 text-center">Trạng thái Đơn & Vận đơn GHN</th>
                    <th className="p-4 text-center w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {orders.map(order => {
                    const recipient = order.shipping_name || order.recipient_name || order.user_name || 'Khách hàng';
                    const phone = order.shipping_phone || order.recipient_phone || '---';

                    return (
                      <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-[#181a24]/50 transition-colors">
                        {/* Order ID */}
                        <td className="p-4 font-mono font-black text-zinc-900 dark:text-white">
                          #{order.id}
                        </td>

                        {/* Customer */}
                        <td className="p-4">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{recipient}</p>
                          <p className="text-[11px] text-zinc-400 font-mono">{phone}</p>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-zinc-500 dark:text-zinc-400">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '---'}
                        </td>

                        {/* Amount */}
                        <td className="p-4 text-right font-black text-[#ea580c] text-sm">
                          {parseFloat(order.total_amount || 0).toLocaleString('vi-VN')} ₫
                        </td>

                        {/* Payment Method */}
                        <td className="p-4 text-center">
                          <span className="font-bold uppercase text-[11px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {order.payment_method === 'store' ? 'Tại Showroom' : order.payment_method}
                          </span>
                        </td>

                        {/* Payment Status Dropdown */}
                        <td className="p-4 text-center">
                          <select
                            value={order.payment_status || 'unpaid'}
                            onChange={(e) => handleUpdateStatus(order.id, 'payment_status', e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer text-center ${getPaymentStatusBadgeClass(order.payment_status)}`}
                          >
                            {PAYMENT_STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>

                        {/* Order Status Dropdown & GHN Tracking */}
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            <select
                              value={order.status || 'pending'}
                              onChange={(e) => handleUpdateStatus(order.id, 'status', e.target.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer w-full text-center ${getOrderStatusBadgeClass(order.status)}`}
                            >
                              {ORDER_STATUS_OPTIONS.map(opt => (
                                <option 
                                  key={opt.value} 
                                  value={opt.value}
                                  disabled={opt.value === 'shipping' && order.payment_method === 'store'}
                                >
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {/* GHN Tracking Link Badge */}
                            {order.tracking_code && (
                              <a
                                href={`https://tracking.ghn.dev/?order_code=${order.tracking_code}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 rounded-lg transition-colors"
                                title="Xem hành trình bưu kiện trên GHN"
                              >
                                <Truck size={12} /> GHN: {order.tracking_code}
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => viewOrderDetails(order.id)}
                              className="p-2 text-sky-600 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
                              title="Xem chi tiết đơn hàng"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handlePrint(order)}
                              className="p-2 text-orange-600 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 rounded-xl transition-colors cursor-pointer"
                              title="In hóa đơn (PDF)"
                            >
                              <Printer size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(order.id)}
                              className="p-2 text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                              title="Xóa đơn hàng"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {orders.length === 0 && (
                    <tr><td colSpan="8" className="p-8 text-center text-zinc-400">Không có đơn hàng nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#12131a] rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 border border-zinc-200 dark:border-zinc-800">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/70 dark:bg-[#181a24]">
              <h2 className="font-bold text-base text-zinc-900 dark:text-white">
                Chi tiết Đơn hàng #{selectedOrderDetails?.id}
              </h2>
              <button onClick={() => setShowDetailModal(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {isLoadingDetails ? (
                <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" /></div>
              ) : selectedOrderDetails && (
                <>
                  {/* Delivery & Customer Info */}
                  <div className="bg-zinc-50 dark:bg-[#181a24] p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Người nhận: {selectedOrderDetails.shipping_name || selectedOrderDetails.recipient_name} ({selectedOrderDetails.shipping_phone || selectedOrderDetails.recipient_phone})
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      <strong>Địa chỉ giao hàng:</strong> {selectedOrderDetails.shipping_address}
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      <strong>Hình thức thanh toán:</strong> <span className="uppercase font-bold text-[#ea580c]">{selectedOrderDetails.payment_method === 'store' ? 'Nhận tại Showroom' : selectedOrderDetails.payment_method}</span> ({selectedOrderDetails.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'})
                    </p>
                    {selectedOrderDetails.voucher_code && (
                      <p className="text-lime-600 dark:text-lime-400 font-semibold">
                        Voucher áp dụng: <strong>{selectedOrderDetails.voucher_code}</strong> (Giảm {parseFloat(selectedOrderDetails.discount_amount || 0).toLocaleString()} ₫)
                      </p>
                    )}

                    {/* GHN Section in Modal */}
                    {selectedOrderDetails.tracking_code && (
                      <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck size={18} className="text-sky-600 dark:text-sky-400" />
                          <div>
                            <span className="block text-[10px] text-sky-600 dark:text-sky-400 uppercase font-bold">Mã vận đơn Giao Hàng Nhanh (GHN)</span>
                            <span className="font-mono font-black text-sm text-sky-900 dark:text-sky-200">{selectedOrderDetails.tracking_code}</span>
                          </div>
                        </div>
                        <a
                          href={`https://tracking.ghn.dev/?order_code=${selectedOrderDetails.tracking_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                        >
                          <span>Tra cứu GHN</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Items list */}
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                      <Package size={14} className="text-[#ea580c]" /> Danh sách sản phẩm đã đặt:
                    </h4>
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden">
                      {selectedOrderDetails.items?.map((item, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between bg-white dark:bg-[#181a24]">
                          <div className="flex items-center gap-3">
                            <img src={item.image_url || 'https://via.placeholder.com/50'} alt="" className="w-12 h-12 object-contain rounded-xl bg-zinc-50 dark:bg-zinc-800 p-1 border border-zinc-100 dark:border-zinc-700" />
                            <div>
                              <p className="font-bold text-zinc-800 dark:text-zinc-100">{item.product_name || item.name}</p>
                              {item.variant_name && (
                                <p className="text-[11px] text-zinc-400">Phân loại: {item.variant_name}</p>
                              )}
                              <p className="text-[11px] text-zinc-500">Số lượng: x{item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-black text-zinc-900 dark:text-white">
                            {(parseFloat(item.price_at_time || item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="text-right space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Tổng tiền hàng: <strong>{parseFloat(selectedOrderDetails.total_amount || 0).toLocaleString('vi-VN')} ₫</strong>
                    </p>
                    <p className="text-base font-black text-[#ea580c] pt-1">
                      Tổng thanh toán: {parseFloat(selectedOrderDetails.total_amount || 0).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50/70 dark:bg-[#181a24]">
              {selectedOrderDetails && (
                <button
                  onClick={() => handlePrint(selectedOrderDetails)}
                  className="px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} /> In hóa đơn
                </button>
              )}
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="px-5 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderPage;
