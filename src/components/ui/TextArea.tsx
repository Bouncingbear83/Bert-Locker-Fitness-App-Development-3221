import React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  variant?: 'default' | 'notes' | 'description' | 'summary';
  contextualHint?: string;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      error,
      success,
      variant = 'default',
      contextualHint,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      if (error) return 'input-field-error';
      if (success) return 'input-field-success';
      
      switch (variant) {
        case 'notes':
          return 'textarea-field';
        case 'description':
          return 'textarea-field';
        case 'summary':
          return 'display-text-summary';
        default:
          return 'textarea-field';
      }
    };

    const getVariantSpecificProps = () => {
      switch (variant) {
        case 'notes':
          return {
            placeholder: 'Add your notes, observations, or form cues...',
            rows: 3
          };
        case 'description':
          return {
            placeholder: 'Provide a detailed description...',
            rows: 4
          };
        case 'summary':
          return {
            placeholder: 'Summary will appear here...',
            rows: 3,
            readOnly: true
          };
        default:
          return {};
      }
    };

    const variantProps = getVariantSpecificProps();

    return (
      <div className="space-y-2">
        {/* Enhanced Label with Context */}
        {label && (
          <label className={cn(
            'form-label',
            props.required && 'form-label-required',
            variant === 'summary' && 'text-emerald-300'
          )}>
            {label}
            {contextualHint && (
              <span className="text-xs opacity-75 ml-2 font-normal">
                ({contextualHint})
              </span>
            )}
          </label>
        )}

        {/* Enhanced Textarea */}
        <textarea
          className={cn(
            getVariantStyles(),
            'w-full resize-vertical transition-all duration-300',
            variant === 'summary' && 'cursor-default select-text',
            variant === 'notes' && 'focus:min-h-[120px]',
            variant === 'description' && 'focus:min-h-[140px]',
            className
          )}
          ref={ref}
          {...variantProps}
          {...props}
        />

        {/* Enhanced Error Message */}
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
              Excellent notes! Very detailed.
            </p>
          </div>
        )}

        {/* Character Count for Long Content */}
        {(variant === 'description' || variant === 'notes') && props.value && (
          <div className="flex justify-end">
            <span className="text-xs text-slate-400">
              {String(props.value).length} characters
            </span>
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;