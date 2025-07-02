import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { exercises } from '@/data/exercises';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  Trophy,
  TrendingUp,
  Calendar,
  Target,
  Award,
  BarChart3,
  LineChart,
  PieChart,
  Search,
  Filter,
  Download,
  Star,
  Flame,
  Clock,
  Zap,
  Activity,
  ChevronRight,
  Medal,
  Crown
} from 'lucide-react';

interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  category: 'reps' | 'time' | 'distance';
  bestPerformance: {
    value: number;
    reps?: number;
    weight?: number;
    time?: number;
    distance?: number;
    date: string;
  };
  daysAgo: number;
  isNewRecord: boolean;
  progression: Array<{ date: string; value: number }>;
}

interface WorkoutFrequency {
  date: string;
  count: number;
}

interface Achievement {
  id: string;
  type: 'pr' | 'milestone' | 'consistency' | 'volume';
  title: string;
  description: string;
  date: string;
  icon: React.ComponentType;
  value?: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'prs' | 'frequency' | 'progress' | 'achievements'>('prs');
  const [prFilter, setPrFilter] = useState('All');
  const [prSort, setPrSort] = useState('Recent');
  const [prSearch, setPrSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [timeRange, setTimeRange] = useState('12M');

  // Load and process workout data
  const workoutData = useMemo(() => {
    const allWorkouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]');
    return allWorkouts
      .filter((workout: any) => workout.userId === user?.id)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [user]);

  // Calculate Personal Records
  const personalRecords = useMemo(() => {
    const records: PersonalRecord[] = [];
    const exerciseRecords: { [key: string]: PersonalRecord } = {};

    workoutData.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        const exerciseData = exercises.find(ex => ex.id === exercise.exerciseId);
        if (!exerciseData) return;

        const exerciseId = exercise.exerciseId;
        const category = exerciseData.exerciseCategory || 'reps';

        if (category === 'reps' && exercise.sets?.length > 0) {
          exercise.sets.forEach((set: any) => {
            if (!set.completed) return;

            let recordValue = 0;
            if (set.weight && set.weight > 0) {
              // Calculate 1RM estimate for weighted exercises
              recordValue = set.reps === 1 ? set.weight : Math.round(set.weight * (36 / (37 - set.reps)));
            } else {
              // Use reps for bodyweight exercises
              recordValue = set.reps;
            }

            if (!exerciseRecords[exerciseId] || recordValue > exerciseRecords[exerciseId].bestPerformance.value) {
              const daysAgo = Math.floor((Date.now() - new Date(workout.date).getTime()) / (1000 * 60 * 60 * 24));
              
              exerciseRecords[exerciseId] = {
                exerciseId,
                exerciseName: exerciseData.name,
                muscleGroup: exerciseData.category,
                category: 'reps',
                bestPerformance: {
                  value: recordValue,
                  reps: set.reps,
                  weight: set.weight,
                  date: workout.date
                },
                daysAgo,
                isNewRecord: daysAgo <= 7,
                progression: []
              };
            }
          });
        }
      });
    });

    // Add progression data for each record
    Object.values(exerciseRecords).forEach(record => {
      const progressionData: Array<{ date: string; value: number }> = [];
      
      workoutData.forEach((workout: any) => {
        workout.exercises?.forEach((exercise: any) => {
          if (exercise.exerciseId === record.exerciseId && exercise.sets?.length > 0) {
            const bestSetInWorkout = exercise.sets.reduce((best: any, set: any) => {
              if (!set.completed) return best;
              let value = 0;
              if (set.weight && set.weight > 0) {
                value = set.reps === 1 ? set.weight : Math.round(set.weight * (36 / (37 - set.reps)));
              } else {
                value = set.reps;
              }
              return !best || value > best.value ? { value, set } : best;
            }, null);

            if (bestSetInWorkout) {
              progressionData.push({
                date: workout.date,
                value: bestSetInWorkout.value
              });
            }
          }
        });
      });

      record.progression = progressionData;
    });

    return Object.values(exerciseRecords);
  }, [workoutData]);

  // Calculate workout frequency data
  const workoutFrequency = useMemo(() => {
    const frequencyMap: { [key: string]: number } = {};
    const last12Months = new Date();
    last12Months.setMonth(last12Months.getMonth() - 12);

    // Initialize all dates with 0
    for (let d = new Date(last12Months); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      frequencyMap[dateStr] = 0;
    }

    // Count workouts per day
    workoutData.forEach((workout: any) => {
      const dateStr = workout.date.split('T')[0];
      if (frequencyMap.hasOwnProperty(dateStr)) {
        frequencyMap[dateStr]++;
      }
    });

    return Object.entries(frequencyMap).map(([date, count]) => ({ date, count }));
  }, [workoutData]);

  // Calculate achievements
  const achievements = useMemo(() => {
    const achievementList: Achievement[] = [];

    // Personal Record achievements
    personalRecords.forEach(pr => {
      if (pr.isNewRecord) {
        achievementList.push({
          id: `pr-${pr.exerciseId}`,
          type: 'pr',
          title: 'New Personal Record!',
          description: `${pr.exerciseName}: ${pr.bestPerformance.weight ? `${pr.bestPerformance.weight}lbs x ${pr.bestPerformance.reps}` : `${pr.bestPerformance.reps} reps`}`,
          date: pr.bestPerformance.date,
          icon: Trophy,
          value: pr.bestPerformance.value
        });
      }
    });

    // Workout milestone achievements
    const totalWorkouts = workoutData.length;
    const milestones = [5, 10, 25, 50, 100, 200, 500];
    milestones.forEach(milestone => {
      if (totalWorkouts >= milestone) {
        const workoutAtMilestone = workoutData[milestone - 1];
        if (workoutAtMilestone) {
          achievementList.push({
            id: `milestone-${milestone}`,
            type: 'milestone',
            title: `${milestone} Workouts Completed!`,
            description: 'Consistency is key to reaching your fitness goals',
            date: workoutAtMilestone.date,
            icon: Star,
            value: milestone
          });
        }
      }
    });

    // Consistency achievements (streaks)
    let currentStreak = 0;
    let longestStreak = 0;
    let streakStart = '';
    
    const today = new Date();
    const recentDays = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    recentDays.forEach(dateStr => {
      const hasWorkout = workoutData.some((w: any) => w.date.split('T')[0] === dateStr);
      if (hasWorkout) {
        if (currentStreak === 0) streakStart = dateStr;
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        if (currentStreak >= 3) {
          achievementList.push({
            id: `streak-${streakStart}`,
            type: 'consistency',
            title: `${currentStreak} Day Streak!`,
            description: 'Amazing consistency with your workouts',
            date: streakStart,
            icon: Flame,
            value: currentStreak
          });
        }
        currentStreak = 0;
      }
    });

    return achievementList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workoutData, personalRecords]);

  // Filter and sort personal records
  const filteredPRs = useMemo(() => {
    let filtered = personalRecords;

    // Apply category filter
    if (prFilter !== 'All') {
      const categoryMap: { [key: string]: string } = {
        'For Reps': 'reps',
        'For Time': 'time',
        'For Distance': 'distance'
      };
      filtered = filtered.filter(pr => pr.category === categoryMap[prFilter]);
    }

    // Apply search filter
    if (prSearch) {
      filtered = filtered.filter(pr => 
        pr.exerciseName.toLowerCase().includes(prSearch.toLowerCase()) ||
        pr.muscleGroup.toLowerCase().includes(prSearch.toLowerCase())
      );
    }

    // Apply sorting
    switch (prSort) {
      case 'Recent':
        filtered.sort((a, b) => a.daysAgo - b.daysAgo);
        break;
      case 'Alphabetical':
        filtered.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
        break;
      case 'By Muscle Group':
        filtered.sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));
        break;
    }

    return filtered;
  }, [personalRecords, prFilter, prSearch, prSort]);

  // Calculate workout statistics
  const workoutStats = useMemo(() => {
    const now = new Date();
    const thisWeek = workoutData.filter((w: any) => {
      const workoutDate = new Date(w.date);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return workoutDate >= weekStart;
    }).length;

    const thisMonth = workoutData.filter((w: any) => {
      const workoutDate = new Date(w.date);
      return workoutDate.getMonth() === now.getMonth() && workoutDate.getFullYear() === now.getFullYear();
    }).length;

    const thisYear = workoutData.filter((w: any) => {
      const workoutDate = new Date(w.date);
      return workoutDate.getFullYear() === now.getFullYear();
    }).length;

    // Calculate average workouts per week
    const weeksWithData = Math.max(1, Math.ceil(workoutData.length / 3));
    const avgPerWeek = Math.round((workoutData.length / weeksWithData) * 10) / 10;

    return {
      thisWeek,
      thisMonth,
      thisYear,
      total: workoutData.length,
      avgPerWeek
    };
  }, [workoutData]);

  const renderPersonalRecords = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Personal Records ({filteredPRs.length})
          </h2>
          <p className="text-slate-400">Your best performances across all exercises</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search exercises..."
              value={prSearch}
              onChange={(e) => setPrSearch(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Select
            value={prFilter}
            onChange={(e) => setPrFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'For Reps', label: 'For Reps' },
              { value: 'For Time', label: 'For Time' },
              { value: 'For Distance', label: 'For Distance' }
            ]}
          />
          <Select
            value={prSort}
            onChange={(e) => setPrSort(e.target.value)}
            options={[
              { value: 'Recent', label: 'Most Recent' },
              { value: 'Alphabetical', label: 'Alphabetical' },
              { value: 'By Muscle Group', label: 'By Muscle Group' }
            ]}
          />
        </div>
      </div>

      {/* Personal Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPRs.map((pr) => (
          <Card key={pr.exerciseId} className="hover-lift relative">
            {pr.isNewRecord && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  NEW PR!
                </div>
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-slate-50 mb-2">{pr.exerciseName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-pink-500/20 border border-pink-400/50 text-pink-300 px-2 py-1 rounded">
                      {pr.muscleGroup}
                    </span>
                    <span className="text-xs text-slate-400">
                      {pr.daysAgo === 0 ? 'Today' : `${pr.daysAgo} days ago`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-500">
                    {pr.bestPerformance.weight 
                      ? `${pr.bestPerformance.weight}lbs`
                      : pr.bestPerformance.time 
                        ? `${Math.floor(pr.bestPerformance.time / 60)}:${(pr.bestPerformance.time % 60).toString().padStart(2, '0')}`
                        : `${pr.bestPerformance.reps} reps`
                    }
                  </div>
                  {pr.bestPerformance.weight && (
                    <div className="text-sm text-slate-400">
                      {pr.bestPerformance.reps} reps
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Mini progression chart */}
              <div className="h-16 mb-4 bg-slate-800 rounded-lg p-2 overflow-hidden">
                <div className="h-full flex items-end justify-between gap-1">
                  {pr.progression.slice(-10).map((point, index) => {
                    const maxValue = Math.max(...pr.progression.map(p => p.value));
                    const height = (point.value / maxValue) * 100;
                    return (
                      <div
                        key={index}
                        className="bg-gradient-to-t from-pink-500 to-pink-400 rounded-sm flex-1 transition-all duration-300"
                        style={{ height: `${height}%`, minHeight: '2px' }}
                      />
                    );
                  })}
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full text-slate-200">
                <LineChart className="h-4 w-4 mr-2" />
                View Progression
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPRs.length === 0 && (
        <Card className="p-12 text-center">
          <Trophy className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Personal Records Found</h3>
          <p className="text-slate-400">
            {prSearch || prFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start working out to establish your personal records!'
            }
          </p>
        </Card>
      )}
    </div>
  );

  const renderWorkoutFrequency = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2 mb-2">
          <Calendar className="h-6 w-6 text-blue-500" />
          Workout Frequency
        </h2>
        <p className="text-slate-400">Your training consistency over time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card variant="stats">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">{workoutStats.thisWeek}</div>
            <div className="text-xs text-slate-400">This Week</div>
          </CardContent>
        </Card>
        <Card variant="stats">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{workoutStats.thisMonth}</div>
            <div className="text-xs text-slate-400">This Month</div>
          </CardContent>
        </Card>
        <Card variant="stats">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{workoutStats.thisYear}</div>
            <div className="text-xs text-slate-400">This Year</div>
          </CardContent>
        </Card>
        <Card variant="stats">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{workoutStats.total}</div>
            <div className="text-xs text-slate-400">Total Workouts</div>
          </CardContent>
        </Card>
        <Card variant="stats">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">{workoutStats.avgPerWeek}</div>
            <div className="text-xs text-slate-400">Avg/Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-50">Workout Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs text-slate-400 text-center p-1 font-medium">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {workoutFrequency.slice(-90).map((day, index) => {
              const intensity = day.count === 0 ? 0 : Math.min(day.count / 3, 1);
              const date = new Date(day.date);
              
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-sm border border-slate-700 relative group cursor-pointer transition-all duration-200 hover:scale-110`}
                  style={{
                    backgroundColor: day.count === 0 
                      ? 'rgb(51, 65, 85)' 
                      : `rgba(236, 72, 153, ${0.2 + intensity * 0.8})`
                  }}
                  title={`${date.toLocaleDateString()}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
                >
                  {day.count > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {day.count > 3 ? '3+' : day.count}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600">
            <div className="text-sm text-slate-400">
              Less active
            </div>
            <div className="flex items-center gap-1">
              {[0, 0.25, 0.5, 0.75, 1].map((intensity, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-sm border border-slate-700"
                  style={{
                    backgroundColor: intensity === 0 
                      ? 'rgb(51, 65, 85)' 
                      : `rgba(236, 72, 153, ${0.2 + intensity * 0.8})`
                  }}
                />
              ))}
            </div>
            <div className="text-sm text-slate-400">
              More active
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-50 flex items-center gap-2 mb-2">
          <Award className="h-6 w-6 text-amber-500" />
          Achievement Timeline
        </h2>
        <p className="text-slate-400">Celebrating your fitness milestones and progress</p>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          const typeColors = {
            pr: 'from-yellow-500 to-amber-500',
            milestone: 'from-blue-500 to-cyan-500',
            consistency: 'from-orange-500 to-red-500',
            volume: 'from-purple-500 to-pink-500'
          };

          return (
            <Card key={achievement.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${typeColors[achievement.type]} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-50">{achievement.title}</h3>
                      {index < 3 && (
                        <span className="text-xs bg-amber-500/20 border border-amber-400/50 text-amber-300 px-2 py-1 rounded">
                          Recent
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 mb-2">{achievement.description}</p>
                    <div className="text-sm text-slate-400">
                      {new Date(achievement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {achievement.value && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-50">{achievement.value}</div>
                      <div className="text-sm text-slate-400">
                        {achievement.type === 'pr' ? 'Est. 1RM' : 
                         achievement.type === 'milestone' ? 'Workouts' :
                         achievement.type === 'consistency' ? 'Days' : 'Total'}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <Card className="p-12 text-center">
          <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No Achievements Yet</h3>
          <p className="text-slate-400">Keep working out to unlock your first achievements!</p>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Analytics</h1>
        <p className="text-slate-400">Comprehensive insights into your fitness journey</p>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-slate-600">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'prs', label: 'Personal Records', icon: Trophy },
            { id: 'frequency', label: 'Workout Frequency', icon: Calendar },
            { id: 'achievements', label: 'Achievements', icon: Award }
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-pink-500 text-pink-400'
                    : 'border-transparent text-slate-300 hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section Content */}
      <div className="tab-content">
        {activeSection === 'prs' && renderPersonalRecords()}
        {activeSection === 'frequency' && renderWorkoutFrequency()}
        {activeSection === 'achievements' && renderAchievements()}
      </div>
    </div>
  );
}