import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PromoBanners = () => {
  const topBannersRef = useRef<HTMLDivElement>(null);
  const bottomBannersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate top banners
      if (topBannersRef.current) {
        gsap.from(topBannersRef.current.children, {
          scrollTrigger: {
            trigger: topBannersRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          scale: 0.9,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
        });
      }

      // Animate bottom banners
      if (bottomBannersRef.current) {
        gsap.from(bottomBannersRef.current.children, {
          scrollTrigger: {
            trigger: bottomBannersRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
        });
      }

      // Add hover effects for all banners
      const allBanners = document.querySelectorAll('.promo-banner');
      allBanners.forEach((banner) => {
        const img = banner.querySelector('img');
        const button = banner.querySelector('button');
        
        banner.addEventListener('mouseenter', () => {
          gsap.to(banner, {
            scale: 1.02,
            y: -5,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            duration: 0.4,
            ease: 'power2.out',
          });
          if (img) {
            gsap.to(img, {
              scale: 1.1,
              duration: 0.6,
              ease: 'power2.out',
            });
          }
          if (button) {
            gsap.to(button, {
              scale: 1.1,
              y: -2,
              duration: 0.3,
              ease: 'back.out(1.7)',
            });
          }
        });
        
        banner.addEventListener('mouseleave', () => {
          gsap.to(banner, {
            scale: 1,
            y: 0,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            duration: 0.4,
            ease: 'power2.out',
          });
          if (img) {
            gsap.to(img, {
              scale: 1,
              duration: 0.6,
              ease: 'power2.out',
            });
          }
          if (button) {
            gsap.to(button, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          }
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div ref={topBannersRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Banner 1 - Cute Animals Toys */}
          <div className="promo-banner relative border-3 border-[#9DD2D8] rounded-lg overflow-hidden h-[180px] sm:h-[200px] lg:h-[230px]">
            <img 
              src="/images/banner-toys.png" 
              alt="Cute Animals Toys" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl sm:text-2xl lg:text-[32px] font-bold font-lobster text-[#E35946] mb-1 sm:mb-2">
                Dụng cụ học tập cute
              </h3>
              <p className="text-xs sm:text-sm text-gray-900 mb-2 sm:mb-4 max-w-xs line-clamp-2">
                Bộ sưu tập đồ chơi động vật dễ thương làm bé yêu của bạn vui vẻ
              </p>
              <button className="bg-[#9F86D9] text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#8A71C7] transition-colors">
                MUA NGAY
              </button>
            </div>
          </div>

          {/* Banner 2 - Bunny Outfit */}
          <div className="promo-banner relative bg-[#A0DDF8] rounded-lg overflow-hidden h-[180px] sm:h-[200px] lg:h-[230px]">
            <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl lg:text-[32px] font-bold font-lobster text-gray-900 mb-1 sm:mb-2">
                  Bút tô màu
                </h3>
                <p className="text-xs sm:text-sm text-gray-900 mb-2 sm:mb-4">
                  Thiết kế dành riêng cho bé
                </p>
                <button className="bg-[#9F86D9] text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#8A71C7] transition-colors">
                  MUA NGAY
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Small Promo Banners */}
        <div ref={bottomBannersRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6 lg:mt-8">
          {/* Kids Dress Banner */}
          <div className="promo-banner relative bg-gray-100 rounded-lg overflow-hidden h-[220px] sm:h-[250px] lg:h-[284px]">
            <img 
              src="/images/promo-dress.png" 
              alt="Kids Dress" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-10 p-5 sm:p-7 lg:p-9">
              <h3 className="text-xl sm:text-2xl lg:text-[32px] font-bold font-lobster text-gray-900 mb-1 sm:mb-2">
                Đồ chơi học tập
              </h3>
              <p className="text-sm sm:text-base text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                Nhận thêm 30% giảm giá
              </p>
              <button className="bg-[#9F86D9] text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#8A71C7] transition-colors">
                MUA NGAY
              </button>
            </div>
          </div>

          {/* Girls Apparels Banner */}
          <div className="promo-banner relative bg-[#C2E9FF] rounded-lg overflow-hidden h-[220px] sm:h-[250px] lg:h-[284px]">
            <img 
              src="/images/promo-apparels.png" 
              alt="Girls Apparels" 
              className="absolute right-0 bottom-0 h-full object-cover"
            />
            <div className="relative z-10 p-5 sm:p-7 lg:p-9">
              <h3 className="text-xl sm:text-2xl lg:text-[32px] font-bold font-lobster text-gray-900 mb-1 sm:mb-2">
                Vở tô màu 
              </h3>
              <p className="text-sm sm:text-base text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                Nhận thêm 50% giảm giá
              </p>
              <button className="bg-[#9F86D9] text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#8A71C7] transition-colors">
                MUA NGAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanners;
