import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const InstagramFeed = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const instagramPosts = [
    { id: 1, image: '/images/butlong.webp', likes: 234 },
    { id: 2, image: '/images/bangcuuchuong.webp', likes: 189 },
    { id: 3, image: '/images/giayghichu.webp', likes: 312 },
    { id: 4, image: '/images/10poster.webp', likes: 267 },
    { id: 5, image: '/images/dongvat.webp', likes: 421 },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
        });
      }

      // Animate grid items
      if (gridRef.current) {
        gsap.from(gridRef.current.children, {
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          scale: 0,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        });

        // Add hover effects for instagram posts
        const posts = gridRef.current.querySelectorAll('.insta-post');
        posts.forEach((post) => {
          const img = post.querySelector('img');
          
          post.addEventListener('mouseenter', () => {
            gsap.to(post, {
              scale: 1.05,
              zIndex: 10,
              duration: 0.3,
              ease: 'power2.out',
            });
            if (img) {
              gsap.to(img, {
                scale: 1.2,
                rotation: 2,
                duration: 0.4,
                ease: 'power2.out',
              });
            }
          });
          
          post.addEventListener('mouseleave', () => {
            gsap.to(post, {
              scale: 1,
              zIndex: 1,
              duration: 0.3,
              ease: 'power2.out',
            });
            if (img) {
              gsap.to(img, {
                scale: 1,
                rotation: 0,
                duration: 0.4,
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
    <section className="py-8 sm:py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-6 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight" style={{ fontFamily: 'Lobster Two' }}>
            instagram feed
          </h2>
        </div>

        {/* Instagram Grid */}
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 sm:gap-2">
          {instagramPosts.map((post) => (
            <div key={post.id} className="insta-post group relative aspect-square overflow-hidden">
              <img 
                src={post.image} 
                alt={`Instagram post ${post.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-2 text-white">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm sm:text-base font-bold">{post.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
