import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, Package, ShoppingCart, DollarSign, Calendar, Sparkles, TrendingUp, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [timeframe, setTimeframe] = useState('week'); // Default to 7 days
  
  // Default custom range: last 30 days
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  
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
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/dashboard-stats?timeframe=${timeframe}`;
      if (timeframe === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const raw = res.data?.data || res.data;
      if (raw) {
        setStats({
          totalUsers: raw.totalUsers !== undefined ? raw.totalUsers : 0,
          newUsers: raw.newUsers !== undefined ? raw.newUsers : 0,
          totalOrders: raw.totalOrders !== undefined ? raw.totalOrders : 0,
          totalRevenue: raw.totalRevenue !== undefined ? raw.totalRevenue : 0,
          totalProducts: raw.totalProducts !== undefined ? raw.totalProducts : 0,
          totalProductsSold: raw.totalProductsSold !== undefined ? raw.totalProductsSold : 0,
          chartData: Array.isArray(raw.chartData) ? raw.chartData : [],
          topCustomers: Array.isArray(raw.topCustomers) ? raw.topCustomers : [],
          topProducts: Array.isArray(raw.topProducts) ? raw.topProducts : []
        });
      }
    } catch (err) {
      console.error('Lỗi lấy dữ liệu thống kê:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeframe === 'custom') {
      if (startDate && endDate) fetchStats();
    } else {
      fetchStats();
    }
  }, [timeframe, startDate, endDate]);

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week': return '7 ngày qua';
      case 'month': return '30 ngày qua';
      case 'year': return 'Năm nay';
      case 'custom': return 'Tùy chọn';
      default: return 'Gần đây';
    }
  };

  return (
    <AdminLayout>
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#ea580c]" />
            Tổng Quan Thống Kê
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Dữ liệu doanh thu thực tế và chỉ số vận hành cửa hàng.</p>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#12131a] p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-1 border-r border-zinc-100 dark:border-zinc-800 pr-2">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  timeframe === btn.value
                    ? 'bg-[#ea580c] text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {timeframe === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 outline-none focus:border-[#ea580c] bg-zinc-50 dark:bg-[#181a24] text-zinc-900 dark:text-white text-xs font-medium"
              />
              <span className="text-zinc-400 font-medium">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 outline-none focus:border-[#ea580c] bg-zinc-50 dark:bg-[#181a24] text-zinc-900 dark:text-white text-xs font-medium"
              />
            </div>
          )}

          <button
            onClick={fetchStats}
            title="Làm mới dữ liệu"
            className="p-1.5 text-zinc-400 hover:text-[#ea580c] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin text-[#ea580c]' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="w-10 h-10 border-4 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            
            {/* Revenue */}
            <div className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">DOANH THU ({getTimeframeLabel()})</p>
                <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{(stats.totalRevenue || 0).toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-lime-50 dark:bg-lime-950/40 text-lime-600 dark:text-lime-400 flex items-center justify-center shrink-0">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">ĐƠN HÀNG THÀNH CÔNG</p>
                <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{stats.totalOrders || 0}</p>
              </div>
            </div>

            {/* Products Sold */}
            <div className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                <Package size={24} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">SẢN PHẨM ĐÃ BÁN</p>
                <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{stats.totalProductsSold || 0}</p>
              </div>
            </div>

            {/* Users */}
            <div className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">KHÁCH HÀNG</p>
                <p className="text-xl font-black text-zinc-900 dark:text-white mt-0.5">{stats.totalUsers || 0}</p>
              </div>
            </div>

          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-[#12131a] p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs mb-8 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-[#ea580c]" /> Biểu Đồ Doanh Thu
              </h3>
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Đơn vị: VNĐ</span>
            </div>

            <div className="h-80 w-full">
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#33415522" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
                      axisLine={{ stroke: '#47556944' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} 
                      tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(v) => [`${parseInt(v).toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                      labelFormatter={(label) => `Thời gian: ${label}`}
                      contentStyle={{
                        backgroundColor: '#0c0d10',
                        borderRadius: '12px',
                        border: '1px solid #27272a',
                        color: '#fff',
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#ea580c" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      dot={{ r: 3.5, fill: '#ea580c', stroke: '#fff', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs">
                  Chưa có dữ liệu giao dịch trong khoảng thời gian này.
                </div>
              )}
            </div>
          </div>

          {/* Bottom Tables: Top Products & Top Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Products */}
            <div className="bg-white dark:bg-[#12131a] p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Top Vợt / Sản Phẩm Bán Chạy</h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {stats.topProducts?.map((p, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/40 font-bold text-[11px] text-[#ea580c] flex items-center justify-center">{i + 1}</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#ea580c]">{p.totalSold || p.total_sold} đã bán</span>
                  </div>
                ))}
                {(!stats.topProducts || stats.topProducts.length === 0) && (
                  <p className="py-4 text-center text-zinc-400 dark:text-zinc-500">Chưa có dữ liệu.</p>
                )}
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white dark:bg-[#12131a] p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4 transition-colors">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Top Khách Hàng Thân Thiết</h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {stats.topCustomers?.map((c, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-bold text-[11px] text-zinc-700 dark:text-zinc-300 flex items-center justify-center">{i + 1}</span>
                      <div>
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{c.fullName || c.full_name || c.username}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{c.email}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">{parseInt(c.totalSpent || c.total_spent || 0).toLocaleString('vi-VN')} ₫</span>
                  </div>
                ))}
                {(!stats.topCustomers || stats.topCustomers.length === 0) && (
                  <p className="py-4 text-center text-zinc-400 dark:text-zinc-500">Chưa có dữ liệu.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;
