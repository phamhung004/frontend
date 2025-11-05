import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BlogSection = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const blogGridRef = useRef<HTMLDivElement>(null);

  const blogPosts = [
    {
      id: 1,
      date: { day: '16', month: 'Th6' },
      title: "5 Đồ Chơi Giáo Dục Montessori Tốt Nhất Cho Trẻ Từ 1-3 Tuổi",
      excerpt: "Khám phá 5 đồ chơi Montessori giúp phát triển kỹ năng vận động tinh, tư duy logic và khả năng sáng tạo cho bé yêu của bạn",
      image: '/images/mauacrylic.webp',
      featured: true,
    },
    {
      id: 2,
      date: { day: '21', month: 'Th6' },
      title: 'Cách Chọn Đồ Chơi Phù Hợp Với Từng Độ Tuổi: Hướng Dẫn Chi Tiết',
      excerpt: 'Tìm hiểu cách lựa chọn đồ chơi an toàn, phù hợp với từng giai đoạn phát triển của trẻ để tối ưu hóa khả năng học tập và vui chơi',
      image: '/images/stitch.webp',
      featured: false,
    },
    {
      id: 3,
      date: { day: '25', month: 'Th6' },
      title: 'Xu Hướng Đồ Chơi Giáo Dục STEM 2024: Top 10 Sản Phẩm Nổi Bật',
      excerpt: "Cập nhật xu hướng đồ chơi STEM mới nhất năm 2024 giúp trẻ phát triển tư duy khoa học, công nghệ và toán học một cách vui nhộn",
      image: '/images/khoinamcham.webp',
      featured: true,
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate header
      if (headerRef.current) {
        gsap.from(headerRef.current.children, {
          scrollTrigger: {
            trigger: headerRef.current,
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

      // Animate blog cards
      if (blogGridRef.current) {
        gsap.from(blogGridRef.current.children, {
          scrollTrigger: {
            trigger: blogGridRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 80,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
        });

        // Add hover effects for blog cards
        const blogCards = blogGridRef.current.querySelectorAll('.blog-card');
        blogCards.forEach((card) => {
          const img = card.querySelector('.blog-image');
          const badge = card.querySelector('.blog-badge');
          
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              y: -15,
              duration: 0.4,
              ease: 'power2.out',
            });
            if (img) {
              gsap.to(img, {
                scale: 1.1,
                duration: 0.5,
                ease: 'power2.out',
              });
            }
            if (badge) {
              gsap.to(badge, {
                scale: 1.1,
                y: -5,
                duration: 0.3,
                ease: 'back.out(1.7)',
              });
            }
          });
          
          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
            });
            if (img) {
              gsap.to(img, {
                scale: 1,
                duration: 0.5,
                ease: 'power2.out',
              });
            }
            if (badge) {
              gsap.to(badge, {
                scale: 1,
                y: 0,
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
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight mb-3 sm:mb-4" style={{ fontFamily: 'Lobster Two' }}>
            Tin Tức và Sự Kiện Mới Nhất
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500 max-w-lg mx-auto px-4">
            Đừng bỏ lỡ những tin tức khuyến mãi hấp dẫn hoặc sự kiện sắp diễn ra trong hệ thống cửa hàng của chúng tôi
          </p>
        </div>

        {/* Blog Grid */}
        <div ref={blogGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="blog-card group">
              {/* Blog Image */}
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-6 h-48 sm:h-64 lg:h-[336px]">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="blog-image w-full h-full object-cover"
                />
                
                {/* Date Badge */}
                <div className="blog-badge absolute top-3 left-3 sm:top-4 sm:left-4 bg-white rounded px-3 py-1.5 sm:px-4 sm:py-2 text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#9F86D9]">{post.date.day}</div>
                  <div className="text-xs sm:text-sm lg:text-base text-gray-900">{post.date.month}</div>
                </div>
              </div>

              {/* Blog Content */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${post.featured ? 'text-[#9F86D9]' : 'text-gray-900'} leading-tight line-clamp-2`}>
                  {post.title}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-500 line-clamp-2 sm:line-clamp-3">
                  {post.excerpt}
                </p>
                <a 
                  href="#" 
                  className={`inline-flex items-center space-x-2 sm:space-x-3 font-bold text-sm sm:text-base lg:text-lg ${
                    post.featured ? 'text-[#9F86D9]' : 'text-gray-900'
                  }`}
                >
                  <span>Đọc tiếp</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
