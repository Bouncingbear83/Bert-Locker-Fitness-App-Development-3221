import { useState, useCallback, useRef } from 'react';

export const useRestTimer = () => {
  const [timerState, setTimerState] = useState({
    isVisible: false,
    restTime: 90,
    exerciseContext: '',
    nextExerciseInfo: null,
    isSuperset: false,
    supersetInfo: null
  });

  const [restTimePreferences, setRestTimePreferences] = useState({
    userSkips: 0,
    userExtensions: 0,
    avgActualRestTime: 90
  });

  const timerDataRef = useRef([]);

  const startRestTimer = useCallback((config) => {
    const {
      restTime = 90,
      exerciseContext = '',
      nextExerciseInfo = null,
      isSuperset = false,
      supersetInfo = null
    } = config;

    // Calculate smart rest time based on user preferences
    let adjustedRestTime = restTime;
    if (restTimePreferences.userSkips > restTimePreferences.userExtensions) {
      // User tends to skip, suggest shorter rest
      adjustedRestTime = Math.max(restTime - 15, 30);
    } else if (restTimePreferences.userExtensions > restTimePreferences.userSkips) {
      // User tends to extend, suggest longer rest
      adjustedRestTime = restTime + 15;
    }

    setTimerState({
      isVisible: true,
      restTime: adjustedRestTime,
      exerciseContext,
      nextExerciseInfo,
      isSuperset,
      supersetInfo
    });

    // Track timer start
    timerDataRef.current.push({
      startTime: Date.now(),
      prescribedRest: restTime,
      adjustedRest: adjustedRestTime,
      exerciseName: nextExerciseInfo?.name || 'Unknown',
      isSuperset
    });
  }, [restTimePreferences]);

  const completeRestTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isVisible: false }));
    
    // Track completion
    if (timerDataRef.current.length > 0) {
      const currentTimer = timerDataRef.current[timerDataRef.current.length - 1];
      currentTimer.endTime = Date.now();
      currentTimer.actualRest = Math.round((currentTimer.endTime - currentTimer.startTime) / 1000);
      currentTimer.completed = true;
    }
  }, []);

  const skipRestTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isVisible: false }));
    
    // Track skip and update preferences
    setRestTimePreferences(prev => ({
      ...prev,
      userSkips: prev.userSkips + 1
    }));

    // Track skip
    if (timerDataRef.current.length > 0) {
      const currentTimer = timerDataRef.current[timerDataRef.current.length - 1];
      currentTimer.endTime = Date.now();
      currentTimer.actualRest = Math.round((currentTimer.endTime - currentTimer.startTime) / 1000);
      currentTimer.skipped = true;
    }
  }, []);

  const extendRestTimer = useCallback((seconds) => {
    // Track extension and update preferences
    setRestTimePreferences(prev => ({
      ...prev,
      userExtensions: prev.userExtensions + 1
    }));
  }, []);

  const getRestTimeData = useCallback(() => {
    return timerDataRef.current;
  }, []);

  const clearRestTimeData = useCallback(() => {
    timerDataRef.current = [];
    setRestTimePreferences({
      userSkips: 0,
      userExtensions: 0,
      avgActualRestTime: 90
    });
  }, []);

  return {
    timerState,
    startRestTimer,
    completeRestTimer,
    skipRestTimer,
    extendRestTimer,
    getRestTimeData,
    clearRestTimeData,
    restTimePreferences
  };
};