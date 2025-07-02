import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabContainer from '../components/TabContainer';
import WorkoutHistory from './WorkoutHistory';
import BodyTracking from './BodyTracking';

export default function Progress() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL params or default to history
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return tab === 'body' ? 'body' : 'history';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const tabs = [
    { id: 'history', label: 'History' },
    { id: 'body', label: 'Body' }
  ];

  // Update URL when tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams();
    params.set('tab', tabId);
    navigate(`/progress?${params.toString()}`, { replace: true });
  };

  // Listen for URL changes (back/forward navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab === 'body' ? 'body' : 'history');
    }
  }, [location.search, activeTab]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Progress</h1>
        <p className="text-slate-400">
          {activeTab === 'history' 
            ? 'Track your workout history and training progress'
            : 'Monitor your body composition and weight changes'
          }
        </p>
      </div>

      <TabContainer
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {/* Render appropriate content based on active tab */}
        {activeTab === 'history' && <WorkoutHistory />}
        {activeTab === 'body' && <BodyTracking />}
      </TabContainer>
    </div>
  );
}