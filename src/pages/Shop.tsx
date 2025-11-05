

import { useState } from 'react';
import InstagramFeed from '../components/InstagramFeed';
import ShopHeader from '../components/shop/ShopHeader';
import ShopSidebar from '../components/shop/ShopSidebar';
import RecentlyViewed from '../components/shop/RecentlyViewed';
import ProductGrid from '../components/shop/ProductGrid';
import { ShopProvider } from '../contexts/ShopContext';

const Shop = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <ShopProvider>
      <div className="min-h-screen bg-white">
        <ShopHeader />
        
        <div className="max-w-[1434px] mx-auto px-4 py-6 sm:py-10 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar */}
            <ShopSidebar 
              isOpen={isFilterOpen} 
              onClose={() => setIsFilterOpen(false)} 
            />
            
            {/* Main Content */}
            <ProductGrid onFilterClick={() => setIsFilterOpen(true)} />
          </div>
        </div>

        {/* Recently Viewed Section */}
        <RecentlyViewed />
        
        {/* Popular Brands */}
        {/* <PopularBrands /> */}
        
        {/* Instagram Feed */}
        <InstagramFeed />
      </div>
    </ShopProvider>
  );
};

export default Shop;
