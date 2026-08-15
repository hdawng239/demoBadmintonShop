import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { authService } from '../../services/authService';

const BottomNav = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const updateCounts = async () => {
    try {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        const [cCount, wCount] = await Promise.all([
          cartService.getCartCount(),
          wishlistService.getWishlistCount(),
        ]);
        setCartCount(cCount);
        setWishlistCount(wCount);
      } else {
        setCartCount(0);
        setWishlistCount(0);
      }
    } catch {
      // Ignore count fetch error
    }
  };

  useEffect(() => {
    updateCounts();

    const handleCartUpdate = () => updateCounts();
    const handleWishlistUpdate = () => updateCounts();
    const handleAuthChange = () => updateCounts();

    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, [location.pathname]);

  const navItems = [
    {
      name: 'Trang chủ',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      name: 'Danh mục',
      path: '/category/1',
      icon: Grid,
      isActive: location.pathname.startsWith('/category'),
    },
    {
      name: 'Yêu thích',
      path: '/favorites',
      icon: Heart,
      badge: wishlistCount,
      badgeColor: 'bg-rose-500',
      isActive: location.pathname === '/favorites',
    },
    {
      name: 'Giỏ hàng',
      path: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
      badgeColor: 'bg-[#ea580c]',
      isActive: location.pathname === '/cart',
    },
    {
      name: currentUser ? 'Tài khoản' : 'Đăng nhập',
      path: currentUser ? (currentUser.role === 'admin' ? '/admin' : '/profile') : '/login',
      icon: User,
      isActive: ['/profile', '/login', '/register', '/my-orders', '/admin'].includes(location.pathname),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#10121a]/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors duration-300">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-[#ea580c] font-black'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`}
                />

                {item.badge > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 ${item.badgeColor} text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight ${active ? 'font-black text-[#ea580c]' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {item.name}
              </span>

              {active && (
                <span className="absolute bottom-0 w-3 h-0.5 bg-[#ea580c] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
