import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { getCurrencyForLang } from '../utils/currency';

const Topbar = () => {
  const { t, i18n } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsLangDropdownOpen(false);
  };

  const currentLanguage = i18n.language === 'vi' ? 'VIE' : 'EN';

  return (
    <div className="bg-[#EAE1D1] hidden lg:block">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-12 text-sm">
          {/* Left side */}
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-900 hover:text-purple-600">{t('topbar.aboutUs')}</a>
            <a href="#" className="text-gray-900 hover:text-purple-600">{t('topbar.contactUs')}</a>
            <a href="#" className="text-gray-900 hover:text-purple-600 font-medium">{t('topbar.openShop')}</a>
          </div>

          {/* Center */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-900">{t('topbar.freeShipping')}</span>
            <button className="bg-[#E35946] text-white text-xs font-bold px-2.5 py-1 rounded">
              {t('topbar.learnMore')}
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Currency Selector (reflects language) */}
            <button className="flex items-center space-x-1 text-gray-900 opacity-80 hover:opacity-100">
              <span>{getCurrencyForLang()}</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center space-x-1 text-gray-900 opacity-80 hover:opacity-100"
              >
                <span>{currentLanguage}</span>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        i18n.language === 'en' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      English (EN)
                    </button>
                    <button
                      onClick={() => changeLanguage('vi')}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        i18n.language === 'vi' ? 'bg-purple-50 text-purple-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      Tiếng Việt (VIE)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
