import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/layout/AdminRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const FranchisePage = lazy(() => import('./pages/FranchisePage'));
const StoreSystemPage = lazy(() => import('./pages/StoreSystemPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const WarrantyPage = lazy(() => import('./pages/WarrantyPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const UserOrdersPage = lazy(() => import('./pages/UserOrdersPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const PaymentQRPage = lazy(() => import('./pages/PaymentQRPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const SearchImagePage = lazy(() => import('./pages/SearchImagePage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductPage = lazy(() => import('./pages/admin/AdminProductPage'));
const AdminCategoryPage = lazy(() => import('./pages/admin/AdminCategoryPage'));
const AdminUserPage = lazy(() => import('./pages/admin/AdminUserPage'));
const AdminOrderPage = lazy(() => import('./pages/admin/AdminOrderPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminPostPage = lazy(() => import('./pages/admin/AdminPostPage'));
const AdminReviewPage = lazy(() => import('./pages/admin/AdminReviewPage'));
const AdminVoucherPage = lazy(() => import('./pages/admin/AdminVoucherPage'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-zinc-500">Đang tải…</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/category/:categoryId" element={<ProductListPage />} />
        <Route path="/search" element={<ProductListPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/payment-qr" element={<PaymentQRPage />} />
        <Route path="/payment-qr/:orderId" element={<PaymentQRPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetailPage />} />
        <Route path="/franchise" element={<FranchisePage />} />
        <Route path="/he-thong-cua-hang" element={<StoreSystemPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/chinh-sach-bao-hanh" element={<WarrantyPage />} />
        <Route path="/warranty-policy" element={<WarrantyPage />} />
        <Route path="/chinh-sach-van-chuyen" element={<ShippingPolicyPage />} />
        <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-orders" element={<UserOrdersPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/search-image" element={<SearchImagePage />} />
        
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
      </Suspense>
    </Router>
  );
}

export default App;
