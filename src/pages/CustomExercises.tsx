import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Trash2, Save, Edit, X } from 'lucide-react';

interface CustomExercise {
  id: string;
  name: string;
  category: string;
  primaryMuscles: string[];
  description: string;
  userId: string;
  createdAt: string;
}

const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other'];

const muscleGroups = [
  'Chest', 'Upper Chest', 'Lower Chest',
  'Lats', 'Rhomboids', 'Lower Back', 'Upper Back',
  'Quadriceps', 'Hamstrings', 'Glutes', 'Calves',
  'Front Delts', 'Side Delts', 'Rear Delts',
  'Biceps', 'Triceps', 'Forearms',
  'Abs', 'Obliques', 'Core'
];

export default function CustomExercises() {
  const { user } = useAuth();
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>(() => {
    const saved = localStorage.getItem('bertLocker_customExercises') || '[]';
    return JSON.parse(saved).filter((ex: CustomExercise) => ex.userId === user?.id);
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<CustomExercise | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseCategory, setExerciseCategory] = useState('Other');
  const [exerciseDescription, setExerciseDescription] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

  // Disable/enable body scroll when modal is open
  React.useEffect(() => {
    if (showCreateForm) {
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
  }, [showCreateForm]);

  const saveExercise = () => {
    if (!exerciseName.trim() || selectedMuscles.length === 0) {
      alert('Exercise name and muscle groups required');
      return;
    }

    const exercise: CustomExercise = {
      id: editingExercise?.id || Date.now().toString(),
      name: exerciseName.trim(),
      category: exerciseCategory,
      primaryMuscles: selectedMuscles,
      description: exerciseDescription.trim(),
      userId: user!.id,
      createdAt: editingExercise?.createdAt || new Date().toISOString()
    };

    const allExercises = JSON.parse(localStorage.getItem('bertLocker_customExercises') || '[]');
    const updatedExercises = editingExercise
      ? allExercises.map((ex: CustomExercise) => ex.id === exercise.id ? exercise : ex)
      : [...allExercises, exercise];

    localStorage.setItem('bertLocker_customExercises', JSON.stringify(updatedExercises));
    setCustomExercises(updatedExercises.filter((ex: CustomExercise) => ex.userId === user?.id));
    resetForm();
  };

  const deleteExercise = (exerciseId: string) => {
    const allExercises = JSON.parse(localStorage.getItem('bertLocker_customExercises') || '[]');
    const updatedExercises = allExercises.filter((ex: CustomExercise) => ex.id !== exerciseId);
    localStorage.setItem('bertLocker_customExercises', JSON.stringify(updatedExercises));
    setCustomExercises(updatedExercises.filter((ex: CustomExercise) => ex.userId === user?.id));
  };

  const editExercise = (exercise: CustomExercise) => {
    setEditingExercise(exercise);
    setExerciseName(exercise.name);
    setExerciseCategory(exercise.category);
    setExerciseDescription(exercise.description);
    setSelectedMuscles(exercise.primaryMuscles);
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingExercise(null);
    setExerciseName('');
    setExerciseCategory('Other');
    setExerciseDescription('');
    setSelectedMuscles([]);
  };

  const toggleMuscleGroup = (muscle: string) => {
    setSelectedMuscles(prev =>
      prev.includes(muscle)
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Custom Exercises</h1>
        <p className="text-slate-400">Create your own exercise database</p>
      </div>

      <Button onClick={() => setShowCreateForm(true)} className="text-white">
        <Plus className="h-4 w-4 mr-2" />
        Create New Exercise
      </Button>

      {/* Create/Edit Exercise Form - Fixed Scrolling */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0">
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <Card className="w-full max-w-2xl h-[95vh] md:h-[90vh] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-50">
                    {editingExercise ? 'Edit Exercise' : 'Create Exercise'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetForm} className="p-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Exercise Name:
                    </label>
                    <Input
                      value={exerciseName}
                      onChange={(e) => setExerciseName(e.target.value)}
                      placeholder="Enter exercise name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Category:
                    </label>
                    <select
                      value={exerciseCategory}
                      onChange={(e) => setExerciseCategory(e.target.value)}
                      className="w-full h-10 p-2 bg-slate-700 border border-slate-500 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    >
                      {categories.map(category => (
                        <option key={category} value={category} className="bg-slate-700 text-slate-200">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Description:
                    </label>
                    <textarea
                      value={exerciseDescription}
                      onChange={(e) => setExerciseDescription(e.target.value)}
                      placeholder="Exercise description and instructions..."
                      className="w-full h-20 p-3 bg-slate-700 border border-slate-500 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Primary Muscle Groups:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {muscleGroups.map(muscle => (
                        <button
                          key={muscle}
                          type="button"
                          onClick={() => toggleMuscleGroup(muscle)}
                          className={`p-2 text-xs rounded border transition-colors ${
                            selectedMuscles.includes(muscle)
                              ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                              : 'bg-slate-700 border-slate-500 text-slate-300 hover:bg-pink-500/10'
                          }`}
                        >
                          {muscle}
                        </button>
                      ))}
                    </div>
                    {selectedMuscles.length > 0 && (
                      <p className="text-xs text-slate-400 mt-2">
                        Selected: {selectedMuscles.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-600">
                    <Button onClick={saveExercise} className="flex-1 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      {editingExercise ? 'Update Exercise' : 'Save Exercise'}
                    </Button>
                    <Button onClick={resetForm} variant="outline" className="text-slate-200">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Custom Exercises List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customExercises.map(exercise => (
          <Card key={exercise.id} className="hover-lift">
            <CardHeader>
              <CardTitle className="text-lg text-slate-50">{exercise.name}</CardTitle>
              <span className="text-sm text-slate-400">[{exercise.category}]</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exercise.description && (
                  <p className="text-sm text-slate-300">{exercise.description}</p>
                )}

                <div>
                  <p className="text-sm font-medium text-slate-200 mb-1">Target Zones:</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.primaryMuscles.map(muscle => (
                      <span
                        key={muscle}
                        className="text-xs bg-slate-700 border border-slate-500 text-slate-300 px-2 py-1 rounded"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => editExercise(exercise)}
                    variant="outline"
                    size="sm"
                    className="text-slate-200"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => deleteExercise(exercise.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customExercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No custom exercises found</p>
          <p className="text-slate-500 text-sm">Create your first custom exercise</p>
        </div>
      )}
    </div>
  );
}