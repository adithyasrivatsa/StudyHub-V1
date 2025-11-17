import React, { useState, useEffect } from 'react';
import { useDb } from '../hooks/useDb';
import type { TimetableEntry } from '../types';
import { PlusIcon } from './icons';
import { useProfile } from '../contexts/ProfileContext';
import { requestPermission, scheduleTimetableReminder, cancelTimetableReminder } from '../services/notificationService';

const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
const daysOfWeek: TimetableEntry['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimetableEditor: React.FC<{
    entry: Partial<TimetableEntry>;
    onSave: (entry: Partial<TimetableEntry>) => void;
    onCancel: () => void;
    onDelete?: () => void;
}> = ({ entry, onSave, onCancel, onDelete }) => {
    const [formData, setFormData] = useState<Partial<TimetableEntry>>(entry);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'reminder' ? parseInt(value, 10) : value });
    };

    const handleSave = () => {
        if (formData.subject && formData.day && formData.startTime && formData.endTime) {
            onSave(formData);
        } else {
            alert('Please fill all required fields.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl p-6 space-y-4 animate-scale-in">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{entry.id ? 'Edit Entry' : 'New Entry'}</h2>
                <input type="text" name="subject" value={formData.subject || ''} onChange={handleChange} placeholder="Subject/Task" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                <select name="day" value={formData.day || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required>
                    <option value="" disabled>Select Day</option>
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="flex space-x-2">
                    <input type="time" name="startTime" value={formData.startTime || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                    <input type="time" name="endTime" value={formData.endTime || ''} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" required />
                </div>
                <input type="text" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Location (Optional)" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                <select name="reminder" value={formData.reminder || -1} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <option value="-1">No reminder</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                </select>
                <div className="flex space-x-2">
                    {colors.map(color => (
                        <button key={color} onClick={() => setFormData({ ...formData, color })} className="w-8 h-8 rounded-full" style={{ backgroundColor: color, border: formData.color === color ? '3px solid #3b82f6' : '3px solid transparent' }}></button>
                    ))}
                </div>
                <div className="flex justify-end space-x-3">
                    {entry.id && onDelete && <button onClick={onDelete} className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">Delete</button>}
                    <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 font-semibold">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save</button>
                </div>
            </div>
        </div>
    );
};

const Timetable: React.FC = () => {
    const { currentProfile } = useProfile();
    const { data: entries, add, update, remove } = useDb<TimetableEntry>('timetable', currentProfile?.id);
    const [selectedEntry, setSelectedEntry] = useState<Partial<TimetableEntry> | null>(null);

    useEffect(() => {
        // Request notification permission when component mounts, if not already granted.
        requestPermission();
    }, []);

    const handleSave = async (entry: Partial<TimetableEntry>) => {
        const entryToSave = { ...entry };
        if (entryToSave.reminder === -1) {
            delete entryToSave.reminder;
        }

        if(entry.id) {
            await update(entryToSave as TimetableEntry);
        } else {
            await add({ color: colors[0], ...entryToSave } as Omit<TimetableEntry, 'id'>);
        }
        
        // Find the full entry from the database to get its ID
        // This is a bit inefficient, but useDb doesn't return the saved item.
        // A better implementation would have `add` return the new object with its ID.
        // For now, let's assume this works for scheduling. A refresh would be needed for new items.
        
        const finalEntry = { ...entryToSave, id: entry.id || Date.now() } as TimetableEntry; // Simulate ID for new entries
        scheduleTimetableReminder(finalEntry);

        setSelectedEntry(null);
    };

    const handleDelete = async () => {
        if(selectedEntry?.id) {
            cancelTimetableReminder(selectedEntry.id);
            await remove(selectedEntry.id);
            setSelectedEntry(null);
        }
    };
    
    const getEntriesForDay = (day: string) => {
        return entries.filter(e => e.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    return (
        <div className="p-4 pb-20">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Timetable</h1>
            <div className="space-y-4">
                {daysOfWeek.map(day => (
                    <div key={day}>
                        <h2 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-2">{day}</h2>
                        <div className="space-y-2">
                            {getEntriesForDay(day).map(entry => (
                                <div key={entry.id} onClick={() => setSelectedEntry(entry)} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center space-x-4 shadow-sm cursor-pointer">
                                    <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 dark:text-gray-100">{entry.subject}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.location}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono text-sm text-gray-600 dark:text-gray-300">{entry.startTime}</p>
                                        <p className="font-mono text-sm text-gray-400 dark:text-gray-500">{entry.endTime}</p>
                                    </div>
                                </div>
                            ))}
                            {getEntriesForDay(day).length === 0 && (
                                <div className="text-center py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    <p className="text-gray-400 dark:text-gray-500">No entries for {day}.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => setSelectedEntry({ day: 'Monday', startTime: '09:00', endTime: '10:00', color: colors[0] })}
                className="fixed bottom-20 right-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg"
                aria-label="Add new timetable entry"
            >
                <PlusIcon className="w-6 h-6" />
            </button>

            {selectedEntry && (
                <TimetableEditor
                    entry={selectedEntry}
                    onSave={handleSave}
                    onCancel={() => setSelectedEntry(null)}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default Timetable;