import { useState, useCallback } from 'react';

export const usePersonalBests = (userId) => {
  const [personalBests, setPersonalBests] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  const calculatePersonalBest = useCallback((exerciseId, exerciseCategory = 'reps') => {
    if (!userId) return null;

    const allWorkouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]');
    const userWorkouts = allWorkouts.filter(w => w.userId === userId);

    let bestWeight = null;
    let bestReps = null;
    let bestTime = null;
    let bestDistance = null;
    let bestPace = null;

    userWorkouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.exerciseId === exerciseId) {
          if (exerciseCategory === 'reps' && exercise.sets?.length > 0) {
            exercise.sets.forEach(set => {
              if (!set.completed) return;

              // Best weight (prioritize weight over reps)
              if (set.weight && set.weight > 0) {
                if (!bestWeight || 
                    set.weight > bestWeight.weight || 
                    (set.weight === bestWeight.weight && set.reps > bestWeight.reps)) {
                  bestWeight = {
                    weight: set.weight,
                    reps: set.reps,
                    date: workout.date,
                    estimatedOneRM: calculateOneRM(set.weight, set.reps)
                  };
                }
              }

              // Best reps (for bodyweight exercises)
              if ((!set.weight || set.weight === 0) && set.reps) {
                if (!bestReps || set.reps > bestReps.reps) {
                  bestReps = {
                    reps: set.reps,
                    date: workout.date
                  };
                }
              }
            });
          }

          // Time-based exercises
          if (exerciseCategory === 'time' && exercise.completionData?.completed) {
            if (exercise.completionData.actualTime) {
              if (!bestTime || exercise.completionData.actualTime < bestTime.time) {
                bestTime = {
                  time: exercise.completionData.actualTime,
                  targetTime: exercise.completionData.targetTime,
                  date: workout.date
                };
              }
            }
          }

          // Distance-based exercises
          if (exerciseCategory === 'distance' && exercise.completionData?.completed) {
            const { distance, actualTime } = exercise.completionData;
            if (distance && actualTime) {
              const pace = actualTime / distance; // seconds per unit

              // Best pace
              if (!bestPace || pace < bestPace.pace) {
                bestPace = {
                  distance,
                  time: actualTime,
                  pace,
                  date: workout.date
                };
              }

              // Longest distance
              if (!bestDistance || distance > bestDistance.distance) {
                bestDistance = {
                  distance,
                  time: actualTime,
                  pace,
                  date: workout.date
                };
              }
            }
          }
        }
      });
    });

    return {
      bestWeight,
      bestReps,
      bestTime,
      bestDistance,
      bestPace
    };
  }, [userId]);

  const calculateOneRM = (weight, reps) => {
    // Brzycki formula: 1RM = weight × (36 / (37 - reps))
    if (reps === 1) return weight;
    if (reps > 15) return weight; // Formula becomes less accurate beyond 15 reps
    return Math.round(weight * (36 / (37 - reps)));
  };

  const calculateAllPersonalBests = useCallback((exerciseIds) => {
    setIsCalculating(true);
    const prs = {};
    
    exerciseIds.forEach(exerciseId => {
      // We need exercise category info - this should be passed or looked up
      prs[exerciseId] = calculatePersonalBest(exerciseId);
    });

    setPersonalBests(prs);
    setIsCalculating(false);
    return prs;
  }, [calculatePersonalBest]);

  const updatePersonalBest = useCallback((exerciseId, newData) => {
    setPersonalBests(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        ...newData,
        lastUpdated: new Date().toISOString()
      }
    }));
  }, []);

  const checkForNewPR = useCallback((exerciseId, currentPerformance, exerciseCategory = 'reps') => {
    const currentPR = personalBests[exerciseId];
    if (!currentPR) return null;

    const improvements = [];

    if (exerciseCategory === 'reps') {
      // Check weight PR
      if (currentPerformance.weight && currentPerformance.weight > 0) {
        const hasWeightPR = !currentPR.bestWeight || 
          currentPerformance.weight > currentPR.bestWeight.weight ||
          (currentPerformance.weight === currentPR.bestWeight.weight && 
           currentPerformance.reps > currentPR.bestWeight.reps);

        if (hasWeightPR) {
          improvements.push({
            type: 'weight',
            previous: currentPR.bestWeight,
            new: {
              weight: currentPerformance.weight,
              reps: currentPerformance.reps,
              estimatedOneRM: calculateOneRM(currentPerformance.weight, currentPerformance.reps)
            }
          });
        }
      }

      // Check reps PR (bodyweight)
      if ((!currentPerformance.weight || currentPerformance.weight === 0) && currentPerformance.reps) {
        const hasRepsPR = !currentPR.bestReps || currentPerformance.reps > currentPR.bestReps.reps;
        if (hasRepsPR) {
          improvements.push({
            type: 'reps',
            previous: currentPR.bestReps,
            new: { reps: currentPerformance.reps }
          });
        }
      }
    }

    if (exerciseCategory === 'time') {
      const hasTimePR = currentPerformance.actualTime && 
        (!currentPR.bestTime || currentPerformance.actualTime < currentPR.bestTime.time);
      if (hasTimePR) {
        improvements.push({
          type: 'time',
          previous: currentPR.bestTime,
          new: { time: currentPerformance.actualTime }
        });
      }
    }

    if (exerciseCategory === 'distance') {
      const { distance, actualTime } = currentPerformance;
      if (distance && actualTime) {
        const pace = actualTime / distance;

        // Check pace PR
        const hasPacePR = !currentPR.bestPace || pace < currentPR.bestPace.pace;
        if (hasPacePR) {
          improvements.push({
            type: 'pace',
            previous: currentPR.bestPace,
            new: { distance, time: actualTime, pace }
          });
        }

        // Check distance PR
        const hasDistancePR = !currentPR.bestDistance || distance > currentPR.bestDistance.distance;
        if (hasDistancePR) {
          improvements.push({
            type: 'distance',
            previous: currentPR.bestDistance,
            new: { distance, time: actualTime, pace }
          });
        }
      }
    }

    return improvements.length > 0 ? improvements : null;
  }, [personalBests, calculateOneRM]);

  const getProgressiveOverloadSuggestion = useCallback((exerciseId, previousWorkout, exerciseCategory = 'reps') => {
    const pr = personalBests[exerciseId];
    if (!pr && !previousWorkout) return null;

    if (exerciseCategory === 'reps') {
      const lastWeight = previousWorkout?.sets ? Math.max(...previousWorkout.sets.map(s => s.weight || 0)) : 0;
      
      if (pr?.bestWeight && lastWeight > 0) {
        const prWeight = pr.bestWeight.weight;
        
        if (lastWeight < prWeight) {
          const suggestion = Math.min(lastWeight + 5, prWeight - 5);
          return {
            type: 'progressive',
            message: `Last: ${lastWeight}lbs, PR: ${prWeight}lbs - try ${suggestion}lbs+ today!`,
            suggestedWeight: suggestion
          };
        } else if (lastWeight >= prWeight) {
          const suggestion = lastWeight + 5;
          return {
            type: 'new_territory',
            message: `Last: ${lastWeight}lbs, PR: ${prWeight}lbs - aim for ${suggestion}lbs for new PR!`,
            suggestedWeight: suggestion
          };
        }
      }
    }

    if (exerciseCategory === 'time') {
      const lastTime = previousWorkout?.completionData?.actualTime;
      if (pr?.bestTime && lastTime) {
        const prTime = pr.bestTime.time;
        const targetImprovement = Math.max(5, Math.round(lastTime * 0.05)); // 5% improvement
        const suggestion = Math.max(prTime - 10, lastTime - targetImprovement);
        
        return {
          type: 'time_improvement',
          message: `Last: ${formatTime(lastTime)}, PR: ${formatTime(prTime)} - aim for under ${formatTime(suggestion)}!`,
          suggestedTime: suggestion
        };
      }
    }

    return null;
  }, [personalBests]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    personalBests,
    isCalculating,
    calculatePersonalBest,
    calculateAllPersonalBests,
    updatePersonalBest,
    checkForNewPR,
    getProgressiveOverloadSuggestion
  };
};