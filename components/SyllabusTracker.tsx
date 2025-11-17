
import React, { useState, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import type { Syllabus, SyllabusTopic } from '../types';
import { useProfile } from '../contexts/ProfileContext';
import { PlusIcon } from './icons';

const SyllabusDetail: React.FC<{
    syllabus: Syllabus,
    onUpdate: (syllabus: Syllabus) => void,
    onDelete: () => void,
    onBack: () => void,
}> = ({ syllabus, onUpdate, onDelete, onBack }) => {
    const [newTopic, setNewTopic] = useState('');

    const toggleTopic = (topicId: string) => {
        const updatedTopics = syllabus.topics.map(t =>
            t.id === topicId ? { ...t, completed: !t.completed } : t
        );
        onUpdate({ ...syllabus, topics: updatedTopics });
    };

    const addTopic = () => {
        if (!newTopic.trim()) return;
        const newTopicObj: SyllabusTopic = { id: Date.now().toString(), name: newTopic.trim(), completed: false };
        onUpdate({ ...syllabus, topics: [...syllabus.topics, newTopicObj] });
        setNewTopic('');
    };

    const completedTopics = syllabus.topics.filter(t => t.completed).length;
    const progress = syllabus.topics.length > 0 ? (completedTopics / syllabus.topics.length) * 100 : 0;

    return (
        <div className="p-4 pb-20">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="mr-2 p-1 text-2xl">&larr;</button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white truncate flex-1">{syllabus.subject}</h1>
                <button onClick={onDelete} className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white font-semibold">Delete</button>
            </div>
            
            <div className="mb-4">
                <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s' }}></div>
                </div>
            </div>

            <div className="space-y-2 mb-6">
                {syllabus.topics.map(topic => (
                    <div key={topic.id} onClick={() => toggleTopic(topic.id)} className="flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer space-x-3">
                        <input type="checkbox" checked={topic.completed} readOnly className="h-5 w-5 rounded text-indigo-600 focus:ring-0 border-gray-300 dark:bg-gray-900 dark:border-gray-600" />
                        <span className={`flex-1 ${topic.completed ? 'line-through text-gray-500' : ''}`}>{topic.name}</span>
                    </div>
                ))}
            </div>
            
            <div className="flex space-x-2">
                <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Add new topic" className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                <button onClick={addTopic} className="p-3 rounded-lg bg-indigo-600 text-white"><PlusIcon className="w-5 h-5"/></button>
            </div>
        </div>
    )
};

const SyllabusTracker: React.FC = () => {
    const { currentProfile, setView } = useProfile();
    const { data: syllabuses, add, update, remove } = useDb<Syllabus>('syllabuses', currentProfile?.id);
    const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
    const [newSyllabusName, setNewSyllabusName] = useState('');

    const handleAddSyllabus = async () => {
        if (!newSyllabusName.trim()) return;
        await add({
            subject: newSyllabusName.trim(),
            topics: [],
            createdAt: new Date(),
        });
        setNewSyllabusName('');
    };

    if (selectedSyllabus) {
        return <SyllabusDetail
            syllabus={selectedSyllabus}
            onUpdate={(s) => { update(s); setSelectedSyllabus(s); }}
            onDelete={() => { remove(selectedSyllabus.id); setSelectedSyllabus(null); }}
            onBack={() => setSelectedSyllabus(null)}
        />
    }

    return (
        <div className="p-4 pb-20">
            <div className="flex items-center mb-4">
                <button onClick={() => setView('more')} className="mr-2 p-1 text-2xl">&larr;</button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Syllabus Tracker</h1>
            </div>
            
            <div className="space-y-3">
                {syllabuses.map(syllabus => {
                    const completed = syllabus.topics.filter(t => t.completed).length;
                    const total = syllabus.topics.length;
                    const progress = total > 0 ? (completed / total) * 100 : 0;
                    return (
                        <div key={syllabus.id} onClick={() => setSelectedSyllabus(syllabus)} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">{syllabus.subject}</h3>
                                <span className="text-sm font-semibold">{completed}/{total} Topics</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%`}}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newSyllabusName}
                        onChange={e => setNewSyllabusName(e.target.value)}
                        placeholder="Add new subject syllabus..."
                        className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <button onClick={handleAddSyllabus} className="p-3 rounded-lg bg-indigo-600 text-white">
                        <PlusIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SyllabusTracker;
