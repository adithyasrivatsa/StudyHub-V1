
import React, { useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';

const ProfileSetup: React.FC = () => {
  const [profileName, setProfileName] = useState('');
  const { addProfile } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName.trim()) {
      await addProfile(profileName.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome to StudyHub!</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Let's start by creating a profile to store your data locally on this device.</p>
            
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name or a profile name"
                    className="w-full p-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    required
                />
                <button 
                    type="submit" 
                    className="w-full p-3 text-lg font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                >
                    Get Started
                </button>
            </form>
        </div>
    </div>
  );
};

export default ProfileSetup;