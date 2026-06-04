import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Package, Truck, Calendar, MapPin, CreditCard, ChevronRight, ExternalLink, Printer } from 'lucide-react';
import axios from 'axios';
import { printInvoice } from '../utils/printInvoice';


const UserOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/orders/my-orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };

        if (token) {
            fetchOrders();
        }
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            hour: '2-digit', minute: '2-digit',
            day: '2-digit', month: '2-digit', year: 'numeric'
        });
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' };
            case 'processing': return { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' };
            case 'shipping': return { label: 'Đang giao hàng', color: 'bg-orange-100 text-orange-800' };
            case 'completed': return { label: 'Thành công', color: 'bg-green-100 text-green-800' };
            case 'cancelled': return { label: 'Đã hủy', color: 'bg-red-100 text-red-800' };
            default: return { label: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <MainLayout>
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="bg-primary/10 p-3 rounded-full text-primary">
                            <Package className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lịch sử đơn hàng của bạn</h1>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <img src="https://cdni.iconscout.com/illustration/premium/thumb/empty-cart-7359557-6024626.png" alt="Empty" className="w-48 mx-auto mb-4 opacity-70" />
                            <h2 className="text-xl font-bold text-gray-700 mb-2">Bạn chưa có đơn hàng nào</h2>
                            <p className="text-gray-500 mb-6">Hãy lướt qua gian hàng Naro Shop và chọn cho mình những sản phẩm ưng ý nhất nhé!</p>
                            <a href="/products" className="inline-block bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-orange-600 transition shadow-lg shadow-primary/30">
                                Tiếp tục mua sắm
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-shadow hover:shadow-md">
                                    {/* Order Header */}
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium mb-1">
                                                Mã đơn: <span className="text-gray-900 font-bold">#NARO-{order.id}</span>
                                            </p>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Ngày đặt: {formatDate(order.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => printInvoice(order)} 
                                                className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center gap-1"
                                                title="In hoặc tải hóa đơn"
                                            >
                                                <Printer className="w-3 h-3" /> In Hóa Đơn
                                            </button>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa TT'}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusInfo(order.status).color}`}>
                                                {getStatusInfo(order.status).label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-8">
                                            {/* Products List */}
                                            <div className="flex-1 space-y-4">
                                                {order.items && order.items.map((item, index) => (
                                                    <div key={index} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-primary/30 transition-colors">
                                                        <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                                                            <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.product_name} className="w-full h-full object-cover mix-blend-multiply" />
                                                        </div>
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{item.product_name}</h3>
                                                                <p className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded-sm">Phân loại: {item.variant_name}</p>
                                                            </div>
                                                            <div className="flex justify-between items-end mt-2">
                                                                <p className="text-sm font-medium text-gray-600">x{item.quantity}</p>
                                                                <p className="font-bold text-primary">{formatPrice(item.price_at_time)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Details & Tracking */}
                                            <div className="lg:w-80 flex flex-col gap-4">
                                                
                                                {/* Shipping Info */}
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                                        <MapPin className="w-4 h-4 mr-2 text-primary" /> Thông tin giao hàng
                                                    </h4>
                                                    <div className="text-sm text-gray-600 space-y-2">
                                                        <p><span className="text-gray-500">Người nhận:</span> <span className="font-medium text-gray-800">{order.shipping_name}</span></p>
                                                        <p><span className="text-gray-500">SĐT:</span> <span className="font-medium text-gray-800">{order.shipping_phone}</span></p>
                                                        <p><span className="text-gray-500">Địa chỉ:</span> {order.shipping_address}</p>
                                                    </div>
                                                </div>

                                                {/* Payment Info */}
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                                                        <CreditCard className="w-4 h-4 mr-2 text-primary" /> Thanh toán
                                                    </h4>
                                                    <div className="flex justify-between items-center text-sm mb-2">
                                                        <span className="text-gray-500">Hình thức:</span>
                                                        <span className="font-medium uppercase">{order.payment_method}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-base pt-2 border-t border-gray-200 mt-2">
                                                        <span className="font-bold text-gray-800">Tổng cộng:</span>
                                                        <span className="font-bold text-primary text-lg">{formatPrice(order.total_amount)}</span>
                                                    </div>
                                                </div>

                                                {/* GHN Tracking Box */}
                                                {order.tracking_code && (
                                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 shadow-sm relative overflow-hidden">
                                                        <div className="absolute -right-4 -top-4 opacity-10">
                                                            <Truck className="w-24 h-24 text-orange-600" />
                                                        </div>
                                                        <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center relative z-10">
                                                            <Truck className="w-4 h-4 mr-2" /> Tra cứu hành trình
                                                        </h4>
                                                        <div className="relative z-10">
                                                            <p className="text-xs text-orange-700 mb-1">Mã vận đơn (GHN):</p>
                                                            <p className="font-mono font-bold text-lg text-gray-900 bg-white inline-block px-3 py-1 rounded-md mb-3 border border-orange-200 shadow-inner">
                                                                {order.tracking_code}
                                                            </p>
                                                            <a 
                                                                href={`https://tracking.ghn.dev/?order_code=${order.tracking_code}`} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center shadow-md shadow-orange-500/20"
                                                            >
                                                                Xem chi tiết trên GHN <ExternalLink className="w-4 h-4 ml-2" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default UserOrdersPage;
