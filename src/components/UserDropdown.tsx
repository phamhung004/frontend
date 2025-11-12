import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

interface UserDropdownProps {
  onLogout: () => void;
}

const UserDropdown = ({ onLogout }: UserDropdownProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role?.toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'ADMINISTRATOR';

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
      <div className="py-2">
        {/* Tài khoản của tôi */}
        <button
          onClick={() => handleNavigate('/account/profile')}
          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-[#9F86D9] transition-colors flex items-center gap-3"
          style={{ fontFamily: 'DM Sans' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{t('userDropdown.myAccount')}</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => handleNavigate('/admin')}
            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-[#9F86D9] transition-colors flex items-center gap-3"
            style={{ fontFamily: 'DM Sans' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span>{t('userDropdown.admin')}</span>
          </button>
        )}

        {/* Đơn mua */}
        <button
          onClick={() => handleNavigate('/account/orders')}
          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-[#9F86D9] transition-colors flex items-center gap-3"
          style={{ fontFamily: 'DM Sans' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>{t('userDropdown.myOrders')}</span>
        </button>

        {/* Divider */}
        <div className="my-2 border-t border-gray-200"></div>

        {/* Đăng xuất */}
        <button
          onClick={onLogout}
          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
          style={{ fontFamily: 'DM Sans' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{t('userDropdown.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default UserDropdown;
