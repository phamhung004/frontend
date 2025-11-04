import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

// Lấy ngôn ngữ đã lưu từ localStorage hoặc sử dụng 'vi' làm mặc định
const savedLanguage = localStorage.getItem('language') || 'vi';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      vi: {
        translation: viTranslations,
      },
    },
    lng: savedLanguage, // Sử dụng ngôn ngữ đã lưu hoặc Tiếng Việt
    fallbackLng: 'vi', // Ngôn ngữ dự phòng là Tiếng Việt
    interpolation: {
      escapeValue: false, // React đã tự động escape
    },
  });

// Lưu ngôn ngữ vào localStorage mỗi khi thay đổi
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;
