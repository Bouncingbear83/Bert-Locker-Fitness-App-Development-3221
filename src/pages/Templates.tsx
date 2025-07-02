import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { exercises } from '@/data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, Edit, Trash2, GripVertical, X, Search, Link, Users, Clock, AlertTriangle } from 'lucide-react';

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

export default function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [defaultRestBetweenSets, setDefaultRestBetweenSets] = useState(90);
  const [selectedExercises, setSelectedExercises] = useState<TemplateExercise[]>([]);
  const [supersets, setSupersets] = useState<Superset[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSupersetCreator, setShowSupersetCreator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);

  // Superset creation state
  const [supersetName, setSupersetName] = useState('');
  const [supersetExercises, setSupersetExercises] = useState<string[]>([]);
  const [restBetweenExercises, setRestBetweenExercises] = useState(30);
  const [restBetweenSets, setRestBetweenSets] = useState(90);
  const [editingSuperset, setEditingSuperset] = useState<Superset | null>(null);

  useEffect(() => {
    loadTemplatesWithMigration();
  }, [user]);

  // Disable/enable body scroll when modals are open
  useEffect(() => {
    const hasModal = showCreateModal || showExerciseSelector || showSupersetCreator || deleteConfirm;
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
  }, [showCreateModal, showExerciseSelector, showSupersetCreator, deleteConfirm]);

  const loadTemplatesWithMigration = () => {
    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const userTemplates = allTemplates.filter((t: any) => t.userId === user?.id);
    let migratedCount = 0;

    const migratedTemplates = userTemplates.map((template: any) => {
      const needsMigration = !template.version || template.version < 2;
      if (needsMigration) {
        migratedCount++;
        return migrateTemplate(template);
      }
      return template;
    });

    if (migratedCount > 0) {
      setMigrationStatus(`Successfully migrated ${migratedCount} template${migratedCount > 1 ? 's' : ''} to support supersets`);
      const allUpdatedTemplates = allTemplates.map((t: any) => {
        const migrated = migratedTemplates.find((m: any) => m.id === t.id);
        return migrated || t;
      });
      localStorage.setItem('bertLocker_templates', JSON.stringify(allUpdatedTemplates));
      setTimeout(() => setMigrationStatus(null), 5000);
    }

    setTemplates(migratedTemplates);
  };

  const migrateTemplate = (oldTemplate: any): WorkoutTemplate => {
    console.log('Migrating template:', oldTemplate.name);
    return {
      ...oldTemplate,
      version: 2,
      supersets: oldTemplate.supersets || [],
      defaultRestBetweenSets: oldTemplate.defaultRestBetweenSets || 90,
      exercises: (oldTemplate.exercises || []).map((ex: any, index: number) => ({
        id: ex.id || `migrated_${index}_${Date.now()}`,
        exerciseId: ex.exerciseId,
        order: ex.order !== undefined ? ex.order : index,
        sets: ex.sets || 3,
        notes: ex.notes || '',
        isInSuperset: ex.isInSuperset || false,
        supersetId: ex.supersetId || undefined,
        restAfterSet: ex.restAfterSet || undefined
      }))
    };
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

    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const templateData: WorkoutTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      userId: user!.id,
      name: templateName,
      description: templateDescription,
      exercises: selectedExercises,
      supersets: supersets,
      defaultRestBetweenSets: defaultRestBetweenSets,
      createdAt: editingTemplate?.createdAt || new Date().toISOString(),
      version: 2
    };

    if (editingTemplate) {
      const updatedTemplates = allTemplates.map((t: WorkoutTemplate) =>
        t.id === editingTemplate.id ? templateData : t
      );
      localStorage.setItem('bertLocker_templates', JSON.stringify(updatedTemplates));
    } else {
      allTemplates.push(templateData);
      localStorage.setItem('bertLocker_templates', JSON.stringify(allTemplates));
    }

    closeModal();
    loadTemplatesWithMigration();
  };

  const deleteTemplate = (templateId: string) => {
    const allTemplates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    const updatedTemplates = allTemplates.filter((t: WorkoutTemplate) => t.id !== templateId);
    localStorage.setItem('bertLocker_templates', JSON.stringify(updatedTemplates));
    loadTemplatesWithMigration();
    setDeleteConfirm(null);
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setDefaultRestBetweenSets(90);
    setSelectedExercises([]);
    setSupersets([]);
    setShowCreateModal(true);
  };

  const openEditModal = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setDefaultRestBetweenSets(template.defaultRestBetweenSets || 90);
    setSelectedExercises(template.exercises || []);
    setSupersets(template.supersets || []);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setDefaultRestBetweenSets(90);
    setSelectedExercises([]);
    setSupersets([]);
    setShowExerciseSelector(false);
    setShowSupersetCreator(false);
    setSearchTerm('');
    resetSupersetForm();
  };

  const resetSupersetForm = () => {
    setSupersetName('');
    setSupersetExercises([]);
    setRestBetweenExercises(30);
    setRestBetweenSets(90);
    setEditingSuperset(null);
  };

  const addExercise = (exerciseId: string) => {
    const newExercise: TemplateExercise = {
      id: Date.now().toString(),
      exerciseId,
      order: selectedExercises.length,
      sets: 3,
      notes: '',
      isInSuperset: false
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setShowExerciseSelector(false);
    setSearchTerm('');
  };

  const removeExercise = (exerciseId: string) => {
    const exercise = selectedExercises.find(ex => ex.id === exerciseId);
    if (exercise?.isInSuperset && exercise?.supersetId) {
      const superset = supersets.find(ss => ss.id === exercise.supersetId);
      if (superset) {
        const updatedSuperset = {
          ...superset,
          exerciseIds: superset.exerciseIds.filter(id => id !== exerciseId)
        };

        if (updatedSuperset.exerciseIds.length < 2) {
          setSupersets(supersets.filter(ss => ss.id !== exercise.supersetId));
          setSelectedExercises(selectedExercises
            .filter(ex => ex.id !== exerciseId)
            .map(ex => ex.supersetId === exercise.supersetId
              ? { ...ex, isInSuperset: false, supersetId: undefined }
              : ex
            )
          );
        } else {
          setSupersets(supersets.map(ss => ss.id === exercise.supersetId ? updatedSuperset : ss));
          setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
        }
      }
    } else {
      setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
    }
  };

  const updateExercise = (exerciseId: string, field: keyof TemplateExercise, value: any) => {
    setSelectedExercises(selectedExercises.map(ex =>
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const openSupersetCreator = () => {
    const nextSupersetNumber = supersets.length + 1;
    setSupersetName(`Superset ${nextSupersetNumber}`);
    setShowSupersetCreator(true);
  };

  const openSupersetEditor = (superset: Superset) => {
    setEditingSuperset(superset);
    setSupersetName(superset.name);
    setSupersetExercises([...superset.exerciseIds]);
    setRestBetweenExercises(superset.restBetweenExercises);
    setRestBetweenSets(superset.restBetweenSets);
    setShowSupersetCreator(true);
  };

  const addExerciseToSuperset = (exerciseId: string) => {
    if (!supersetExercises.includes(exerciseId)) {
      setSupersetExercises([...supersetExercises, exerciseId]);
    }
  };

  const removeExerciseFromSuperset = (exerciseId: string) => {
    setSupersetExercises(supersetExercises.filter(id => id !== exerciseId));
  };

  const saveSuperset = () => {
    if (supersetExercises.length < 2) {
      alert('Superset must contain at least 2 exercises');
      return;
    }

    const supersetData: Superset = {
      id: editingSuperset?.id || Date.now().toString(),
      name: supersetName || `Superset ${supersets.length + 1}`,
      exerciseIds: supersetExercises,
      restBetweenExercises,
      restBetweenSets,
      order: editingSuperset?.order || supersets.length
    };

    if (editingSuperset) {
      setSupersets(supersets.map(ss => ss.id === editingSuperset.id ? supersetData : ss));
      setSelectedExercises(selectedExercises.map(ex => {
        if (supersetExercises.includes(ex.id)) {
          return { ...ex, isInSuperset: true, supersetId: supersetData.id };
        } else if (ex.supersetId === editingSuperset.id) {
          return { ...ex, isInSuperset: false, supersetId: undefined };
        }
        return ex;
      }));
    } else {
      setSupersets([...supersets, supersetData]);
      setSelectedExercises(selectedExercises.map(ex =>
        supersetExercises.includes(ex.id)
          ? { ...ex, isInSuperset: true, supersetId: supersetData.id }
          : ex
      ));
    }

    setShowSupersetCreator(false);
    resetSupersetForm();
  };

  const deleteSuperset = (supersetId: string) => {
    setSupersets(supersets.filter(ss => ss.id !== supersetId));
    setSelectedExercises(selectedExercises.map(ex =>
      ex.supersetId === supersetId
        ? { ...ex, isInSuperset: false, supersetId: undefined }
        : ex
    ));
  };

  const getExerciseName = (exerciseId: string) => {
    return exercises.find(ex => ex.id === exerciseId)?.name || 'Unknown Exercise';
  };

  const getTotalSets = (template: WorkoutTemplate) => {
    return (template.exercises || []).reduce((total, ex) => total + (ex.sets || 0), 0);
  };

  const getAvailableExercisesForSuperset = () => {
    return selectedExercises.filter(ex => !ex.isInSuperset);
  };

  const renderExercisesByType = () => {
    const regularExercises = selectedExercises.filter(ex => !ex.isInSuperset);
    const supersetGroups = supersets.map(superset => ({
      superset,
      exercises: selectedExercises.filter(ex => ex.supersetId === superset.id)
    }));

    return (
      <div className="space-y-6">
        {/* Mobile-optimized layout */}
        <div className="block md:hidden text-xs text-slate-400 mb-4 p-3 bg-slate-800 border border-slate-600 rounded-md">
          💡 TIP: Tap and hold exercises for options. Blue=Superset, Green=Regular
        </div>

        {/* Regular Exercises */}
        {regularExercises.map((exercise, index) => (
          <div key={exercise.id} className="p-4 bg-slate-800 border-2 border-slate-600 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
                <div className="font-medium text-slate-200 text-sm md:text-base">
                  {getExerciseName(exercise.exerciseId)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExercise(exercise.id)}
                className="text-red-400 hover:text-red-300 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-3">
              <div>
                <label className="block text-xs text-slate-200 mb-1">Sets:</label>
                <Input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-200 mb-1">Rest (sec):</label>
                <Input
                  type="number"
                  value={exercise.restAfterSet || defaultRestBetweenSets}
                  onChange={(e) => updateExercise(exercise.id, 'restAfterSet', parseInt(e.target.value) || 0)}
                  min="0"
                  className="text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-200 mb-1">Notes:</label>
                <Input
                  value={exercise.notes || ''}
                  onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                  placeholder="Form cues, etc..."
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Supersets with enhanced mobile UI */}
        {supersetGroups.map(({ superset, exercises: supersetExercises }) => (
          <div key={superset.id} className="border-4 border-blue-500/70 rounded-xl p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 shadow-xl">
            {/* Superset Header */}
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5 text-blue-400 animate-pulse" />
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <h4 className="font-bold text-blue-300 text-sm md:text-base">{superset.name}</h4>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSupersetEditor(superset)}
                  className="text-blue-400 border-blue-400 hover:bg-blue-500/20 p-2"
                >
                  <Edit className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSuperset(superset.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>

            {/* Superset Info */}
            <div className="mb-4 p-2 bg-blue-900/20 rounded border border-blue-500/30">
              <div className="text-xs text-blue-400 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <span>⏱️ Rest: {superset.restBetweenExercises}s between exercises</span>
                <span>🔄 {superset.restBetweenSets}s between rounds</span>
              </div>
            </div>

            {/* Superset Exercises */}
            <div className="space-y-4">
              {supersetExercises.map((exercise, index) => (
                <div key={exercise.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center mt-2">
                    <div className="text-blue-400 text-xs bg-blue-500/20 px-2 py-1 rounded-full border border-blue-400/50">
                      SS
                    </div>
                    <div className="text-blue-400 text-xs mt-1">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 p-3 bg-blue-900/20 border-2 border-blue-500/40 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium text-blue-300 text-sm">
                        {getExerciseName(exercise.exerciseId)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-3">
                      <div>
                        <label className="block text-xs text-blue-400 mb-1">Sets:</label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                          min="1"
                          max="20"
                          className="text-sm border-blue-500/30"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs text-blue-400 mb-1">Notes:</label>
                        <Input
                          value={exercise.notes || ''}
                          onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                          placeholder="Form cues, etc..."
                          className="text-sm border-blue-500/30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {selectedExercises.length === 0 && (
          <div className="text-center py-8 p-4 border-2 border-dashed border-slate-600 rounded-lg">
            <div className="text-slate-400 mb-2">No exercises added</div>
            <div className="text-slate-500 text-sm">Tap "Add Exercise" to start building your template</div>
          </div>
        )}
      </div>
    );
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
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Migration Status */}
      {migrationStatus && (
        <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
            <span className="text-blue-300 text-sm">{migrationStatus}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-2">Workout Templates</h1>
          <p className="text-slate-400 text-sm md:text-base">Manage training protocols</p>
        </div>
        <Button onClick={openCreateModal} className="w-full md:w-auto text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id} className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg text-slate-50">{template.name}</CardTitle>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">
                  {(template.exercises || []).length} exercise{(template.exercises || []).length !== 1 ? 's' : ''} • {getTotalSets(template)} total sets
                  {(template.supersets || []).length > 0 && (
                    <span className="text-blue-400 block md:inline">
                      <span className="hidden md:inline"> • </span>
                      🔗 {(template.supersets || []).length} superset{(template.supersets || []).length !== 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                {template.description && (
                  <p className="text-xs text-slate-500">{template.description}</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {/* Show supersets first with enhanced mobile display */}
                {(template.supersets || []).map(superset => (
                  <div key={superset.id} className="text-sm text-blue-300 border-l-4 border-blue-500 pl-3 bg-blue-900/20 rounded-r py-2">
                    <div className="font-medium flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {superset.name}
                    </div>
                    {(template.exercises || [])
                      .filter(ex => ex.supersetId === superset.id)
                      .slice(0, 2)
                      .map(exercise => (
                        <div key={exercise.id} className="text-xs text-blue-400 ml-4 mt-1">
                          • {getExerciseName(exercise.exerciseId)} - {exercise.sets} sets
                        </div>
                      ))}
                    {(template.exercises || []).filter(ex => ex.supersetId === superset.id).length > 2 && (
                      <div className="text-xs text-blue-400 ml-4 mt-1">
                        +{(template.exercises || []).filter(ex => ex.supersetId === superset.id).length - 2} more...
                      </div>
                    )}
                  </div>
                ))}

                {/* Show regular exercises */}
                {(template.exercises || [])
                  .filter(ex => !ex.isInSuperset)
                  .slice(0, 3)
                  .map(exercise => (
                    <div key={exercise.id} className="text-sm text-slate-300 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                      {getExerciseName(exercise.exerciseId)} - {exercise.sets} sets
                    </div>
                  ))}
                {(template.exercises || []).filter(ex => !ex.isInSuperset).length > 3 && (
                  <div className="text-sm text-slate-400 ml-4">
                    +{(template.exercises || []).filter(ex => !ex.isInSuperset).length - 3} more...
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(template)}
                  className="flex-1 text-xs text-slate-200"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(template.id)}
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
          <CardContent className="p-8 md:p-12 text-center">
            <Plus className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No templates found</h3>
            <p className="text-slate-400 mb-4 text-sm md:text-base">Create your first workout template</p>
            <Button onClick={openCreateModal} className="text-white">
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Template Modal - Fixed Scrolling */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0">
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <Card className="w-full max-w-6xl h-[95vh] md:h-[90vh] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg md:text-xl text-slate-50">
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={closeModal} className="p-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-6">
                  {/* Template Basic Info - Mobile Optimized */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium text-slate-200 mb-1">
                        Default Rest (sec):
                      </label>
                      <Input
                        type="number"
                        value={defaultRestBetweenSets}
                        onChange={(e) => setDefaultRestBetweenSets(parseInt(e.target.value) || 90)}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Exercise Management - Mobile Optimized */}
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <label className="block text-sm font-medium text-slate-200">
                        Exercises ({selectedExercises.length}):
                      </label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowExerciseSelector(true)}
                          className="flex-1 md:flex-none text-slate-200"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Exercise
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openSupersetCreator}
                          className="text-blue-400 border-blue-400 hover:bg-blue-500/10 flex-1 md:flex-none"
                          disabled={getAvailableExercisesForSuperset().length < 2}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          <span className="hidden md:inline">Create </span>Superset
                        </Button>
                      </div>
                    </div>

                    {renderExercisesByType()}
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 pt-4 border-t border-slate-600">
                    <Button onClick={saveTemplate} className="flex-1 text-white">
                      {editingTemplate ? 'Update Template' : 'Save Template'}
                    </Button>
                    <Button variant="outline" onClick={closeModal} className="text-slate-200">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal - Fixed Scrolling */}
      {showExerciseSelector && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0">
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <Card className="w-full max-w-2xl h-[95vh] md:h-[80vh] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4 border-b border-slate-600">
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
              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-2">
                  {availableExercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => addExercise(exercise.id)}
                      className="w-full text-left p-3 rounded-md border border-slate-600 hover:bg-slate-700 hover:border-slate-500 transition-colors active:bg-slate-600"
                    >
                      <div className="font-medium text-slate-200 text-sm">{exercise.name}</div>
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
        </div>
      )}

      {/* Superset Creator Modal - Fixed Scrolling */}
      {showSupersetCreator && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-0">
          <div className="w-full h-full flex items-center justify-center p-2 md:p-4 overflow-hidden">
            <Card className="w-full max-w-3xl h-[95vh] md:h-[80vh] flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4 border-b border-blue-500/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-400">
                    {editingSuperset ? 'Edit Superset' : 'Create Superset'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowSupersetCreator(false);
                      resetSupersetForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-1">
                        Superset Name:
                      </label>
                      <Input
                        value={supersetName}
                        onChange={(e) => setSupersetName(e.target.value)}
                        placeholder="Superset 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-1">
                        Rest Between Exercises (sec):
                      </label>
                      <Input
                        type="number"
                        value={restBetweenExercises}
                        onChange={(e) => setRestBetweenExercises(parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-1">
                        Rest Between Sets (sec):
                      </label>
                      <Input
                        type="number"
                        value={restBetweenSets}
                        onChange={(e) => setRestBetweenSets(parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-400 mb-2">
                      Exercises in Superset ({supersetExercises.length}):
                    </label>
                    <div className="space-y-2 mb-4">
                      {supersetExercises.map((exerciseId) => {
                        const exercise = selectedExercises.find(ex => ex.id === exerciseId);
                        return (
                          <div key={exerciseId} className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                            <span className="text-blue-300 text-sm">
                              {exercise ? getExerciseName(exercise.exerciseId) : 'Unknown'}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExerciseFromSuperset(exerciseId)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">
                        Available Exercises:
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {getAvailableExercisesForSuperset().map((exercise) => (
                          <button
                            key={exercise.id}
                            onClick={() => addExerciseToSuperset(exercise.id)}
                            disabled={supersetExercises.includes(exercise.id)}
                            className="w-full text-left p-3 rounded border border-blue-500/30 hover:bg-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed active:bg-blue-500/20"
                          >
                            <span className="text-blue-300 text-sm">
                              {getExerciseName(exercise.exerciseId)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 pt-4 border-t border-blue-500/30">
                    <Button
                      onClick={saveSuperset}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={supersetExercises.length < 2}
                    >
                      {editingSuperset ? 'Update Superset' : 'Save Superset'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSupersetCreator(false);
                        resetSupersetForm();
                      }}
                      className="text-slate-200"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Fixed Scrolling */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-400">Confirm Deletion</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4 text-sm md:text-base">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => deleteTemplate(deleteConfirm)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 text-slate-200"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}