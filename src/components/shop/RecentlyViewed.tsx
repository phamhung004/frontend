import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import { productService } from '../../services/productService';
import type { Product } from '../../types/product';

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getAllProducts(true);
        if (!isMounted) {
          return;
        }

        const sortedByOldest = [...products].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        });

        setFeaturedProducts(sortedByOldest.slice(0, 4));
      } catch (error) {
        console.error('Failed to load featured products:', error);
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolveDisplayPrice = (product: Product) => {
    const price = product.finalPrice ?? product.salePrice ?? product.regularPrice ?? 0;
    const isFreePdf = product.productType === 'PDF' && price === 0;
    return isFreePdf ? 'MIỄN PHÍ' : formatCurrency(price);
  };

  const handleNavigate = (product: Product) => {
    const destination = product.productType === 'PDF'
      ? `/product-pdf/${product.id}`
      : `/product/${product.id}`;
    navigate(destination);
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 border-t border-gray-200">
      <div className="max-w-[1434px] mx-auto px-4">
        <h2 className="text-xl sm:text-2xl lg:text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight mb-6 sm:mb-8">
          Sản phẩm nổi bật
        </h2>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <div 
                key={product.id}
                className="group cursor-pointer"
                onClick={() => handleNavigate(product)}
              >
                <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-6">
                  <img
                    src={product.thumbnailUrl || '/images/placeholder.webp'}
                    alt={product.name}
                    className="w-full h-48 sm:h-64 lg:h-80 xl:h-[397px] object-cover"
                  />
                  {product.badgeLabel && (
                    <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-[#EDA62A] text-white text-xs font-bold px-3 py-1 sm:px-4 sm:py-1.5 rounded">
                      {product.badgeLabel}
                    </div>
                  )}
                </div>
                <div className="text-center px-2">
                  <h3 className="font-bold text-sm sm:text-base lg:text-lg mb-2 line-clamp-2" title={product.name}>
                    {product.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
                    <p className="text-[#9F86D9] text-base sm:text-lg font-semibold">{resolveDisplayPrice(product)}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, index) => (
                        <span key={index} className="text-yellow-400 text-xs sm:text-sm">★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500">Chưa có sản phẩm nổi bật để hiển thị.</p>
        )}
      </div>
    </section>
  );
};

export default RecentlyViewed;
