import { Outlet } from 'react-router-dom';
import AccountSidebar from '../components/AccountSidebar';

const Account = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <AccountSidebar />

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
