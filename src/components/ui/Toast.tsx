import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
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
    IconComponent: AlertCircle,
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

export default function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const style = toastStyles[type];
  const IconComponent = style.IconComponent;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${style.bg} ${style.border} shadow-lg animate-slideInRight`}
      style={{ minWidth: '320px', maxWidth: '420px' }}
    >
      <IconComponent className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
      
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-sm ${style.title} mb-0.5`}>
          {title}
        </h4>
        {message && (
          <p className={`text-sm ${style.message} leading-snug`}>
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
