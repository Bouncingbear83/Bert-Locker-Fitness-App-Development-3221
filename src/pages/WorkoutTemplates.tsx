import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { exercises } from '@/data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Trash2, Save, Play, Edit } from 'lucide-react';

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  userId: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
  createdAt: string;
}

export default function WorkoutTemplates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => {
    const saved = localStorage.getItem('bertLocker_templates') || '[]';
    return JSON.parse(saved).filter((t: WorkoutTemplate) => t.userId === user?.id);
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const saveTemplate = () => {
    if (!templateName.trim() || selectedExercises.length === 0) {
      alert('TEMPLATE NAME AND EXERCISES REQUIRED');
      return;
    }

    const template: WorkoutTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: templateName,
      description: templateDescription,
      userId: user!.id,
      exercises: selectedExercises,
      createdAt: editingTemplate?.createdAt || new Date().toISOString()
    };

    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const updatedTemplates = editingTemplate 
      ? allTemplates.map((t: WorkoutTemplate) => t.id === template.id ? template : t)
      : [...allTemplates, template];
    
    localStorage.setItem('bertLocker_templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates.filter((t: WorkoutTemplate) => t.userId === user?.id));
    resetForm();
  };

  const deleteTemplate = (templateId: string) => {
    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const updatedTemplates = allTemplates.filter((t: WorkoutTemplate) => t.id !== templateId);
    localStorage.setItem('bertLocker_templates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates.filter((t: WorkoutTemplate) => t.userId === user?.id));
  };

  const startWorkoutFromTemplate = (template: WorkoutTemplate) => {
    const workoutData = {
      templateId: template.id,
      exercises: template.exercises.map(ex => ({
        id: Date.now().toString() + Math.random(),
        exerciseId: ex.exerciseId,
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          id: Date.now().toString() + i,
          reps: ex.reps,
          weight: ex.weight
        }))
      }))
    };
    localStorage.setItem('bertLocker_activeWorkout', JSON.stringify(workoutData));
    navigate('/workout');
  };

  const editTemplate = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description);
    setSelectedExercises(template.exercises);
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setSelectedExercises([]);
  };

  const addExerciseToTemplate = (exerciseId: string) => {
    const newExercise = {
      exerciseId,
      sets: 3,
      reps: 10,
      weight: 0
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExerciseFromTemplate = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExerciseInTemplate = (index: number, field: string, value: number) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const getExerciseName = (exerciseId: string) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'UNKNOWN EXERCISE';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold neon-text mb-2 font-mono">WORKOUT TEMPLATES</h1>
        <p className="text-green-400 font-mono">SAVED TRAINING PROTOCOLS</p>
      </div>

      <Button onClick={() => setShowCreateForm(true)} className="font-mono">
        <Plus className="h-4 w-4 mr-2" />
        CREATE NEW TEMPLATE
      </Button>

      {/* Create/Edit Template Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="font-mono">
                {editingTemplate ? 'EDIT TEMPLATE' : 'CREATE TEMPLATE'}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-1 font-mono">
                    TEMPLATE NAME:
                  </label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-1 font-mono">
                    DESCRIPTION:
                  </label>
                  <textarea
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Template description..."
                    className="w-full h-20 p-3 bg-black/60 border border-green-500/30 rounded-md text-green-300 placeholder-green-500/60 focus:outline-none focus:ring-2 focus:ring-green-500/50 font-mono"
                  />
                </div>
                
                <div>
                  <Button onClick={() => setShowExerciseSelector(true)} variant="outline" className="font-mono">
                    <Plus className="h-4 w-4 mr-2" />
                    ADD EXERCISE
                  </Button>
                </div>

                {selectedExercises.map((exercise, index) => (
                  <div key={index} className="border border-green-500/30 rounded-md p-4 bg-green-900/10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-green-300 font-mono">
                        {getExerciseName(exercise.exerciseId).toUpperCase()}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExerciseFromTemplate(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-green-400 mb-1 font-mono">SETS:</label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExerciseInTemplate(index, 'sets', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-green-400 mb-1 font-mono">REPS:</label>
                        <Input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExerciseInTemplate(index, 'reps', parseInt(e.target.value) || 0)}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-green-400 mb-1 font-mono">WEIGHT:</label>
                        <Input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExerciseInTemplate(index, 'weight', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <Button onClick={saveTemplate} className="font-mono">
                    <Save className="h-4 w-4 mr-2" />
                    {editingTemplate ? 'UPDATE TEMPLATE' : 'SAVE TEMPLATE'}
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="font-mono">
                    CANCEL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="font-mono">SELECT EXERCISE</CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-2">
                {exercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => addExerciseToTemplate(exercise.id)}
                    className="w-full text-left p-3 rounded-md border border-green-500/30 hover:bg-green-500/10 hover:border-green-400/50 transition-colors"
                  >
                    <div className="font-medium text-green-300 font-mono">{exercise.name.toUpperCase()}</div>
                    <div className="text-sm text-green-400 font-mono">[{exercise.category.toUpperCase()}]</div>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setShowExerciseSelector(false)} className="w-full font-mono">
                  CANCEL
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="scan-line">
            <CardHeader>
              <CardTitle className="text-lg font-mono">{template.name.toUpperCase()}</CardTitle>
              <p className="text-sm text-green-400 font-mono">{template.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-green-400 font-mono">
                  {template.exercises.length} EXERCISES
                </div>
                <div className="space-y-1">
                  {template.exercises.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="text-xs text-green-300 font-mono">
                      • {getExerciseName(exercise.exerciseId).toUpperCase()} - {exercise.sets}x{exercise.reps}
                    </div>
                  ))}
                  {template.exercises.length > 3 && (
                    <div className="text-xs text-green-400 font-mono">
                      +{template.exercises.length - 3} MORE...
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => startWorkoutFromTemplate(template)} size="sm" className="font-mono">
                    <Play className="h-4 w-4 mr-1" />
                    START
                  </Button>
                  <Button onClick={() => editTemplate(template)} variant="outline" size="sm" className="font-mono">
                    <Edit className="h-4 w-4 mr-1" />
                    EDIT
                  </Button>
                  <Button 
                    onClick={() => deleteTemplate(template.id)} 
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

      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-green-400 font-mono">NO TEMPLATES FOUND</p>
          <p className="text-green-500/60 font-mono text-sm">CREATE YOUR FIRST WORKOUT TEMPLATE</p>
        </div>
      )}
    </div>
  );
}