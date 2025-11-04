import { useState } from 'react';
import { useToast } from '../components/ui/ToastContainer';
import { useConfirm } from '../components/ui/useConfirm';
import Alert from '../components/ui/Alert';
import NewsletterPopup from '../components/ui/NewsletterPopup';

export default function NotificationDemo() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [showAlert, setShowAlert] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);

  const handleToastSuccess = () => {
    toast.success('Success!', 'Your action was completed successfully.');
  };

  const handleToastError = () => {
    toast.error('Error!', 'Something went wrong. Please try again.');
  };

  const handleToastWarning = () => {
    toast.warning('Warning!', 'Please review your changes before proceeding.');
  };

  const handleToastInfo = () => {
    toast.info('Information', 'This is an informational message for you.');
  };

  const handleConfirmDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item?',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (confirmed) {
      toast.success('Deleted!', 'Item has been deleted successfully.');
    }
  };

  const handleConfirmWarning = async () => {
    const confirmed = await confirm({
      title: 'Warning',
      message: 'This action may have unexpected consequences. Do you want to continue?',
      confirmText: 'Continue',
      cancelText: 'Cancel',
      type: 'warning',
    });

    if (confirmed) {
      toast.info('Action completed', 'Your action was performed.');
    }
  };

  const handleNewsletterSubscribe = async (email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Subscribed:', email);
    toast.success('Subscribed!', `Thank you for subscribing with ${email}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Notification & Alert Components Demo
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Thiết kế theo phong cách Baby Shop Figma Template
        </p>

        {/* Toast Notifications */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Toast Notifications</h2>
          <p className="text-gray-600 mb-6">
            Thông báo tự động biến mất sau vài giây, hiển thị ở góc phải trên màn hình.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleToastSuccess}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Show Success
            </button>
            <button
              onClick={handleToastError}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Show Error
            </button>
            <button
              onClick={handleToastWarning}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Show Warning
            </button>
            <button
              onClick={handleToastInfo}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Show Info
            </button>
          </div>
        </section>

        {/* Confirmation Modals */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmation Modals</h2>
          <p className="text-gray-600 mb-6">
            Hộp thoại xác nhận với các loại khác nhau: danger, warning, info, success.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleConfirmDelete}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Danger Confirm
            </button>
            <button
              onClick={handleConfirmWarning}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Warning Confirm
            </button>
            <button
              onClick={async () => {
                const confirmed = await confirm({
                  title: 'Save Changes?',
                  message: 'Do you want to save your changes before leaving?',
                  confirmText: 'Save',
                  cancelText: 'Discard',
                  type: 'info',
                });
                if (confirmed) toast.success('Saved!', 'Your changes have been saved.');
              }}
              className="px-6 py-3 bg-[#9F86D9] text-white rounded-lg font-semibold hover:bg-[#8B72C5] transition-colors"
            >
              Info Confirm
            </button>
            <button
              onClick={async () => {
                const confirmed = await confirm({
                  title: 'Complete Task?',
                  message: 'Are you ready to mark this task as completed?',
                  confirmText: 'Complete',
                  cancelText: 'Cancel',
                  type: 'success',
                });
                if (confirmed) toast.success('Completed!', 'Task marked as completed.');
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Success Confirm
            </button>
          </div>
        </section>

        {/* Alert Components */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Alert Components</h2>
          <p className="text-gray-600 mb-6">
            Thông báo tĩnh hiển thị trong nội dung trang.
          </p>
          <div className="space-y-4">
            <Alert
              type="success"
              title="Success Alert"
              message="Your profile has been updated successfully."
              onClose={() => console.log('Closed')}
            />
            <Alert
              type="error"
              title="Error Alert"
              message="Unable to process your request. Please check your connection and try again."
              onClose={() => console.log('Closed')}
            />
            <Alert
              type="warning"
              title="Warning Alert"
              message="Your session will expire in 5 minutes. Please save your work."
              onClose={() => console.log('Closed')}
            />
            <Alert
              type="info"
              message="You have 3 new messages in your inbox."
            />
            
            <div className="mt-4">
              <button
                onClick={() => setShowAlert(!showAlert)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Toggle Dismissable Alert
              </button>
              {showAlert && (
                <div className="mt-4">
                  <Alert
                    type="info"
                    title="Did you know?"
                    message="You can dismiss this alert by clicking the X button."
                    onClose={() => setShowAlert(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter Popup */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Newsletter Popup</h2>
          <p className="text-gray-600 mb-6">
            Popup đăng ký nhận email theo thiết kế từ Figma với hiệu ứng và pattern trang trí.
          </p>
          <button
            onClick={() => setShowNewsletter(true)}
            className="px-6 py-3 bg-[#9F86D9] text-white rounded-lg font-semibold hover:bg-[#8B72C5] transition-colors"
          >
            Open Newsletter Popup
          </button>
        </section>

        {/* Usage Examples */}
        <section className="bg-gradient-to-br from-[#9F86D9]/10 to-[#E35946]/10 rounded-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cách sử dụng</h2>
          <div className="space-y-4 text-gray-700">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold mb-2">1. Toast Notifications:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useToast } from '@/components/ui/ToastContainer';

const MyComponent = () => {
  const toast = useToast();
  
  const handleClick = () => {
    toast.success('Success!', 'Operation completed.');
    toast.error('Error!', 'Something went wrong.');
    toast.warning('Warning!', 'Please be careful.');
    toast.info('Info', 'Here is some information.');
  };
};`}
              </pre>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold mb-2">2. Confirmation Modal:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useConfirm } from '@/components/ui/useConfirm';

const MyComponent = () => {
  const { confirm, ConfirmDialog } = useConfirm();
  
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete?',
      message: 'Are you sure?',
      type: 'danger'
    });
    
    if (confirmed) {
      // Do delete action
    }
  };
  
  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      <ConfirmDialog />
    </>
  );
};`}
              </pre>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold mb-2">3. Alert Component:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import Alert from '@/components/ui/Alert';

<Alert
  type="success"
  title="Success"
  message="Your changes have been saved."
  onClose={() => console.log('Closed')}
/>`}
              </pre>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold mb-2">4. Newsletter Popup:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import NewsletterPopup from '@/components/ui/NewsletterPopup';

const [showNewsletter, setShowNewsletter] = useState(false);

<NewsletterPopup
  isOpen={showNewsletter}
  onClose={() => setShowNewsletter(false)}
  onSubscribe={async (email) => {
    // Handle subscription
    await subscribeToNewsletter(email);
  }}
/>`}
              </pre>
            </div>
          </div>
        </section>
      </div>

      {/* Render Dialogs */}
      <ConfirmDialog />
      <NewsletterPopup
        isOpen={showNewsletter}
        onClose={() => setShowNewsletter(false)}
        onSubscribe={handleNewsletterSubscribe}
      />
    </div>
  );
}
