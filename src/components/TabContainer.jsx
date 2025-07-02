import React from 'react';
import { cn } from '../lib/utils';

const TabContainer = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Sub-tab Navigation */}
      <div className="border-b border-slate-600">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-400'
                  : 'border-transparent text-slate-300 hover:text-slate-200 hover:border-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {children}
      </div>
    </div>
  );
};

export default TabContainer;