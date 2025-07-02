import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Calendar, Trophy, Star, Timer, TrendingUp, Award, Target } from 'lucide-react';

const PerformanceCard = ({ 
  exerciseId, 
  exerciseName, 
  exerciseCategory = 'reps',
  personalBest, 
  previousWorkout, 
  progressiveHint,
  isNewPR = false,
  celebrationActive = false 
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPace = (pacePerUnit, unit = 'km') => {
    const mins = Math.floor(pacePerUnit / 60);
    const secs = Math.round(pacePerUnit % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/${unit}`;
  };

  const renderPreviousWorkoutData = () => {
    if (!previousWorkout) {
      return (
        <div className="mb-4 p-3 bg-slate-800 border border-slate-600 rounded-lg">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">First time doing this exercise!</span>
          </div>
        </div>
      );
    }

    const formatPreviousData = () => {
      const { exercise, date } = previousWorkout;
      
      if (exerciseCategory === 'reps' && exercise.sets?.length > 0) {
        const setStrings = exercise.sets.map(set => {
          if (set.weight > 0) {
            return `${set.weight}lbs x ${set.reps}`;
          } else {
            return `${set.reps} reps`;
          }
        });
        return `${exercise.sets.length} sets - ${setStrings.join(', ')}`;
      } else if (exerciseCategory === 'time' && exercise.completionData) {
        const data = exercise.completionData;
        if (data.targetTime && data.actualTime) {
          return `Target ${formatTime(data.targetTime)}, Achieved ${formatTime(data.actualTime)}`;
        } else if (data.actualTime) {
          return `Completed in ${formatTime(data.actualTime)}`;
        }
      } else if (exerciseCategory === 'distance' && exercise.completionData) {
        const data = exercise.completionData;
        if (data.distance && data.actualTime) {
          const pace = data.actualTime / data.distance;
          return `${data.distance}km in ${formatTime(data.actualTime)} (${formatPace(pace)} pace)`;
        }
      }
      return 'No detailed data available';
    };

    return (
      <div className="mb-4 p-3 bg-slate-800 border border-slate-600 rounded-lg">
        <div className="flex items-center gap-2 text-slate-300 mb-1">
          <Calendar className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium">Last workout ({formatDate(previousWorkout.date)}):</span>
        </div>
        <div className="text-sm text-slate-400 ml-6">
          {formatPreviousData()}
        </div>
      </div>
    );
  };

  const renderPersonalBest = () => {
    if (!personalBest || (!personalBest.bestWeight && !personalBest.bestReps && !personalBest.bestTime && !personalBest.bestPace)) {
      return null;
    }

    const formatPR = () => {
      if (exerciseCategory === 'reps') {
        if (personalBest.bestWeight) {
          return {
            text: `${personalBest.bestWeight.weight}lbs x ${personalBest.bestWeight.reps}`,
            date: personalBest.bestWeight.date,
            icon: <Trophy className="h-4 w-4" />,
            subtitle: personalBest.bestWeight.estimatedOneRM ? `Est. 1RM: ${personalBest.bestWeight.estimatedOneRM}lbs` : null
          };
        } else if (personalBest.bestReps) {
          return {
            text: `${personalBest.bestReps.reps} reps`,
            date: personalBest.bestReps.date,
            icon: <Star className="h-4 w-4" />
          };
        }
      } else if (exerciseCategory === 'time' && personalBest.bestTime) {
        return {
          text: formatTime(personalBest.bestTime.time),
          date: personalBest.bestTime.date,
          icon: <Timer className="h-4 w-4" />,
          subtitle: personalBest.bestTime.targetTime ? `Target was: ${formatTime(personalBest.bestTime.targetTime)}` : null
        };
      } else if (exerciseCategory === 'distance' && personalBest.bestPace) {
        return {
          text: `${formatPace(personalBest.bestPace.pace)} (${personalBest.bestPace.distance}km)`,
          date: personalBest.bestPace.date,
          icon: <TrendingUp className="h-4 w-4" />
        };
      }
      return null;
    };

    const prData = formatPR();
    if (!prData) return null;

    return (
      <div className={`mb-4 p-4 rounded-lg border-2 bg-gradient-to-r from-pink-500/20 to-pink-600/20 border-pink-500/50 ${isNewPR ? 'animate-pulse ring-4 ring-pink-400/50' : ''} ${celebrationActive ? 'animate-bounce' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/30 rounded-lg">
              {prData.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-pink-300 font-bold text-sm">
                  {isNewPR ? 'NEW PR!' : 'PERSONAL BEST'}
                </span>
                {isNewPR && <Award className="h-4 w-4 text-yellow-400 animate-pulse" />}
              </div>
              <div className="text-white font-bold text-lg">{prData.text}</div>
              {prData.subtitle && (
                <div className="text-pink-200 text-xs">{prData.subtitle}</div>
              )}
              <div className="text-pink-200 text-xs">{formatDate(prData.date)}</div>
            </div>
          </div>
          <div className="text-pink-200 text-xs text-right">
            {exerciseCategory === 'reps' && personalBest.bestWeight ? 'Beat your PR!' : 
             exerciseCategory === 'time' ? 'Go faster!' : 
             'New territory!'}
          </div>
        </div>
      </div>
    );
  };

  const renderProgressiveOverloadHints = () => {
    if (!progressiveHint) return null;

    const getHintColor = () => {
      switch (progressiveHint.type) {
        case 'progressive': return 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 text-emerald-300';
        case 'new_territory': return 'from-yellow-500/10 to-yellow-600/10 border-yellow-500/30 text-yellow-300';
        case 'time_improvement': return 'from-blue-500/10 to-blue-600/10 border-blue-500/30 text-blue-300';
        default: return 'from-emerald-500/10 to-emerald-600/10 border-emerald-500/30 text-emerald-300';
      }
    };

    return (
      <div className={`mb-4 p-3 bg-gradient-to-r ${getHintColor()} border rounded-lg`}>
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4" />
          <span className="text-sm font-medium">
            {progressiveHint.type === 'new_territory' ? 'Break New Ground:' : 'Progressive Overload:'}
          </span>
        </div>
        <div className="text-sm mt-1 ml-6">
          {progressiveHint.message}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {renderPersonalBest()}
      {renderPreviousWorkoutData()}
      {renderProgressiveOverloadHints()}
    </div>
  );
};

export default PerformanceCard;