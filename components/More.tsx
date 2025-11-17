
import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { ChevronRightIcon } from './icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProfile } from '../contexts/ProfileContext';

const More: React.FC = () => {
  const { currentProfile, setView } = useProfile();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [streak, setStreak] = useLocalStorage('streak', 0, currentProfile?.id);
  const [lastStreakDate, setLastStreakDate] = useLocalStorage('lastStreakDate', '', currentProfile?.id);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleStreakUpdate = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastStreakDate === todayStr) {
      alert("You've already updated your streak today!");
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const newStreak = lastStreakDate === yesterdayStr ? streak + 1 : 1;
    setStreak(newStreak);
    setLastStreakDate(todayStr);
    alert(`Streak updated! Your new streak is ${newStreak}.`);
  };

  const menuItems = [
    { label: 'Pomodoro Timer', view: 'pomodoro' as View },
    { label: 'Documents & Certs', view: 'documents' as View },
    { label: 'Formula Book', view: 'formulabook' as View },
    { label: 'AI Tools', view: 'aitools' as View },
    { label: 'Tasks & Assignments', view: 'tasks' as View },
    { label: 'Habit Tracker', view: 'habits' as View },
    { label: 'Syllabus Tracker', view: 'syllabus' as View },
    { label: 'Opportunities', view: 'opportunities' as View },
  ];

  return (
    <div className="p-4 pb-20 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">More</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
        <button onClick={() => setView('profiles')} className="w-full flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-200">Profile</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current: {currentProfile?.name}</p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Productivity Tools</h2>
        {menuItems.map(item => (
          <button key={item.label} onClick={() => setView(item.view)} className="w-full flex justify-between items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <span className="font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Streak</h2>
         <div className="flex items-center justify-between p-3">
            <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Current Streak: {streak} days</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastStreakDate || 'Never'}</p>
            </div>
            <button onClick={handleStreakUpdate} className="px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold">I Studied Today</button>
         </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-white">Settings</h2>
        <div className="flex justify-between items-center p-3">
          <label htmlFor="theme-select" className="font-medium text-gray-700 dark:text-gray-200">Theme</label>
          <select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)} className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default More;