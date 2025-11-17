
import React, { useEffect } from 'react';
import type { View } from './types';
import { useProfile } from './contexts/ProfileContext';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import Notes from './components/Notes';
import Timetable from './components/Timetable';
import Performance from './components/Performance';
import More from './components/More';
import Pomodoro from './components/Pomodoro';
import Documents from './components/Documents';
import AiTools from './components/AiTools';
import ProfileSetup from './components/ProfileSetup';
import ProfileManager from './components/ProfileManager';
import Tasks from './components/Tasks';
import Habits from './components/Habits';
import SyllabusTracker from './components/SyllabusTracker';
import Opportunities from './components/Opportunities';
import FormulaBook from './components/FormulaBook';

const App: React.FC = () => {
  const { currentProfile, view, setView } = useProfile();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
          console.log('SW registered: ', registration);
        }).catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  }, []);
  
  if (!currentProfile) {
    return <ProfileSetup />;
  }
  
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'notes':
        return <Notes />;
      case 'timetable':
        return <Timetable />;
      case 'performance':
        return <Performance />;
      case 'more':
        return <More />;
      case 'pomodoro':
        return <Pomodoro />;
      case 'documents':
        return <Documents />;
      case 'aitools':
        return <AiTools />;
      case 'profiles':
        return <ProfileManager />;
      case 'tasks':
        return <Tasks />;
      case 'habits':
        return <Habits />;
      case 'syllabus':
        return <SyllabusTracker />;
      case 'opportunities':
        return <Opportunities />;
      case 'formulabook':
        return <FormulaBook />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <main className="max-w-lg mx-auto">
        {renderView()}
      </main>
      <BottomNav activeView={view} setView={setView} />
    </div>
  );
};

export default App;