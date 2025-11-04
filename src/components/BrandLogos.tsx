const BrandLogos = () => {
  const brands = [
    { id: 1, name: 'Brand 1', logo: '/images/brand-1.png' },
    { id: 2, name: 'Brand 2', logo: '/images/brand-2.png' },
    { id: 3, name: 'Brand 3', logo: '/images/brand-3.png' },
    { id: 4, name: 'Brand 4', logo: '/images/brand-4.png' },
    { id: 5, name: 'Brand 5', logo: '/images/brand-5.png' },
    { id: 6, name: 'Brand 6', logo: '/images/brand-6.png' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight">
            Popular brands
          </h2>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-5 gap-12 items-center justify-items-center">
          {brands.slice(0, 5).map((brand) => (
            <div key={brand.id} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="h-16 w-auto object-contain"
              />
            </div>
          ))}
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-5 gap-12 items-center justify-items-center mt-16">
          {brands.slice(0, 5).map((brand) => (
            <div key={`row2-${brand.id}`} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100">
              <img 
                src={brand.logo} 
                alt={`${brand.name} row 2`}
                className="h-16 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandLogos;
