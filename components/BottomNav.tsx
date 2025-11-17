
import React from 'react';
import type { View } from '../types';
import { HomeIcon, NoteIcon, TimetableIcon, PerformanceIcon, MoreIcon } from './icons';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-indigo-600 dark:text-indigo-400';
  const inactiveClasses = 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400';

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center flex-1 space-y-1 transition-colors duration-200"
    >
      <div className={`w-7 h-7 ${isActive ? activeClasses : inactiveClasses}`}>{icon}</div>
      <span className={`text-xs font-medium ${isActive ? activeClasses : inactiveClasses}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const isMoreActive = ['more', 'pomodoro', 'documents', 'aitools', 'profiles', 'tasks', 'habits', 'syllabus', 'opportunities'].includes(activeView);
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-t-lg z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto px-2">
        <NavItem label="Home" icon={<HomeIcon />} isActive={activeView === 'dashboard'} onClick={() => setView('dashboard')} />
        <NavItem label="Notes" icon={<NoteIcon />} isActive={activeView === 'notes'} onClick={() => setView('notes')} />
        <NavItem label="Timetable" icon={<TimetableIcon />} isActive={activeView === 'timetable'} onClick={() => setView('timetable')} />
        <NavItem label="Grades" icon={<PerformanceIcon />} isActive={activeView === 'performance'} onClick={() => setView('performance')} />
        <NavItem label="More" icon={<MoreIcon />} isActive={isMoreActive} onClick={() => setView('more')} />
      </div>
    </nav>
  );
};

export default BottomNav;
