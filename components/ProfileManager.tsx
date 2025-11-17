import React, { useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { PlusIcon } from './icons';

const ProfileManager: React.FC = () => {
  const { profiles, currentProfile, switchProfile, addProfile, deleteProfile, setView } = useProfile();
  const [newProfileName, setNewProfileName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      await addProfile(newProfileName.trim());
      setNewProfileName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center mb-4">
        <button onClick={() => setView('more')} className="mr-2 p-1">&larr;</button>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profiles</h1>
      </div>
      
      <div className="space-y-3">
        {profiles.map(profile => (
          <div key={profile.id} className={`p-4 rounded-lg flex justify-between items-center ${profile.id === currentProfile?.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-gray-800'}`}>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{profile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created: {new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-2">
              {profile.id !== currentProfile?.id ? (
                <>
                  <button onClick={() => switchProfile(profile.id)} className="px-3 py-1 text-sm font-semibold text-white bg-indigo-600 rounded-md">Switch</button>
                  <button onClick={() => deleteProfile(profile.id)} className="px-3 py-1 text-sm font-semibold text-red-600">Delete</button>
                </>
              ) : (
                <span className="px-3 py-1 text-sm font-semibold text-green-600">Active</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {isAdding ? (
          <form onSubmit={handleAddProfile} className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="New profile name"
              className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save</button>
            </div>
          </form>
        ) : (
          <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add New Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileManager;