import { useState, useEffect } from 'react';
import { GitCompare } from 'lucide-react';
import productComparisonService from '../services/productComparisonService';
import ProductComparisonModal from './ProductComparisonModal';

const ComparisonBadge = () => {
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Initial count
    updateCount();

    // Listen for storage changes (if multiple tabs)
    const handleStorageChange = () => {
      updateCount();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleComparisonUpdate = () => {
      updateCount();
    };
    
    window.addEventListener('comparisonUpdated', handleComparisonUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('comparisonUpdated', handleComparisonUpdate);
    };
  }, []);

  const updateCount = () => {
    setCount(productComparisonService.getCount());
  };

  if (count === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-brand-orange text-white rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2"
        aria-label={`So sánh ${count} sản phẩm`}
      >
        <GitCompare className="w-5 h-5" />
        <span className="font-semibold">So sánh ({count})</span>
      </button>

      <ProductComparisonModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          updateCount(); // Refresh count after closing
        }}
      />
    </>
  );
};

export default ComparisonBadge;

// Helper function to trigger updates
export const triggerComparisonUpdate = () => {
  window.dispatchEvent(new Event('comparisonUpdated'));
};
