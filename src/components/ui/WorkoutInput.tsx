import React from 'react';
import { cn } from '@/lib/utils';

interface WorkoutInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  unit?: 'reps' | 'weight' | 'kg' | 'time' | 'distance' | 'seconds';
  context?: 'regular' | 'superset';
  error?: boolean;
  success?: boolean;
  performanceHint?: string;
}

const WorkoutInput = React.forwardRef<HTMLInputElement, WorkoutInputProps>(
  (
    {
      className,
      label,
      unit,
      context = 'regular',
      error,
      success,
      performanceHint,
      ...props
    },
    ref
  ) => {
    const getInputStyles = () => {
      if (error) return 'input-field-error';
      if (success) return 'input-field-success';
      if (context === 'superset') return 'input-field-superset';
      return 'input-field-workout';
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
      if (context === 'superset') return 'superset-context';
      return 'workout-context';
    };

    return (
      <div className="relative group">
        {/* Enhanced Label with Performance Context */}
        {label && (
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wide">
            <span
              className={cn(
                'bg-gradient-to-r bg-clip-text text-transparent font-extrabold',
                context === 'superset'
                  ? 'from-blue-300 to-blue-400'
                  : 'from-emerald-300 to-emerald-400'
              )}
            >
              {label}
            </span>
            {performanceHint && (
              <span className="text-xs opacity-75 ml-2 font-normal normal-case">
                {performanceHint}
              </span>
            )}
          </label>
        )}

        {/* Enhanced Input Container with Unit */}
        <div className={cn('input-with-unit', getContextualClass())}>
          <input
            ref={ref}
            className={cn(
              getInputStyles(),
              'text-center font-bold tracking-wide transition-all duration-300',
              'focus:scale-105 focus:font-extrabold',
              'placeholder:font-normal placeholder:tracking-normal',
              unit && 'pr-16',
              // Performance state styling
              success && 'ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-400/20',
              error && 'ring-2 ring-red-400/50 shadow-lg shadow-red-400/20',
              className
            )}
            {...props}
          />

          {/* Enhanced Unit Label with Gradient */}
          {unit && (
            <div className="input-unit-label text-xs font-bold uppercase tracking-wider">
              {getUnitLabel()}
            </div>
          )}
        </div>

        {/* Performance Feedback Indicators */}
        {success && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
          </div>
        )}

        {error && (
          <div className="absolute -top-1 -right-1">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50" />
          </div>
        )}
      </div>
    );
  }
);

WorkoutInput.displayName = 'WorkoutInput';

export default WorkoutInput;