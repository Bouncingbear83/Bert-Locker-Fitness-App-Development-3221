import React, { useState, useEffect } from 'react';
import { exercises, categories } from '../data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Search, Filter, Plus, Edit, Trash2, Play, FileImage, Video, Info, ExternalLink, Eye, X } from 'lucide-react';

const muscleGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio'];

const exerciseCategories = [
  { value: 'reps', label: 'For Reps' },
  { value: 'time', label: 'For Time' },
  { value: 'distance', label: 'For Distance' }
];

export default function ExerciseLibrary() {
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [customExercises, setCustomExercises] = useState([]);

  useEffect(() => {
    loadCustomExercises();
  }, []);

  const loadCustomExercises = () => {
    const saved = localStorage.getItem('bertLocker_customExercises') || '[]';
    setCustomExercises(JSON.parse(saved));
  };

  // Combine built-in and custom exercises with proper category mapping
  const allExercises = [
    ...exercises.map(ex => ({
      ...ex,
      category: ex.exerciseCategory || 'reps', // Use exerciseCategory if available
      muscleGroup: ex.category, // Map category to muscleGroup for built-in exercises
      isCustom: false
    })),
    ...customExercises
  ];

  // Count exercises for each filter
  const getFilterCounts = () => {
    const muscleGroupCounts = { All: allExercises.length };
    const categoryCounts = { 'All Categories': allExercises.length };

    // Count by muscle group
    muscleGroups.forEach(muscle => {
      muscleGroupCounts[muscle] = allExercises.filter(ex =>
        ex.muscleGroup === muscle ||
        (ex.primaryMuscles && ex.primaryMuscles.some(m =>
          m.toLowerCase().includes(muscle.toLowerCase())
        ))
      ).length;
    });

    // Count by category
    exerciseCategories.forEach(cat => {
      categoryCounts[cat.label] = allExercises.filter(ex =>
        ex.category === cat.value
      ).length;
    });

    return { muscleGroupCounts, categoryCounts };
  };

  const { muscleGroupCounts, categoryCounts } = getFilterCounts();

  // Filter exercises based on all active filters
  const filteredExercises = allExercises.filter(exercise => {
    // Muscle group filter
    const matchesMuscleGroup = selectedMuscleGroup === 'All' ||
      exercise.muscleGroup === selectedMuscleGroup ||
      (exercise.primaryMuscles && exercise.primaryMuscles.some(muscle =>
        muscle.toLowerCase().includes(selectedMuscleGroup.toLowerCase())
      ));

    // Category filter
    const matchesCategory = selectedCategory === 'All Categories' ||
      (selectedCategory === 'For Reps' && exercise.category === 'reps') ||
      (selectedCategory === 'For Time' && exercise.category === 'time') ||
      (selectedCategory === 'For Distance' && exercise.category === 'distance');

    // Search filter
    const matchesSearch = !searchTerm ||
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.primaryMuscles || [exercise.muscleGroup || '']).some(muscle =>
        muscle.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (exercise.description || exercise.instructions || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Search by category keywords
      (searchTerm.toLowerCase() === 'reps' && exercise.category === 'reps') ||
      (searchTerm.toLowerCase() === 'time' && exercise.category === 'time') ||
      (searchTerm.toLowerCase() === 'distance' && exercise.category === 'distance');

    return matchesMuscleGroup && matchesCategory && matchesSearch;
  });

  // Sort exercises by category when "All" filters are active
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    if (selectedMuscleGroup === 'All' && selectedCategory === 'All Categories') {
      const categoryOrder = { reps: 0, time: 1, distance: 2 };
      return (categoryOrder[a.category] || 0) - (categoryOrder[b.category] || 0);
    }
    return 0;
  });

  const getCategoryBadge = (category) => {
    const badges = {
      reps: { text: 'REPS', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
      time: { text: 'TIME', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      distance: { text: 'DIST', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    };
    return badges[category] || badges.reps;
  };

  const clearAllFilters = () => {
    setSelectedMuscleGroup('All');
    setSelectedCategory('All Categories');
    setSearchTerm('');
  };

  const hasActiveFilters = selectedMuscleGroup !== 'All' || selectedCategory !== 'All Categories' || searchTerm;

  const getActiveFilterSummary = () => {
    const parts = [];
    if (selectedMuscleGroup !== 'All') parts.push(selectedMuscleGroup);
    if (selectedCategory !== 'All Categories') parts.push(selectedCategory);
    return parts.length > 0 ?
      `Showing: ${parts.join(' + ')} (${filteredExercises.length} results)` :
      `Showing: All exercises (${filteredExercises.length} results)`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-50 mb-2">Exercise Database</h1>
          <p className="text-slate-400">Browse and create custom exercises</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Search exercises by name, muscle group, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Section */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Muscle Group Filters */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              Muscle Groups
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedMuscleGroup('All')}
                variant={selectedMuscleGroup === 'All' ? 'primary' : 'outline'}
                size="sm"
                className="text-slate-200"
              >
                All ({muscleGroupCounts.All})
              </Button>
              {muscleGroups.map(muscle => (
                <Button
                  key={muscle}
                  onClick={() => setSelectedMuscleGroup(muscle)}
                  variant={selectedMuscleGroup === muscle ? 'primary' : 'outline'}
                  size="sm"
                  disabled={muscleGroupCounts[muscle] === 0}
                  className={`text-slate-200 ${muscleGroupCounts[muscle] === 0 ? 'opacity-50' : ''}`}
                >
                  {muscle} ({muscleGroupCounts[muscle] || 0})
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Exercise Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedCategory('All Categories')}
                variant={selectedCategory === 'All Categories' ? 'primary' : 'outline'}
                size="sm"
                className="text-slate-200"
              >
                All Categories ({categoryCounts['All Categories']})
              </Button>
              {exerciseCategories.map(category => (
                <Button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.label)}
                  variant={selectedCategory === category.label ? 'primary' : 'outline'}
                  size="sm"
                  disabled={categoryCounts[category.label] === 0}
                  className={`text-slate-200 ${categoryCounts[category.label] === 0 ? 'opacity-50' : ''}`}
                >
                  {category.label} ({categoryCounts[category.label] || 0})
                </Button>
              ))}
            </div>
          </div>

          {/* Active Filter Summary and Clear All */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-600">
            <div className="text-sm text-slate-300">
              {getActiveFilterSummary()}
            </div>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Exercise Grid */}
      <div className="space-y-6">
        {/* Category Sections when showing all */}
        {selectedMuscleGroup === 'All' && selectedCategory === 'All Categories' && !searchTerm ? (
          <>
            {/* For Reps Section */}
            {sortedExercises.filter(ex => ex.category === 'reps').length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                  For Reps Exercises ({sortedExercises.filter(ex => ex.category === 'reps').length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedExercises.filter(ex => ex.category === 'reps').map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              </div>
            )}

            {/* For Time Section */}
            {sortedExercises.filter(ex => ex.category === 'time').length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  For Time Exercises ({sortedExercises.filter(ex => ex.category === 'time').length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedExercises.filter(ex => ex.category === 'time').map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              </div>
            )}

            {/* For Distance Section */}
            {sortedExercises.filter(ex => ex.category === 'distance').length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-50 mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  For Distance Exercises ({sortedExercises.filter(ex => ex.category === 'distance').length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedExercises.filter(ex => ex.category === 'distance').map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Filtered Results */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedExercises.map(exercise => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        )}
      </div>

      {filteredExercises.length === 0 && (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="text-slate-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No exercises found</h3>
              <p className="text-sm">
                {hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Create your first custom exercise to get started'}
              </p>
            </div>
            {hasActiveFilters && (
              <Button onClick={clearAllFilters} variant="outline" className="text-slate-200">
                Clear All Filters
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise }) {
  const getCategoryBadge = (category) => {
    const badges = {
      reps: { text: 'REPS', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
      time: { text: 'TIME', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      distance: { text: 'DIST', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
    };
    return badges[category] || badges.reps;
  };

  const categoryBadge = getCategoryBadge(exercise.category);

  return (
    <Card className="hover-lift transition-all duration-300 relative group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-slate-50 flex items-center gap-2 mb-2">
              {exercise.name}
              {exercise.isCustom && (
                <span className="text-xs bg-pink-500/20 border border-pink-400/50 text-pink-300 px-2 py-1 rounded">
                  Custom
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded border ${categoryBadge.color}`}>
                {categoryBadge.text}
              </span>
              <span className="text-sm text-slate-400">
                {exercise.muscleGroup || exercise.primaryMuscles?.[0] || 'General'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-slate-300 line-clamp-2">
            {exercise.description || exercise.instructions || 'No description available'}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-slate-200"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}