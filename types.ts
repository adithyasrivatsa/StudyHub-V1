
export interface Profile {
  id: number;
  name: string;
  createdAt: Date;
}

export interface Note {
  id: number;
  profileId: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimetableEntry {
  id: number;
  profileId: number;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  subject: string;
  location?: string;
  color: string;
  reminder?: number; // minutes before
}

export interface SemesterResult {
  id: number;
  profileId: number;
  semesterName: string;
  gpa: number;
  credits: number;
}

// FIX: Add the Opportunity interface to resolve import errors.
export interface Opportunity {
  title: string;
  company: string;
  deadline: string;
  link: string;
  type?: 'Internship' | 'Scholarship' | 'Hackathon' | 'Job';
}

export interface DocumentFile {
  id: number;
  profileId: number;
  name: string;
  type: string;
  data: string; // base64 data URL
  addedAt: Date;
}

export interface PomodoroStat {
  id: string; // profileId-YYYY-MM-DD
  profileId: number;
  date: string; // YYYY-MM-DD
  completed: number;
}

export interface Task {
  id: number;
  profileId: number;
  title: string;
  dueDate?: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: Date;
}

export interface Habit {
  id: number;
  profileId: number;
  name: string;
  createdAt: Date;
}

export interface HabitLog {
  id: string; // `${profileId}-${habitId}-${YYYY-MM-DD}`
  profileId: number;
  habitId: number;
  date: string; // YYYY-MM-DD
}

export interface SyllabusTopic {
    id: string;
    name: string;
    completed: boolean;
}

export interface Syllabus {
    id: number;
    profileId: number;
    subject: string;
    topics: SyllabusTopic[];
    createdAt: Date;
}

export type View = 'dashboard' | 'notes' | 'timetable' | 'performance' | 'more' | 'pomodoro' | 'documents' | 'aitools' | 'profiles' | 'tasks' | 'habits' | 'syllabus' | 'opportunities';
