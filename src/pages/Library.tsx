import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabContainer from '../components/TabContainer';
import ExerciseLibrary from './ExerciseLibrary';
import Templates from './Templates';

export default function Library() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial tab from URL params or default to workouts
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'exercises' ? 'exercises' : 'workouts';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const tabs = [
    { id: 'workouts', label: 'Workouts' },
    { id: 'exercises', label: 'Exercises' }
  ];

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams();
    params.set('tab', tabId);
    navigate(`/library?${params.toString()}`, { replace: true });
  };

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab === 'exercises' ? 'exercises' : 'workouts');
    }
  }, [location.search, activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Library</h1>
        <p className="text-slate-400">
          {activeTab === 'workouts' 
            ? 'Manage your workout templates and training protocols' 
            : 'Browse and manage your exercise database'
          }
        </p>
      </div>

      <TabContainer
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {/* Render appropriate content based on active tab */}
        {activeTab === 'workouts' && <Templates />}
        {activeTab === 'exercises' && <ExerciseLibrary />}
      </TabContainer>
    </div>
  );
}