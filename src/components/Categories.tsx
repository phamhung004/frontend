import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Categories = () => {
  const { t, i18n } = useTranslation();

  // Keys for categories (keeps translations reactive)
  const categoryKeys = [
    'categories.girlsClothing',
    'categories.boysClothing',
    'categories.accessories',
  ];

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  const updateUnderline = (index = activeIndex) => {
    const wrapper = wrapperRef.current;
    const btn = buttonRefs.current[index];
    if (!wrapper || !btn) {
      setUnderline({ left: 0, width: 0 });
      return;
    }

    const wrapperRect = wrapper.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const left = btnRect.left - wrapperRect.left;
    setUnderline({ left, width: btnRect.width });
  };

  useEffect(() => {
    updateUnderline();
    const onResize = () => updateUnderline(activeIndex);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
    // Recalculate when language changes or active index changes
  }, [activeIndex, i18n.language]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate category buttons on scroll
      if (buttonRefs.current.length > 0) {
        gsap.from(buttonRefs.current, {
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          y: 50,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power2.out',
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center">
          {/* Category Navigation */}
          <div ref={wrapperRef} className="relative w-full flex items-center justify-center">
            <div className="flex items-center space-x-8 mb-2">
              {categoryKeys.map((key, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={key}
                    ref={(el) => { buttonRefs.current[idx] = el; }}
                    onClick={() => setActiveIndex(idx)}
                    aria-pressed={isActive}
                    className={`text-[22px] font-bold font-lobster px-1 pb-3 transition-colors focus:outline-none ${
                      isActive ? 'text-[#9F86D9]' : 'text-[#1C1D1D] hover:text-[#9F86D9]'
                    }`}
                  >
                    {t(key)}
                  </button>
                );
              })}
            </div>

            {/* Sliding underline positioned based on active button */}
            <span
              aria-hidden
              className={`absolute bottom-0 h-[3px] bg-[#9F86D9] rounded transition-all duration-300`}
              style={{ left: underline.left, width: underline.width }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
