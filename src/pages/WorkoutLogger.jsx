import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { exercises } from '../data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Trash2, Save, FileText, X, Target, CheckCircle } from 'lucide-react';

export default function WorkoutLogger() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = () => {
    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const userTemplates = allTemplates.filter(t => t.userId === user?.id);
    setTemplates(userTemplates);
  };

  const addExercise = (exerciseId) => {
    const newExercise = {
      id: Date.now().toString(),
      exerciseId,
      sets: [{
        id: Date.now().toString(),
        reps: 0,
        weight: 0
      }],
      notes: ''
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSet = {
          id: Date.now().toString(),
          reps: 0,
          weight: 0
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId, setId) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(set => set.id !== setId) };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set =>
            set.id === setId ? { ...set, [field]: value } : set
          )
        };
      }
      return ex;
    }));
  };

  const completeSet = (exerciseId, setId) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set =>
            set.id === setId ? { ...set, completed: true } : set
          )
        };
      }
      return ex;
    }));
  };

  const saveWorkout = () => {
    if (selectedExercises.length === 0) {
      alert('Add at least one exercise to workout session');
      return;
    }

    const workout = {
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toISOString(),
      exercises: selectedExercises,
      notes
    };

    const existingWorkouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]');
    existingWorkouts.push(workout);
    localStorage.setItem('bertLocker_workouts', JSON.stringify(existingWorkouts));

    navigate('/history');
  };

  const getExerciseName = (exerciseId) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Workout Logger</h1>
        <p className="text-slate-400">Record your training session</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Button onClick={() => setShowExerciseSelector(true)} className="flex-1">
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
        <Button
          onClick={() => setShowTemplateSelector(true)}
          variant="outline"
          className="flex-1"
          disabled={templates.length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          Start from Template
        </Button>
      </div>

      {templates.length === 0 && (
        <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <p className="text-blue-400 text-sm font-medium">
            Create templates to quickly start workouts
          </p>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-6">
        {selectedExercises.map(exercise => (
          <Card key={exercise.id} className="border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-emerald-800/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                      <Target className="h-5 w-5 text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-emerald-300">
                      {getExerciseName(exercise.exerciseId).toUpperCase()}
                    </CardTitle>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExercise(exercise.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sets */}
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className={`grid grid-cols-5 gap-4 items-center ${set.completed ? 'opacity-60' : ''}`}>
                    <div className="text-slate-200 text-sm font-medium">{index + 1}</div>
                    <Input
                      type="number"
                      value={set.reps || ''}
                      onChange={(e) => updateSet(exercise.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      disabled={set.completed}
                      variant="workout"
                    />
                    <Input
                      type="number"
                      value={set.weight || ''}
                      onChange={(e) => updateSet(exercise.id, set.id, 'weight', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      disabled={set.completed}
                      variant="workout"
                    />
                    <Button
                      onClick={() => completeSet(exercise.id, set.id)}
                      disabled={set.completed}
                      size="sm"
                      className="text-xs bg-emerald-600 hover:bg-emerald-700"
                    >
                      {set.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        'DONE'
                      )}
                    </Button>
                    <div className="text-center">
                      {set.completed && <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto" />}
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSet(exercise.id)}
                  className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Set
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record session observations..."
            className="textarea-field w-full"
            rows={4}
          />
        </CardContent>
      </Card>

      {selectedExercises.length > 0 && (
        <Button onClick={saveWorkout} className="w-full" size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save Workout Data
        </Button>
      )}

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-600">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-50">Select Exercise</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowExerciseSelector(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6">
              <div className="space-y-2">
                {exercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise.id)}
                    className="w-full text-left p-3 rounded-md border border-slate-600 hover:bg-slate-700 transition-colors"
                  >
                    <div className="font-medium text-slate-200">{exercise.name}</div>
                    <div className="text-sm text-slate-400">[{exercise.category}]</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}