import { useTranslation } from 'react-i18next';

const Notifications = () => {
  const { t } = useTranslation();

  const notifications = [
    {
      id: 1,
      title: 'Đơn hàng của bạn đã được giao',
      message: 'Đơn hàng #DH123456 đã được giao thành công',
      time: '2 giờ trước',
      isRead: false,
    },
    {
      id: 2,
      title: 'Khuyến mãi đặc biệt',
      message: 'Giảm giá 30% cho tất cả sản phẩm trong tuần này',
      time: '1 ngày trước',
      isRead: false,
    },
    {
      id: 3,
      title: 'Đơn hàng đang vận chuyển',
      message: 'Đơn hàng #DH123455 đang trên đường giao đến bạn',
      time: '2 ngày trước',
      isRead: true,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#9F86D9] to-[#B69EE6]">
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'DM Sans' }}>
          {t('notifications.title')}
        </h2>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-32 h-32 mb-4 flex items-center justify-center">
              <svg className="w-full h-full text-gray-300" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 text-center" style={{ fontFamily: 'DM Sans' }}>
              {t('notifications.empty')}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-6 py-4 hover:bg-purple-50 transition-colors cursor-pointer ${
                !notification.isRead ? 'bg-purple-25' : ''
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-2 h-2 mt-2 rounded-full ${!notification.isRead ? 'bg-[#9F86D9]' : 'bg-transparent'}`}></div>
                <div className="flex-1">
                  <h3 className={`text-base mb-1 ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`} style={{ fontFamily: 'DM Sans' }}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'DM Sans' }}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-400" style={{ fontFamily: 'DM Sans' }}>
                    {notification.time}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
