import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ChevronDown, ChevronUp, Grid, FileText, MessageSquare } from 'lucide-react';
import { authService } from '../../services/authService';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);

  useEffect(() => {
    // Tự động mở menu Sản phẩm nếu đang ở các trang con của nó
    if (location.pathname.startsWith('/admin/products') || location.pathname.startsWith('/admin/categories')) {
      setIsProductMenuOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-5 text-center text-2xl font-black border-b border-gray-100 flex items-center justify-center space-x-2">
          <span className="text-primary">Naro Shop</span> 
          <span className="text-gray-800 text-sm bg-gray-100 px-2 py-1 rounded-md font-bold mt-1">ADMIN</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* Dashboard */}
          <Link 
            to="/admin"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/admin' ? 'bg-primary text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
          >
            <LayoutDashboard size={20} className="mr-3" />
            Dashboard
          </Link>

          {/* Products Dropdown */}
          <div>
            <button 
              onClick={() => setIsProductMenuOpen(!isProductMenuOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${(location.pathname.startsWith('/admin/products') || location.pathname.startsWith('/admin/categories')) ? 'bg-primary text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
            >
              <div className="flex items-center">
                <Package size={20} className="mr-3" />
                Products
              </div>
              {isProductMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isProductMenuOpen && (
              <div className="mt-1 ml-4 pl-4 border-l-2 border-gray-100 space-y-1">
                <Link 
                  to="/admin/products"
                  className={`block px-4 py-2.5 rounded-xl transition-all text-sm ${location.pathname === '/admin/products' ? 'bg-orange-50 text-primary font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
                >
                  Product List
                </Link>
                <Link 
                  to="/admin/categories"
                  className={`block px-4 py-2.5 rounded-xl transition-all text-sm ${location.pathname === '/admin/categories' ? 'bg-orange-50 text-primary font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}
                >
                  Categories
                </Link>
              </div>
            )}
          </div>

          {/* Orders */}
          <Link 
            to="/admin/orders"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname.startsWith('/admin/orders') ? 'bg-primary text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
          >
            <ShoppingCart size={20} className="mr-3" />
            Orders
          </Link>

          {/* Users */}
          <Link 
            to="/admin/users"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname.startsWith('/admin/users') ? 'bg-primary text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
          >
            <Users size={20} className="mr-3" />
            Customers
          </Link>

          {/* Posts/News */}
          <Link 
            to="/admin/posts"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname.startsWith('/admin/posts') ? 'bg-primary text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
          >
            <FileText size={20} className="mr-3" />
            News
          </Link>

          {/* Reviews */}
          <Link 
            to="/admin/reviews"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname.startsWith('/admin/reviews') ? 'bg-primary text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
          >
            <MessageSquare size={20} className="mr-3" />
            Reviews
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} className="mr-2" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm border-b border-gray-100 z-10 relative">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Dashboard Quản Trị</h2>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary font-bold">
                A
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-gray-800 leading-tight">Admin</p>
                <p className="text-gray-500 text-xs">Quản trị viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
