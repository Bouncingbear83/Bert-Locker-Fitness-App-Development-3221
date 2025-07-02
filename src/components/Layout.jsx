import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Dumbbell, BookOpen, TrendingUp, User, LogOut, Bell } from 'lucide-react';
import Button from './ui/Button';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Workout', href: '/workout', icon: Dumbbell },
    { name: 'Training', href: '/training', icon: BookOpen },
    { name: 'Progress', href: '/progress', icon: TrendingUp },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  // Helper function to check if a navigation item is active
  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-600 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25 animate-pulse-glow">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-50">
                  The Bert Locker
                </h1>
                <p className="text-xs text-slate-300 hidden sm:block">Fitness Tracking System</p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="icon" size="md" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse" />
              </Button>

              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">
                    Welcome back
                  </p>
                  <p className="text-xs text-pink-400 font-semibold">
                    {user?.name}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Logout */}
              <Button
                variant="icon"
                size="md"
                onClick={logout}
                className="text-slate-200 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <nav className="w-64 bg-slate-800 min-h-screen border-r border-slate-600 hidden lg:block">
          <div className="p-4 space-y-2">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-target ${
                    active
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'text-slate-200 hover:text-slate-50 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.name}</span>
                  {/* Active indicator */}
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" />
                  )}
                </Link>
              );
            })}

            {/* Sidebar Footer */}
            <div className="pt-8 mt-8 border-t border-slate-600">
              <div className="p-4 bg-slate-700 rounded-xl border border-slate-500">
                <p className="text-xs text-slate-300 mb-2">Quick Stats</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200">This Week</span>
                    <span className="text-pink-400 font-semibold">3 workouts</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200">Streak</span>
                    <span className="text-emerald-400 font-semibold">7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 text-slate-100 min-h-screen bg-slate-900">
          <div className="animate-fade-in-up max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile/Tablet Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-600 z-40">
        <div className="grid grid-cols-5 gap-1 py-1 px-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-1 py-2 text-xs transition-all duration-200 touch-target justify-center rounded-lg relative min-h-[60px] ${
                  active
                    ? 'text-pink-400 bg-pink-500/10'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-[10px] leading-tight text-center px-1 truncate max-w-full">
                  {item.name}
                </span>
                {/* Mobile active indicator */}
                {active && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-pink-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile spacing */}
      <div className="lg:hidden h-20" />
    </div>
  );
}