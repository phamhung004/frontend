import { useState, useEffect } from 'react';
import NewsletterPopup from '../components/ui/NewsletterPopup';

const NEWSLETTER_SHOWN_KEY = 'newsletter_popup_shown';
const SHOW_DELAY = 3000; // 3 seconds

export function useNewsletterPopup() {
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    // Kiểm tra xem đã hiển thị popup chưa
    const hasShown = localStorage.getItem(NEWSLETTER_SHOWN_KEY);
    
    if (!hasShown) {
      // Hiển thị sau 3 giây
      const timer = setTimeout(() => {
        setShowNewsletter(true);
      }, SHOW_DELAY);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowNewsletter(false);
    // Đánh dấu đã hiển thị
    localStorage.setItem(NEWSLETTER_SHOWN_KEY, 'true');
  };

  const handleSubscribe = async (email: string) => {
    // TODO: Implement API call
    console.log('Newsletter subscription:', email);
    
    // Đánh dấu đã hiển thị
    localStorage.setItem(NEWSLETTER_SHOWN_KEY, 'true');
    
    // Có thể throw error nếu API fails
    // throw new Error('Subscription failed');
  };

  const NewsletterPopupComponent = () => (
    <NewsletterPopup
      isOpen={showNewsletter}
      onClose={handleClose}
      onSubscribe={handleSubscribe}
    />
  );

  // Reset function (useful for testing)
  const resetNewsletter = () => {
    localStorage.removeItem(NEWSLETTER_SHOWN_KEY);
    setShowNewsletter(false);
  };

  return {
    NewsletterPopupComponent,
    showNewsletter,
    resetNewsletter,
  };
}
