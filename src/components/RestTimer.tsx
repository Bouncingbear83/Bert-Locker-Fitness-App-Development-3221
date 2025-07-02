import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/Card';
import Button from './ui/Button';
import { Play, Pause, RotateCcw, X, Clock, Zap, Timer, Bell } from 'lucide-react';

interface RestTimerProps {
  isVisible: boolean;
  onClose: () => void;
  defaultTime?: number;
  context?: string;
}

export default function RestTimer({ 
  isVisible, 
  onClose, 
  defaultTime = 90, 
  context = '' 
}: RestTimerProps) {
  const [time, setTime] = useState(defaultTime);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(defaultTime);

  useEffect(() => {
    if (isVisible && defaultTime !== initialTime) {
      setTime(defaultTime);
      setInitialTime(defaultTime);
      setIsRunning(true);
    }
  }, [isVisible, defaultTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      // Rest complete notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('REST COMPLETE', {
          body: context || 'Time to start your next set!',
          icon: '/vite.svg'
        });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time, context]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTime(initialTime);
    setIsRunning(false);
  };

  const setQuickTime = (seconds: number) => {
    setTime(seconds);
    setInitialTime(seconds);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((initialTime - time) / initialTime) * 100;
  };

  const getTimerColor = () => {
    if (time === 0) return '#ef4444';
    if (time <= 10) return '#f59e0b';
    if (time <= 30) return '#ec4899';
    return '#10b981';
  };

  if (!isVisible) return null;

  return (
    <div className="modal-backdrop flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-md border border-slate-700 animate-fade-in-up">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-600">
                <Timer className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-50">Rest Timer</h3>
                <p className="text-sm text-slate-400">Take your time to recover</p>
              </div>
            </div>
            <Button variant="icon" size="md" onClick={onClose} className="text-slate-400">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Context Display */}
          {context && (
            <div className="text-center mb-6 p-4 bg-slate-800/50 border border-slate-600 rounded-xl">
              <p className="text-slate-300 text-sm font-medium">{context}</p>
            </div>
          )}

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div className="relative w-48 h-48 mx-auto mb-6">
              {/* Background Circle */}
              <svg className="w-48 h-48 progress-ring" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgb(51, 65, 85)"
                  strokeWidth="4"
                  fill="transparent"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={getTimerColor()}
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                  style={{
                    filter: `drop-shadow(0 0 12px ${getTimerColor()})`
                  }}
                />
              </svg>
              
              {/* Timer Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className="text-4xl font-bold mb-2"
                  style={{
                    color: getTimerColor(),
                    textShadow: `0 0 20px ${getTimerColor()}`
                  }}
                >
                  {formatTime(time)}
                </span>
                <span className="text-sm text-slate-400 font-medium">
                  {isRunning ? 'Running' : 'Paused'}
                </span>
              </div>
            </div>

            {/* Status Messages */}
            {time === 0 && (
              <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Bell className="h-5 w-5" />
                <span className="font-semibold">Rest Complete!</span>
              </div>
            )}

            {time <= 10 && time > 0 && (
              <div className="flex items-center justify-center gap-2 text-amber-500 animate-pulse mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Final Countdown</span>
              </div>
            )}

            {time <= 30 && time > 10 && (
              <div className="flex items-center justify-center gap-2 text-pink-400 mb-4 p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Almost Ready</span>
              </div>
            )}
          </div>

          {/* Quick Time Buttons */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[30, 60, 90, 120].map(seconds => (
              <Button
                key={seconds}
                variant="secondary"
                size="sm"
                onClick={() => setQuickTime(seconds)}
                className="text-xs hover-lift"
              >
                {seconds}s
              </Button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 mb-6">
            <Button 
              onClick={toggleTimer} 
              variant={isRunning ? "secondary" : "primary"}
              className="flex-1"
              disabled={time === 0}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button 
              onClick={resetTimer} 
              variant="secondary"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Custom Time Input */}
          <div className="space-y-3">
            <label className="form-label">
              Custom Time (seconds)
            </label>
            <input
              type="number"
              min="1"
              max="999"
              value={time}
              onChange={(e) => {
                const newTime = parseInt(e.target.value) || 0;
                setTime(newTime);
                setInitialTime(newTime);
                setIsRunning(false);
              }}
              className="input-field w-full touch-target"
              placeholder="Enter time in seconds"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}