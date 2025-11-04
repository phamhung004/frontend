import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
        {/* Header */}
        <div className={`flex items-start gap-3 p-6 border-b-2 ${style.border}`}>
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.bg} flex items-center justify-center`}>
            <svg
              className={`w-6 h-6 ${style.icon}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
