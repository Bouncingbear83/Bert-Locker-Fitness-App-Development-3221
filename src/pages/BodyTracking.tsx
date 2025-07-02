import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LineChart from '@/components/ui/LineChart';
import { Scale, Save, Target, TrendingUp, TrendingDown, Calendar, Clock, Edit, Trash2, Plus, BarChart3, Award, Zap, MinusCircle, PlusCircle } from 'lucide-react';

export default function BodyTracking() {
  const { user } = useAuth();
  const [weightEntries, setWeightEntries] = useState<any[]>([]);
  const [targetWeight, setTargetWeight] = useState<any>(null);
  const [userUnit, setUserUnit] = useState('lbs');

  // Quick entry form state
  const [weightInput, setWeightInput] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryTime, setEntryTime] = useState(new Date().toTimeString().slice(0, 5));
  const [entryNotes, setEntryNotes] = useState('');

  // Chart state
  const [chartTimeRange, setChartTimeRange] = useState('3M');
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [showTargetWeight, setShowTargetWeight] = useState(true);

  // Target weight modal
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetWeightValue, setTargetWeightValue] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetType, setTargetType] = useState('lose');

  // Edit modal
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Tooltip state
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    data: null
  });

  useEffect(() => {
    loadWeightData();
    loadUserPreferences();
  }, [user]);

  const loadWeightData = () => {
    const entries = JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]');
    const userEntries = entries
      .filter((entry: any) => entry.userId === user?.id)
      .sort((a: any, b: any) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
    
    setWeightEntries(userEntries);

    const target = JSON.parse(localStorage.getItem('bertLocker_targetWeight') || 'null');
    if (target && target.userId === user?.id) {
      setTargetWeight(target);
    }
  };

  const loadUserPreferences = () => {
    const prefs = JSON.parse(localStorage.getItem('bertLocker_userPreferences') || '{}');
    if (prefs[user?.id]?.weightUnit) {
      setUserUnit(prefs[user?.id].weightUnit);
    }
  };

  const saveUserPreferences = (unit: string) => {
    const prefs = JSON.parse(localStorage.getItem('bertLocker_userPreferences') || '{}');
    if (!prefs[user?.id]) {
      prefs[user?.id] = {};
    }
    prefs[user?.id].weightUnit = unit;
    localStorage.setItem('bertLocker_userPreferences', JSON.stringify(prefs));
  };

  const saveWeightEntry = () => {
    if (!weightInput || isNaN(parseFloat(weightInput))) {
      alert('Please enter a valid weight');
      return;
    }

    const newEntry = {
      id: Date.now().toString(),
      userId: user!.id,
      date: entryDate,
      time: entryTime,
      weight: parseFloat(weightInput),
      unit: userUnit,
      notes: entryNotes.trim(),
      timestamp: new Date(`${entryDate}T${entryTime}`).toISOString()
    };

    const allEntries = JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]');
    allEntries.push(newEntry);
    localStorage.setItem('bertLocker_weightEntries', JSON.stringify(allEntries));

    // Reset form
    setWeightInput('');
    setEntryNotes('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setEntryTime(new Date().toTimeString().slice(0, 5));

    loadWeightData();
  };

  const deleteWeightEntry = (entryId: string) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) return;

    const allEntries = JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]');
    const updatedEntries = allEntries.filter((entry: any) => entry.id !== entryId);
    localStorage.setItem('bertLocker_weightEntries', JSON.stringify(updatedEntries));

    loadWeightData();
  };

  const editWeightEntry = (entry: any) => {
    setEditingEntry(entry);
    setShowEditModal(true);
  };

  const saveEditedEntry = (updatedEntry: any) => {
    const allEntries = JSON.parse(localStorage.getItem('bertLocker_weightEntries') || '[]');
    const updatedEntries = allEntries.map((entry: any) =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    localStorage.setItem('bertLocker_weightEntries', JSON.stringify(updatedEntries));

    setShowEditModal(false);
    setEditingEntry(null);
    loadWeightData();
  };

  const saveTargetWeight = () => {
    if (!targetWeightValue || isNaN(parseFloat(targetWeightValue))) {
      alert('Please enter a valid target weight');
      return;
    }

    const target = {
      userId: user!.id,
      value: parseFloat(targetWeightValue),
      unit: userUnit,
      targetDate: targetDate || null,
      type: targetType,
      setDate: new Date().toISOString()
    };

    localStorage.setItem('bertLocker_targetWeight', JSON.stringify(target));
    setTargetWeight(target);
    setShowTargetModal(false);
    setTargetWeightValue('');
    setTargetDate('');
  };

  const getFilteredChartData = () => {
    if (weightEntries.length === 0) return [];

    const now = new Date();
    let startDate;

    switch (chartTimeRange) {
      case '30D':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6M':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return weightEntries;
    }

    return weightEntries.filter((entry: any) => new Date(entry.timestamp) >= startDate);
  };

  const getWeightChange = (timeframe = 'week') => {
    if (weightEntries.length < 2) return null;

    const now = new Date();
    const days = timeframe === 'week' ? 7 : 30;
    const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const recentEntries = weightEntries.filter((entry: any) => new Date(entry.timestamp) >= pastDate);

    if (recentEntries.length < 2) return null;

    const oldestRecent = recentEntries[0];
    const newest = weightEntries[weightEntries.length - 1];

    return newest.weight - oldestRecent.weight;
  };

  const getCurrentWeight = () => {
    return weightEntries.length > 0 ? weightEntries[weightEntries.length - 1] : null;
  };

  const getWeightStats = () => {
    if (weightEntries.length === 0) return null;

    const weights = weightEntries.map((e: any) => e.weight);
    const highest = Math.max(...weights);
    const lowest = Math.min(...weights);

    return { highest, lowest };
  };

  const getProgressToTarget = () => {
    if (!targetWeight || weightEntries.length === 0) return null;

    const latestWeight = getCurrentWeight();
    const current = latestWeight.weight;
    const target = targetWeight.value;
    const start = weightEntries[0].weight;

    let progress;
    if (targetWeight.type === 'lose') {
      const totalToLose = start - target;
      const lostSoFar = start - current;
      progress = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0;
    } else if (targetWeight.type === 'gain') {
      const totalToGain = target - start;
      const gainedSoFar = current - start;
      progress = totalToGain > 0 ? (gainedSoFar / totalToGain) * 100 : 0;
    } else {
      // maintain
      const tolerance = 2; // 2 lbs tolerance
      progress = Math.abs(current - target) <= tolerance ? 100 : 0;
    }

    return Math.max(0, Math.min(100, progress));
  };

  const handlePointHover = (point: any, x: number, y: number) => {
    setTooltip({
      show: true,
      x: x + 70, // offset for tooltip
      y: y - 10,
      data: point
    });
  };

  const hideTooltip = () => {
    setTooltip({ show: false, x: 0, y: 0, data: null });
  };

  const handleUnitChange = (newUnit: string) => {
    setUserUnit(newUnit);
    saveUserPreferences(newUnit);
  };

  const formatWeight = (weight: number, unit = userUnit) => {
    return `${weight.toFixed(1)} ${unit}`;
  };

  const formatDate = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const latestWeight = getCurrentWeight();
  const weightChange = getWeightChange();
  const stats = getWeightStats();
  const targetProgress = getProgressToTarget();
  const chartData = getFilteredChartData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-50 mb-2">Body Weight Progress</h1>
          <p className="text-slate-400">
            {latestWeight ? (
              <>Current: {formatWeight(latestWeight.weight)} • Last updated {formatDate(latestWeight.date, latestWeight.time)}</>
            ) : (
              'Start tracking your weight progress'
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowTargetModal(true)}
            variant="outline"
            className="text-slate-200"
          >
            <Target className="h-4 w-4 mr-2" />
            {targetWeight ? 'Edit Target' : 'Set Target'}
          </Button>
        </div>
      </div>

      {/* Quick Weight Entry */}
      <Card className="border-2 border-pink-500/30 bg-gradient-to-r from-pink-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-50">
            <Scale className="h-6 w-6 text-pink-500" />
            Log Today's Weight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Weight</label>
              <Input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="175.5"
                className="text-lg text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Unit</label>
              <select
                value={userUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="select-field w-full"
              >
                <option value="lbs">Pounds (lbs)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Date</label>
              <Input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Time</label>
              <Input
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Notes (Optional)</label>
              <Input
                value={entryNotes}
                onChange={(e) => setEntryNotes(e.target.value)}
                placeholder="Morning weigh-in"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={saveWeightEntry}
              className="w-full md:w-auto"
              size="lg"
              disabled={!weightInput}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Weight Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weight Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="stats">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-600">
                <Scale className="h-6 w-6 text-pink-500" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-pink-500/10 text-pink-400 border-pink-500/20">
                Current
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Current Weight</p>
              <p className="text-3xl font-bold text-slate-50 mb-1">
                {latestWeight ? formatWeight(latestWeight.weight) : '--'}
              </p>
              <p className="text-xs text-slate-500">
                {latestWeight ? `Last: ${formatDate(latestWeight.date, latestWeight.time)}` : 'No entries yet'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stats">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-600">
                {weightChange && weightChange > 0 ? (
                  <TrendingUp className="h-6 w-6 text-red-500" />
                ) : weightChange && weightChange < 0 ? (
                  <TrendingDown className="h-6 w-6 text-emerald-500" />
                ) : (
                  <BarChart3 className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                7 Days
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Weekly Change</p>
              <p className="text-3xl font-bold text-slate-50 mb-1">
                {weightChange ? (
                  <span className={weightChange > 0 ? 'text-red-400' : weightChange < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {userUnit}
                  </span>
                ) : '--'}
              </p>
              <p className="text-xs text-slate-500">Past 7 days</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stats">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-600">
                <Target className="h-6 w-6 text-cyan-400" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-cyan-400/10 text-cyan-400 border-cyan-400/20">
                Goal
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Target Progress</p>
              <p className="text-3xl font-bold text-slate-50 mb-1">
                {targetProgress !== null ? `${Math.round(targetProgress)}%` : '--'}
              </p>
              <p className="text-xs text-slate-500">
                {targetWeight ? `Target: ${formatWeight(targetWeight.value)}` : 'No target set'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card variant="stats">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-600">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
                Range
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Weight Range</p>
              <p className="text-3xl font-bold text-slate-50 mb-1">
                {stats ? `${(stats.highest - stats.lowest).toFixed(1)}` : '--'}
              </p>
              <p className="text-xs text-slate-500">
                {stats ? `${formatWeight(stats.lowest)} - ${formatWeight(stats.highest)}` : 'No data yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-slate-50">Weight Progress Chart</CardTitle>
            <div className="flex flex-wrap gap-2">
              {['30D', '3M', '6M', '1Y', 'All'].map(range => (
                <Button
                  key={range}
                  onClick={() => setChartTimeRange(range)}
                  variant={chartTimeRange === range ? 'primary' : 'outline'}
                  size="sm"
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={showTrendLine}
                onChange={(e) => setShowTrendLine(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Trend Line</span>
            </label>
            {targetWeight && (
              <label className="flex items-center gap-2 text-slate-200">
                <input
                  type="checkbox"
                  checked={showTargetWeight}
                  onChange={(e) => setShowTargetWeight(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show Target Weight</span>
              </label>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative" onMouseLeave={hideTooltip}>
            <LineChart
              data={chartData}
              xKey="timestamp"
              yKey="weight"
              width={800}
              height={400}
              showTrendLine={showTrendLine}
              targetWeight={showTargetWeight && targetWeight ? targetWeight.value : null}
              unit={userUnit}
              onPointHover={handlePointHover}
            />

            {/* Tooltip */}
            {tooltip.show && tooltip.data && (
              <div
                className="absolute bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl z-10 pointer-events-none"
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                <div className="text-slate-200 font-medium">
                  {formatWeight(tooltip.data.weight)}
                </div>
                <div className="text-slate-400 text-sm">
                  {formatDate(tooltip.data.date, tooltip.data.time)}
                </div>
                {tooltip.data.notes && (
                  <div className="text-slate-300 text-sm mt-1">
                    "{tooltip.data.notes}"
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weight History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-slate-50">Weight History ({weightEntries.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          {weightEntries.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No weight entries yet</h3>
              <p className="text-slate-400">Start logging your weight to track progress</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {[...weightEntries].reverse().map((entry: any, index: number) => {
                const prevEntry = weightEntries[weightEntries.length - index - 2];
                const change = prevEntry ? entry.weight - prevEntry.weight : 0;

                return (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-200">
                        <div className="font-medium">{formatWeight(entry.weight)}</div>
                        <div className="text-sm text-slate-400">
                          {formatDate(entry.date, entry.time)} at {formatTime(entry.time)}
                        </div>
                      </div>
                      {change !== 0 && (
                        <div className={`text-sm font-medium ${change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)} {userUnit}
                        </div>
                      )}
                      {entry.notes && (
                        <div className="text-sm text-slate-300 italic">
                          "{entry.notes}"
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editWeightEntry(entry)}
                        className="text-slate-400 hover:text-slate-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWeightEntry(entry.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Weight Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-slate-50">Set Target Weight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Target Weight</label>
                <Input
                  type="number"
                  step="0.1"
                  value={targetWeightValue}
                  onChange={(e) => setTargetWeightValue(e.target.value)}
                  placeholder={`Enter weight in ${userUnit}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Goal Type</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="select-field w-full"
                >
                  <option value="lose">Lose Weight</option>
                  <option value="gain">Gain Weight</option>
                  <option value="maintain">Maintain Weight</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">Target Date (Optional)</label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveTargetWeight} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Target
                </Button>
                <Button
                  onClick={() => setShowTargetModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Weight Entry Modal */}
      {showEditModal && editingEntry && (
        <EditWeightModal
          entry={editingEntry}
          onSave={saveEditedEntry}
          onCancel={() => {
            setShowEditModal(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}

// Edit Weight Entry Modal Component
interface EditWeightModalProps {
  entry: any;
  onSave: (entry: any) => void;
  onCancel: () => void;
}

function EditWeightModal({ entry, onSave, onCancel }: EditWeightModalProps) {
  const [weight, setWeight] = useState(entry.weight.toString());
  const [date, setDate] = useState(entry.date);
  const [time, setTime] = useState(entry.time);
  const [notes, setNotes] = useState(entry.notes || '');

  const handleSave = () => {
    if (!weight || isNaN(parseFloat(weight))) {
      alert('Please enter a valid weight');
      return;
    }

    const updatedEntry = {
      ...entry,
      weight: parseFloat(weight),
      date,
      time,
      notes: notes.trim(),
      timestamp: new Date(`${date}T${time}`).toISOString()
    };

    onSave(updatedEntry);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-slate-50">Edit Weight Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Weight</label>
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Time</label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}