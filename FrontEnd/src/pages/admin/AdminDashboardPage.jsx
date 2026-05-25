import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    chartData: []
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
      
      {/* Chart Section */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Biểu đồ doanh thu</h3>
            <p className="text-sm text-gray-500">Thống kê doanh thu trong 6 tháng gần nhất</p>
          </div>
          <div className="flex items-center text-green-500 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">
            <TrendingUp size={16} className="mr-1" />
            +15.3%
          </div>
        </div>

        <div className="h-80 w-full">
          {stats.chartData && stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickFormatter={(value) => `${(value / 1000000)}M`}
                  axisLine={false} 
                  tickLine={false}
                  tickMargin={10}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: "#f97316", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400">
              Đang tải dữ liệu biểu đồ...
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
