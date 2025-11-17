import React, { useState } from 'react';
import { useDb } from '../hooks/useDb';
import type { Note } from '../types';
import { PlusIcon } from './icons';
import { useProfile } from '../contexts/ProfileContext';

const NoteEditor: React.FC<{
  note: Partial<Note>;
  onSave: (note: Partial<Note>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}> = ({ note, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');

  const handleSave = () => {
    onSave({ ...note, title, content });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl p-6 space-y-4 animate-scale-in">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{note.id ? 'Edit Note' : 'New Note'}</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note Title"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          rows={10}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <div className="flex justify-end space-x-3">
          {note.id && onDelete && (
            <button onClick={onDelete} className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold">Delete</button>
          )}
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save</button>
        </div>
      </div>
    </div>
  );
};

const Notes: React.FC = () => {
  const { currentProfile } = useProfile();
  const { data: notes, add, update, remove } = useDb<Note>('notes', currentProfile?.id);
  const [selectedNote, setSelectedNote] = useState<Partial<Note> | null>(null);

  const handleSaveNote = async (note: Partial<Note>) => {
    const now = new Date();
    if (note.id) {
      const existingNote = notes.find(n => n.id === note.id);
      if (existingNote) {
        await update({ ...existingNote, ...note, updatedAt: now });
      }
    } else {
      await add({ title: note.title || 'Untitled', content: note.content || '', createdAt: now, updatedAt: now });
    }
    setSelectedNote(null);
  };

  const handleDeleteNote = async () => {
    if (selectedNote && selectedNote.id) {
      await remove(selectedNote.id);
      setSelectedNote(null);
    }
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Notes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => setSelectedNote(note)}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{note.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{note.content}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(note.updatedAt).toLocaleDateString()}</p>
          </div>
        ))}
         {notes.length === 0 && (
            <div className="col-span-1 sm:col-span-2 text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">You have no notes yet.</p>
                <p className="text-gray-500 dark:text-gray-400">Tap the '+' button to create one.</p>
            </div>
        )}
      </div>

      <button
        onClick={() => setSelectedNote({})}
        className="fixed bottom-20 right-4 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Add new note"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {selectedNote && (
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onCancel={() => setSelectedNote(null)}
          onDelete={handleDeleteNote}
        />
      )}
    </div>
  );
};

export default Notes;