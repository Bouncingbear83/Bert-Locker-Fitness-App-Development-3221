import React from 'react';
import { cn } from '@/lib/utils';
import { Copy, ExternalLink, Info } from 'lucide-react';

interface DisplayTextProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: string | number;
  variant?: 'primary' | 'secondary' | 'summary' | 'url' | 'metric';
  copyable?: boolean;
  clickable?: boolean;
  onCopy?: () => void;
  onClick?: () => void;
  contextualInfo?: string;
  metricType?: 'success' | 'warning' | 'error';
}

const DisplayText = React.forwardRef<HTMLDivElement, DisplayTextProps>(
  (
    {
      className,
      label,
      value,
      variant = 'primary',
      copyable = false,
      clickable = false,
      onCopy,
      onClick,
      contextualInfo,
      metricType,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'secondary':
          return 'display-text-secondary';
        case 'summary':
          return 'display-text-summary';
        case 'url':
          return 'display-text-url';
        case 'metric':
          return cn(
            'metric-display',
            metricType === 'success' && 'success',
            metricType === 'warning' && 'warning'
          );
        default:
          return 'display-text-primary';
      }
    };

    const handleCopy = async () => {
      if (copyable && value) {
        try {
          await navigator.clipboard.writeText(String(value));
          onCopy?.();
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
      }
    };

    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      } else if (variant === 'url' && typeof value === 'string' && value.startsWith('http')) {
        window.open(value, '_blank', 'noopener,noreferrer');
      }
    };

    return (
      <div className="space-y-3">
        {/* Enhanced Label with Context */}
        {label && (
          <label
            className={cn(
              'form-label',
              variant === 'metric' && 'text-center justify-center flex'
            )}
          >
            {label}
            {contextualInfo && (
              <div className="inline-flex items-center gap-1 ml-2">
                <Info className="h-3 w-3 opacity-75" />
                <span className="text-xs opacity-75 font-normal">
                  {contextualInfo}
                </span>
              </div>
            )}
          </label>
        )}

        {/* Enhanced Display Container */}
        <div
          ref={ref}
          className={cn(
            getVariantStyles(),
            'group relative',
            (clickable || variant === 'url') && 'cursor-pointer hover:scale-[1.02]',
            copyable && 'cursor-copy',
            className
          )}
          onClick={handleClick}
          {...props}
        >
          {/* Display Value */}
          <div
            className={cn(
              'flex-1',
              variant === 'metric' && 'flex items-center justify-center',
              variant === 'url' && 'font-mono text-xs break-all'
            )}
          >
            {value || (
              <span className="italic opacity-60">
                {variant === 'summary' ? 'No summary available' : 'No data'}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Copy Button */}
            {copyable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors duration-200 text-slate-300 hover:text-slate-100"
                title="Copy to clipboard"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}

            {/* External Link Button */}
            {variant === 'url' && typeof value === 'string' && value.startsWith('http') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(value, '_blank', 'noopener,noreferrer');
                }}
                className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors duration-200 text-slate-300 hover:text-slate-100"
                title="Open in new tab"
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Metric Enhancement */}
          {variant === 'metric' && metricType && (
            <div className="absolute -top-2 -right-2">
              <div
                className={cn(
                  'w-4 h-4 rounded-full animate-pulse',
                  metricType === 'success' && 'bg-emerald-400 shadow-lg shadow-emerald-400/50',
                  metricType === 'warning' && 'bg-amber-400 shadow-lg shadow-amber-400/50',
                  metricType === 'error' && 'bg-red-400 shadow-lg shadow-red-400/50'
                )}
              />
            </div>
          )}
        </div>

        {/* Copy Success Feedback */}
        {copyable && (
          <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Click to copy to clipboard
          </div>
        )}
      </div>
    );
  }
);

DisplayText.displayName = 'DisplayText';

export default DisplayText;