import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDb } from '../hooks/useDb';
import type { PomodoroStat } from '../types';
import { useProfile } from '../contexts/ProfileContext';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const Pomodoro: React.FC = () => {
    const { currentProfile } = useProfile();
    const [workDuration, setWorkDuration] = useState(25);
    const [shortBreakDuration, setShortBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);

    const [mode, setMode] = useState<TimerMode>('work');
    const [timeLeft, setTimeLeft] = useState(workDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [cycles, setCycles] = useState(0);

    const { data: stats, update } = useDb<PomodoroStat>('pomodoroStats', currentProfile?.id);

    const timerRef = useRef<number | null>(null);

    const getDuration = useCallback(() => {
        switch (mode) {
            case 'work': return workDuration * 60;
            case 'shortBreak': return shortBreakDuration * 60;
            case 'longBreak': return longBreakDuration * 60;
        }
    }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

    useEffect(() => {
        setTimeLeft(getDuration());
    }, [workDuration, shortBreakDuration, longBreakDuration, getDuration]);
    
    const updateTodayStat = useCallback(async () => {
        if (!currentProfile) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const statId = `${currentProfile.id}-${todayStr}`;
        const todayStat = stats.find(s => s.id === statId);

        if (todayStat) {
            await update({ ...todayStat, completed: todayStat.completed + 1 });
        } else {
            const newStat: PomodoroStat = {
                id: statId,
                profileId: currentProfile.id,
                date: todayStr,
                completed: 1,
            };
            await update(newStat);
        }
    }, [stats, update, currentProfile]);


    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsActive(false);
            
            if(mode === 'work') {
                updateTodayStat();
                const newCycles = cycles + 1;
                setCycles(newCycles);
                setMode(newCycles % 4 === 0 ? 'longBreak' : 'shortBreak');
            } else {
                setMode('work');
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft, mode, cycles, updateTodayStat]);
    
    useEffect(() => {
      setTimeLeft(getDuration());
    }, [mode, getDuration])

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTimeLeft(workDuration * 60);
        setCycles(0);
    };

    const percentage = ((getDuration() - timeLeft) / getDuration()) * 100;
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    const ringColor = mode === 'work' ? 'text-rose-500' : 'text-sky-500';
    const todayStat = stats.find(s => s.date === new Date().toISOString().split('T')[0]);

    return (
        <div className="p-4 pb-20 flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200 dark:text-gray-700" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle
                        className={ringColor}
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={(2 * Math.PI * 45) - (percentage / 100) * (2 * Math.PI * 45)}
                        strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.3s' }}
                    />
                </svg>
                <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full">
                    <span className="text-6xl font-mono font-bold text-gray-800 dark:text-white">{minutes}:{seconds}</span>
                    <span className="text-lg font-medium text-gray-500 dark:text-gray-400 capitalize">{mode === 'shortBreak' ? 'Short Break' : mode === 'longBreak' ? 'Long Break' : 'Work Session'}</span>
                </div>
            </div>
            <div className="mt-8 flex space-x-4">
                <button onClick={toggleTimer} className="px-8 py-3 text-xl font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition">
                    {isActive ? 'Pause' : 'Start'}
                </button>
                <button onClick={resetTimer} className="px-8 py-3 text-xl font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    Reset
                </button>
            </div>
            <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-300">Completed cycles today: {todayStat?.completed || 0}</p>
            </div>
        </div>
    );
};

export default Pomodoro;