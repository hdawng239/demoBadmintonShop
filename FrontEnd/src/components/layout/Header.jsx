import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Phone, MapPin, Search as SearchIcon, User, ShoppingCart, ChevronDown, Flame } from 'lucide-react';
import { authService } from '../../services/authService';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';

const Header = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const [cartCount, setCartCount] = useState(0);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const data = await productService.getAllProducts(1, 5, null, null, searchQuery);
          setSearchResults(data?.products || data?.data || data || []);
        } catch (error) {
          console.error("Lỗi tìm kiếm:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (authService.getCurrentUser()) {
        try {
          const cart = await cartService.getMyCart();
          const count = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
          setCartCount(count);
        } catch (error) {
          console.error("Lỗi lấy giỏ hàng:", error);
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();

    const handleUserUpdate = () => {
      setUser(authService.getCurrentUser());
      fetchCartCount();
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    window.addEventListener('cartUpdated', fetchCartCount);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.dispatchEvent(new Event('userUpdated'));
    navigate('/');
  };

  return (
    <header className="bg-white w-full border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="container mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-y-4">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link to="/" className="text-2xl md:text-3xl font-black italic tracking-tighter text-black flex items-center">
            <span className="bg-black text-white px-2 py-1 mr-1 rounded-sm">Naro</span>Shop
          </Link>
          
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="flex items-center text-primary font-bold">
              <Phone className="w-4 h-4 mr-1" />
              HOTLINE: 0977508430
            </div>
            <Link to="/he-thong-cua-hang" className="flex items-center text-gray-700 hover:text-primary cursor-pointer">
              <MapPin className="w-4 h-4 mr-1" />
              HỆ THỐNG CỬA HÀNG
            </Link>
          </div>
        </div>

        <div className="flex-1 w-full md:w-auto md:max-w-xl px-0 md:px-6 order-last md:order-none" ref={searchRef}>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm sản phẩm..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 px-4 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all-300"
            />
            <SearchIcon className="absolute right-3 top-2.5 text-gray-400 w-5 h-5 cursor-pointer hover:text-primary" />
            
            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-gray-700 font-bold flex items-center mb-3">
                    <Flame className="w-5 h-5 text-gray-500 mr-2" />
                    TÌM KIẾM NHIỀU NHẤT
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Vợt cầu lông', 'Giày cầu lông', 'Áo cầu lông', 'Quần cầu lông'].map((tag, idx) => (
                      <span 
                        key={idx} 
                        onClick={() => {
                          setSearchQuery(tag);
                          setShowSearchDropdown(true);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700 px-3 py-1.5 rounded-md text-sm transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500">Đang tìm kiếm...</div>
                  ) : searchQuery.trim().length >= 2 && searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào phù hợp.</div>
                  ) : (
                    searchResults.map(product => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-50 transition-colors"
                      >
                        <div className="w-14 h-14 bg-white rounded-md overflow-hidden flex-shrink-0 mr-4 flex items-center justify-center border border-gray-100 p-1">
                          <img 
                            src={product.image_url || 'https://via.placeholder.com/150'} 
                            alt={product.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-800 text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-primary font-bold mt-1">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.base_price)}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <div className="relative group cursor-pointer flex flex-col justify-center">
              <div className="flex flex-col items-center text-primary transition-all-300">
                <User className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold uppercase whitespace-nowrap">
                  {user.full_name || 'Tài khoản'}
                </span>
              </div>
              
              <div className="absolute top-full right-0 pt-2 w-56 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-50">
                <div className="bg-white border border-gray-100 shadow-xl rounded-md overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 break-words">{user.full_name}</p>
                    <p className="text-xs text-gray-500 break-words">{user.email}</p>
                  </div>
                  <ul className="py-2 text-sm text-gray-700">
                    <li><Link to="/profile" className="block px-4 py-2 hover:bg-gray-100 hover:text-primary transition-colors">Hồ sơ cá nhân</Link></li>
                    <li><Link to="/my-orders" className="block px-4 py-2 hover:bg-gray-100 hover:text-primary transition-colors">Theo dõi đơn hàng</Link></li>
                    <li><button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-red-500 transition-colors">Đăng xuất</button></li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex flex-col items-center text-gray-600 hover:text-primary cursor-pointer transition-all-300">
              <User className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-semibold uppercase">Tài khoản</span>
            </Link>
          )}
          <Link to="/cart" className="flex flex-col items-center text-gray-600 hover:text-primary cursor-pointer transition-all-300 relative">
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-1" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold uppercase">Giỏ hàng</span>
          </Link>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="bg-primary text-white">
        <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
          <ul className="flex items-center justify-start md:justify-center space-x-6 md:space-x-8 text-sm font-bold uppercase whitespace-nowrap">
            <li><Link to="/" className="block py-3 hover:text-yellow-300 transition-colors">Trang chủ</Link></li>
            
            {/* Mega Menu Wrapper */}
            <li 
              className="relative group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex items-center py-3 cursor-pointer hover:text-yellow-300 transition-colors">
                <span>Sản phẩm</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>

              {/* Mega Menu Content */}
              <div className={`absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 w-[95vw] md:w-[800px] bg-white text-black shadow-2xl border-t border-gray-100 rounded-b-lg overflow-hidden transition-all duration-300 transform origin-top z-[100] ${isHovered ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="p-4 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {/* Cột 1: Vợt */}
                  <div>
                    <Link to="/category/1" className="text-primary font-bold uppercase mb-4 block hover:underline">Vợt Cầu Lông</Link>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><Link to="/category/1?brand=yonex" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Vợt cầu lông Yonex</Link></li>
                      <li><Link to="/category/1?brand=lining" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Vợt cầu lông Lining</Link></li>
                      <li><Link to="/category/1?brand=victor" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Vợt cầu lông Victor</Link></li>
                      <li><Link to="/category/1?brand=kumpoo" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Vợt cầu lông Kumpoo</Link></li>
                      <li><Link to="/category/1?brand=mizuno" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Vợt cầu lông Mizuno</Link></li>
                    </ul>
                  </div>
                  {/* Cột 2: Giày */}
                  <div>
                    <Link to="/category/2" className="text-primary font-bold uppercase mb-4 block hover:underline">Giày Cầu Lông</Link>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><Link to="/category/2?brand=yonex" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Giày cầu lông Yonex</Link></li>
                      <li><Link to="/category/2?brand=lining" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Giày cầu lông Lining</Link></li>
                      <li><Link to="/category/2?brand=victor" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Giày cầu lông Victor</Link></li>
                      <li><Link to="/category/2?brand=kumpoo" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Giày cầu lông Kumpoo</Link></li>
                      <li><Link to="/category/2?brand=mizuno" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Giày cầu lông Mizuno</Link></li>
                    </ul>
                  </div>
                  {/* Cột 3: Quần áo */}
                  <div>
                    <div className="text-primary font-bold uppercase mb-4 block">Quần Áo Cầu Lông</div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><Link to="/category/6" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Quần áo Cầu Lông nam</Link></li>
                      <li><Link to="/category/8" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Quần áo Cầu Lông nữ</Link></li>
                    </ul>
                  </div>
                  {/* Cột 4: Phụ kiện */}
                  <div>
                    <Link to="/category/5" className="text-primary font-bold uppercase mb-4 block hover:underline">Phụ Kiện Cầu Lông</Link>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li><Link to="/category/7" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Túi vợt Cầu Lông</Link></li>
                      <li><Link to="/category/9" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Cước Cầu Lông</Link></li>
                      <li><Link to="/category/10" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Tất Cầu Lông</Link></li>
                      <li><Link to="/category/11" className="hover:text-primary hover:translate-x-1 transition-transform inline-block">Quấn cán Cầu Lông</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li><Link to="/news" className="block py-3 hover:text-yellow-300 transition-colors">Tin tức</Link></li>
            <li><Link to="/franchise" className="block py-3 hover:text-yellow-300 transition-colors">Chính sách nhượng quyền</Link></li>
            <li><Link to="/guide" className="block py-3 hover:text-yellow-300 transition-colors">Hướng dẫn</Link></li>
            <li><Link to="/about" className="block py-3 hover:text-yellow-300 transition-colors">Giới thiệu</Link></li>
            <li><Link to="/contact" className="block py-3 hover:text-yellow-300 transition-colors">Liên hệ</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
