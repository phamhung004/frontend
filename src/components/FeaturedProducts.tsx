import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../utils/currency';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const products = [
    {
      id: 1,
      name: 'Bộ tranh tô màu chủ đề Stitch dễ thương khổ A5 – đồ chơi giấy cho bé',
      price: 185.0,
      originalPrice: 196.0,
      rating: 5,
      image: '/images/stitch.webp',
      badge: 'NEW',
    },
    {
      id: 2,
      name: 'Bút lông viết bảng có đầu xóa, Bút tô vẽ xóa thông minh cho bé',
      price: 145.0,
      originalPrice: 160.0,
      rating: 5,
      image: '/images/butlong.webp',
      badge: 'NEW',
    },
    {
      id: 3,
      name: 'Bộ tranh tô màu chibi động vật dễ thương khổ A5 – đồ chơi giấy cho bé',
      price: 125.0,
      originalPrice: 140.0,
      rating: 5,
      image: '/images/dongvat.webp',
      badge: 'NEW',
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate section title
      if (sectionRef.current) {
        gsap.from(sectionRef.current.children, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
        });
      }

      // Animate products
      if (productsRef.current) {
        gsap.from(productsRef.current.children, {
          scrollTrigger: {
            trigger: productsRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
        });

        // Add hover effects for product cards
        const productCards = productsRef.current.querySelectorAll('.product-card');
        productCards.forEach((card) => {
          const img = card.querySelector('img');
          const badge = card.querySelector('.product-badge');
          
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -10,
              duration: 0.3,
              ease: 'power2.out',
            });
            if (img) {
              gsap.to(img, {
                scale: 1.1,
                duration: 0.4,
                ease: 'power2.out',
              });
            }
            if (badge) {
              gsap.to(badge, {
                scale: 1.1,
                rotation: 5,
                duration: 0.3,
                ease: 'back.out(1.7)',
              });
            }
          });
          
          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
            if (img) {
              gsap.to(img, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
              });
            }
            if (badge) {
              gsap.to(badge, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out',
              });
            }
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-4">
        {/* Section Title */}
        <div ref={sectionRef} className="text-center mb-6 md:mb-12 flex flex-col items-center gap-1.5 md:gap-2">
          <h3 className="text-[12.3px] md:text-base font-normal text-[#EDA62A] leading-[1.6] tracking-normal" style={{ fontFamily: 'DM Sans' }}>
            {t('products.newInStore')}
          </h3>
          <h2 className="text-lg md:text-[32px] font-normal md:font-bold uppercase text-[#9F86D9] tracking-tight leading-[1.22]" style={{ fontFamily: 'Lobster Two' }}>
            {t('products.newArrival')}
          </h2>
        </div>

        {/* Products Grid */}
        <div ref={productsRef} className="grid grid-cols-1 md:grid-cols-3 gap-[30px] md:gap-8 max-w-[342px] md:max-w-none mx-auto md:mx-0">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="product-card group cursor-pointer flex flex-col items-center"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {/* Product Image */}
              <div className="relative bg-[#EFF2F3] rounded-lg overflow-hidden mb-4 md:mb-6 w-full md:w-auto">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-[397px] object-cover"
                />
                {product.badge && (
                  <div className="product-badge absolute top-5 left-5 bg-[#EDA62A] text-white text-xs font-bold px-4 py-1.5 rounded-[28px]">
                    {t('products.new')}
                  </div>
                )}
                {/* Hover Icons - Desktop only */}
                <div className="absolute right-5 top-5 hidden md:flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#9F86D9] hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#9F86D9] hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#9F86D9] hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="text-center space-y-2 w-full md:w-auto max-w-[336px] min-w-0">
                <h3 className="text-base md:text-lg font-bold text-gray-900 leading-[1.75] truncate" title={product.name} style={{ fontFamily: 'DM Sans' }}>
                  {product.name}
                </h3>
                
                {/* Rating - Hidden on mobile */}
                <div className="hidden md:flex items-center justify-center space-x-1">
                  {[...Array(product.rating)].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                {/* Price */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-[15px] md:gap-4">
                  <span className="text-lg text-[#9F86D9] leading-[1.67]" style={{ fontFamily: 'DM Sans' }}>
                    {formatCurrency(product.price)}
                  </span>
                  <span className="hidden md:inline text-lg text-gray-500 line-through" style={{ fontFamily: 'DM Sans' }}>
                    {formatCurrency(product.originalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
