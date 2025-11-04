import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export type ConfirmType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  isLoading?: boolean;
}

const confirmStyles = {
  danger: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    iconBg: 'bg-red-100',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    IconComponent: AlertTriangle,
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
    button: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
    IconComponent: AlertCircle,
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    button: 'bg-[#9F86D9] hover:bg-[#8B72C5] focus:ring-[#9F86D9]',
    IconComponent: Info,
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    IconComponent: CheckCircle,
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const style = confirmStyles[type];
  const IconComponent = style.IconComponent;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center mb-4`}>
            <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8">
            {title}
          </h3>

          {/* Message */}
          <div className="text-gray-600 text-sm leading-relaxed mb-6">
            {message}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${style.button}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
