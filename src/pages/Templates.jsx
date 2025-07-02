import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { exercises } from '../data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Plus, Edit, Trash2, X, Search, Users, Clock, AlertTriangle } from 'lucide-react';

export default function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [user]);

  const loadTemplates = () => {
    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const userTemplates = allTemplates.filter(t => t.userId === user?.id);
    setTemplates(userTemplates);
  };

  const saveTemplate = () => {
    if (!templateName.trim()) {
      alert('Template name is required');
      return;
    }

    if (selectedExercises.length === 0) {
      alert('Add at least one exercise to template');
      return;
    }

    const templateData = {
      id: Date.now().toString(),
      userId: user.id,
      name: templateName,
      description: templateDescription,
      exercises: selectedExercises.map((ex, index) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        order: index,
        sets: ex.sets || 3,
        notes: ex.notes || ''
      })),
      createdAt: new Date().toISOString(),
      version: 2
    };

    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    allTemplates.push(templateData);
    localStorage.setItem('bertLocker_templates', JSON.stringify(allTemplates));

    closeModal();
    loadTemplates();
  };

  const deleteTemplate = (templateId) => {
    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const updatedTemplates = allTemplates.filter(t => t.id !== templateId);
    localStorage.setItem('bertLocker_templates', JSON.stringify(updatedTemplates));
    loadTemplates();
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setTemplateName('');
    setTemplateDescription('');
    setSelectedExercises([]);
    setShowExerciseSelector(false);
    setSearchTerm('');
  };

  const addExercise = (exerciseId) => {
    const newExercise = {
      id: Date.now().toString(),
      exerciseId,
      sets: 3,
      notes: ''
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
  };

  const removeExercise = (exerciseId) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
  };

  const getExerciseName = (exerciseId) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };

  const getTotalSets = (template) => {
    return (template.exercises || []).reduce((total, ex) => total + (ex.sets || 0), 0);
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.primaryMuscles.some(muscle =>
      muscle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const availableExercises = filteredExercises.filter(exercise =>
    !selectedExercises.some(selected => selected.exerciseId === exercise.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-50 mb-2">Workout Templates</h1>
          <p className="text-slate-400">Manage training protocols</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-50">{template.name}</CardTitle>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  {(template.exercises || []).length} exercise{(template.exercises || []).length !== 1 ? 's' : ''} • {getTotalSets(template)} total sets
                </p>
                {template.description && (
                  <p className="text-xs text-slate-500">{template.description}</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {(template.exercises || [])
                  .slice(0, 3)
                  .map(exercise => (
                    <div key={exercise.id} className="text-sm text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      {getExerciseName(exercise.exerciseId)} - {exercise.sets} sets
                    </div>
                  ))}
                {(template.exercises || []).length > 3 && (
                  <div className="text-sm text-slate-400 ml-4">
                    +{(template.exercises || []).length - 3} more...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-slate-200"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  className="text-red-400 hover:text-red-300 px-3"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No templates found</h3>
            <p className="text-slate-400 mb-4">Create your first workout template</p>
            <Button onClick={() => setShowCreateModal(true)} className="text-white">
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-600">
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-50">Create Template</CardTitle>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Template Name:
                  </label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Description (Optional):
                  </label>
                  <Input
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowExerciseSelector(true)}
                    className="text-slate-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </div>

                {selectedExercises.map((exercise, index) => (
                  <div key={exercise.id} className="border border-slate-600 rounded-md p-4 bg-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-200">
                        {getExerciseName(exercise.exerciseId)}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(exercise.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <Button onClick={saveTemplate} className="flex-1 text-white">
                    Save Template
                  </Button>
                  <Button onClick={closeModal} variant="outline" className="text-slate-200">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6">
              <div className="space-y-2">
                {availableExercises.map(exercise => (
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
              {availableExercises.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">
                    {searchTerm ? 'No exercises match search' : 'All exercises added'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}