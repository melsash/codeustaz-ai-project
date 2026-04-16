import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, BarChart3, User, LogOut } from 'lucide-react';
import { AppProvider, useApp } from './store';
import HomePage from './pages/Home';
import LessonPage from './pages/Lesson';
import AnalyticsPage from './pages/Analytics';
import ProfilePage from './pages/Profile';
import { Landing } from './pages/Landing';
import { StudentAuth } from './pages/StudentAuth';
import { TeacherAuth } from './pages/TeacherAuth';
import { TeacherDashboard } from './pages/TeacherDashboard';

const MainLayout = () => {
  const { state, t, currentStudent, currentTeacher, logout } = useApp();
  const [currentRoute, setCurrentRoute] = useState<'home' | 'lesson' | 'analytics' | 'profile'>('home');
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [authType, setAuthType] = useState<'student' | 'teacher' | null>(null);

  const handleNavigate = (route: 'home' | 'lesson' | 'analytics' | 'profile', lessonId?: number) => {
    setCurrentRoute(route);
    if (lessonId !== undefined) {
      setActiveLessonId(lessonId);
    }
  };

  // Auth Flow
  if (!state.userType || !state.currentUser) {
    if (authType === 'student') {
      return <StudentAuth onBack={() => setAuthType(null)} language="kk" />;
    }
    if (authType === 'teacher') {
      return <TeacherAuth onBack={() => setAuthType(null)} language="kk" />;
    }
    return <Landing onSelect={setAuthType} language="kk" />;
  }

  // Teacher View
  if (state.userType === 'teacher') {
    return (
      <div className="min-h-screen bg-[#F8FAFF] text-gray-900 font-['Nunito']">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentRoute('home')}>
                  <div className="w-8 h-8 bg-[#1A56DB] rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl font-['Space_Grotesk'] tracking-tight">CodeUstaz</span>
                </div>
                <div className="hidden md:flex space-x-1">
                  <button
                    onClick={() => setCurrentRoute('home')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      currentRoute === 'home' ? 'bg-blue-50 text-[#1A56DB]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {t('auth.teacherDashboard')}
                  </button>
                  <button
                    onClick={() => setCurrentRoute('analytics')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                      currentRoute === 'analytics' ? 'bg-blue-50 text-[#1A56DB]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    {t('analytics')}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-900">{currentTeacher?.name}</span>
                  <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">Мұғалім</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title={t('auth.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="pt-8 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentRoute === 'home' && <TeacherDashboard />}
              {currentRoute === 'analytics' && <AnalyticsPage />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // Student View
  return (
    <div className="min-h-screen bg-[#F8FAFF] text-gray-900 font-['Nunito']">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('home')}>
                <div className="w-8 h-8 bg-[#1A56DB] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl font-['Space_Grotesk'] tracking-tight">CodeUstaz</span>
              </div>
              
              <div className="hidden md:flex space-x-1">
                <button
                  onClick={() => handleNavigate('home')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    currentRoute === 'home' ? 'bg-blue-50 text-[#1A56DB]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {t('home')}
                </button>
                <button
                  onClick={() => handleNavigate('profile')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                    currentRoute === 'profile' ? 'bg-blue-50 text-[#1A56DB]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  {t('profile')}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-sm font-bold text-gray-900">{currentStudent?.name}</span>
                <span className="text-xs font-mono font-bold text-[#1A56DB] bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                  {currentStudent?.classCode}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title={t('auth.logout')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-8 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentRoute === 'home' && <HomePage onSelectLesson={(id) => handleNavigate('lesson', id)} />}
            {currentRoute === 'lesson' && activeLessonId !== null && (
              <LessonPage lessonId={activeLessonId} onBack={() => handleNavigate('home')} />
            )}
            {currentRoute === 'profile' && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
