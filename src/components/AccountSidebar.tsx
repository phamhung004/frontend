import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AccountSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    {
      path: '/account/notifications',
      label: t('accountSidebar.notifications'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      path: '/account/profile',
      label: t('accountSidebar.myAccount'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      submenu: [
        { path: '/account/profile', label: t('accountSidebar.profile') },
        // { path: '/account/bank', label: t('accountSidebar.bank') },
        // { path: '/account/address', label: t('accountSidebar.address') },
        // { path: '/account/password', label: t('accountSidebar.changePassword') },
        // { path: '/account/privacy', label: t('accountSidebar.privacy') },
      ],
    },
    {
      path: '/account/orders',
      label: t('accountSidebar.myOrders'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isParentActive = (item: any) => {
    if (item.submenu) {
      return item.submenu.some((sub: any) => location.pathname === sub.path);
    }
    return location.pathname === item.path;
  };

  return (
    <div className="w-full md:w-[240px] bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* User Info */}
      <div className="p-6 bg-gradient-to-br from-[#9F86D9] to-[#B69EE6] text-white">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#9F86D9]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ fontFamily: 'DM Sans' }}>Hungg</h3>
            <p className="text-sm opacity-90" style={{ fontFamily: 'DM Sans' }}>hunggphamm908</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item) => (
          <div key={item.path}>
            <button
              onClick={() => navigate(item.path)}
              className={`w-full px-6 py-3 text-left flex items-center gap-3 transition-all ${
                isParentActive(item)
                  ? 'bg-purple-50 text-[#9F86D9] border-r-4 border-[#9F86D9]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#9F86D9]'
              }`}
              style={{ fontFamily: 'DM Sans' }}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>

            {/* Submenu */}
            {item.submenu && isParentActive(item) && (
              <div className="bg-gray-50 py-1">
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className={`w-full px-6 pl-14 py-2 text-left text-sm transition-colors ${
                      isActive(subItem.path)
                        ? 'text-[#9F86D9] font-medium'
                        : 'text-gray-600 hover:text-[#9F86D9]'
                    }`}
                    style={{ fontFamily: 'DM Sans' }}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSidebar;
