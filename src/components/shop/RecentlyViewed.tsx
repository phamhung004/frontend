import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';

const RecentlyViewed = () => {
  const navigate = useNavigate();

  // Use the same recommended items data as the sidebar in ProductDetail
  const products = [
    { id: 1, name: 'Tô màu chú chó Labrador dễ thương', price: 56.4, image: '/images/tomaucho.webp', badge: undefined },
    { id: 2, name: 'Bảng chữ cái viết thường tiếng việt', price: 253.0, image: '/images/bangchucai.webp', badge: undefined },
    { id: 3, name: 'Kéo Capybara an toàn cho bé', price: 150.6, image: '/images/keocapi.webp', badge: undefined },
    { id: 4, name: 'Bảng cửu chương cho bé', price: 253.0, image: '/images/bangcuuchuong.webp', badge: undefined },

  ];

  return (
    <section className="py-16 border-t border-gray-200">
      <div className="max-w-[1434px] mx-auto px-4">
        <h2 className="text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight mb-8">
          Sản phẩm nổi bật
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
