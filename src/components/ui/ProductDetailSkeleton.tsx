import Skeleton from './Skeleton';

const ProductDetailSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          <Skeleton width="100%" height="500px" className="rounded-lg" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height="100px" className="rounded" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Breadcrumb */}
          <Skeleton width="300px" height="16px" />
          
          {/* Title */}
          <Skeleton width="80%" height="32px" />
          
          {/* Rating and Reviews */}
          <div className="flex items-center gap-4">
            <Skeleton width="120px" height="20px" />
            <Skeleton width="100px" height="20px" />
          </div>
          
          {/* Price */}
          <div className="space-y-2">
            <Skeleton width="200px" height="36px" />
            <Skeleton width="150px" height="20px" />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Skeleton width="100%" height="16px" />
            <Skeleton width="95%" height="16px" />
            <Skeleton width="90%" height="16px" />
          </div>
          
          {/* Variants */}
          <div className="space-y-3">
            <Skeleton width="100px" height="20px" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="80px" height="40px" className="rounded" />
              ))}
            </div>
          </div>
          
          {/* Quantity and Actions */}
          <div className="space-y-3">
            <Skeleton width="150px" height="48px" />
            <div className="flex gap-3">
              <Skeleton width="60%" height="48px" />
              <Skeleton width="48px" height="48px" />
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="space-y-2 pt-4 border-t">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width="100%" height="20px" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
