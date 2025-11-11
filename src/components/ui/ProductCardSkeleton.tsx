import Skeleton from './Skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Image skeleton */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Skeleton width="100%" height="100%" className="absolute inset-0" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Skeleton width="60%" height="12px" />
        
        {/* Title */}
        <Skeleton width="90%" height="16px" />
        <Skeleton width="70%" height="16px" />
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width="80px" height="12px" />
          <Skeleton variant="rectangular" width="40px" height="12px" />
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton width="80px" height="20px" />
          <Skeleton variant="rectangular" width="36px" height="36px" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
