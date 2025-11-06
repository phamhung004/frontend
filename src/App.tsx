import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ToastProvider } from './components/ui/ToastContainer';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import Topbar from './components/Topbar';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
// Lazy load to avoid naming conflict with ProductDetail type
const ProductDetailPage = lazy(() => import('./pages/ProductDetail'));
import ProductDetailPDF from './pages/ProductDetailPDF';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
// import Blog from './pages/Blog';
import Admin from './pages/Admin';
import OrderDetail from './pages/admin/OrderDetail';
import Account from './pages/Account';
import Notifications from './pages/account/Notifications';
import Profile from './pages/account/Profile';
import Address from './pages/Address';
import Orders from './pages/account/Orders';
import AccountOrderDetail from './pages/account/OrderDetail';
import NotificationDemo from './pages/NotificationDemo';
import Wishlist from './pages/Wishlist';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <Router>
            <ScrollToTop />
            <Routes>
            {/* Admin Route - No header/footer - Protected */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders/:orderId" 
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              } 
            />
            
            {/* Demo Route - No header/footer */}
            <Route path="/demo/notifications" element={<NotificationDemo />} />

          {/* Main Site Routes - With header/footer */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-white">
                <Topbar />
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route 
                      path="/product/:id" 
                      element={
                        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                          <ProductDetailPage />
                        </Suspense>
                      } 
                    />
                    <Route path="/product-pdf/:id" element={<ProductDetailPDF />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    {/* <Route path="/blog" element={<Blog />} /> */}
                    <Route 
                      path="/wishlist" 
                      element={
                        <ProtectedRoute>
                          <Wishlist />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Account Routes - Protected */}
                    <Route 
                      path="/account" 
                      element={
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="notifications" element={<Notifications />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="address" element={<Address />} />
                      <Route path="orders" element={<Orders />} />
                    </Route>
                    <Route 
                      path="/account/orders/:orderId" 
                      element={
                        <ProtectedRoute>
                          <AccountOrderDetail />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
