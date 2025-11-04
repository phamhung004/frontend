import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

const RecentlyViewed = () => {
  const navigate = useNavigate();

  const products = [
    { id: 1, name: 'Petite Plaid Skirt', price: 658.0, image: '/images/product-7.png', badge: 'Hot' },
    { id: 2, name: 'Tiny Tulle Skirt', price: 35.62, image: '/images/product-2.png', badge: 'Hot' },
    { id: 3, name: 'Tiny Tuxedo Shirt', price: 75.86, image: '/images/product-1.png', badge: 'Hot' },
    { id: 4, name: 'Baby Bow Tie Romper', price: 12.53, image: '/images/product-3.png', badge: 'Hot' },
  ];

  return (
    <section className="py-16 border-t border-gray-200">
      <div className="max-w-[1434px] mx-auto px-4">
        <h2 className="text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight mb-8">
          Recently Viewed Products
        </h2>

        <div className="grid grid-cols-4 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-[397px] object-cover"
                />
                {product.badge && (
                  <div className="absolute top-5 left-5 bg-[#EDA62A] text-white text-xs font-bold px-4 py-1.5 rounded">
                    {product.badge}
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-[#9F86D9] text-lg">{formatCurrency(product.price)}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
