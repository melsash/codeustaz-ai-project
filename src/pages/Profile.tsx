import React, { useState } from 'react';
import { useApp } from '../store';
import { User, Settings, Award, Flame, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { state, updateStudent, t, currentStudent } = useApp();
  
  if (!currentStudent) return null;

  const [name, setName] = useState(currentStudent.name);
  const [isEditing, setIsEditing] = useState(false);

  const studentProgress = state.progress[currentStudent.id] || {};

  const completedTasks = Object.values(studentProgress).reduce((acc: number, lesson: any) => {
    return acc + Object.values(lesson.tasks).filter((t: any) => t.status === 'completed').length;
  }, 0) as number;

  const hintsUsed = 0; // Analytics not fully implemented per student yet

  const handleSaveName = () => {
    updateStudent(currentStudent.id, { name });
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white">
                <div className="text-5xl font-bold text-blue-600">
                  {currentStudent.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-md">
              {Math.floor(completedTasks / 3) + 1}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="flex items-center gap-2 max-w-sm mx-auto md:mx-0">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />
                <button 
                  onClick={handleSaveName}
                  className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  <CheckCircle2 className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <h1 className="text-4xl font-bold font-['Space_Grotesk'] text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-3">
                {currentStudent.name}
                <button onClick={() => setIsEditing(true)} className="text-sm text-blue-500 hover:text-blue-600 font-medium">Өңдеу</button>
              </h1>
            )}
            <p className="text-gray-500 font-medium">Python Arrays Master in Training</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{currentStudent.streak}</div>
            <div className="text-sm text-gray-500 font-medium">{t('streak')}</div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{completedTasks}</div>
            <div className="text-sm text-gray-500 font-medium">{t('tasksCompleted')}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{hintsUsed}</div>
            <div className="text-sm text-gray-500 font-medium">{t('hintsUsed')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            {t('achievements')}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => {
              const isUnlocked = studentProgress[i + 1] && Object.values((studentProgress[i + 1] as any).tasks).every((t: any) => t.status === 'completed');
              return (
                <div key={i} className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${isUnlocked ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50 opacity-50 grayscale'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}>
                    {i + 1}
                  </div>
                  <span className="text-xs font-bold text-center text-gray-700">Сабақ {i + 1}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-500" />
            {t('settings')}
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">{t('language')}</label>
              <div className="flex gap-2">
                <button onClick={() => updateStudent(currentStudent.id, { language: 'kk' })} className={`flex-1 py-2 rounded-xl font-bold transition-colors ${currentStudent.language === 'kk' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Қазақша</button>
                <button onClick={() => updateStudent(currentStudent.id, { language: 'ru' })} className={`flex-1 py-2 rounded-xl font-bold transition-colors ${currentStudent.language === 'ru' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Русский</button>
                <button onClick={() => updateStudent(currentStudent.id, { language: 'en' })} className={`flex-1 py-2 rounded-xl font-bold transition-colors ${currentStudent.language === 'en' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>English</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
