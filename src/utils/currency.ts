import i18n from '../i18n/config';

export const getCurrencyForLang = (lang?: string) => {
  const language = lang || i18n.language || 'en';
  if (language.startsWith('vi')) return 'VND';
  return 'USD';
};

export const formatCurrency = (amountVnd: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amountVnd);
};


