

import InstagramFeed from '../components/InstagramFeed';
import ShopHeader from '../components/shop/ShopHeader';
import ShopSidebar from '../components/shop/ShopSidebar';
import RecentlyViewed from '../components/shop/RecentlyViewed';
import ProductGrid from '../components/shop/ProductGrid';
import { ShopProvider } from '../contexts/ShopContext';

const Shop = () => {
  return (
    <ShopProvider>
      <div className="min-h-screen bg-white">
        <ShopHeader />
        
        <div className="max-w-[1434px] mx-auto px-4 py-16">
          <div className="flex gap-8">
            {/* Sidebar */}
            <ShopSidebar />
            
            {/* Main Content */}
            <ProductGrid/>
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
