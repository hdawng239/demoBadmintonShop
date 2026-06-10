import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, Package, ShoppingCart, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [timeframe, setTimeframe] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalProductsSold: 0,
    chartData: [],
    topCustomers: [],
    topProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/admin/dashboard-stats?timeframe=${timeframe}`;
      if (timeframe === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu thống kê", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeframe === 'custom') {
      if (startDate && endDate) {
        fetchStats();
      }
    } else {
      fetchStats();
    }
  }, [timeframe, startDate, endDate]);

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week': return '7 ngày qua';
      case 'month': return '30 ngày qua';
      case 'year': return 'Năm nay';
      case 'custom': return 'Khoảng tùy chọn';
      default: return '';
    }
  };

  return (
    <AdminLayout>
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Sparkles className="w-6 h-6 text-primary mr-2" />
            Tổng quan Thống kê
          </h1>
          <p className="text-gray-500 text-sm mt-1">Dữ liệu doanh thu thực tế và thứ hạng cửa hàng.</p>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-1 border-r border-gray-100 pr-2">
            {[
              { label: '7 Ngày', value: 'week' },
              { label: '30 Ngày', value: 'month' },
              { label: 'Năm nay', value: 'year' },
              { label: 'Tùy chọn', value: 'custom' }
            ].map(btn => (
              <button
                key={btn.value}
                type="button"
                onClick={() => setTimeframe(btn.value)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === btn.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {timeframe === 'custom' && (
            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 font-medium">Từ</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-400 font-medium">Đến</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Doanh thu */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="p-4 rounded-xl bg-orange-50 text-primary mr-4">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Doanh thu ({getTimeframeLabel()})</p>
                <p className="text-2xl font-black text-gray-800">{stats.totalRevenue.toLocaleString()} ₫</p>
              </div>
            </div>

            {/* Đơn hàng */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="p-4 rounded-xl bg-green-50 text-green-500 mr-4">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Đơn hoàn thành ({getTimeframeLabel()})</p>
                <p className="text-2xl font-black text-gray-800">{stats.totalOrders} đơn</p>
              </div>
            </div>

            {/* Sản phẩm đã bán */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="p-4 rounded-xl bg-purple-50 text-purple-500 mr-4">
                <Package size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Sản phẩm đã bán ({getTimeframeLabel()})</p>
                <p className="text-2xl font-black text-gray-800">{stats.totalProductsSold} cái</p>
              </div>
            </div>

            {/* Khách hàng mới */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
              <div className="p-4 rounded-xl bg-blue-50 text-blue-500 mr-4">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Khách hàng mới ({getTimeframeLabel()})</p>
                <p className="text-2xl font-black text-gray-800">{stats.newUsers} người</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Biểu đồ Doanh thu chi tiết</h3>
              <p className="text-sm text-gray-400 mt-1">Số liệu trực quan gom nhóm theo bộ lọc thời gian: {getTimeframeLabel()}</p>
            </div>
            
            <div className="h-80 w-full mt-6">
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={stats.chartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke="#9ca3af" 
                      fontSize={11} 
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      axisLine={false} 
                      tickLine={false}
                      tickMargin={10}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <Tooltip 
                      formatter={(value) => [`${value.toLocaleString()} ₫`, 'Doanh thu']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
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
                <div className="h-full w-full flex items-center justify-center text-gray-400 italic">
                  Không có đơn hàng nào hoàn thành trong khoảng thời gian này để vẽ biểu đồ.
                </div>
              )}
            </div>
          </div>

          {/* Grid Top 3 lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top 3 Khách hàng chi tiêu nhiều nhất */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" /> Top 3 Khách hàng chi tiêu lớn nhất
              </h3>
              
              {stats.topCustomers && stats.topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {stats.topCustomers.map((cust, idx) => {
                    const maxSpent = stats.topCustomers[0]?.totalSpent || 1;
                    const percent = (cust.totalSpent / maxSpent) * 100;
                    return (
                      <div key={cust.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary font-bold uppercase shrink-0">
                          {cust.fullName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 truncate text-sm">{cust.fullName}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{cust.email}</p>
                          {/* Progress bar mini */}
                          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-primary text-sm">{cust.totalSpent.toLocaleString()} ₫</p>
                          <p className="text-xs text-gray-400 mt-0.5">{cust.totalOrders} đơn hàng</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-400 italic py-6 text-sm">Chưa có dữ liệu giao dịch.</p>
              )}
            </div>

            {/* Top 3 Sản phẩm bán chạy nhất */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" /> Top 3 Sản phẩm bán chạy nhất
              </h3>
              
              {stats.topProducts && stats.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {stats.topProducts.map(prod => (
                    <div key={prod.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        {prod.imageUrl ? (
                          <img src={prod.imageUrl} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        ) : (
                          <Package className="text-gray-300 w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 line-clamp-2 text-sm">{prod.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Đã bán: <span className="font-semibold text-gray-700">{prod.totalSold} cái</span></p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary text-sm">{prod.totalRevenue.toLocaleString()} ₫</p>
                        <p className="text-xs text-gray-400 mt-1">Doanh thu sản phẩm</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 italic py-6 text-sm">Chưa có dữ liệu bán hàng.</p>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
