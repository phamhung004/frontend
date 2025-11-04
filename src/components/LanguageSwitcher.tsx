import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageIcon, CheckIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="Change Language"
      >
        <LanguageIcon className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-700 hidden lg:block">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase">Select Language</p>
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-3 py-2 hover:bg-purple-50 transition-colors ${
                i18n.language === lang.code ? 'bg-purple-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm font-medium text-gray-700">{lang.name}</span>
              </div>
              {i18n.language === lang.code && (
                <CheckIcon className="w-5 h-5 text-brand-purple" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
