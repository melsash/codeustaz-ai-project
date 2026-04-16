import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'kk' | 'ru' | 'en';

export interface Student {
  id: string;
  name: string;
  classCode: string;
  language: Language;
  streak: number;
  soundEnabled: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  schoolName: string;
}

export interface ClassData {
  id: string;
  name: string;
  code: string;
  teacherId: string;
}

export interface TaskProgress {
  status: 'locked' | 'active' | 'completed';
  code?: string;
  feedback?: any;
}

export interface LessonProgress {
  visualizationWatched: boolean;
  tasks: {
    easy: TaskProgress;
    medium: TaskProgress;
    hard: TaskProgress;
  };
}

export interface AppState {
  userType: 'student' | 'teacher' | null;
  currentUser: string | null; // student id or teacher id
  students: Record<string, Student>;
  teachers: Record<string, Teacher>;
  classes: Record<string, ClassData>;
  progress: Record<string, Record<number, LessonProgress>>; // studentId -> lessonId -> progress
  analytics: any[];
}

const defaultState: AppState = {
  userType: null,
  currentUser: null,
  students: {},
  teachers: {},
  classes: {},
  progress: {},
  analytics: [],
};

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  updateProgress: (studentId: string, lessonId: number, updates: Partial<LessonProgress>) => void;
  updateTask: (studentId: string, lessonId: number, difficulty: string, updates: Partial<TaskProgress>) => void;
  addAnalytics: (data: any) => void;
  logout: () => void;
  t: (key: string) => any;
  currentStudent: Student | null;
  currentTeacher: Teacher | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

import { translations } from './translations';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('codeustaz_data_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('codeustaz_data_v2', JSON.stringify(state));
    // Remove any dark mode classes if they exist from previous version
    document.documentElement.classList.remove('dark');
  }, [state]);

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setState(prev => ({
      ...prev,
      students: {
        ...prev.students,
        [studentId]: { ...prev.students[studentId], ...updates }
      }
    }));
  };

  const updateProgress = (studentId: string, lessonId: number, updates: Partial<LessonProgress>) => {
    setState(prev => {
      const studentProgress = prev.progress[studentId] || {};
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [studentId]: {
            ...studentProgress,
            [lessonId]: {
              ...(studentProgress[lessonId] || {
                visualizationWatched: false,
                tasks: {
                  easy: { status: 'locked' },
                  medium: { status: 'locked' },
                  hard: { status: 'locked' }
                }
              }),
              ...updates
            }
          }
        }
      };
    });
  };

  const updateTask = (studentId: string, lessonId: number, difficulty: string, updates: Partial<TaskProgress>) => {
    setState(prev => {
      const studentProgress = prev.progress[studentId] || {};
      const lesson = studentProgress[lessonId] || {
        visualizationWatched: false,
        tasks: {
          easy: { status: 'locked' },
          medium: { status: 'locked' },
          hard: { status: 'locked' }
        }
      };
      return {
        ...prev,
        progress: {
          ...prev.progress,
          [studentId]: {
            ...studentProgress,
            [lessonId]: {
              ...lesson,
              tasks: {
                ...lesson.tasks,
                [difficulty]: {
                  ...lesson.tasks[difficulty as keyof typeof lesson.tasks],
                  ...updates
                }
              }
            }
          }
        }
      };
    });
  };

  const addAnalytics = (data: any) => {
    setState(prev => ({
      ...prev,
      analytics: [...prev.analytics, { ...data, timestamp: Date.now() }]
    }));
  };

  const logout = () => {
    setState(prev => ({ ...prev, userType: null, currentUser: null }));
  };

  const currentStudent = state.userType === 'student' && state.currentUser ? state.students[state.currentUser] : null;
  const currentTeacher = state.userType === 'teacher' && state.currentUser ? state.teachers[state.currentUser] : null;
  
  const language = currentStudent?.language || 'kk';
  
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    return value || key;
  };

  return (
    <AppContext.Provider value={{ state, setState, updateStudent, updateProgress, updateTask, addAnalytics, logout, t, currentStudent, currentTeacher }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
