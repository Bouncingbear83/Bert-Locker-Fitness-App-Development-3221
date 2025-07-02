import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { exercises } from '@/data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Select from '@/components/ui/Select';
import InlineInputGroup from '@/components/ui/InlineInputGroup';
import RestTimer from '@/components/RestTimer';
import { Plus, Trash2, Save, FileText, X, Info, Users, Clock, ArrowRight, Target, CheckCircle } from 'lucide-react';

interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed?: boolean;
}

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
  isInSuperset?: boolean;
  supersetId?: string;
  restAfterSet?: number;
}

interface Workout {
  id: string;
  userId: string;
  date: string;
  exercises: WorkoutExercise[];
  duration?: number;
  notes?: string;
}

interface TemplateExercise {
  id: string;
  exerciseId: string;
  order: number;
  sets: number;
  notes?: string;
  isInSuperset: boolean;
  supersetId?: string;
  restAfterSet?: number;
}

interface Superset {
  id: string;
  name: string;
  exerciseIds: string[];
  restBetweenExercises: number;
  restBetweenSets: number;
  order: number;
}

interface WorkoutTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
  supersets: Superset[];
  defaultRestBetweenSets: number;
  createdAt: string;
  version?: number;
}

export default function WorkoutLogger() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [notes, setNotes] = useState('');
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(90);
  const [currentRestContext, setCurrentRestContext] = useState('');
  
  const [supersetProgress, setSupersetProgress] = useState<{[key: string]: {
    currentExercise: number,
    currentSet: number,
    totalSets: number
  }}>({});
  const [activeSuperset, setActiveSuperset] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, [user]);

  // Disable/enable body scroll when modals are open
  useEffect(() => {
    const hasModal = showExerciseSelector || showTemplateSelector;
    if (hasModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [showExerciseSelector, showTemplateSelector]);

  const loadTemplates = () => {
    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const userTemplates = allTemplates.filter((t: WorkoutTemplate) => t.userId === user?.id);
    setTemplates(userTemplates);
  };

  const addExercise = (exerciseId: string) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      exerciseId,
      sets: [{
        id: Date.now().toString(),
        reps: 0,
        weight: 0
      }],
      notes: '',
      isInSuperset: false
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSet: WorkoutSet = {
          id: Date.now().toString(),
          reps: 0,
          weight: 0
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setSelectedExercises(selectedExercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(set => set.id !== setId) };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
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

  const completeSet = (exerciseId: string, setId: string, restTime: number) => {
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

    // Handle rest timer based on superset or regular exercise
    const exercise = selectedExercises.find(ex => ex.id === exerciseId);
    if (exercise?.isInSuperset && exercise?.supersetId) {
      handleSupersetProgress(exercise.supersetId, exerciseId, setId);
    } else {
      setCurrentRestTime(restTime);
      setCurrentRestContext('Rest before next set');
      setShowRestTimer(true);
    }
  };

  const handleSupersetProgress = (supersetId: string, exerciseId: string, setId: string) => {
    const template = templates.find(t => t.supersets.some(ss => ss.id === supersetId));
    const superset = template?.supersets.find(ss => ss.id === supersetId);
    if (!superset) return;

    const supersetExercises = selectedExercises.filter(ex => ex.supersetId === supersetId);
    const currentExerciseIndex = supersetExercises.findIndex(ex => ex.id === exerciseId);
    const currentExercise = supersetExercises[currentExerciseIndex];
    const currentSetIndex = currentExercise.sets.findIndex(set => set.id === setId);

    // Update superset progress
    const newProgress = {
      ...supersetProgress,
      [supersetId]: {
        currentExercise: currentExerciseIndex,
        currentSet: currentSetIndex,
        totalSets: Math.max(...supersetExercises.map(ex => ex.sets.length))
      }
    };
    setSupersetProgress(newProgress);
    setActiveSuperset(supersetId);

    // Check if this is the last exercise in the superset for this set
    if (currentExerciseIndex === supersetExercises.length - 1) {
      // Last exercise in superset round - start rest timer for superset completion
      setCurrentRestTime(superset.restBetweenSets);
      setCurrentRestContext(`Superset round complete - Rest before next round`);
      setShowRestTimer(true);
    } else {
      // Not last exercise - short rest between superset exercises
      if (superset.restBetweenExercises > 0) {
        setCurrentRestTime(superset.restBetweenExercises);
        setCurrentRestContext(`Next exercise: ${getExerciseName(supersetExercises[currentExerciseIndex + 1].exerciseId)}`);
        setShowRestTimer(true);
      }
    }
  };

  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setSelectedExercises(selectedExercises.map(ex =>
      ex.id === exerciseId ? { ...ex, notes } : ex
    ));
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    const templateExercises: WorkoutExercise[] = (template.exercises || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(templateEx => ({
        id: Date.now().toString() + Math.random(),
        exerciseId: templateEx.exerciseId,
        sets: Array.from({ length: templateEx.sets || 3 }, (_, i) => ({
          id: Date.now().toString() + Math.random() + i,
          reps: 0,
          weight: 0,
          completed: false
        })),
        notes: templateEx.notes || '',
        isInSuperset: templateEx.isInSuperset || false,
        supersetId: templateEx.supersetId,
        restAfterSet: templateEx.restAfterSet
      }));

    setSelectedExercises(templateExercises);
    setShowTemplateSelector(false);

    // Initialize superset progress
    const initialProgress: {[key: string]: {currentExercise: number, currentSet: number, totalSets: number}} = {};
    (template.supersets || []).forEach(superset => {
      const supersetExercises = templateExercises.filter(ex => ex.supersetId === superset.id);
      initialProgress[superset.id] = {
        currentExercise: 0,
        currentSet: 0,
        totalSets: Math.max(...supersetExercises.map(ex => ex.sets.length))
      };
    });
    setSupersetProgress(initialProgress);
  };

  const saveWorkout = () => {
    if (selectedExercises.length === 0) {
      alert('Add at least one exercise to workout session');
      return;
    }

    const workout: Workout = {
      id: Date.now().toString(),
      userId: user!.id,
      date: new Date().toISOString(),
      exercises: selectedExercises,
      notes
    };

    const existingWorkouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]');
    existingWorkouts.push(workout);
    localStorage.setItem('bertLocker_workouts', JSON.stringify(existingWorkouts));

    navigate('/history');
  };

  const getExerciseName = (exerciseId: string) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };

  const getTotalSets = (template: WorkoutTemplate) => {
    return (template.exercises || []).reduce((total, ex) => total + (ex.sets || 0), 0);
  };

  const getRestTimeForExercise = (exercise: WorkoutExercise, template?: WorkoutTemplate) => {
    if (exercise.restAfterSet !== undefined) {
      return exercise.restAfterSet;
    }
    if (template) {
      return template.defaultRestBetweenSets || 90;
    }
    return 90; // fallback
  };

  const getSupersetInfo = (supersetId: string) => {
    const template = templates.find(t => t.supersets.some(ss => ss.id === supersetId));
    return template?.supersets.find(ss => ss.id === supersetId);
  };

  const renderExercisesByType = () => {
    const regularExercises = selectedExercises.filter(ex => !ex.isInSuperset);
    const supersetGroups = Array.from(new Set(
      selectedExercises
        .filter(ex => ex.isInSuperset && ex.supersetId)
        .map(ex => ex.supersetId)
    )).map(supersetId => {
      const supersetInfo = getSupersetInfo(supersetId!);
      return {
        supersetId: supersetId!,
        superset: supersetInfo,
        exercises: selectedExercises.filter(ex => ex.supersetId === supersetId)
      };
    });

    return (
      <div className="space-y-8 mb-8">
        {/* Mobile tip */}
        <div className="block md:hidden text-xs text-emerald-400 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl">
          💡 <span className="font-semibold">TIP:</span> Blue = Superset (complete all exercises in sequence), Green = Regular exercise
        </div>

        {/* Regular Exercises */}
        {regularExercises.map(exercise => (
          <Card key={exercise.id} className="border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-900/20 to-emerald-800/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                      <Target className="h-5 w-5 text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg md:text-xl font-semibold text-emerald-300">
                      {getExerciseName(exercise.exerciseId).toUpperCase()}
                    </CardTitle>
                  </div>
                  {exercise.notes && (
                    <div className="flex items-center gap-2 mt-1">
                      <Info className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400">{exercise.notes}</span>
                    </div>
                  )}
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
                  <InlineInputGroup
                    key={set.id}
                    setNumber={index + 1}
                    reps={set.reps}
                    weight={set.weight}
                    completed={set.completed}
                    context="regular"
                    onRepsChange={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                    onWeightChange={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                    onComplete={() => completeSet(exercise.id, set.id, getRestTimeForExercise(exercise))}
                    onRemove={() => removeSet(exercise.id, set.id)}
                    showRemove={exercise.sets.length > 1}
                  />
                ))}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSet(exercise.id)}
                    className="flex-1 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Set
                  </Button>
                </div>

                <div>
                  <TextArea
                    label="Exercise Notes"
                    value={exercise.notes || ''}
                    onChange={(e) => updateExerciseNotes(exercise.id, e.target.value)}
                    placeholder="Form notes, rest time, observations..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Supersets with enhanced visual clarity */}
        {supersetGroups.map(({ supersetId, superset, exercises: supersetExercises }) => {
          const progress = supersetProgress[supersetId];
          const isActive = activeSuperset === supersetId;
          
          return (
            <Card 
              key={supersetId} 
              className={`border-4 border-blue-500/70 bg-gradient-to-br from-blue-900/30 to-blue-800/20 ${
                isActive ? 'ring-4 ring-blue-400/50' : ''
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                      <Users className="h-6 w-6 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <CardTitle className="text-lg md:text-xl font-semibold text-blue-300">
                        {superset?.name.toUpperCase() || `SUPERSET ${supersetId}`}
                      </CardTitle>
                      {progress && (
                        <div className="text-sm text-blue-400 mt-1">
                          Round {progress.currentSet + 1} of {progress.totalSets} • Exercise {progress.currentExercise + 1} of {supersetExercises.length}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-blue-400 bg-blue-900/30 p-3 rounded-xl border border-blue-500/30">
                    <div>⏱️ REST: {superset?.restBetweenExercises || 0}s between exercises</div>
                    <div>🔄 {superset?.restBetweenSets || 0}s between rounds</div>
                  </div>
                </div>

                {/* Superset Instructions */}
                <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-500/30">
                  <p className="text-blue-400 text-sm">
                    🎯 <span className="font-semibold">SUPERSET FLOW:</span> Complete all exercises in sequence, then rest
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {supersetExercises.map((exercise, exerciseIndex) => {
                    const isCurrentExercise = progress?.currentExercise === exerciseIndex;
                    
                    return (
                      <div 
                        key={exercise.id} 
                        className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                          isCurrentExercise 
                            ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20' 
                            : 'border-blue-500/30 bg-blue-900/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center">
                              <span className="text-blue-400 text-xs font-semibold bg-blue-500/20 px-2 py-1 rounded-full border border-blue-400/50">
                                SS
                              </span>
                              <span className="text-blue-400 text-xs font-semibold mt-1">
                                {exerciseIndex + 1}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-300 text-sm md:text-base">
                                {getExerciseName(exercise.exerciseId).toUpperCase()}
                              </h4>
                              {isCurrentExercise && (
                                <div className="flex items-center gap-2 mt-1">
                                  <ArrowRight className="h-4 w-4 text-blue-400 animate-pulse" />
                                  <span className="text-xs text-blue-400 animate-pulse font-semibold">CURRENT EXERCISE</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {exercise.notes && (
                            <div className="flex items-center gap-2">
                              <Info className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-blue-400">{exercise.notes}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {exercise.sets.map((set, setIndex) => {
                            const isCurrentSet = isCurrentExercise && progress?.currentSet === setIndex;
                            
                            return (
                              <InlineInputGroup
                                key={set.id}
                                setNumber={setIndex + 1}
                                reps={set.reps}
                                weight={set.weight}
                                completed={set.completed}
                                context="superset"
                                onRepsChange={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                                onWeightChange={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                                onComplete={() => completeSet(exercise.id, set.id, superset?.restBetweenSets || 90)}
                                onRemove={() => removeSet(exercise.id, set.id)}
                                showRemove={exercise.sets.length > 1}
                                className={isCurrentSet ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''}
                              />
                            );
                          })}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSet(exercise.id)}
                            className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Set
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {selectedExercises.length === 0 && (
          <Card className="border-2 border-dashed border-slate-600/50">
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-2 font-semibold">No exercises added</div>
              <div className="text-slate-500 text-sm">Add exercises or start from a template to begin your workout</div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">Workout Logger</h1>
        <p className="text-slate-400">Record your training session</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Button
          onClick={() => setShowExerciseSelector(true)}
          className="flex-1"
        >
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
          <span className="hidden md:inline">Start from </span>Template
        </Button>
      </div>

      {templates.length === 0 && (
        <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
          <p className="text-blue-400 text-sm font-medium">
            Create templates to quickly start workouts
          </p>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0">
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <Card className="w-full max-w-2xl h-[95vh] md:h-[80vh] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <CardTitle>Select Template</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplateSelector(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="w-full text-left p-4 rounded-xl border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-colors"
                    >
                      <div className="font-semibold text-slate-200 mb-1 text-sm md:text-base">
                        {template.name.toUpperCase()}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">
                        {(template.exercises || []).length} exercise{(template.exercises || []).length !== 1 ? 's' : ''} • {getTotalSets(template)} total sets
                        {(template.supersets || []).length > 0 && (
                          <span className="text-blue-400 block md:inline">
                            <span className="hidden md:inline"> • </span>
                            🔗 {(template.supersets || []).length} superset{(template.supersets || []).length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <div className="text-xs text-slate-500 mb-2">
                          {template.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0">
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <Card className="w-full max-w-2xl h-[95vh] md:h-[80vh] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <CardTitle>Select Exercise</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowExerciseSelector(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-2">
                  {exercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => addExercise(exercise.id)}
                      className="w-full text-left p-3 rounded-xl border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-colors active:bg-slate-600"
                    >
                      <div className="font-semibold text-slate-200 text-sm">{exercise.name}</div>
                      <div className="text-sm text-slate-400">[{exercise.category}]</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {renderExercisesByType()}

      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record session observations, energy levels, form notes..."
            rows={4}
          />
        </CardContent>
      </Card>

      {selectedExercises.length > 0 && (
        <Button
          onClick={saveWorkout}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Workout Data
        </Button>
      )}

      <RestTimer
        isVisible={showRestTimer}
        onClose={() => {
          setShowRestTimer(false);
          setActiveSuperset(null);
        }}
        defaultTime={currentRestTime}
        context={currentRestContext}
      />
    </div>
  );
}