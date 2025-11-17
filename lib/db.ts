
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Profile, Note, TimetableEntry, SemesterResult, DocumentFile, PomodoroStat, Task, Habit, HabitLog, Syllabus } from '../types';

interface StudyHubDB extends DBSchema {
  profiles: {
    key: number;
    value: Profile;
  };
  notes: {
    key: number;
    value: Note;
    indexes: { 'updatedAt': Date; 'profileId': number };
  };
  timetable: {
    key: number;
    value: TimetableEntry;
    indexes: { 'day': string; 'profileId': number };
  };
  performance: {
    key: number;
    value: SemesterResult;
    indexes: { 'profileId': number };
  };
  documents: {
    key: number;
    value: DocumentFile;
    indexes: { 'profileId': number };
  };
  pomodoroStats: {
    key: string; 
    value: PomodoroStat;
    indexes: { 'profileId': number };
  };
  tasks: {
    key: number;
    value: Task;
    indexes: { 'profileId': number };
  };
  habits: {
    key: number;
    value: Habit;
    indexes: { 'profileId': number };
  };
  habitLogs: {
    key: string;
    value: HabitLog;
    indexes: { 'profileId': number; 'habitId': number };
  };
  syllabuses: {
    key: number;
    value: Syllabus;
    indexes: { 'profileId': number };
  };
}

let dbPromise: Promise<IDBPDatabase<StudyHubDB>> | null = null;

export const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<StudyHubDB>('studyhub-db', 3, {
      upgrade(db, oldVersion, newVersion, tx) {
        if (oldVersion < 1) {
            // Initial schema from version 1
            const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
            notesStore.createIndex('updatedAt', 'updatedAt');
            
            const timetableStore = db.createObjectStore('timetable', { keyPath: 'id', autoIncrement: true });
            timetableStore.createIndex('day', 'day');
            
            db.createObjectStore('performance', { keyPath: 'id', autoIncrement: true });
            db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
            db.createObjectStore('pomodoroStats', { keyPath: 'date' });
        }
        if (oldVersion < 2) {
            // Schema changes for version 2: Profiles
            db.createObjectStore('profiles', { keyPath: 'id', autoIncrement: true });

            // Add profileId index to existing stores using the upgrade transaction
            const notesStore = tx.objectStore('notes');
            notesStore.createIndex('profileId', 'profileId');

            const timetableStore = tx.objectStore('timetable');
            timetableStore.createIndex('profileId', 'profileId');

            const performanceStore = tx.objectStore('performance');
            performanceStore.createIndex('profileId', 'profileId');

            const documentsStore = tx.objectStore('documents');
            documentsStore.createIndex('profileId', 'profileId');
            
            // Recreate pomodoroStats store with new keyPath and index
            db.deleteObjectStore('pomodoroStats');
            const pomodoroStore = db.createObjectStore('pomodoroStats', { keyPath: 'id' });
            pomodoroStore.createIndex('profileId', 'profileId');
        }
        if (oldVersion < 3) {
            const tasksStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
            tasksStore.createIndex('profileId', 'profileId');

            const habitsStore = db.createObjectStore('habits', { keyPath: 'id', autoIncrement: true });
            habitsStore.createIndex('profileId', 'profileId');

            const habitLogsStore = db.createObjectStore('habitLogs', { keyPath: 'id' });
            habitLogsStore.createIndex('profileId', 'profileId');
            habitLogsStore.createIndex('habitId', 'habitId');

            const syllabusStore = db.createObjectStore('syllabuses', { keyPath: 'id', autoIncrement: true });
            syllabusStore.createIndex('profileId', 'profileId');
        }
      },
    });
  }
  return dbPromise;
};
