import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabContainer from '../components/TabContainer';
import ExerciseLibrary from './ExerciseLibrary';
import Templates from './Templates';

export default function Training() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL params or default to templates
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'exercises' ? 'exercises' : 'templates';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const tabs = [
    { id: 'templates', label: 'Templates' },
    { id: 'exercises', label: 'Exercises' }
  ];

  // Update URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams();
    params.set('tab', tabId);
    navigate(`/training?${params.toString()}`, { replace: true });
  };

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab === 'exercises' ? 'exercises' : 'templates');
    }
  }, [location.search, activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Training</h1>
        <p className="text-slate-400">
          {activeTab === 'templates' 
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
        {activeTab === 'templates' && <Templates />}
        {activeTab === 'exercises' && <ExerciseLibrary />}
      </TabContainer>
    </div>
  );
}