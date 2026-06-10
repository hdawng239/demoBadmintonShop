import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Pagination from '../../components/Pagination';
import { Eye, Trash2, X, Package, Printer } from 'lucide-react';
import axios from 'axios';
import { printInvoice } from '../../utils/printInvoice';

const AdminOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal Chi tiết đơn hàng
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/orders?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.data) {
        setOrders(res.data.data);
        setPagination(res.data.pagination);
      } else {
        setOrders(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  // Handle inline update
  const handleUpdateStatus = async (orderId, field, value) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/orders/${orderId}`, { [field]: value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedOrder = response.data.data;
      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o));
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi cập nhật đơn hàng");
      // Revert select if failed by re-fetching
      fetchOrders(currentPage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa đơn hàng này?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders(currentPage);
    } catch (err) {
      alert("Lỗi khi xóa đơn hàng");
    }
  };

  const viewOrderDetails = async (id) => {
    setShowDetailModal(true);
    setIsLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrderDetails(res.data);
    } catch (err) {
      alert("Lỗi tải chi tiết đơn hàng");
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handlePrintOrder = async (orderInfo) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/orders/${orderInfo.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      printInvoice(res.data);
    } catch (err) {
      alert("Lỗi tải chi tiết đơn hàng để in");
    }
  };

  // Helper cho màu badge (Mặc dù dùng select inline nhưng vẫn có thể trang trí bằng CSS)
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'shipping': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200';
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
        <p className="text-gray-500 text-sm mt-1">Xem danh sách, cập nhật trạng thái nhanh và chi tiết đơn hàng.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div></div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="p-4 font-semibold">Mã ĐH</th>
                    <th className="p-4 font-semibold">Khách hàng</th>
                    <th className="p-4 font-semibold text-right">Tổng tiền</th>
                    <th className="p-4 font-semibold text-center">Phương thức thanh toán</th>
                    <th className="p-4 font-semibold text-center">Trạng thái TT</th>
                    <th className="p-4 font-semibold text-center">Trạng thái ĐH</th>
                    <th className="p-4 font-semibold text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 text-gray-800 font-medium">#{order.id}</td>
                      <td className="p-4">
                        <p className="text-gray-800 font-medium">{order.shipping_name}</p>
                        <p className="text-gray-500 text-xs">{order.shipping_phone}</p>
                      </td>
                      <td className="p-4 text-right font-bold text-primary">
                        {parseFloat(order.total_amount).toLocaleString()} ₫
                      </td>
                      <td className="p-4 text-center text-gray-600 font-medium uppercase text-sm">
                        {order.payment_method === 'store' ? 'ON COUNTER' : order.payment_method}
                      </td>
                      
                      {/* Inline Payment Status Select */}
                      <td className="p-4 text-center">
                        <select 
                          value={order.payment_status}
                          onChange={(e) => handleUpdateStatus(order.id, 'payment_status', e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border cursor-pointer appearance-none text-center ${getPaymentStatusColor(order.payment_status)}`}
                        >
                          <option value="unpaid">UNPAID</option>
                          <option value="paid">PAID</option>
                        </select>
                      </td>

                      {/* Inline Order Status Select */}
                      <td className="p-4 text-center">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, 'status', e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none border cursor-pointer appearance-none text-center w-full mb-1 ${getStatusColor(order.status)}`}
                        >
                          <option value="pending">PENDING</option>
                          <option value="processing">PROCESSING</option>
                          <option value="shipping" disabled={order.payment_method === 'store'}>
                            SHIPPING
                          </option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
                        </select>
                        {order.tracking_code && (
                          <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded border border-blue-100 mt-1" title="Mã vận đơn GHN">
                            GHN: {order.tracking_code}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => viewOrderDetails(order.id)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handlePrintOrder(order)} className="text-orange-500 hover:text-orange-700 bg-orange-50 p-2 rounded-lg transition" title="In hoặc Tải hóa đơn (PDF)">
                            <Printer size={18} />
                          </button>
                          <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition" title="Xóa đơn hàng">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Modal Chi Tiết Đơn Hàng */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Chi tiết Đơn hàng #{selectedOrderDetails?.id}</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {isLoadingDetails ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div></div>
              ) : selectedOrderDetails ? (
                <div className="space-y-6">
                  {/* Thông tin khách hàng */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Người nhận</p>
                      <p className="text-gray-800 font-medium">{selectedOrderDetails.shipping_name}</p>
                      <p className="text-gray-600">{selectedOrderDetails.shipping_phone}</p>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1 mt-3">Hình thức thanh toán</p>
                      <p className="text-gray-800 font-medium uppercase">
                        {selectedOrderDetails.payment_method === 'store' ? 'ON COUNTER' : selectedOrderDetails.payment_method}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Địa chỉ nhận/giao hàng</p>
                      <p className="text-gray-800">{selectedOrderDetails.shipping_address}</p>
                      {selectedOrderDetails.tracking_code && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Mã Vận Đơn (GHN)</p>
                          <div className="inline-block bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold text-sm">
                            {selectedOrderDetails.tracking_code}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div>
                    <h3 className="text-sm text-gray-500 uppercase font-semibold mb-3 flex items-center">
                      <Package size={16} className="mr-1" /> Sản phẩm đã đặt
                    </h3>
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500">
                          <tr>
                            <th className="p-3 font-semibold">Sản phẩm</th>
                            <th className="p-3 font-semibold text-center">SL</th>
                            <th className="p-3 font-semibold text-right">Đơn giá</th>
                            <th className="p-3 font-semibold text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 ? (
                            selectedOrderDetails.items.map((item, idx) => (
                              <tr key={idx} className="border-t border-gray-100">
                                <td className="p-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                      {item.image_url ? (
                                        <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20}/></div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.product_name}</p>
                                      <p className="text-xs text-gray-500">{item.variant_name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3 text-center text-sm">{item.quantity}</td>
                                <td className="p-3 text-right text-sm text-gray-600">{parseFloat(item.price_at_time).toLocaleString()} ₫</td>
                                <td className="p-3 text-right font-medium text-primary">{parseFloat(item.price_at_time * item.quantity).toLocaleString()} ₫</td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-400">Không có dữ liệu sản phẩm</td></tr>
                          )}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t border-gray-100">
                          <tr>
                            <td colSpan="3" className="p-3 text-right font-semibold text-gray-700">Tổng cộng:</td>
                            <td className="p-3 text-right font-bold text-primary text-lg">{parseFloat(selectedOrderDetails.total_amount).toLocaleString()} ₫</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">Không tìm thấy dữ liệu.</p>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-medium transition">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrderPage;
