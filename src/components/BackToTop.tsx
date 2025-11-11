import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  showAfter?: number; // Scroll distance in pixels before showing the button
  className?: string;
}

const BackToTop = ({ showAfter = 300, className = '' }: BackToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    
    // Check on mount
    toggleVisibility();

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-brand-purple text-white shadow-lg hover:bg-purple-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 ${className}`}
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
};

export default BackToTop;
