import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import { Play, Pause, Plus, SkipForward, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const RestTimer = ({
  isVisible,
  onComplete,
  onSkip,
  restTime = 90,
  exerciseContext = '',
  nextExerciseInfo = null,
  isSuperset = false,
  supersetInfo = null
}) => {
  const [timeRemaining, setTimeRemaining] = useState(restTime);
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasPlayedWarning, setHasPlayedWarning] = useState(false);
  const [hasPlayedCompletion, setHasPlayedCompletion] = useState(false);
  const [userAdjustments, setUserAdjustments] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize timer when component becomes visible
  useEffect(() => {
    if (isVisible) {
      setTimeRemaining(restTime);
      setIsRunning(true);
      setIsPaused(false);
      setIsCompleted(false);
      setHasPlayedWarning(false);
      setHasPlayedCompletion(false);
      setUserAdjustments(0);
      startTimeRef.current = Date.now();

      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isVisible, restTime]);

  // Timer countdown logic
  useEffect(() => {
    if (!isVisible || !isRunning || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;

        // Warning at 10 seconds
        if (newTime === 10 && !hasPlayedWarning) {
          setHasPlayedWarning(true);
          playWarningSound();
          announceToScreenReader('10 seconds remaining');
        }

        // Timer completion
        if (newTime <= 0) {
          setIsRunning(false);
          setIsCompleted(true);
          playCompletionSound();
          showCompletionNotification();
          announceToScreenReader('Rest timer complete');
          
          // Auto-complete after 2 seconds
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 2000);
          
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, isRunning, isPaused, hasPlayedWarning, onComplete]);

  // Audio functions
  const createAudioContext = () => {
    if (!audioContextRef.current && 'AudioContext' in window) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTone = (frequency, duration, volume = 0.1) => {
    const audioContext = createAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio not available:', error);
    }
  };

  const playWarningSound = () => {
    playTone(800, 0.2, 0.05); // Gentle warning tone
  };

  const playCompletionSound = () => {
    // Pleasant completion chime - three ascending notes
    setTimeout(() => playTone(523, 0.15, 0.1), 0);   // C
    setTimeout(() => playTone(659, 0.15, 0.1), 150); // E
    setTimeout(() => playTone(784, 0.3, 0.1), 300);  // G
  };

  const showCompletionNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Rest Complete!', {
        body: nextExerciseInfo ? `Next: ${nextExerciseInfo.name}` : 'Ready for next set',
        icon: '/vite.svg',
        tag: 'rest-timer',
        silent: true // We handle audio ourselves
      });

      setTimeout(() => notification.close(), 3000);
    }
  };

  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only absolute';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Timer controls
  const togglePause = () => {
    setIsPaused(!isPaused);
    announceToScreenReader(isPaused ? 'Timer resumed' : 'Timer paused');
  };

  const addTime = (seconds) => {
    setTimeRemaining(prev => prev + seconds);
    setUserAdjustments(prev => prev + seconds);
    announceToScreenReader(`Added ${seconds} seconds`);
    
    // Resume if paused when adding time
    if (isPaused) {
      setIsPaused(false);
    }
  };

  const skipRest = () => {
    setIsRunning(false);
    if (onSkip) onSkip();
    announceToScreenReader('Rest timer skipped');
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgress = () => {
    const totalTime = restTime + userAdjustments;
    return totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  };

  // Get timer state colors and styling
  const getTimerState = () => {
    if (isCompleted) {
      return {
        bgColor: 'bg-green-900/90',
        borderColor: 'border-green-500',
        textColor: 'text-green-100',
        progressColor: '#10b981',
        statusText: 'Rest Complete!'
      };
    } else if (timeRemaining <= 10 && timeRemaining > 0) {
      return {
        bgColor: 'bg-orange-900/90',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-100',
        progressColor: '#f59e0b',
        statusText: isPaused ? 'Paused - Final Countdown' : 'Final Countdown'
      };
    } else {
      return {
        bgColor: 'bg-blue-900/90',
        borderColor: 'border-blue-500',
        textColor: 'text-blue-100',
        progressColor: '#3b82f6',
        statusText: isPaused ? 'Paused - Resting' : 'Resting'
      };
    }
  };

  const timerState = getTimerState();

  if (!isVisible) return null;

  return (
    <Card className={`w-full ${timerState.bgColor} border-2 ${timerState.borderColor} transition-all duration-500 shadow-2xl`}>
      <CardContent className="p-6 text-center">
        {/* Timer Status */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className={`h-5 w-5 ${timerState.textColor}`} />
            <span className={`text-sm font-medium ${timerState.textColor}`}>
              {timerState.statusText}
            </span>
          </div>
          
          {/* Exercise Context */}
          {exerciseContext && (
            <p className={`text-xs ${timerState.textColor} opacity-90`}>
              {exerciseContext}
            </p>
          )}
        </div>

        {/* Countdown Display with Progress Circle */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Background Circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className={`${timerState.textColor} opacity-20`}
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={timerState.progressColor}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000 ease-linear"
              style={{ filter: `drop-shadow(0 0 8px ${timerState.progressColor})` }}
            />
          </svg>

          {/* Countdown Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl font-bold ${timerState.textColor} font-mono`}
              style={{ textShadow: `0 0 10px ${timerState.progressColor}` }}
            >
              {formatTime(timeRemaining)}
            </span>
            {isPaused && (
              <span className={`text-xs ${timerState.textColor} opacity-75 mt-1`}>
                PAUSED
              </span>
            )}
          </div>
        </div>

        {/* Next Exercise Info */}
        {nextExerciseInfo && !isCompleted && (
          <div className={`mb-4 p-3 rounded-lg bg-black/20 border border-current/20`}>
            <p className={`text-sm ${timerState.textColor} opacity-90`}>
              <span className="font-medium">Next: </span>
              {nextExerciseInfo.name}
              {nextExerciseInfo.setNumber && ` - Set ${nextExerciseInfo.setNumber}`}
            </p>
          </div>
        )}

        {/* Superset Info */}
        {isSuperset && supersetInfo && (
          <div className={`mb-4 p-3 rounded-lg bg-black/20 border border-current/20`}>
            <p className={`text-xs ${timerState.textColor} opacity-75 mb-1`}>
              Superset: {supersetInfo.name}
            </p>
            <p className={`text-xs ${timerState.textColor} opacity-75`}>
              Round {supersetInfo.currentRound} of {supersetInfo.totalRounds}
            </p>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="mb-6 animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span className="text-lg font-bold text-green-100">
                Rest Complete!
              </span>
            </div>
            <p className="text-sm text-green-200 opacity-90">
              Ready for your next set
            </p>
          </div>
        )}

        {/* Timer Controls */}
        {!isCompleted && (
          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={togglePause}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {isPaused ? 'Resume' : 'Pause'}
              </span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => addTime(30)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">+30s</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={skipRest}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white"
            >
              <SkipForward className="h-4 w-4" />
              <span className="hidden sm:inline">Skip</span>
            </Button>
          </div>
        )}

        {/* Manual Completion Button */}
        {isCompleted && (
          <Button
            variant="primary"
            size="lg"
            onClick={onComplete}
            className="w-full"
          >
            Continue to Next Set
          </Button>
        )}

        {/* Rest Time Adjustment Info */}
        {userAdjustments !== 0 && !isCompleted && (
          <div className="mt-3 text-xs opacity-75">
            <span className={timerState.textColor}>
              {userAdjustments > 0 ? '+' : ''}{userAdjustments}s from original
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RestTimer;