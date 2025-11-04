import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * Component bảo vệ route, yêu cầu đăng nhập
 * Redirect về trang chủ nếu chưa đăng nhập
 */
const ProtectedRoute = ({ children, requireAuth = true }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Đang loading thì hiển thị loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F86D9]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Nếu yêu cầu auth nhưng chưa đăng nhập thì redirect
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập nhưng route không yêu cầu auth (như login page)
  // thì redirect về trang chủ
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
