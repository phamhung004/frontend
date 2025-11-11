import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Home Icon */}
      <Link 
        to="/" 
        className="text-gray-500 hover:text-brand-purple transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            
            {isLast || !item.path ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="text-gray-500 hover:text-brand-purple transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
