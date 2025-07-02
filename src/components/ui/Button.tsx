import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed touch-target',
          
          // Variant styles
          {
            // Primary Button - Pink accent
            'bg-pink-500 hover:bg-pink-400 text-white font-semibold shadow-lg shadow-pink-500/25 hover:scale-105 rounded-lg': variant === 'primary',
            
            // Secondary Button - Slate
            'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-medium rounded-md': variant === 'secondary',
            
            // Danger Button - Red
            'bg-red-600 hover:bg-red-500 text-white font-semibold shadow-lg shadow-red-500/25 hover:scale-105 rounded-lg': variant === 'danger',
            
            // Icon Button - Rounded
            'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-full': variant === 'icon',
            
            // Ghost Button - Minimal
            'text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-md': variant === 'ghost',
          },
          
          // Size variants
          {
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md' && variant !== 'icon',
            'px-6 py-3 text-base': size === 'lg' && variant !== 'icon',
            'px-8 py-4 text-lg': size === 'xl' && variant !== 'icon',
            'p-2': variant === 'icon' && size === 'sm',
            'p-2.5': variant === 'icon' && size === 'md',
            'p-3': variant === 'icon' && size === 'lg',
            'p-4': variant === 'icon' && size === 'xl',
          },
          
          // Loading state
          loading && 'cursor-wait',
          
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            <span className="opacity-70">Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;