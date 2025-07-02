import React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  success?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, success, options, placeholder, ...props }, ref) => {
    const getSelectStyles = () => {
      if (error) return 'input-field-error';
      if (success) return 'input-field-success';
      return 'select-field';
    };

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label className={cn(
            "form-label",
            props.required && "form-label-required"
          )}>
            {label}
          </label>
        )}

        {/* Select */}
        <select
          className={cn(
            getSelectStyles(),
            'w-full touch-target',
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
            <p className="text-sm text-red-400 font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Success message */}
        {success && !error && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
            <p className="text-sm text-emerald-400 font-medium">
              Perfect choice!
            </p>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;