import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import Toast from './Toast';
import type { ToastType, ToastProps } from './Toast';

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('success', title, message, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('error', title, message, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('warning', title, message, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) => {
      showToast('info', title, message, duration);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
