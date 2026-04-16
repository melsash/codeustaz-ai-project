import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../store';
import { translations } from '../translations';
import { ArrowLeft } from 'lucide-react';

interface TeacherAuthProps {
  onBack: () => void;
  language: 'kk' | 'ru' | 'en';
}

export const TeacherAuth: React.FC<TeacherAuthProps> = ({ onBack, language }) => {
  const { state, setState } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const t = (key: string) => translations[language][key as keyof typeof translations['kk']] || key;
  const authT = (key: string) => translations[language].auth[key as keyof typeof translations['kk']['auth']] || key;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login
      const teacherId = Object.keys(state.teachers).find(
        id => state.teachers[id].email === email
      );
      
      if (teacherId) {
        setState(prev => ({ ...prev, userType: 'teacher', currentUser: teacherId }));
      } else {
        setError('Қате логин немесе құпия сөз');
      }
    } else {
      // Register
      if (password !== confirmPassword) {
        setError('Құпия сөздер сәйкес келмейді');
        return;
      }

      const newTeacherId = `teacher_${Date.now()}`;
      setState(prev => ({
        ...prev,
        teachers: {
          ...prev.teachers,
          [newTeacherId]: {
            id: newTeacherId,
            name,
            email,
            schoolName
          }
        },
        userType: 'teacher',
        currentUser: newTeacherId
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Артқа
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 font-['Space_Grotesk'] text-center">
          {isLogin ? authT('teacherLoginBtn') : authT('register')}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{authT('fullName')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{authT('schoolName')}</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{authT('email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{authT('password')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent outline-none"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{authT('confirmPassword')}</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#1A56DB] hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors mt-6"
          >
            {isLogin ? authT('login') : authT('register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#1A56DB] hover:underline text-sm font-medium"
          >
            {isLogin ? authT('noAccount') + ' ' + authT('register') : authT('hasAccount') + ' ' + authT('login')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
