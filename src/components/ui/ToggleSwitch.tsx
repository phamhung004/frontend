import { useState } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleSwitch = ({ 
  checked, 
  onChange, 
  disabled = false, 
  label,
  size = 'md'
}: ToggleSwitchProps) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (disabled || isToggling) return;
    
    setIsToggling(true);
    try {
      await onChange(!checked);
    } finally {
      setIsToggling(false);
    }
  };

  // Size configurations
  const sizes = {
    sm: {
      track: 'w-9 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-4'
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className={`text-gray-700 font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled || isToggling}
        onClick={handleToggle}
        className={`
          ${currentSize.track}
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2
          ${disabled || isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked ? 'bg-brand-purple' : 'bg-gray-300'}
        `}
      >
        <span className="sr-only">Toggle switch</span>
        <span
          className={`
            ${currentSize.thumb}
            inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
            ${checked ? currentSize.translate : 'translate-x-0.5'}
            ${isToggling ? 'opacity-70' : ''}
          `}
        >
          {isToggling && (
            <svg 
              className="w-full h-full animate-spin text-brand-purple" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};

export default ToggleSwitch;
