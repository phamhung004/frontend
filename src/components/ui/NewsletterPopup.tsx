import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (email: string) => Promise<void>;
}

export default function NewsletterPopup({ isOpen, onClose, onSubscribe }: NewsletterPopupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await onSubscribe(email);
      setEmail('');
      onClose();
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-[946px] w-full animate-scaleIn overflow-hidden">
        {/* Decorative Border */}
        <div className="absolute inset-[21px] border-2 border-dashed border-[#E35946] rounded pointer-events-none" 
             style={{ borderSpacing: '4px' }} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[37px] right-[37px] z-20 w-[31px] h-[31px] bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all shadow-md"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="newsletter-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="2" fill="#9F86D9" />
              <circle cx="25" cy="25" r="2" fill="#E35946" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#newsletter-pattern)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative px-12 py-16 text-center">
          {/* Title with Wave */}
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-[#9F86D9] font-bold text-xl tracking-wide mb-1">
              SIGN UP FOR EMAILS
            </h3>
            <svg width="72" height="6" viewBox="0 0 72 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 3C8 3 8 0 16 0C24 0 24 6 32 6C40 6 40 0 48 0C56 0 56 3 64 3C68 3 68 4.5 72 4.5" 
                    stroke="#9F86D9" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Main Heading */}
          <h2 className="text-[48px] leading-[56px] font-bold text-gray-900 mb-6 max-w-[641px] mx-auto">
            Get 20% discount shipped to your inbox
          </h2>

          {/* Description */}
          <p className="text-gray-900 text-base mb-12 max-w-[520px] mx-auto">
            Subscribe to our newsletter and we will ship 20% discount code today
          </p>

          {/* Subscribe Form */}
          <form onSubmit={handleSubmit} className="max-w-[566px] mx-auto mb-6">
            <div className="flex h-12 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-5 text-base text-gray-900 placeholder-gray-500 focus:outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-[142px] bg-[#9F86D9] hover:bg-[#8B72C5] text-white font-bold text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'LOADING...' : 'SUBSCRIBE'}
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mt-2 text-left">{error}</p>
            )}
          </form>

          {/* Learn More Link */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Handle learn more click
            }}
            className="text-gray-900 text-sm underline hover:text-[#9F86D9] transition-colors"
          >
            Learn more
          </a>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full bg-gradient-to-br from-[#9F86D9]/20 to-[#E35946]/20 blur-xl" />
        <div className="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#E35946]/20 to-[#9F86D9]/20 blur-xl" />
      </div>
    </div>
  );
}
