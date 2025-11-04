import { useState, useCallback } from 'react';
import ConfirmModal from './ConfirmModal';
import type { ConfirmType } from './ConfirmModal';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const [resolveFunc, setResolveFunc] = useState<((value: boolean) => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolveFunc(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    if (resolveFunc) {
      resolveFunc(true);
    }
    setTimeout(() => {
      setIsOpen(false);
      setIsLoading(false);
      setResolveFunc(null);
    }, 300);
  }, [resolveFunc]);

  const handleCancel = useCallback(() => {
    if (resolveFunc) {
      resolveFunc(false);
    }
    setIsOpen(false);
    setResolveFunc(null);
  }, [resolveFunc]);

  const ConfirmDialog = useCallback(
    () => (
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
        isLoading={isLoading}
      />
    ),
    [isOpen, options, isLoading, handleCancel, handleConfirm]
  );

  return { confirm, ConfirmDialog };
}
