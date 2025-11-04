import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const alertStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    message: 'text-green-700',
    IconComponent: CheckCircle,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    message: 'text-red-700',
    IconComponent: XCircle,
  },
  warning: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
    title: 'text-orange-900',
    message: 'text-orange-700',
    IconComponent: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    message: 'text-blue-700',
    IconComponent: Info,
  },
};

export default function Alert({ type, title, message, onClose, className = '' }: AlertProps) {
  const style = alertStyles[type];
  const IconComponent = style.IconComponent;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${style.bg} ${style.border} ${className}`}>
      <IconComponent className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={`font-bold text-sm ${style.title} mb-1`}>
            {title}
          </h4>
        )}
        <p className={`text-sm ${style.message} leading-relaxed`}>
          {message}
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
