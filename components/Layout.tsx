
import React from 'react';
import { AppView } from '../types';

interface TopAppBarProps {
  title: string;
  leftIcon?: string;
  onLeftClick?: () => void;
  rightIcon?: string;
  onRightClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ 
  title, 
  leftIcon = 'menu', 
  onLeftClick, 
  rightIcon = 'account_circle',
  onRightClick
}) => (
  <header className="flex items-center bg-white dark:bg-slate-900 p-4 pb-2 justify-between sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
    <button onClick={onLeftClick} className="text-slate-900 dark:text-white flex size-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <span className="material-symbols-outlined">{leftIcon}</span>
    </button>
    <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
      {title}
    </h2>
    <button onClick={onRightClick} className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors overflow-hidden">
      <span className="material-symbols-outlined">{rightIcon}</span>
    </button>
  </header>
);

interface BottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const items = [
    { view: AppView.DASHBOARD, label: 'Home', icon: 'dashboard' },
    { view: AppView.TEAM_BOOKINGS, label: 'History', icon: 'history' },
    { view: AppView.STATS, label: 'Stats', icon: 'analytics' },
    { view: AppView.PROFILE, label: 'Profile', icon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 max-w-[430px] w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 pb-8 flex justify-between items-center z-20 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
      {items.map((item) => (
        <button
          key={item.view}
          onClick={() => onViewChange(item.view)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentView === item.view ? 'text-primary' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          <span className={`material-symbols-outlined ${currentView === item.view ? 'fill' : ''}`}>
            {item.icon}
          </span>
          <span className="text-[10px] font-bold">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
