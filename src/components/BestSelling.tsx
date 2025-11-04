import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/currency';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { productService } from '../services/productService';
import type { Product } from '../types/product';

gsap.registerPlugin(ScrollTrigger);

const BestSelling = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const bestSellingRef = useRef<HTMLDivElement>(null);
  const flashSaleRef = useRef<HTMLDivElement>(null);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await productService.getAllProducts(true);
        // Chia sản phẩm: 3 sản phẩm cho Best Selling và 3 sản phẩm cho Flash Sale
        setBestSellingProducts(allProducts.slice(3, 6));
        setFlashSaleProducts(allProducts.slice(6, 9));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const ProductCard = ({ product }: { product: Product }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const price = product.finalPrice ?? product.salePrice ?? product.regularPrice;
    const originalPrice = product.regularPrice;

    useEffect(() => {
      if (cardRef.current && imgRef.current) {
        const card = cardRef.current;
        const img = imgRef.current;

        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            scale: 1.02,
            boxShadow: '0 10px 30px rgba(159, 134, 217, 0.3)',
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(img, {
            scale: 1.1,
            duration: 0.4,
            ease: 'power2.out',
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            duration: 0.3,
            ease: 'power2.out',
          });
          gsap.to(img, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      }
    }, []);

    return (
      <div 
        ref={cardRef}
        className="flex items-center space-x-6 border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        {/* Product Image */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            ref={imgRef}
            src={product.thumbnailUrl || '/images/placeholder.webp'} 
            alt={product.name}
            className="w-40 h-40 object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-2 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate" title={product.name}>
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-lg text-[#9F86D9]">{formatCurrency(price)}</span>
            {price < originalPrice && (
              <span className="text-lg text-gray-500 line-through">{formatCurrency(originalPrice)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate best selling section
      if (bestSellingRef.current) {
        gsap.from(bestSellingRef.current.children, {
          scrollTrigger: {
            trigger: bestSellingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          x: -60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
        });
      }

      // Animate flash sale section
      if (flashSaleRef.current) {
        gsap.from(flashSaleRef.current.children, {
          scrollTrigger: {
            trigger: flashSaleRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          x: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-8">
          {/* Best Selling Column */}
          <div ref={bestSellingRef} className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight" style={{ fontFamily: 'Lobster Two' }}>
                {t('products.bestSelling')}
              </h2>
              <div className="flex items-center space-x-2">
                <button className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-[#9F86D9] hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-[#9F86D9] hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-6">
              {bestSellingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Flash Sale Column */}
          <div ref={flashSaleRef} className="space-y-8">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight" style={{ fontFamily: 'Lobster Two' }}>
                {t('products.flashSale')}
              </h2>
              <div className="flex items-center space-x-2">
                <button className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-[#9F86D9] hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-[#9F86D9] hover:text-[#9F86D9]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-6">
              {flashSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSelling;
