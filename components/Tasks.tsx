
import React, { useState, useMemo } from 'react';
import { useDb } from '../hooks/useDb';
import type { Task } from '../types';
import { PlusIcon } from './icons';
import { useProfile } from '../contexts/ProfileContext';

const TaskEditor: React.FC<{
  task: Partial<Task>;
  onSave: (task: Partial<Task>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}> = ({ task, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(task.title || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');

  const handleSave = () => {
    if (!title.trim()) {
        alert('Task title cannot be empty.');
        return;
    }
    onSave({ ...task, title, dueDate });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl p-6 space-y-4 animate-scale-in">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{task.id ? 'Edit Task' : 'New Task'}</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <div className="flex justify-end space-x-3">
          {task.id && onDelete && (
            <button onClick={onDelete} className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">Delete</button>
          )}
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
};

const Tasks: React.FC = () => {
  const { currentProfile, setView } = useProfile();
  const { data: tasks, add, update, remove } = useDb<Task>('tasks', currentProfile?.id);
  const [selectedTask, setSelectedTask] = useState<Partial<Task> | null>(null);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return a.dueDate ? -1 : b.dueDate ? 1 : 0;
    });
  }, [tasks]);

  const handleSaveTask = async (task: Partial<Task>) => {
    const now = new Date();
    if (task.id) {
      const existingTask = tasks.find(t => t.id === task.id);
      if (existingTask) {
        await update({ ...existingTask, ...task });
      }
    } else {
      await add({ title: task.title || 'Untitled Task', dueDate: task.dueDate, completed: false, createdAt: now });
    }
    setSelectedTask(null);
  };

  const toggleComplete = async (task: Task) => {
    await update({ ...task, completed: !task.completed });
  };

  const handleDeleteTask = async () => {
    if (selectedTask && selectedTask.id) {
      await remove(selectedTask.id);
      setSelectedTask(null);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-4">
        <button onClick={() => setView('more')} className="mr-2 p-1 text-2xl">&larr;</button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tasks & Assignments</h1>
      </div>
      <div className="space-y-3">
        {sortedTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm flex items-center space-x-3"
          >
            <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:bg-gray-900 dark:border-gray-600" />
            <div className="flex-1 cursor-pointer" onClick={() => setSelectedTask(task)}>
              <p className={`font-medium text-gray-800 dark:text-gray-100 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>{task.title}</p>
              {task.dueDate && <p className={`text-sm ${task.completed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>Due: {task.dueDate}</p>}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
            <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No tasks yet. Stay organized!</p>
            </div>
        )}
      </div>

      <button
        onClick={() => setSelectedTask({})}
        className="fixed bottom-20 right-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Add new task"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {selectedTask && (
        <TaskEditor
          task={selectedTask}
          onSave={handleSaveTask}
          onCancel={() => setSelectedTask(null)}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default Tasks;
