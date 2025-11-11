import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = ({ 
  variant = 'rectangular', 
  width, 
  height, 
  animation = 'pulse',
  className = '',
  style,
  ...props 
}: SkeletonProps) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const inlineStyles = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};

export default Skeleton;
