import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thống kê", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="text-gray-500">Xem thống kê và hoạt động kinh doanh của cửa hàng.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-xl bg-blue-50 text-blue-500 mr-4">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng Khách hàng</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-xl bg-green-50 text-green-500 mr-4">
              <ShoppingCart size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Đơn hàng (Tháng)</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-xl bg-orange-50 text-primary mr-4">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Doanh thu (Tháng)</p>
              <p className="text-2xl font-bold text-gray-800">{parseFloat(stats.totalRevenue).toLocaleString()} ₫</p>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className="p-4 rounded-xl bg-purple-50 text-purple-500 mr-4">
              <Package size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng Sản phẩm</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Khung chứa các biểu đồ hoặc thông tin khác sau này */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400 border-dashed">
        Khu vực phát triển biểu đồ (Sắp ra mắt)
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
