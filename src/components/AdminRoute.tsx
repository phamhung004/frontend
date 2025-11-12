import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
	children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
	const { user, loading } = useAuth();

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

	if (!user) {
		return <Navigate to="/" replace />;
	}

	const role = user.role?.toUpperCase();
	const hasAdminAccess = role === 'ADMIN' || role === 'ADMINISTRATOR';

	if (!hasAdminAccess) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

export default AdminRoute;
