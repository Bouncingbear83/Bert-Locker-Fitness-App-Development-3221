import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  User, 
  Settings, 
  Database, 
  Info, 
  Download, 
  Trash2, 
  Bell, 
  Scale,
  Save,
  AlertTriangle
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [showDataModal, setShowDataModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  // Load user preferences
  React.useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem('bertLocker_userPreferences') || '{}');
    if (prefs[user?.id]) {
      setWeightUnit(prefs[user?.id].weightUnit || 'lbs');
      setNotifications(prefs[user?.id].notifications !== false);
    }
  }, [user]);

  const savePreferences = () => {
    const prefs = JSON.parse(localStorage.getItem('bertLocker_userPreferences') || '{}');
    if (!prefs[user?.id]) {
      prefs[user?.id] = {};
    }
    prefs[user?.id].weightUnit = weightUnit;
    prefs[user?.id].notifications = notifications;
    localStorage.setItem('bertLocker_userPreferences', JSON.stringify(prefs));
    
    // Show success message (you could add a toast here)
    alert('Preferences saved successfully!');
  };

  const exportData = () => {
    const data = {
      workouts: JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]')
        .filter(w => w.userId === user?.id),
      templates: JSON.parse(localStorage.getItem('bertLocker_templates') || '[]')
        .filter(t => t.userId === user?.id),
      weightEntries: JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]')
        .filter(w => w.userId === user?.id),
      customExercises: JSON.parse(localStorage.getItem('bertLocker_customExercises') || '[]')
        .filter(e => e.userId === user?.id),
      preferences: JSON.parse(localStorage.getItem('bertLocker_userPreferences') || '{}')[user?.id] || {},
      targetWeight: JSON.parse(localStorage.getItem('bertLocker_targetWeight') || 'null'),
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bert-locker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    // Clear user-specific data
    const workouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]')
      .filter(w => w.userId !== user?.id);
    const templates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]')
      .filter(t => t.userId !== user?.id);
    const weightEntries = JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]')
      .filter(w => w.userId !== user?.id);
    const customExercises = JSON.parse(localStorage.getItem('bertLocker_customExercises') || '[]')
      .filter(e => e.userId !== user?.id);

    localStorage.setItem('bertLocker_workouts', JSON.stringify(workouts));
    localStorage.setItem('bertLocker_templates', JSON.stringify(templates));
    localStorage.setItem('bertLocker_weightEntries', JSON.stringify(weightEntries));
    localStorage.setItem('bertLocker_customExercises', JSON.stringify(customExercises));

    // Clear user preferences and target weight
    const prefs = JSON.parse(localStorage.getItem('bertLocker_userPreferences') || '{}');
    delete prefs[user?.id];
    localStorage.setItem('bertLocker_userPreferences', JSON.stringify(prefs));

    const targetWeight = JSON.parse(localStorage.getItem('bertLocker_targetWeight') || 'null');
    if (targetWeight?.userId === user?.id) {
      localStorage.removeItem('bertLocker_targetWeight');
    }

    setShowClearModal(false);
    alert('All your data has been cleared successfully!');
  };

  const getDataStats = () => {
    const workouts = JSON.parse(localStorage.getItem('bertLocker_workouts') || '[]')
      .filter(w => w.userId === user?.id);
    const templates = JSON.parse(localStorage.getItem('bertLocker_templates') || '[]')
      .filter(t => t.userId === user?.id);
    const weightEntries = JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]')
      .filter(w => w.userId === user?.id);
    const customExercises = JSON.parse(localStorage.getItem('bertLocker_customExercises') || '[]')
      .filter(e => e.userId === user?.id);

    return {
      workouts: workouts.length,
      templates: templates.length,
      weightEntries: weightEntries.length,
      customExercises: customExercises.length
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Profile</h1>
        <p className="text-slate-400">Manage your account and app preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-50">
              <User className="h-5 w-5 text-pink-500" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50">{user?.name}</h3>
                <p className="text-slate-400">{user?.email}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-600">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Account Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-pink-400">{stats.workouts}</div>
                  <div className="text-xs text-slate-400">Workouts</div>
                </div>
                <div className="text-center p-3 bg-slate-700 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-400">{stats.templates}</div>
                  <div className="text-xs text-slate-400">Templates</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Preferences Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-50">
              <Settings className="h-5 w-5 text-pink-500" />
              App Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-200">Notifications</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="toggle-checkbox"
                />
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-6">
                Enable rest timer and workout reminders
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-200">Weight Unit</span>
                </div>
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="select-field w-24"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-6">
                Default unit for weight tracking
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={savePreferences} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-50">
              <Database className="h-5 w-5 text-pink-500" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-lg font-bold text-blue-400">{stats.weightEntries}</div>
                <div className="text-xs text-slate-400">Weight Entries</div>
              </div>
              <div className="text-center p-3 bg-slate-700 rounded-lg">
                <div className="text-lg font-bold text-cyan-400">{stats.customExercises}</div>
                <div className="text-xs text-slate-400">Custom Exercises</div>
              </div>
            </div>

            <Button
              onClick={exportData}
              variant="outline"
              className="w-full text-slate-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>

            <Button
              onClick={() => setShowClearModal(true)}
              variant="outline"
              className="w-full text-red-400 border-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-50">
              <Info className="h-5 w-5 text-pink-500" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-200 mb-2">The Bert Locker</h4>
              <p className="text-sm text-slate-400 mb-2">Version 1.0.0</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                A comprehensive fitness tracking application designed to help you 
                monitor your workouts, track progress, and achieve your fitness goals.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-600">
              <h5 className="font-medium text-slate-300 mb-2">Features</h5>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Workout logging and templates</li>
                <li>• Exercise database management</li>
                <li>• Body weight tracking</li>
                <li>• Progress analytics</li>
                <li>• Data export and backup</li>
              </ul>
            </div>

            <div className="pt-4">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full text-slate-200"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Confirm Data Deletion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">
                Are you sure you want to clear all your data? This will permanently delete:
              </p>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {stats.workouts} workout sessions</li>
                <li>• {stats.templates} workout templates</li>
                <li>• {stats.weightEntries} weight entries</li>
                <li>• {stats.customExercises} custom exercises</li>
                <li>• All preferences and settings</li>
              </ul>
              <p className="text-red-400 text-sm font-medium">
                This action cannot be undone!
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={clearAllData}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Clear All Data
                </Button>
                <Button
                  onClick={() => setShowClearModal(false)}
                  variant="outline"
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