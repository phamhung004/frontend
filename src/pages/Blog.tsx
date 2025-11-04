import { useState } from 'react';
import InstagramFeed from '../components/InstagramFeed';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  views: string;
}

const Blog = () => {
  const [currentPage] = useState(1);

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Styling Children for Formal Events: Tips for Dressing to Impress",
      excerpt: "If you're looking for some inspiration to dress up your child, you've come to the right place! Check out our top 10 picks for adorable outfits that will make your little fashionista stand out.",
      image: "/images/blog-1.png",
      category: "Kids' Outfits",
      date: "August 30, 2022",
      readTime: "4 Mins read",
      views: "520 views"
    },
    {
      id: 2,
      title: "From Cute to Cool: Transforming Your Baby's Wardrobe as They Grow",
      excerpt: "If you're looking for some inspiration to dress up your child, you've come to the right place! Check out our top 10 picks for adorable outfits that will make your little fashionista stand out.",
      image: "/images/blog-2.png",
      category: "Fashion Trends",
      date: "August 30, 2022",
      readTime: "4 Mins read",
      views: "520 views"
    },
    {
      id: 3,
      title: "Gender-Neutral Fashion for Kids: Breaking Down Stereotypes",
      excerpt: "If you're looking for some inspiration to dress up your child, you've come to the right place! Check out our top 10 picks for adorable outfits that will make your little fashionista stand out.",
      image: "/images/blog-3.png",
      category: "Favorite Brands",
      date: "August 30, 2022",
      readTime: "4 Mins read",
      views: "520 views"
    },
    {
      id: 4,
      title: "Product Review: Best Sunscreen for Kids' Sensitive Skin",
      excerpt: "If you're looking for some inspiration to dress up your child, you've come to the right place! Check out our top 10 picks for adorable outfits that will make your little fashionista stand out.",
      image: "/images/blog-4.png",
      category: "Trends",
      date: "August 30, 2022",
      readTime: "4 Mins read",
      views: "520 views"
    }
  ];

  const categories = [
    { name: "Fashion Trends", count: 136 },
    { name: "Kids' Outfits", count: 25 },
    { name: "Styling Tips", count: 48 },
    { name: "Favorite Brands", count: 164 },
    { name: "Best Deals Online", count: 18 }
  ];

  const featurePosts = [
    { id: 1, category: "Fashion", title: "Styling Children for Formal Events: Tips for Dressing to Impress", image: "/images/feature-1.png" },
    { id: 2, category: "Trend", title: "The Importance of Sustainable Fashion for Children", image: "/images/feature-2.png" },
    { id: 3, category: "Tips", title: "5 Creative Halloween Costume Ideas for Kids", image: "/images/feature-3.png" },
    { id: 4, category: "events", title: "How to Dress Your Kid for Winter: Tips and Ideas", image: "/images/feature-4.png" }
  ];

  const tags = ["Top Rated", "Outfits", "T-Shirts", "Boy Shirts", "Boy Tanks", "Shoes", "Boys Denim", "Toddler Boys", "Boy Swimwear", "Boys Interior"];

  const archives = [
    { month: "October 2022", count: 136 },
    { month: "November 2022", count: 25 },
    { month: "December 2022", count: 48 },
    { month: "January 2023", count: 164 },
    { month: "February 2023", count: 18 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Title Section */}
      <div className="bg-[#EEF9FF] py-24 relative overflow-hidden">
        <div className="max-w-[1434px] mx-auto px-4 text-center relative z-10">
          <h1 className="text-[64px] font-bold text-[#1C1D1D] mb-6">Our Blog</h1>
          <div className="flex items-center justify-center gap-3 text-base">
            <a href="/" className="text-[#9F86D9] hover:underline">Home</a>
            <span className="text-[#646667]"></span>
            <span className="text-[#646667]">Blog</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1434px] mx-auto px-4 py-16">
        <div className="flex gap-20">
          {/* Blog Posts */}
          <div className="flex-1">
            <div className="space-y-12">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded overflow-hidden">
                  {/* Image */}
                  <div className="relative h-[513px] bg-[#EFF2F3] mb-6 rounded overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 right-6">
                      <span className="inline-block px-5 py-1.5 bg-[#9F86D9] text-white text-sm rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h2 className="text-[42px] font-bold text-[#1C1D1D] leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-lg text-[#1C1D1D] leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-8 text-sm text-[#646667]">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                      <span>{post.views}</span>
                    </div>

                    {/* Read More */}
                    <a 
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center gap-3 text-sm font-bold text-[#9F86D9] hover:underline"
                    >
                      <span>Keep reading</span>
                      <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                        <path d="M0 1h16" stroke="#9F86D9" strokeWidth="1"/>
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-6 mt-12">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-[#9F86D9] rounded-full"></div>
                <span className="absolute inset-0 flex items-center justify-center text-white font-medium">
                  {currentPage}
                </span>
              </div>
              <button className="text-[#1C1D1D] font-medium hover:text-[#9F86D9]">2</button>
              <button className="text-[#1C1D1D] font-medium hover:text-[#9F86D9]">3</button>
              <button className="text-[#1C1D1D] font-medium hover:text-[#9F86D9]">4</button>
              <button className="text-[#1C1D1D] hover:text-[#9F86D9]"></button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[410px] space-y-8">
            {/* Categories */}
            <div className="bg-white border border-[#DBE2E5] rounded shadow-sm p-12">
              <div className="mb-7">
                <h3 className="text-3xl font-bold text-[#1C1D1D] mb-2">Categories</h3>
                <div className="w-full h-px bg-[#DBE2E5]"></div>
              </div>
              <div className="space-y-2.5">
                {categories.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xl text-[#1C1D1D]">{cat.name}</span>
                    <span className="px-2 py-1 bg-[#EFF2F3] text-[13px] text-[#1C1D1D] rounded">
                      {cat.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Posts */}
            <div className="bg-white border border-[#DBE2E5] rounded shadow-sm p-12">
              <div className="mb-7">
                <h3 className="text-3xl font-bold text-[#1C1D1D] mb-2">Feature Posts</h3>
                <div className="w-full h-px bg-[#DBE2E5]"></div>
              </div>
              <div className="space-y-5">
                {featurePosts.map((post) => (
                  <div key={post.id} className="flex gap-3.5">
                    <div className="w-[106px] h-[97px] bg-[#EFF2F3] rounded flex-shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover rounded" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#9F86D9] uppercase tracking-wider">
                        {post.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#1C1D1D] leading-tight mt-1">
                        {post.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white border border-[#DBE2E5] rounded shadow-sm p-12">
              <div className="mb-7">
                <h3 className="text-3xl font-bold text-[#1C1D1D] mb-2">Tags</h3>
                <div className="w-full h-px bg-[#DBE2E5]"></div>
              </div>
              <div className="space-y-2.5">
                <div className="flex flex-wrap gap-2.5">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-5 py-1.5 text-sm rounded-full ${
                        index === 0
                          ? 'bg-[#9F86D9] text-white'
                          : 'bg-white border border-[#DBE2E5] text-[#1C1D1D] hover:bg-[#9F86D9] hover:text-white hover:border-[#9F86D9]'
                      } transition-colors cursor-pointer`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="bg-white border border-[#DBE2E5] rounded shadow-sm p-12">
              <div className="mb-7">
                <h3 className="text-3xl font-bold text-[#1C1D1D] mb-2">Gallery</h3>
                <div className="w-full h-px bg-[#DBE2E5]"></div>
              </div>
              <div className="grid grid-cols-3 gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <div key={i} className="w-[100px] h-[100px] bg-[#EFF2F3]">
                    <img 
                      src={`/images/gallery-${i}.png`} 
                      alt={`Gallery ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Archives */}
            <div className="bg-white border border-[#DBE2E5] rounded shadow-sm p-12">
              <div className="mb-7">
                <h3 className="text-3xl font-bold text-[#1C1D1D] mb-2">Archives</h3>
                <div className="w-full h-px bg-[#DBE2E5]"></div>
              </div>
              <div className="space-y-2.5">
                {archives.map((archive, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xl text-[#1C1D1D]">{archive.month}</span>
                    <span className="px-2 py-1 bg-[#EFF2F3] text-[13px] text-[#1C1D1D] rounded">
                      {archive.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-[#BFDDDE] border-t-[3px] border-dashed border-[#EDA62A] py-20">
        <div className="max-w-[1189px] mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[32px] font-bold text-[#EDA62A] leading-tight mb-5">
                Sing up and get up to 25% off<br />your first purchase
              </h2>
              <p className="text-base text-[#1C1D1D]">
                Receive offter, product alerts, styling inspiration and more. By signing up, you agree to our Privace Policy
              </p>
            </div>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-[368px] h-[42px] px-5 border border-[#DBE2E5] rounded-l text-base focus:outline-none focus:border-[#9F86D9]"
              />
              <button className="px-6 h-[42px] bg-[#9F86D9] text-white font-bold text-sm rounded-r hover:bg-[#8a75c4] transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instagram Feed */}
      <InstagramFeed />
    </div>
  );
};

export default Blog;
