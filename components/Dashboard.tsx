import React, { useState, useEffect } from 'react';
import { useDb } from '../hooks/useDb';
import type { TimetableEntry, SemesterResult, PomodoroStat } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useProfile } from '../contexts/ProfileContext';

const StatRing: React.FC<{ percentage: number; label: string; value: string; color: string }> = ({ percentage, label, value, color }) => {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-gray-200 dark:text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
          <circle
            className={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full">
          <span className="text-xl font-bold text-gray-800 dark:text-white">{value}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentProfile, setView } = useProfile();
  const { data: timetableData } = useDb<TimetableEntry>('timetable', currentProfile?.id);
  const { data: performanceData } = useDb<SemesterResult>('performance', currentProfile?.id);
  const { data: pomodoroStats } = useDb<PomodoroStat>('pomodoroStats', currentProfile?.id);
  const [streak] = useLocalStorage('streak', 0, currentProfile?.id);
  const [lastStreakDate] = useLocalStorage('lastStreakDate', '', currentProfile?.id);

  const [todaysSchedule, setTodaysSchedule] = useState<TimetableEntry[]>([]);
  const [cgpa, setCgpa] = useState<string>("0.00");
  const [todaysPomodoros, setTodaysPomodoros] = useState(0);

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const filtered = timetableData
      .filter(entry => entry.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    setTodaysSchedule(filtered);
  }, [timetableData]);

  useEffect(() => {
    if (performanceData.length > 0) {
      const totalCredits = performanceData.reduce((acc, curr) => acc + curr.credits, 0);
      const weightedGpaSum = performanceData.reduce((acc, curr) => acc + curr.gpa * curr.credits, 0);
      const calculatedCgpa = totalCredits > 0 ? (weightedGpaSum / totalCredits).toFixed(2) : "0.00";
      setCgpa(calculatedCgpa);
    } else {
      setCgpa("0.00");
    }
  }, [performanceData]);

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayStat = pomodoroStats.find(s => s.date === todayStr);
        setTodaysPomodoros(todayStat?.completed || 0);
    }, [pomodoroStats]);

    const handleStreak = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        if (lastStreakDate !== todayStr) {
            alert("Go to the 'More' section to update your streak!");
        }
    };


  return (
    <div className="p-4 pb-20 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Hello, {currentProfile?.name}!</h1>
        <p className="text-gray-500 dark:text-gray-400">Ready to be productive today?</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
         <StatRing percentage={(parseFloat(cgpa) / 4.0) * 100} label="CGPA" value={cgpa} color="text-indigo-500" />
         <StatRing percentage={(streak % 30) * 100/30} label="Streak" value={streak.toString()} color="text-amber-500" />
         <StatRing percentage={(todaysPomodoros / 10) * 100} label="Pomodoros" value={todaysPomodoros.toString()} color="text-rose-500" />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Schedule</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3 max-h-48 overflow-y-auto">
          {todaysSchedule.length > 0 ? (
            todaysSchedule.map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{item.subject}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.location}</p>
                </div>
                <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{item.startTime}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No classes scheduled for today. Enjoy your day off!</p>
          )}
        </div>
      </div>
        
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setView('pomodoro')} className="flex flex-col items-center p-3 bg-rose-100 dark:bg-rose-900/50 rounded-xl text-rose-600 dark:text-rose-400 font-semibold text-sm">
            <span>Start</span>
            <span>Pomodoro</span>
        </button>
        <button onClick={() => setView('notes')} className="flex flex-col items-center p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
            <span>Quick</span>
            <span>Note</span>
        </button>
        <button onClick={handleStreak} className="flex flex-col items-center p-3 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-600 dark:text-amber-400 font-semibold text-sm">
            <span>Update</span>
            <span>Streak</span>
        </button>
      </div>

    </div>
  );
};

export default Dashboard;