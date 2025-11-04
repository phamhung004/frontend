import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
  const { t } = useTranslation();
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate hero image - scale and fade in
      if (heroImageRef.current) {
        gsap.from(heroImageRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        });

        // Hover effect for hero image
        const img = heroImageRef.current;
        img.addEventListener('mouseenter', () => {
          gsap.to(img, {
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
        img.addEventListener('mouseleave', () => {
          gsap.to(img, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          });
        });
      }

      // Animate content - slide in from left
      if (heroContentRef.current) {
        gsap.from(heroContentRef.current.children, {
          x: -50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          delay: 0.3,
        });
      }

      // Animate badge - bounce in
      if (badgeRef.current) {
        gsap.from(badgeRef.current, {
          scale: 0,
          rotation: -180,
          opacity: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
          delay: 0.5,
        });

        // Hover effect for badge
        const badge = badgeRef.current;
        badge.addEventListener('mouseenter', () => {
          gsap.to(badge, {
            scale: 1.1,
            rotation: 5,
            duration: 0.3,
            ease: 'back.out(1.7)',
          });
        });
        badge.addEventListener('mouseleave', () => {
          gsap.to(badge, {
            scale: 1,
            rotation: 0,
            duration: 0.3,
            ease: 'power2.out',
          });
        });
      }

      // Animate buttons - fade in from bottom
      if (buttonsRef.current) {
        gsap.from(buttonsRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
          delay: 1,
        });

        // Hover effects for buttons
        const buttons = buttonsRef.current.querySelectorAll('button, a');
        buttons.forEach((button) => {
          button.addEventListener('mouseenter', () => {
            gsap.to(button, {
              y: -3,
              duration: 0.3,
              ease: 'power2.out',
            });
          });
          button.addEventListener('mouseleave', () => {
            gsap.to(button, {
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            });
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative bg-[#E3CEE3] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[436px] md:min-h-[708px]">
          {/* Left Side - Image (Hidden on mobile, shown above content on desktop) */}
          <div className="relative hidden md:flex items-center justify-center">
            <img 
              ref={heroImageRef}
              // src="/images/hero-baby.png" 
              src="/images/banner.webp" 
              alt="Baby wearing winter clothes" 
              className="w-full max-w-[600px] h-auto object-contain rounded-[32px]"
            />
          </div>

          {/* Right Side - Content */}
          <div className="relative flex flex-col items-start space-y-4 md:space-y-6 py-8 md:pr-8">
            {/* Mobile Image Background - Only on mobile */}
            <div className="absolute inset-0 md:hidden">
              <div className="w-full h-[264px] bg-[#EFF2F3]">
                {/* Placeholder for mobile hero image */}
              </div>
            </div>

            {/* Content Container - Positioned below image on mobile */}
            <div className="relative z-10 mt-[282px] md:mt-0 w-full max-w-[372px] md:max-w-none">
              {/* Special Deals Badge - Top Right */}
              <div ref={badgeRef} className="absolute top-2 right-0 md:self-end border-[1.26px] md:border-4 border-dashed border-[#1C1D1D] bg-[#BFDDDE] p-2 md:p-4 rounded-sm md:rounded w-[58px] h-[61px] md:w-auto md:h-auto">
                <p className="text-[5.87px] md:text-xs font-normal md:font-bold mb-0.5 md:mb-1 text-left leading-[2em]" style={{ fontFamily: 'DM Sans' }}>
                  {t('hero.specialDeals')}
                </p>
                <div className="relative bg-[#EDA62A] px-1.5 md:px-4 py-0.5 md:py-2 rounded-sm md:rounded text-center w-[45px] md:w-auto h-[3px] md:h-auto">
                  {/* Decorative line */}
                </div>
                <p className="text-[6.71px] md:text-[10px] font-bold uppercase mt-1.5 md:mt-0.5 tracking-[0.15em]" style={{ fontFamily: 'DM Sans' }}>
                  {t('hero.upTo')}
                </p>
                <div className="flex items-baseline justify-start md:justify-center">
                  <span className="text-[21px] md:text-[32px] font-bold text-[#9F86D9] leading-none" style={{ fontFamily: 'DM Sans' }}>
                    70
                  </span>
                  <span className="text-[9px] md:text-base font-bold text-[#9F86D9]" style={{ fontFamily: 'DM Sans' }}>
                    %
                  </span>
                </div>
                <p className="text-[6.71px] md:text-[10px] font-bold uppercase tracking-[0.15em]" style={{ fontFamily: 'DM Sans' }}>
                  {t('hero.off')}
                </p>
              </div>

              {/* Main Content */}
              <div ref={heroContentRef} className="space-y-2 md:space-y-4">
                {/* Winter Label */}
                <p className="text-[12.58px] md:text-2xl font-bold text-gray-900 leading-[1.4]" style={{ fontFamily: 'DM Sans' }}>
                  {t('hero.winter')}
                </p>
                
                {/* Sale Off Text */}
                <div className="relative">
                  <h2 className="text-[48.74px] md:text-[80px] font-bold text-white uppercase leading-none tracking-tight" style={{ fontFamily: 'Lobster Two' }}>
                    {t('hero.saleOff')}
                  </h2>
                  <h2 className="absolute top-[2px] left-[2px] text-[48.74px] md:text-[80px] font-bold text-[#9F86D9] uppercase leading-none tracking-tight" style={{ fontFamily: 'Lobster Two' }}>
                    {t('hero.saleOff')}
                  </h2>
                </div>

                {/* Tagline */}
                <h3 className="text-[13.42px] md:text-[28px] font-bold text-gray-900 inline-block tracking-[-0.02em] leading-[1.25]" style={{ fontFamily: 'Lobster Two' }}>
                  {t('hero.tagline')}
                </h3>
                
                {/* Decorative lines */}
                <div className="flex gap-2 pt-2">
                  <div className="w-[39.66px] md:w-[86px] h-[0.61px] md:h-[0.75px] bg-[#9F86D9] mt-2"></div>
                  <div className="w-[86.01px] md:w-[140px] h-[0.61px] md:h-[0.75px] bg-[#9F86D9]"></div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div ref={buttonsRef} className="flex items-center gap-[13.42px] md:gap-6 mt-6 md:mt-8">
                <button className="relative group">
                  <div className="absolute inset-0 bg-white border-[0.84px] md:border-2 border-gray-900 rounded-sm md:rounded transform translate-x-[2.52px] md:translate-x-1 translate-y-[2.52px] md:translate-y-1"></div>
                  <div className="relative bg-white border-[0.84px] md:border-2 border-gray-900 rounded-sm md:rounded px-2.5 md:px-6 py-1.5 md:py-3 font-bold text-[7.55px] md:text-base leading-[1.28] transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" style={{ fontFamily: 'DM Sans' }}>
                    {t('hero.viewAllDeals')}
                  </div>
                </button>
                <a href="#" className="flex items-center gap-1 md:gap-2 font-bold text-[7.55px] md:text-base text-gray-900 hover:text-[#9F86D9] leading-[1.28]" style={{ fontFamily: 'DM Sans' }}>
                  <span>{t('hero.learnMore')}</span>
                  <svg className="w-[8.39px] md:w-5 h-[8.39px] md:h-5" fill="none" stroke="currentColor" strokeWidth="0.84" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Decorative Leaf Icon - Desktop only */}
            <div className="absolute bottom-8 right-16 hidden md:block">
              <svg className="w-16 h-16 text-gray-400 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.09 2.82c-2.23-.38-4.28.31-6.09 1.87-1.81-1.56-3.86-2.25-6.09-1.87C2.08 3.26.44 5.76.15 8.84c-.48 5.05 3.31 9.36 7.87 12.97.89.71 1.9 1.19 2.98 1.19s2.09-.48 2.98-1.19c4.56-3.61 8.35-7.92 7.87-12.97-.29-3.08-1.93-5.58-4.76-6.02z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Dots - Bottom Left - Desktop only */}
      <div className="absolute bottom-8 left-8 hidden md:block">
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#9F86D9]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white opacity-50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-white opacity-50"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
