import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TabContainer from '../components/TabContainer';
import WorkoutHistory from './WorkoutHistory';
import BodyTracking from './BodyTracking';
import Analytics from './Analytics';

export default function Progress() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial tab from URL params or default to body
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    return ['body', 'analytics', 'history'].includes(tab || '') ? tab : 'body';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const tabs = [
    { id: 'body', label: 'Body' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'history', label: 'History' }
  ];

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
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
      setActiveTab(['body', 'analytics', 'history'].includes(tab) ? tab : 'body');
    }
  }, [location.search, activeTab]);

  const getPageDescription = () => {
    switch (activeTab) {
      case 'body':
        return 'Monitor your body composition and weight changes';
      case 'analytics':
        return 'Comprehensive insights into your fitness journey';
      case 'history':
        return 'Track your workout history and training progress';
      default:
        return 'Track your fitness progress and achievements';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-50 mb-2">Progress</h1>
        <p className="text-slate-400">
          {getPageDescription()}
        </p>
      </div>

      <TabContainer
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {/* Render appropriate content based on active tab */}
        {activeTab === 'body' && <BodyTracking />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'history' && <WorkoutHistory />}
      </TabContainer>
    </div>
  );
}