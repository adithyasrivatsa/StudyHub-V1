
import React, { useState, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import type { Habit, HabitLog } from '../types';
import { useProfile } from '../contexts/ProfileContext';
import { PlusIcon } from './icons';

const getPastDays = (numDays: number) => {
    const days = [];
    for (let i = 0; i < numDays; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
    }
    return days.reverse();
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const Habits: React.FC = () => {
    const { currentProfile, setView } = useProfile();
    const { data: habits, add: addHabit, remove: removeHabit } = useDb<Habit>('habits', currentProfile?.id);
    // FIX: Use `update` for habit logs as they have a non-auto-incrementing string key. `add` is for auto-incrementing keys.
    const { data: habitLogs, update: updateLog, remove: removeLog } = useDb<HabitLog>('habitLogs', currentProfile?.id);

    const [newHabitName, setNewHabitName] = useState('');
    const pastSevenDays = useMemo(() => getPastDays(7), []);

    const logsMap = useMemo(() => {
        const map = new Map<string, HabitLog>();
        habitLogs.forEach(log => map.set(log.id, log));
        return map;
    }, [habitLogs]);

    const handleAddHabit = async () => {
        if (newHabitName.trim() && habits.length < 5) {
            await addHabit({ name: newHabitName.trim(), createdAt: new Date() });
            setNewHabitName('');
        }
    };

    const toggleHabitLog = async (habitId: number, date: Date) => {
        if (!currentProfile) return;
        const dateStr = formatDate(date);
        const logId = `${currentProfile.id}-${habitId}-${dateStr}`;

        if (logsMap.has(logId)) {
            // FIX: Remove `as any` as `remove` now accepts string keys.
            await removeLog(logId);
        } else {
            // FIX: Use `update` (aliased as `updateLog`) to add/update the log entry.
            await updateLog({ id: logId, profileId: currentProfile.id, habitId, date: dateStr });
        }
    };

    return (
        <div className="p-4 pb-20">
             <div className="flex items-center mb-4">
                <button onClick={() => setView('more')} className="mr-2 p-1 text-2xl">&larr;</button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Habit Tracker</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <h2 className="font-semibold text-lg mb-4">Your Habits (Last 7 Days)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-center">
                        <thead>
                            <tr>
                                <th className="p-2 text-left">Habit</th>
                                {pastSevenDays.map(day => (
                                    <th key={day.toISOString()} className="p-2 w-12">
                                        <div className="text-xs font-normal">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                        <div className="font-semibold">{day.getDate()}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {habits.map(habit => (
                                <tr key={habit.id}>
                                    <td className="p-2 text-left font-medium flex items-center justify-between">
                                        <span>{habit.name}</span>
                                        <button onClick={() => removeHabit(habit.id)} className="text-red-500 text-xs opacity-50 hover:opacity-100">remove</button>
                                    </td>
                                    {pastSevenDays.map(day => {
                                        const logId = `${currentProfile?.id}-${habit.id}-${formatDate(day)}`;
                                        const isCompleted = logsMap.has(logId);
                                        return (
                                            <td key={day.toISOString()} className="p-2">
                                                <button onClick={() => toggleHabitLog(habit.id, day)} className={`w-8 h-8 rounded-lg ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'} transition-colors`}></button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {habits.length === 0 && <p className="text-center text-gray-500 py-8">Add up to 5 habits to start tracking.</p>}
            </div>

            {habits.length < 5 && (
                <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newHabitName}
                            onChange={(e) => setNewHabitName(e.target.value)}
                            placeholder="Add a new habit..."
                            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button onClick={handleAddHabit} className="p-3 rounded-lg bg-indigo-600 text-white">
                           <PlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Habits;
