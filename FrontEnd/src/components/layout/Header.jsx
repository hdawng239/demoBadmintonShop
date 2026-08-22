import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp,
  User, 
  Phone, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Camera, 
  LogOut,
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { themeService } from '../../services/themeService';

const NAV_LINKS = [
  { name: 'Trang Chủ', path: '/' },
  { 
    name: 'Vợt Cầu Lông', 
    path: '/category/1',
    children: [
      { name: 'Vợt Yonex', path: '/category/1?brand=1' },
      { name: 'Vợt Victor', path: '/category/1?brand=5' },
      { name: 'Vợt Lining', path: '/category/1?brand=2' },
      { name: 'Vợt Kumpoo', path: '/category/1?brand=4' },
      { name: 'Vợt Mizuno', path: '/category/1?brand=6' },
      { name: 'Vợt Felet', path: '/category/1?brand=7' },
    ]
  },
  { 
    name: 'Giày Cầu Lông', 
    path: '/category/2',
    children: [
      { name: 'Giày Yonex', path: '/category/2?brand=1' },
      { name: 'Giày Victor', path: '/category/2?brand=5' },
      { name: 'Giày Lining', path: '/category/2?brand=2' },
    ]
  },
  { 
    name: 'Quần Áo', 
    path: '/category/13',
    children: [
      { name: 'Quần Áo Cầu Lông Nam', path: '/category/6' },
      { name: 'Quần Áo Cầu Lông Nữ', path: '/category/8' },
    ]
  },
  { 
    name: 'Phụ Kiện', 
    path: '/category/5',
    children: [
      { name: 'Túi Vợt Cầu Lông', path: '/category/7' },
      { name: 'Cước Cầu Lông', path: '/category/9' },
      { name: 'Tất Cầu Lông', path: '/category/10' },
      { name: 'Quấn Cán Cầu Lông', path: '/category/11' },
    ]
  },
  { name: 'Tin Tức & Review', path: '/news' },
  { name: 'Hướng Dẫn Chọn Vợt', path: '/guide' },
  { name: 'Hệ Thống Showroom', path: '/he-thong-cua-hang' }
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState(themeService.getTheme());
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(() => {
    return localStorage.getItem('store_header_collapsed') === 'true';
  });

  const toggleHeaderCollapse = () => {
    const next = !isHeaderCollapsed;
    setIsHeaderCollapsed(next);
    localStorage.setItem('store_header_collapsed', String(next));
  };

  const handleToggleTheme = () => {
    const nextTheme = themeService.toggleTheme();
    setTheme(nextTheme);
  };

  // Sync auth & counters
  const updateUserData = async () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      try {
        const cart = await cartService.getMyCart();
        const count = cart?.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
        setCartCount(count);
      } catch (err) {
        setCartCount(0);
      }

      try {
        const ids = await wishlistService.getProductIds();
        setWishlistCount(Array.isArray(ids) ? ids.length : 0);
      } catch (err) {
        setWishlistCount(0);
      }
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateUserData();
    setTheme(themeService.getTheme());

    const handleCartUpdate = () => updateUserData();
    const handleWishlistUpdate = () => updateUserData();
    const handleAuthChange = () => updateUserData();
    const handleThemeChange = (e) => setTheme(e.detail || themeService.getTheme());

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    window.addEventListener('favoritesUpdated', handleWishlistUpdate);
    window.addEventListener('userUpdated', handleAuthChange);
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
      window.removeEventListener('favoritesUpdated', handleWishlistUpdate);
      window.removeEventListener('userUpdated', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      setSearchKeyword('');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setCartCount(0);
    setWishlistCount(0);
    setIsUserMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0c0d10] text-zinc-900 dark:text-white shadow-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      
      {/* 1. Top Utility Announcement Bar (Smooth Slide) */}
      <div className={`bg-zinc-100 dark:bg-[#181920] border-b border-zinc-200 dark:border-zinc-800 text-[11px] px-4 hidden md:block transition-all duration-300 ease-in-out ${
        isHeaderCollapsed ? 'max-h-0 py-0 opacity-0 overflow-hidden border-b-0' : 'max-h-12 py-1.5 opacity-100'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={13} className="text-[#ea580c]" />
              Cam kết 100% chính hãng Yonex, Victor, Li-Ning
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Truck size={13} className="text-[#ea580c]" />
              Giao nhanh toàn quốc & Đồng kiểm
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <RotateCcw size={13} className="text-[#ea580c]" />
              Đổi size trong 7 ngày
            </span>
          </div>
          <div className="flex items-center space-x-4 font-bold">
            <a href="tel:0338780204" className="hover:text-[#ea580c] transition-colors flex items-center gap-1">
              <Phone size={12} />
              Hotline: 0338 780 204
            </a>
            <span>|</span>
            <Link to="/franchise" className="text-[#ea580c] hover:underline">
              Hợp tác nhượng quyền
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className={`max-w-7xl mx-auto px-4 lg:px-6 transition-all duration-300 ${isHeaderCollapsed ? 'py-2 sm:py-2.5' : 'py-3.5'}`}>
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className={`rounded-xl bg-gradient-to-tr from-[#c2410c] to-[#ea580c] flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20 transition-all ${
              isHeaderCollapsed ? 'w-8 h-8 text-base' : 'w-10 h-10 text-xl'
            }`}>
              N
            </div>
            <div className="leading-tight">
              <span className={`block font-black tracking-tight text-zinc-950 dark:text-white transition-all ${
                isHeaderCollapsed ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
              }`}>
                NARO <span className="text-[#ea580c]">BADMINTON</span>
              </span>
              {!isHeaderCollapsed && (
                <span className="block text-[9px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-bold animate-in fade-in duration-200">
                  Authentic Pro Shop
                </span>
              )}
            </div>
          </Link>

          {/* Search Bar with AI Visual Search */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="w-full flex items-center bg-zinc-100 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-700/80 rounded-full pl-4 pr-1 py-1 focus-within:border-[#ea580c] focus-within:ring-1 focus-within:ring-[#ea580c] transition-all">
              <Search size={16} className="text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Tìm kiếm vợt Astrox, giày 65Z, cước BG65, quần áo..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-transparent px-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none"
              />
              
              {/* AI Camera Search Button */}
              <button
                type="button"
                onClick={() => navigate('/search-image')}
                className="p-2 text-zinc-400 hover:text-[#ea580c] hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors shrink-0 cursor-pointer"
                title="Tìm kiếm bằng hình ảnh (AI)"
              >
                <Camera size={16} />
              </button>

              <button
                type="submit"
                className="ml-1 px-4 py-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-full transition-colors shrink-0 uppercase tracking-wider cursor-pointer"
              >
                Tìm
              </button>
            </form>
          </div>

          {/* Action Icons Desktop (Wishlist, Cart, Theme Toggle, Single Arrow Toggle, User) */}
          <div className="hidden md:flex items-center space-x-2 sm:space-x-3.5">
            
            {/* Wishlist Button */}
            <Link
              to="/favorites"
              className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-[#ea580c] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors"
              title="Sản phẩm yêu thích"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-[#ea580c] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors"
              title="Giỏ hàng của bạn"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ea580c] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle Icon Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-[#ea580c] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-full transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} className="text-sky-500" />}
            </button>

            {/* Single Elegant Header Collapse Arrow Button (Desktop) */}
            <button
              onClick={toggleHeaderCollapse}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-[#ea580c] dark:hover:text-[#ea580c] hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-full border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer shadow-xs"
              title={isHeaderCollapsed ? "Mở rộng thanh menu điều hướng" : "Thu gọn thanh menu (Tối ưu không gian Laptop)"}
            >
              {isHeaderCollapsed ? (
                <ChevronDown size={18} className="text-[#ea580c]" />
              ) : (
                <ChevronUp size={18} />
              )}
            </button>

            {/* User Account / Auth Desktop */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-full text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer border border-zinc-300 dark:border-zinc-700"
                >
                  <div className="w-6 h-6 rounded-full bg-[#ea580c] text-white font-bold flex items-center justify-center text-xs">
                    {(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] truncate hidden sm:inline-block">
                    {currentUser.full_name || currentUser.username}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold rounded-full transition-all shadow-md shadow-orange-500/20"
                >
                  <User size={15} />
                  <span>Đăng nhập</span>
                </Link>
              )}

              {/* User Dropdown Menu Desktop */}
              {isUserMenuOpen && currentUser && (
                <div 
                  className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="font-bold text-zinc-900 dark:text-white text-xs truncate">{currentUser.full_name || currentUser.username}</p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded bg-[#ea580c]/20 text-[#ea580c] uppercase">
                      {currentUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                    </span>
                  </div>

                  {currentUser.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-[#ea580c] transition-colors font-medium"
                    >
                      <SlidersHorizontal size={14} />
                      Trang Quản Trị Admin
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-[#ea580c] transition-colors"
                  >
                    <User size={14} />
                    Tài khoản của tôi
                  </Link>

                  <Link
                    to="/my-orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-[#ea580c] transition-colors"
                  >
                    <ShoppingBag size={14} />
                    Đơn hàng đã mua
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border-t border-zinc-100 dark:border-zinc-800 mt-1 cursor-pointer"
                  >
                    <LogOut size={14} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Icons Mobile (Theme Toggle + Hamburger) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Theme Toggle Icon Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-[#ea580c] dark:hover:text-white rounded-full transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
            >
              {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} className="text-sky-500" />}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Quick Search Bar (Dành riêng cho điện thoại) */}
        <div className="md:hidden pt-2 pb-0.5">
          <form onSubmit={handleSearch} className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-700/80 rounded-full pl-3 pr-1 py-1 focus-within:border-[#ea580c] transition-all shadow-xs">
            <Search size={15} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm vợt, giày, cước, phụ kiện..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent px-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none"
            />
            <button
              type="button"
              onClick={() => navigate('/search-image')}
              className="p-1.5 text-zinc-400 hover:text-[#ea580c] rounded-full transition-colors shrink-0 cursor-pointer"
              title="Tìm bằng hình ảnh AI"
            >
              <Camera size={15} />
            </button>
            <button
              type="submit"
              className="ml-1 px-3 py-1 bg-[#ea580c] text-white text-[11px] font-bold rounded-full transition-colors shrink-0 uppercase tracking-wider cursor-pointer"
            >
              Tìm
            </button>
          </form>
        </div>
      </div>

      {/* 3. Category Strip (Desktop Mega Navigation + Slide Transition) */}
      <nav className={`hidden lg:block bg-zinc-50 dark:bg-[#121318] border-b border-zinc-200 dark:border-zinc-800 text-xs transition-all duration-300 ease-in-out ${
        isHeaderCollapsed ? 'max-h-0 opacity-0 overflow-hidden border-b-0' : 'max-h-16 opacity-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <ul className="flex items-center space-x-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.path} className="relative group">
                  <Link
                    to={link.path}
                    className={`inline-flex items-center gap-1.5 py-2.5 px-3.5 font-bold uppercase tracking-wider transition-all duration-150 ${
                      isActive
                        ? 'text-white bg-[#ea580c]'
                        : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.children && (
                      <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#ea580c] transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {link.children && (
                    <div className="absolute left-0 top-full hidden group-hover:block w-56 bg-white dark:bg-[#121318] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {link.children.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          to={sub.path}
                          className="block px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:text-[#ea580c] hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors font-medium text-xs"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 4. Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0c0d10] border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          {/* Mobile User Authentication / Profile Box */}
          {currentUser ? (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ea580c] text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                  {(currentUser.full_name || currentUser.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="truncate flex-1">
                  <p className="font-bold text-xs text-zinc-900 dark:text-white truncate">{currentUser.full_name || currentUser.username}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded bg-[#ea580c]/15 text-[#ea580c] uppercase">
                    {currentUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-bold">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl"
                >
                  <User size={13} />
                  <span>Tài khoản</span>
                </Link>
                <Link
                  to="/my-orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl"
                >
                  <ShoppingBag size={13} />
                  <span>Đơn hàng</span>
                </Link>
              </div>

              {currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-xs font-bold"
                >
                  <SlidersHorizontal size={13} />
                  <span>Vào Trang Quản Trị Admin</span>
                </Link>
              )}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                <span>Đăng xuất tài khoản</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center bg-[#ea580c] text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl border border-zinc-200 dark:border-zinc-700"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2">
            <Search size={16} className="text-zinc-400 mr-2" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none w-full"
            />
            <button type="submit" className="text-xs font-bold text-[#ea580c] shrink-0 ml-2">Tìm</button>
          </form>

          {/* Mobile Theme Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Giao diện</span>
            <button
              onClick={handleToggleTheme}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold"
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-sky-500" />}
              <span>{theme === 'dark' ? 'Sáng' : 'Tối'}</span>
            </button>
          </div>

          {/* Mobile Links */}
          <div className="space-y-1">
            {NAV_LINKS.map((link, idx) => (
              <div key={idx} className="border-b border-zinc-100 dark:border-zinc-800/60 pb-1">
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2.5 text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 hover:text-[#ea580c]"
                >
                  {link.name}
                </Link>
                {link.children && (
                  <div className="pl-4 space-y-2 pb-2">
                    {link.children.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        to={sub.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#ea580c]"
                      >
                        • {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Franchise link */}
          <div className="pt-2">
            <Link
              to="/franchise"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 bg-orange-50 dark:bg-orange-950/40 text-[#ea580c] font-bold text-xs rounded-xl border border-orange-200 dark:border-orange-900"
            >
              Hợp tác nhượng quyền
            </Link>
          </div>
        </div>
      )}

    </header>
  );
};

export default Header;
