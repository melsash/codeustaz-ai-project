import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { translations } from '../translations';

interface LandingProps {
  onSelect: (type: 'student' | 'teacher') => void;
  language: 'kk' | 'ru' | 'en';
}

export const Landing: React.FC<LandingProps> = ({ onSelect, language }) => {
  const t = (key: string) => translations[language][key as keyof typeof translations['kk']] || key;
  const authT = (key: string) => translations[language].auth[key as keyof typeof translations['kk']['auth']] || key;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFF] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#1A56DB] rounded-2xl flex items-center justify-center rotate-3">
            <BookOpen className="w-8 h-8 text-white -rotate-3" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-['Space_Grotesk']">
          CodeUstaz
        </h1>
        <p className="text-gray-500 mb-8">
          Python жиымдарын үйренуге арналған платформа
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onSelect('student')}
            className="w-full flex items-center justify-center gap-3 bg-[#1A56DB] hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors"
          >
            <GraduationCap className="w-5 h-5" />
            {authT('studentLoginBtn')}
          </button>
          
          <button
            onClick={() => onSelect('teacher')}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#1A56DB] text-[#1A56DB] hover:bg-blue-50 py-4 px-6 rounded-xl font-semibold transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            {authT('teacherLoginBtn')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
