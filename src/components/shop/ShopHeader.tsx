import { useTranslation } from 'react-i18next';

const ShopHeader = () => {
  const { t } = useTranslation();
  
  const tags = [
    { key: 'topRated', label: t('shop.tags.topRated') },
    { key: 'twoPieceOutfits', label: t('shop.tags.twoPieceOutfits') },
    { key: 'tShirts', label: t('shop.tags.tShirts') },
    { key: 'boyPoloShirts', label: t('shop.tags.boyPoloShirts') },
    { key: 'boyTanks', label: t('shop.tags.boyTanks') },
    { key: 'shoes', label: t('shop.tags.shoes') },
    { key: 'boysDenim', label: t('shop.tags.boysDenim') },
    { key: 'toddlerBoysBottoms', label: t('shop.tags.toddlerBoysBottoms') },
    { key: 'boySwimwear', label: t('shop.tags.boySwimwear') },
    { key: 'boysInterior', label: t('shop.tags.boysInterior') },
  ];

  return (
    <div className="bg-[#BFDDDE] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px]">
          <img src="/images/pattern-bg.png" alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="max-w-[1434px] mx-auto px-4 py-20 relative z-10">
        {/* Breadcrumb & Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Lobster Two' }}>{t('shop.title')}</h1>
          <div className="flex items-center justify-center gap-2 text-base">
            <a href="/" className="text-[#9F86D9] hover:underline">{t('shop.home')}</a>
            <span className="text-gray-500"></span>
            <a href="/shop" className="text-[#9F86D9] hover:underline">{t('shop.shop')}</a>
            <span className="text-gray-500"></span>
            <span className="text-gray-500">{t('shop.boysClothing')}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <button
              key={tag.key}
              className="px-5 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-[#9F86D9] hover:text-[#9F86D9] transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopHeader;
