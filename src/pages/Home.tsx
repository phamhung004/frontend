import Hero from '../components/Hero';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import PromoBanners from '../components/PromoBanners';
import BestSelling from '../components/BestSelling';
import BlogSection from '../components/BlogSection';
import InstagramFeed from '../components/InstagramFeed';

const Home = () => {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <PromoBanners />
      <BestSelling />
      <BlogSection />
      <InstagramFeed />
    </>
  );
};

export default Home;
