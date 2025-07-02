import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import { FileImage, Video, ExternalLink, Eye, EyeOff, Clock, Timer, Play, Pause } from 'lucide-react';

interface WorkoutExerciseCardProps {
  exercise: any;
  onComplete?: () => void;
  onUpdate?: (data: any) => void;
}

export default function WorkoutExerciseCard({ exercise, onComplete, onUpdate }: WorkoutExerciseCardProps) {
  const [showGif, setShowGif] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [targetTime, setTargetTime] = useState('');

  // Timer for time-based exercises
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTargetTime = (timeStr: string) => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setTimeElapsed(0);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const completeTimeExercise = () => {
    setIsTimerRunning(false);
    const targetSeconds = parseTargetTime(targetTime);
    const result = {
      targetTime: targetSeconds,
      actualTime: timeElapsed,
      completed: true
    };
    onUpdate?.(result);
    onComplete?.();
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-2 border-emerald-500/50 bg-emerald-900/10">
      <CardHeader>
        <CardTitle className="text-xl text-emerald-300 flex items-center justify-between">
          {exercise.name}
          {exercise.media?.gif && (
            <Button
              onClick={() => setShowGif(!showGif)}
              variant="ghost"
              size="sm"
              className="text-slate-400"
            >
              {showGif ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* GIF Display */}
        {exercise.media?.gif && showGif && (
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-300">Form Reference</span>
              <FileImage className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex justify-center">
              <img
                src={exercise.media.gif.preview}
                alt="Exercise form"
                className="max-h-40 rounded border border-slate-600"
              />
            </div>
          </div>
        )}

        {/* Video Links */}
        {exercise.media?.videos?.length > 0 && (
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-slate-300">
                {exercise.media.videos.length} tutorial{exercise.media.videos.length !== 1 ? 's' : ''} available
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {exercise.media.videos.map((video: any, index: number) => (
                <Button
                  key={index}
                  onClick={() => openVideo(video.url)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  📹 {video.title || `Tutorial ${index + 1}`}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Exercise-specific inputs based on category */}
        {exercise.category === 'time' && (
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
            <h4 className="text-blue-300 font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time-Based Exercise
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-blue-400 mb-1">Target Time (MM:SS)</label>
                <Input
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  placeholder="1:30"
                  className="border-blue-500/30"
                />
              </div>
              
              <div className="text-center py-4">
                <div className="text-3xl font-mono text-blue-300 mb-2">
                  {formatTime(timeElapsed)}
                </div>
                {targetTime && (
                  <div className="text-sm text-blue-400">
                    Target: {targetTime}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!isTimerRunning ? (
                  <Button
                    onClick={startTimer}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Timer
                  </Button>
                ) : (
                  <Button
                    onClick={pauseTimer}
                    variant="outline"
                    className="flex-1 border-blue-500 text-blue-400"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={completeTimeExercise}
                  disabled={timeElapsed === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Complete
                </Button>
              </div>
            </div>
          </div>
        )}

        {exercise.category === 'distance' && (
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <h4 className="text-green-300 font-medium mb-3">Distance-Based Exercise</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-green-400 mb-1">Target Distance</label>
                <Input placeholder="5.0" className="border-green-500/30" />
              </div>
              <div>
                <label className="block text-sm text-green-400 mb-1">Unit</label>
                <select className="w-full h-10 p-2 bg-slate-800 border border-green-500/30 rounded-md text-slate-200">
                  <option value="km">Kilometers</option>
                  <option value="miles">Miles</option>
                  <option value="meters">Meters</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-green-400 mb-1">Actual Distance</label>
                <Input placeholder="5.0" className="border-green-500/30" />
              </div>
              <div>
                <label className="block text-sm text-green-400 mb-1">Time (MM:SS)</label>
                <Input placeholder="25:30" className="border-green-500/30" />
              </div>
            </div>
            <Button
              onClick={onComplete}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
            >
              Complete Exercise
            </Button>
          </div>
        )}

        {/* Instructions */}
        {exercise.instructions && (
          <div className="p-3 bg-slate-800 rounded-lg border border-slate-600">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Instructions</h4>
            <p className="text-sm text-slate-400">{exercise.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}