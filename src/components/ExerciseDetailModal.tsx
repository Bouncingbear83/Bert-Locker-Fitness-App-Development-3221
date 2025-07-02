import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { X, ExternalLink, FileImage, Video, Clock, Target, MapPin } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: any;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  // Disable body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px';
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, []);

  const getCategoryInfo = (category: string) => {
    const categories = {
      reps: {
        icon: Target,
        text: 'For Reps',
        color: 'text-pink-400',
        description: 'Measured by repetitions'
      },
      time: {
        icon: Clock,
        text: 'For Time',
        color: 'text-blue-400',
        description: 'Measured by duration'
      },
      distance: {
        icon: MapPin,
        text: 'For Distance',
        color: 'text-green-400',
        description: 'Measured by distance'
      }
    };
    return categories[category as keyof typeof categories] || categories.reps;
  };

  const categoryInfo = getCategoryInfo(exercise.category || 'reps');
  const CategoryIcon = categoryInfo.icon;

  const openVideoLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-0">
      <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
        <Card className="w-full max-w-3xl h-[95vh] md:h-[85vh] flex flex-col border border-slate-600">
          <CardHeader className="flex-shrink-0 pb-4 border-b border-slate-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CategoryIcon className={`h-6 w-6 ${categoryInfo.color}`} />
                <div>
                  <CardTitle className="text-2xl text-slate-50 flex items-center gap-2">
                    {exercise.name}
                    {exercise.isCustom && (
                      <span className="text-xs bg-pink-500/20 border border-pink-400/50 text-pink-300 px-2 py-1 rounded">
                        Custom
                      </span>
                    )}
                  </CardTitle>
                  <p className={`text-sm ${categoryInfo.color}`}>
                    {categoryInfo.text} • {categoryInfo.description}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Exercise Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-50 mb-3">Exercise Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-400">Muscle Group:</span>
                    <span className="text-slate-200">
                      {exercise.muscleGroup || exercise.primaryMuscles?.join(', ') || 'Not specified'}
                    </span>
                  </div>
                  {(exercise.description || exercise.instructions) && (
                    <div>
                      <span className="text-sm font-medium text-slate-400 block mb-2">Instructions:</span>
                      <p className="text-slate-200 leading-relaxed">
                        {exercise.description || exercise.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* GIF Display */}
              {exercise.media?.gif && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                    <FileImage className="h-5 w-5 text-blue-400" />
                    Exercise Demonstration
                  </h3>
                  <div className="flex justify-center p-4 bg-slate-800 rounded-lg border border-slate-600">
                    <img
                      src={exercise.media.gif.preview}
                      alt="Exercise demonstration"
                      className="max-w-full max-h-80 rounded border border-slate-600"
                    />
                  </div>
                </div>
              )}

              {/* Video Links */}
              {exercise.media?.videos?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-3 flex items-center gap-2">
                    <Video className="h-5 w-5 text-green-400" />
                    Tutorial Videos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exercise.media.videos.map((video: any, index: number) => (
                      <Button
                        key={index}
                        onClick={() => openVideoLink(video.url)}
                        variant="outline"
                        className="flex items-center gap-2 h-auto p-4 text-left justify-start"
                      >
                        <Video className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-200 truncate">
                            {video.title || `Tutorial ${index + 1}`}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {new URL(video.url).hostname}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Tips Based on Category */}
              <div>
                <h3 className="text-lg font-semibold text-slate-50 mb-3">Training Tips</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  {exercise.category === 'reps' && (
                    <>
                      <p>• Focus on controlled movement and proper form</p>
                      <p>• Adjust weight to maintain good technique throughout all reps</p>
                      <p>• Rest 2-3 minutes between sets for strength, 1-2 minutes for endurance</p>
                    </>
                  )}
                  {exercise.category === 'time' && (
                    <>
                      <p>• Maintain consistent effort throughout the duration</p>
                      <p>• Focus on breathing and form as fatigue sets in</p>
                      <p>• Gradually increase duration as you build endurance</p>
                    </>
                  )}
                  {exercise.category === 'distance' && (
                    <>
                      <p>• Pace yourself to maintain consistent speed</p>
                      <p>• Track both distance and time for progress monitoring</p>
                      <p>• Focus on efficiency of movement to conserve energy</p>
                    </>
                  )}
                </div>
              </div>

              {/* No Media Message */}
              {!exercise.media?.gif && !exercise.media?.videos?.length && (
                <div className="text-center py-8 text-slate-400">
                  <FileImage className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No demonstration media available for this exercise</p>
                  <p className="text-sm">Refer to the instructions above for proper form</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}