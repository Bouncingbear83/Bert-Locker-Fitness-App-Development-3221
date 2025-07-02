import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'workout' | 'superset';
  unit?: 'reps' | 'weight' | 'kg' | 'time' | 'distance' | 'seconds';
  showUnit?: boolean;
  contextualHint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      success,
      icon,
      variant = 'default',
      unit,
      showUnit = false,
      contextualHint,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const getVariantStyles = () => {
      if (error) return 'input-field-error';
      if (success) return 'input-field-success';
      
      switch (variant) {
        case 'workout':
          return 'input-field-workout';
        case 'superset':
          return 'input-field-superset';
        default:
          return 'input-field';
      }
    };

    const getUnitLabel = () => {
      const unitLabels = {
        reps: 'reps',
        weight: 'lbs',
        kg: 'kg',
        time: 'min',
        distance: 'km',
        seconds: 'sec'
      };
      return unit ? unitLabels[unit] : '';
    };

    const getContextualClass = () => {
      if (variant === 'workout') return 'workout-context';
      if (variant === 'superset') return 'superset-context';
      return '';
    };

    return (
      <div className="space-y-2">
        {/* Enhanced Label with Contextual Styling */}
        {label && (
          <label
            className={cn(
              'form-label',
              props.required && 'form-label-required',
              variant === 'workout' && 'text-emerald-300',
              variant === 'superset' && 'text-blue-300'
            )}
          >
            {label}
            {contextualHint && (
              <span className="text-xs opacity-75 ml-2 font-normal">
                ({contextualHint})
              </span>
            )}
          </label>
        )}

        <div
          className={cn(
            'relative',
            showUnit && unit && `input-with-unit ${getContextualClass()}`
          )}
        >
          {/* Icon with Enhanced Positioning */}
          {icon && (
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-500 z-10">
              {icon}
            </div>
          )}

          {/* Enhanced Input Field */}
          <input
            type={inputType}
            className={cn(
              getVariantStyles(),
              'w-full touch-target',
              // Icon spacing
              icon && 'pl-14',
              isPassword && 'pr-14',
              // Unit spacing
              showUnit && unit && 'pr-20',
              // Contextual enhancements
              variant === 'workout' && 'font-mono tracking-wide',
              variant === 'superset' && 'font-mono tracking-wide',
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Enhanced Unit Label with Gradient */}
          {showUnit && unit && (
            <div className="input-unit-label">
              {getUnitLabel()}
            </div>
          )}

          {/* Enhanced Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500/25 rounded-lg p-2"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Enhanced Error Message with Icon */}
        {error && (
          <div className="flex items-center gap-3 mt-3">
            <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0 animate-pulse" />
            <p className="text-sm text-red-400 font-medium flex-1">
              {error}
            </p>
          </div>
        )}

        {/* Enhanced Success Message */}
        {success && !error && (
          <div className="flex items-center gap-3 mt-3">
            <div className="w-3 h-3 bg-emerald-400 rounded-full flex-shrink-0 animate-pulse" />
            <p className="text-sm text-emerald-400 font-medium flex-1">
              Perfect! Looks great.
            </p>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;