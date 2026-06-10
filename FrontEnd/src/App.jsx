import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import FranchisePage from './pages/FranchisePage';
import StoreSystemPage from './pages/StoreSystemPage';
import GuidePage from './pages/GuidePage';
import UserOrdersPage from './pages/UserOrdersPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import PaymentQRPage from './pages/PaymentQRPage';
import ScrollToTop from './components/ScrollToTop';
import FavoritesPage from './pages/FavoritesPage';
import SearchImagePage from './pages/SearchImagePage';


import AdminRoute from './components/layout/AdminRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductPage from './pages/admin/AdminProductPage';
import AdminCategoryPage from './pages/admin/AdminCategoryPage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminOrderPage from './pages/admin/AdminOrderPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

import AdminPostPage from './pages/admin/AdminPostPage';
import AdminReviewPage from './pages/admin/AdminReviewPage';
import AdminVoucherPage from './pages/admin/AdminVoucherPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/category/:categoryId" element={<ProductListPage />} />
        <Route path="/search" element={<ProductListPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/payment-qr" element={<PaymentQRPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/franchise" element={<FranchisePage />} />
        <Route path="/he-thong-cua-hang" element={<StoreSystemPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-orders" element={<UserOrdersPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/search-image" element={<SearchImagePage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUserPage /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProductPage /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminCategoryPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrderPage /></AdminRoute>} />
        <Route path="/admin/posts" element={<AdminRoute><AdminPostPage /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminReviewPage /></AdminRoute>} />
        <Route path="/admin/vouchers" element={<AdminRoute><AdminVoucherPage /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
