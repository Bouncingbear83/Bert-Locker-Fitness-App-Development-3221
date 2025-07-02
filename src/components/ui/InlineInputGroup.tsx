import React from 'react';
import { cn } from '@/lib/utils';
import WorkoutInput from './WorkoutInput';
import Button from './Button';
import { CheckCircle, Trash2, Trophy, Target } from 'lucide-react';

interface InlineInputGroupProps {
  setNumber: number;
  reps: number;
  weight: number;
  completed?: boolean;
  context?: 'regular' | 'superset';
  onRepsChange: (value: number) => void;
  onWeightChange: (value: number) => void;
  onComplete: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  className?: string;
  isPersonalRecord?: boolean;
  previousBest?: {
    reps: number;
    weight: number;
  };
  progressiveHint?: string;
}

const InlineInputGroup = React.forwardRef<HTMLDivElement, InlineInputGroupProps>(
  (
    {
      setNumber,
      reps,
      weight,
      completed = false,
      context = 'regular',
      onRepsChange,
      onWeightChange,
      onComplete,
      onRemove,
      showRemove = false,
      className,
      isPersonalRecord = false,
      previousBest,
      progressiveHint,
      ...props
    },
    ref
  ) => {
    const getContextualStyling = () => {
      if (context === 'superset') {
        return {
          borderColor: 'border-blue-500/30',
          bgColor: 'bg-gradient-to-r from-blue-500/8 to-blue-600/6',
          accentColor: 'text-blue-300',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          glowColor: 'shadow-blue-500/20'
        };
      }
      return {
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-gradient-to-r from-emerald-500/8 to-emerald-600/6',
        accentColor: 'text-emerald-300',
        buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
        glowColor: 'shadow-emerald-500/20'
      };
    };

    const styling = getContextualStyling();

    const getPerformanceIndicator = () => {
      if (isPersonalRecord) {
        return (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
              <Trophy className="h-3 w-3" />
              <span>PR!</span>
            </div>
          </div>
        );
      }

      if (
        previousBest &&
        (weight > previousBest.weight ||
          (weight === previousBest.weight && reps > previousBest.reps))
      ) {
        return (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="flex items-center gap-1 bg-gradient-to-r from-pink-400 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <Target className="h-3 w-3" />
              <span>+</span>
            </div>
          </div>
        );
      }

      return null;
    };

    return (
      <div
        ref={ref}
        className={cn(
          'input-group-inline relative',
          styling.bgColor,
          styling.borderColor,
          styling.glowColor,
          completed && 'opacity-70 ring-2 ring-emerald-400/30',
          isPersonalRecord && 'ring-2 ring-yellow-400/50 shadow-xl shadow-yellow-400/20',
          context === 'superset' && 'superset-context',
          context === 'regular' && 'workout-context',
          className
        )}
        {...props}
      >
        {/* Performance Indicator */}
        {getPerformanceIndicator()}

        {/* Set Number with Enhanced Styling */}
        <div className="text-center">
          <div
            className={cn(
              'text-lg font-bold mb-1',
              styling.accentColor,
              completed && 'text-emerald-400',
              isPersonalRecord && 'text-yellow-400 animate-pulse'
            )}
          >
            {setNumber}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
            Set
          </div>
          {progressiveHint && (
            <div className="text-xs text-slate-400 mt-1 opacity-75">
              {progressiveHint}
            </div>
          )}
        </div>

        {/* Enhanced Reps Input */}
        <WorkoutInput
          type="number"
          value={reps || ''}
          onChange={(e) => onRepsChange(parseInt(e.target.value) || 0)}
          placeholder="0"
          min="0"
          max="999"
          disabled={completed}
          unit="reps"
          context={context}
          success={completed}
          performanceHint={previousBest ? `Last: ${previousBest.reps}` : undefined}
          className="text-center"
        />

        {/* Enhanced Weight Input */}
        <WorkoutInput
          type="number"
          value={weight || ''}
          onChange={(e) => onWeightChange(parseInt(e.target.value) || 0)}
          placeholder="0"
          min="0"
          max="9999"
          disabled={completed}
          unit="weight"
          context={context}
          success={completed}
          performanceHint={previousBest ? `Last: ${previousBest.weight}lbs` : undefined}
          className="text-center"
        />

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onComplete}
            disabled={completed || (!reps && !weight)}
            size="sm"
            className={cn(
              'font-bold text-xs min-w-[70px] transition-all duration-300',
              completed
                ? 'bg-emerald-500 text-white cursor-default ring-2 ring-emerald-400/50'
                : cn(
                    styling.buttonColor,
                    'hover:scale-105 active:scale-95',
                    'hover:shadow-lg',
                    styling.glowColor
                  ),
              isPersonalRecord &&
                !completed &&
                'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20'
            )}
          >
            {completed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                DONE
              </>
            ) : (
              'COMPLETE'
            )}
          </Button>

          {/* Enhanced Remove Button */}
          {showRemove && onRemove && (
            <Button
              onClick={onRemove}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
              disabled={completed}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progressive Loading Indicator */}
        {!completed && (reps > 0 || weight > 0) && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700 rounded-b-lg overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500',
                context === 'superset'
                  ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                  : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              )}
              style={{
                width: `${Math.min(
                  (reps > 0 ? 50 : 0) + (weight > 0 ? 50 : 0),
                  100
                )}%`
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

InlineInputGroup.displayName = 'InlineInputGroup';

export default InlineInputGroup;