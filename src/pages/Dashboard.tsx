import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  Dumbbell,
  TrendingUp,
  Calendar,
  Target,
  FileText,
  Plus,
  Zap,
  Award,
  Activity,
  CheckCircle,
  ArrowRight,
  Flame,
  Scale,
  TrendingDown,
  Book,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const getWorkoutStats = () => {
    const workouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]');
    const userWorkouts = workouts.filter((w: any) => w.userId === user?.id);

    const thisWeek = userWorkouts.filter((w: any) => {
      const workoutDate = new Date(w.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return workoutDate >= weekAgo;
    });

    return {
      total: userWorkouts.length,
      thisWeek: thisWeek.length,
      lastWorkout: userWorkouts.length > 0 ? new Date(userWorkouts[userWorkouts.length - 1].date) : null,
    };
  };

  const getWeightStats = () => {
    const entries = JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]');
    const userEntries = entries
      .filter((entry: any) => entry.userId === user?.id)
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (userEntries.length === 0) return null;

    const currentWeight = userEntries[userEntries.length - 1];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentEntries = userEntries.filter((entry: any) => new Date(entry.timestamp) >= weekAgo);

    let weeklyChange = null;
    if (recentEntries.length > 1) {
      const oldestRecent = recentEntries[0];
      weeklyChange = currentWeight.weight - oldestRecent.weight;
    }

    return {
      current: currentWeight,
      weeklyChange,
      totalEntries: userEntries.length,
    };
  };

  const getTemplateCount = () => {
    const templates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]');
    return templates.filter((t: any) => t.userId === user?.id).length;
  };

  const stats = getWorkoutStats();
  const weightStats = getWeightStats();
  const templateCount = getTemplateCount();

  const statCards = [
    {
      title: 'Total Workouts',
      value: stats.total,
      icon: Target,
      color: 'pink',
      trend: '+12% this month',
      description: 'Lifetime sessions completed'
    },
    {
      title: 'This Week',
      value: stats.thisWeek,
      icon: TrendingUp,
      color: 'emerald',
      trend: stats.thisWeek >= 3 ? 'On track!' : 'Keep pushing!',
      description: 'Weekly training sessions'
    },
    {
      title: 'Current Weight',
      value: weightStats ? `${weightStats.current.weight.toFixed(1)} ${weightStats.current.unit}` : '--',
      icon: Scale,
      color: 'blue',
      trend: weightStats?.weeklyChange
        ? `${weightStats.weeklyChange > 0 ? '+' : ''}${weightStats.weeklyChange.toFixed(1)} ${weightStats.current.unit} this week`
        : 'No recent data',
      description: weightStats ? `${weightStats.totalEntries} entries logged` : 'Start tracking'
    },
    {
      title: 'Templates',
      value: templateCount,
      icon: FileText,
      color: 'cyan',
      trend: `${templateCount} saved`,
      description: 'Workout templates ready'
    }
  ];

  const achievements = [
    {
      title: 'First Workout',
      completed: stats.total > 0,
      icon: CheckCircle
    },
    {
      title: 'Weekly Warrior',
      completed: stats.thisWeek >= 3,
      icon: Flame
    },
    {
      title: 'Weight Tracker',
      completed: weightStats && weightStats.totalEntries > 0,
      icon: Scale
    },
    {
      title: 'Template Master',
      completed: templateCount > 0,
      icon: FileText
    },
    {
      title: 'Consistency King',
      completed: stats.total >= 10,
      icon: Target
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-cyan-400/10 rounded-2xl" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-4 animate-fade-in-up">
            Welcome back, <span className="text-pink-400">{user?.name}</span>!
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-6 animate-fade-in-up delay-100">
            Ready to crush your fitness goals today? Your journey to greatness continues here.
          </p>
          {/* Quick CTA */}
          <div className="animate-fade-in-up delay-200">
            <Link to="/workout">
              <Button variant="primary" size="xl" className="shadow-2xl">
                <Zap className="h-6 w-6 mr-2" />
                Start Today's Workout
                <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              variant="stats"
              hover
              className="animate-slide-in-right"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-600">
                    <Icon className={`h-6 w-6 ${
                      stat.color === 'pink' ? 'text-pink-500' :
                      stat.color === 'emerald' ? 'text-emerald-500' :
                      stat.color === 'blue' ? 'text-blue-400' :
                      stat.color === 'cyan' ? 'text-cyan-400' : 'text-amber-500'
                    }`} />
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
                    stat.color === 'pink' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
                    stat.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    stat.color === 'blue' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
                    stat.color === 'cyan' ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-50 mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card variant="glass" className="hover-lift animate-slide-in-left delay-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-50">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Zap className="h-6 w-6 text-pink-500" />
            </div>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Action */}
          <Link to="/workout" className="block">
            <Button variant="primary" size="lg" className="w-full h-20 text-lg justify-start gap-4 group">
              <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Dumbbell className="h-8 w-8" />
              </div>
              <div className="text-left">
                <div className="font-bold">Start Workout</div>
                <div className="text-sm opacity-90">Begin a new training session</div>
              </div>
              <ArrowRight className="h-6 w-6 ml-auto group-hover:translate-x-1 transition-transform duration-200" />
            </Button>
          </Link>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/library?tab=exercises">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2 p-4 group hover-lift text-slate-200">
                <Book className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Browse Exercises</div>
                  <div className="text-xs opacity-75">Explore exercise database</div>
                </div>
              </Button>
            </Link>

            <Link to="/library?tab=workouts">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2 p-4 group hover-lift text-slate-200">
                <FileText className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Manage Workouts</div>
                  <div className="text-xs opacity-75">Create workout templates</div>
                </div>
              </Button>
            </Link>

            <Link to="/progress?tab=body">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2 p-4 group hover-lift text-slate-200">
                <Scale className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Track Weight</div>
                  <div className="text-xs opacity-75">Monitor body progress</div>
                </div>
              </Button>
            </Link>

            <Link to="/progress?tab=analytics">
              <Button variant="secondary" className="w-full h-24 flex-col gap-2 p-4 group hover-lift text-slate-200">
                <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-center">
                  <div className="font-semibold text-sm">View Analytics</div>
                  <div className="text-xs opacity-75">Track your progress</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Section */}
        {stats.total > 0 || weightStats ? (
          <Card variant="glass" className="hover-lift animate-slide-in-right delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-50">
                <div className="p-2 bg-cyan-400/20 rounded-lg">
                  <Activity className="h-6 w-6 text-cyan-400" />
                </div>
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Workout Progress */}
                {stats.total > 0 && (
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Dumbbell className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-50">
                          {stats.total} Workout{stats.total !== 1 ? 's' : ''} Completed
                        </p>
                        <p className="text-sm text-slate-400">
                          {stats.thisWeek > 0 && (
                            <span className="text-emerald-400">
                              {stats.thisWeek} this week •{' '}
                            </span>
                          )}
                          Keep up the momentum!
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${stats.thisWeek >= 3 ? 'text-emerald-400' : 'text-amber-500'}`}>
                        {stats.thisWeek >= 3 ? 'Excellent!' : 'Keep Going!'}
                      </div>
                      {stats.lastWorkout && (
                        <div className="text-xs text-slate-400">
                          Last: {stats.lastWorkout.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Weight Progress */}
                {weightStats && (
                  <div className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Scale className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-50">
                          Current: {weightStats.current.weight.toFixed(1)} {weightStats.current.unit}
                        </p>
                        <p className="text-sm text-slate-400">
                          {weightStats.totalEntries} weight entries logged
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {weightStats.weeklyChange !== null ? (
                        <div className={`text-lg font-bold flex items-center gap-1 ${
                          weightStats.weeklyChange > 0 ? 'text-red-400' : 
                          weightStats.weeklyChange < 0 ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                          {weightStats.weeklyChange > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : weightStats.weeklyChange < 0 ? (
                            <TrendingDown className="h-4 w-4" />
                          ) : null}
                          {weightStats.weeklyChange > 0 ? '+' : ''}{weightStats.weeklyChange.toFixed(1)} {weightStats.current.unit}
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-slate-400">--</div>
                      )}
                      <div className="text-xs text-slate-400">This week</div>
                    </div>
                  </div>
                )}

                {/* Progress Bar for Workouts */}
                {stats.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Weekly Goal Progress</span>
                      <span className="text-slate-300">{stats.thisWeek}/3</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((stats.thisWeek / 3) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass" className="border-2 border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5 animate-slide-in-right delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-50">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <Plus className="h-6 w-6 text-pink-500" />
                </div>
                Get Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-slate-300">
                  Welcome to The Bert Locker! Here's how to get the most out of your fitness journey:
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover-lift">
                    <FileText className="h-8 w-8 text-cyan-400 mb-3" />
                    <h3 className="font-semibold text-slate-50 mb-2">1. Create Templates</h3>
                    <p className="text-sm text-slate-400">Build workout templates for consistent training</p>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover-lift">
                    <Dumbbell className="h-8 w-8 text-pink-500 mb-3" />
                    <h3 className="font-semibold text-slate-50 mb-2">2. Start Working Out</h3>
                    <p className="text-sm text-slate-400">Log your sets, reps, and weights during workouts</p>
                  </div>
                  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 hover-lift">
                    <Scale className="h-8 w-8 text-blue-400 mb-3" />
                    <h3 className="font-semibold text-slate-50 mb-2">3. Track Your Weight</h3>
                    <p className="text-sm text-slate-400">Monitor your body composition progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card variant="glass" className="hover-lift animate-slide-in-left delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-50">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.title}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                      achievement.completed
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${achievement.completed ? 'text-emerald-500' : 'text-slate-500'}`} />
                    <span className="font-medium">{achievement.title}</span>
                    {achievement.completed && (
                      <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}