import { useState, useEffect, useCallback } from 'react';
import { getDb } from '../lib/db';
import type { IDBPDatabase } from 'idb';
// FIX: Import all necessary types for the database stores.
import { Note, TimetableEntry, SemesterResult, DocumentFile, PomodoroStat, Task, Habit, HabitLog, Syllabus } from '../types';

// FIX: Expand StoreName to include all stores that use this hook.
type StoreName = 'notes' | 'timetable' | 'performance' | 'documents' | 'pomodoroStats' | 'tasks' | 'habits' | 'habitLogs' | 'syllabuses';
// FIX: Expand StoreValue to include all value types for the stores.
type StoreValue = Note | TimetableEntry | SemesterResult | DocumentFile | PomodoroStat | Task | Habit | HabitLog | Syllabus;

export function useDb<T extends StoreValue>(storeName: StoreName, profileId: number | undefined) {
  const [data, setData] = useState<T[]>([]);
  const [db, setDb] = useState<IDBPDatabase<any> | null>(null);

  useEffect(() => {
    getDb().then(setDb);
  }, []);

  const refreshData = useCallback(async () => {
    if (db && profileId !== undefined) {
      const allData = await db.getAllFromIndex(storeName, 'profileId', profileId);
      if (storeName === 'notes') {
          (allData as Note[]).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      }
      setData(allData as T[]);
    } else {
        setData([]);
    }
  }, [db, storeName, profileId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const add = async (item: Omit<T, 'id' | 'profileId'>) => {
    if (db && profileId !== undefined) {
      await db.add(storeName, { ...item, profileId });
      await refreshData();
    }
  };
  
  const put = async (item: T) => {
      if(db && profileId !== undefined) {
          await db.put(storeName, { ...item, profileId });
          await refreshData();
      }
  };

  // FIX: Allow `remove` to accept string keys for stores like 'habitLogs'.
  const remove = async (id: number | string) => {
    if (db && profileId !== undefined) {
      await db.delete(storeName, id);
      await refreshData();
    }
  };
  
  const clear = async () => {
    if (db && profileId !== undefined) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const itemsToDelete = await store.index('profileId').getAllKeys(profileId);
      await Promise.all(itemsToDelete.map(key => store.delete(key)));
      await tx.done;
      await refreshData();
    }
  };

  return { data, add, update: put, remove, clear, refreshData };
}
