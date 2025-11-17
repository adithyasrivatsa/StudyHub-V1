import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getDb } from '../lib/db';
import type { Profile, View } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  switchProfile: (profileId: number) => void;
  addProfile: (name: string) => Promise<void>;
  deleteProfile: (profileId: number) => Promise<void>;
  view: View;
  setView: (view: View) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [lastProfileId, setLastProfileId] = useLocalStorage<number | null>('lastActiveProfile', null);
  const [view, setView] = useState<View>('dashboard');

  const loadProfiles = useCallback(async () => {
    const db = await getDb();
    const allProfiles = await db.getAll('profiles');
    setProfiles(allProfiles);
    
    if (allProfiles.length > 0) {
      const profileToLoad = allProfiles.find(p => p.id === lastProfileId) || allProfiles[0];
      setCurrentProfile(profileToLoad);
      setLastProfileId(profileToLoad.id);
    } else {
      setCurrentProfile(null);
    }
  }, [lastProfileId, setLastProfileId]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const addProfile = async (name: string) => {
    const db = await getDb();
    const newProfile = { name, createdAt: new Date() };
    const id = await db.add('profiles', newProfile);
    await loadProfiles();
    switchProfile(id);
  };

  const switchProfile = (profileId: number) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
      setLastProfileId(profile.id);
      setView('dashboard');
    }
  };

  const deleteProfile = async (profileId: number) => {
    if (!window.confirm("Are you sure? This will delete the profile and all its associated data forever.")) {
        return;
    }
    const db = await getDb();
    const stores = ['notes', 'timetable', 'performance', 'documents', 'pomodoroStats'];
    const tx = db.transaction([...stores, 'profiles'], 'readwrite');
    
    await Promise.all([
      ...stores.map(async storeName => {
        let cursor = await tx.objectStore(storeName as any).index('profileId').openCursor(profileId);
        while(cursor) {
          await cursor.delete();
          cursor = await cursor.continue();
        }
      }),
      tx.objectStore('profiles').delete(profileId)
    ]);

    await tx.done;
    await loadProfiles();
  };


  const value = { profiles, currentProfile, switchProfile, addProfile, deleteProfile, view, setView };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
