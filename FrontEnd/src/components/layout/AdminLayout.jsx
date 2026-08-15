import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingCart, 
  Users, 
  Ticket, 
  FileText, 
  Star, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { authService } from '../../services/authService';

const ADMIN_MENU = [
  { name: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
  { name: 'Sản phẩm & Phân loại', path: '/admin/products', icon: Package },
  { name: 'Danh mục hàng', path: '/admin/categories', icon: Layers },
  { name: 'Quản lý Đơn hàng', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Khách hàng & User', path: '/admin/users', icon: Users },
  { name: 'Mã khuyến mãi', path: '/admin/vouchers', icon: Ticket },
  { name: 'Tin tức & Bài viết', path: '/admin/posts', icon: FileText },
  { name: 'Đánh giá sản phẩm', path: '/admin/reviews', icon: Star },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const currentUser = authService.getCurrentUser();

  // Enforce Light Mode 100% inside Admin
  useEffect(() => {
    const root = document.documentElement;
    const prevTheme = localStorage.getItem('site_theme') || 'light';
    root.classList.remove('dark');

    return () => {
      if (prevTheme === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  const setSidebarCollapsedState = (collapsed) => {
    setIsCollapsed(collapsed);
    localStorage.setItem('admin_sidebar_collapsed', String(collapsed));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-zinc-800 flex flex-col md:flex-row antialiased relative">
      
      {/* Mobile Topbar */}
      <div className="md:hidden bg-[#121318] text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ea580c] flex items-center justify-center font-black text-white text-sm">
            N
          </div>
          <span className="font-extrabold text-sm tracking-tight">NARO ADMIN</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)} 
          className="p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden animate-in fade-in"
        />
      )}

      {/* Floating Toggle Arrow Tab (When Collapsed) */}
      {isCollapsed && (
        <button
          onClick={() => setSidebarCollapsedState(false)}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-[#121318] hover:bg-[#ea580c] text-zinc-300 hover:text-white w-7 h-14 rounded-r-xl shadow-2xl border-y border-r border-zinc-700/80 items-center justify-center transition-all cursor-pointer group hover:w-9"
          title="Mở thanh điều hướng (Menu)"
        >
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen bg-[#121318] text-zinc-300 flex flex-col z-40 transition-all duration-300 ease-in-out border-r border-zinc-800/80 shadow-2xl ${
        isMobileOpen 
          ? 'translate-x-0 w-64' 
          : '-translate-x-full md:translate-x-0'
      } ${
        isCollapsed ? 'md:w-0 md:opacity-0 md:pointer-events-none' : 'w-64'
      }`}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ea580c] flex items-center justify-center font-black text-white text-base shadow-sm">
              N
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-tight leading-none">NARO ADMIN</h2>
              <p className="text-[9px] text-zinc-400 font-semibold tracking-wider uppercase mt-1">Management Portal</p>
            </div>
          </Link>

          {/* Desktop Collapse Arrow Button */}
          <button
            onClick={() => setSidebarCollapsedState(true)}
            className="hidden md:flex p-1.5 rounded-lg bg-zinc-800 hover:bg-[#ea580c] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-xs"
            title="Thu gọn toàn bộ thanh điều hướng"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Mobile Close Button */}
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden text-zinc-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {ADMIN_MENU.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-[#ea580c] text-white shadow-md shadow-orange-600/30' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="shrink-0" />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="opacity-80" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Box */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 space-y-2 shrink-0">
          <Link 
            to="/" 
            target="_blank" 
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={15} />
              <span>Xem Storefront</span>
            </span>
          </Link>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div 
                className="w-8 h-8 rounded-lg bg-zinc-800 text-lime-400 flex items-center justify-center font-bold text-xs shrink-0 border border-zinc-700"
              >
                {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentUser?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-zinc-400">Quản trị viên</p>
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f5f7] transition-all duration-300">
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
