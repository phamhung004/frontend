import { useShop } from '../../contexts/ShopContext';

const Pagination = () => {
  const { pagination, setPage } = useShop();
  const { page: currentPage, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setPage(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
        }`}
        aria-label="Previous page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="w-[42px] h-[42px] flex items-center justify-center text-gray-500">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => handlePageClick(pageNum)}
            className={`w-[42px] h-[42px] rounded-full flex items-center justify-center font-medium transition-colors ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
            }`}
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
        }`}
        aria-label="Next page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
