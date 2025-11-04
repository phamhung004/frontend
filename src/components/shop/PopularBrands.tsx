const PopularBrands = () => {
  // Using placeholder images - you can replace with actual brand logos
  const brands = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10]
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1434px] mx-auto px-4">
        <h2 className="text-[32px] font-bold uppercase text-[#9F86D9] tracking-tight text-center mb-12">
          Popular brands
        </h2>

        <div className="flex flex-col gap-12">
          {brands.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center items-center gap-12">
              {row.map((brand) => (
                <div
                  key={brand}
                  className="w-[200px] h-[100px] flex items-center justify-center bg-gray-50 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <img
                    src={`/images/brand-${brand}.png`}
                    alt={`Brand ${brand}`}
                    className="max-w-[160px] max-h-[80px] object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularBrands;
