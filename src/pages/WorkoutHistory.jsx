import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { exercises } from '../data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { formatDate, formatTime } from '../lib/utils';
import { Calendar, Clock, Dumbbell } from 'lucide-react';

export default function WorkoutHistory() {
  const { user } = useAuth();

  const getWorkouts = () => {
    const allWorkouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]');
    return allWorkouts
      .filter((workout) => workout.userId === user?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const getExerciseName = (exerciseId) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };

  const getTotalSets = (workout) => {
    return workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  };

  const workouts = getWorkouts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Workout History</h1>
        <p className="text-slate-400">Recent training sessions</p>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Dumbbell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No data found</h3>
            <p className="text-slate-400">Begin training to populate history</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout, index) => {
            const workoutDate = new Date(workout.date);
            return (
              <Card key={workout.id} className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-50">
                      Session #{String(index + 1).padStart(3, '0')}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(workoutDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(workoutDate)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>{workout.exercises.length} exercises</span>
                      <span>{getTotalSets(workout)} total sets</span>
                    </div>

                    <div className="space-y-3">
                      {workout.exercises.map(exercise => (
                        <div key={exercise.id} className="border border-slate-600 rounded-md p-3 bg-slate-800/50">
                          <h4 className="font-medium text-slate-200 mb-2">
                            {getExerciseName(exercise.exerciseId)}
                          </h4>
                          <div className="space-y-1">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={set.id} className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="w-16">Set {setIndex + 1}:</span>
                                <span>{set.reps} reps</span>
                                <span>@ {set.weight} lb</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {workout.notes && (
                      <div className="border-t border-slate-600 pt-3">
                        <h4 className="font-medium text-slate-400 mb-1">Session Notes:</h4>
                        <p className="text-slate-300 text-sm">{workout.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}