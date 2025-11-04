import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { productService } from '../services/productService';
import type { Product } from '../types/product';
import AuthModal from './AuthModal';
import UserDropdown from './UserDropdown';
import CartDropdown from './CartDropdown';
import SearchDropdown from './SearchDropdown';

const Header = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const cartItemsCount = getCartItemsCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setShowCartDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchKeyword.trim().length >= 2) {
        setSearchLoading(true);
        try {
          const results = await productService.searchProducts(searchKeyword.trim());
          setSearchResults(results);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error('Error searching products:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchKeyword]);

  const handleSearchClose = () => {
    setShowSearchDropdown(false);
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserDropdown(false);
    navigate('/');
  };

  return (
  <header className={`bg-white border-b border-gray-200 sticky top-0 z-40 transition-shadow duration-200 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-4">
        <div className="flex items-center justify-between h-[77px] md:h-24">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#9F86D9] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-2xl font-bold text-[#9F86D9]" style={{ fontFamily: 'Lobster Two' }}>
                Bigkid
              </span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-9">
            <a href="/" className="text-lg text-gray-900 hover:text-[#9F86D9]" style={{ fontFamily: 'Lobster Two' }}>{t('header.home')}</a>
            <a href="#" className="text-lg text-gray-900 hover:text-[#9F86D9]" style={{ fontFamily: 'Lobster Two' }}>{t('header.about')}</a>
            <a href="/shop" className="text-lg text-gray-900 hover:text-[#9F86D9]" style={{ fontFamily: 'Lobster Two' }}>{t('header.shop')}</a>
            <a href="#" className="text-lg text-gray-900 hover:text-[#9F86D9]" style={{ fontFamily: 'Lobster Two' }}>{t('header.pages')}</a>
            <a href="/blog" className="text-lg text-gray-900 hover:text-[#9F86D9]" style={{ fontFamily: 'Lobster Two' }}>{t('header.blog')}</a>
            <a href="#" className="text-lg text-gray-900 hover:text-[#9F86D9]" style={{ fontFamily: 'Lobster Two' }}>{t('header.contact')}</a>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Search */}
            <div ref={searchRef} className="hidden md:block relative">
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                />
                <button className="absolute right-3 text-gray-900 hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              {showSearchDropdown && (
                <SearchDropdown
                  products={searchResults}
                  loading={searchLoading}
                  onClose={handleSearchClose}
                />
              )}
            </div>

            {/* Wishlist - Hidden on mobile */}
            <button 
              onClick={() => navigate('/wishlist')}
              className="hidden md:block relative text-gray-900 hover:text-[#9F86D9]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#9F86D9] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* User - Hidden on mobile */}
            {user ? (
              <div 
                ref={userDropdownRef}
                className="hidden md:block relative"
                onMouseEnter={() => setShowUserDropdown(true)}
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <button 
                  className="text-gray-900 hover:text-[#9F86D9] transition-colors flex items-center gap-2"
                >
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.fullName || user.email}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-8 h-8 rounded-full bg-[#9F86D9] flex items-center justify-center text-white font-semibold';
                          fallback.textContent = (user.fullName || user.email).charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#9F86D9] flex items-center justify-center text-white font-semibold">
                      {(user.fullName || user.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
                {showUserDropdown && <UserDropdown onLogout={handleLogout} />}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:block text-gray-900 hover:text-[#9F86D9]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}

            {/* Cart */}
            <div 
              ref={cartDropdownRef}
              className="relative"
              onMouseEnter={() => setShowCartDropdown(true)}
              onMouseLeave={() => setShowCartDropdown(false)}
            >
              <button 
                onClick={() => navigate('/cart')}
                className="relative text-gray-900 hover:text-[#9F86D9] cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#9F86D9] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>
              {showCartDropdown && <CartDropdown />}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col space-y-1 text-gray-900 hover:text-[#9F86D9]"
            >
              <span className="w-[18px] h-[2px] bg-current"></span>
              <span className="w-[18px] h-[2px] bg-current"></span>
              <span className="w-[18px] h-[2px] bg-current"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#1C1D1D] opacity-40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-[380px] bg-white shadow-lg overflow-y-auto">
            {/* Menu Header */}
            <div className="flex items-center justify-end h-[64px] px-6 md:px-[43px] border-b border-[#DBE2E5]">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-6 h-6 flex items-center justify-center text-[#1C1D1D]"
                aria-label="Close menu"
              >
                <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Search */}
            <div className="px-6 py-4 border-b border-[#DBE2E5]">
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F86D9] focus:border-transparent"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                {showSearchDropdown && (
                  <SearchDropdown
                    products={searchResults}
                    loading={searchLoading}
                    onClose={() => {
                      handleSearchClose();
                      setIsMobileMenuOpen(false);
                    }}
                  />
                )}
              </div>
            </div>

            {/* Menu Items */}
            <nav className="px-[44px] py-[55px]">
              <ul className="space-y-12">
                <li>
                  <a href="/" className="text-base text-[#1C1D1D] flex items-center justify-between hover:text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                    {t('header.home')}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="/shop" className="text-base text-[#1C1D1D] flex items-center justify-between hover:text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                    {t('header.shop')}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-[#1C1D1D] flex items-center justify-between hover:text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                    {t('header.products')}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-[#1C1D1D] flex items-center justify-between hover:text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                    {t('header.pages')}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-base text-[#1C1D1D] flex items-center justify-between hover:text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                    {t('header.blog')}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-[#1C1D1D] flex items-center justify-between hover:text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                    {t('header.elements')}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </li>
              </ul>
            </nav>

            {/* Divider */}
            <div className="mx-[44px] border-t border-[#DBE2E5]"></div>

            {/* Contact Section */}
            <div className="px-[44px] py-12 space-y-8">
              <h3 className="text-[22px] font-bold text-[#1C1D1D] uppercase tracking-[0.07em]" style={{ fontFamily: 'Mulish' }}>
                {t('header.contactTitle')}
              </h3>
              
              <div className="space-y-2">
                <p className="text-lg text-[#1C1D1D]" style={{ fontFamily: 'DM Sans' }}>
                  {t('header.workingHours')}
                </p>
                
                <div className="flex items-center gap-1">
                  <svg className="w-7 h-7 text-[#646667]" viewBox="0 0 28 28" fill="currentColor">
                    <path d="M6 5h16a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zm0 2v.01l8 4.99 8-5V7H6zm0 3v11h16V10l-8 5-8-5z"/>
                  </svg>
                  <p className="text-lg text-[#1C1D1D]" style={{ fontFamily: 'DM Sans' }}>
                    +01 456 789
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <svg className="w-7 h-7 text-[#646667]" viewBox="0 0 28 28" fill="currentColor">
                    <path d="M6 5h16a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zm0 2v.01l8 4.99 8-5V7H6zm0 3v11h16V10l-8 5-8-5z"/>
                  </svg>
                  <p className="text-lg text-[#1C1D1D]" style={{ fontFamily: 'DM Sans' }}>
                    +01 567 890
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <svg className="w-7 h-7 text-[#646667]" viewBox="0 0 28 28" fill="currentColor">
                    <path d="M4 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm2 0l8 5 8-5H6zm0 2.5V18h16V8.5l-8 5-8-5z"/>
                  </svg>
                  <p className="text-lg text-[#1C1D1D]" style={{ fontFamily: 'DM Sans' }}>
                    {t('header.email')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
