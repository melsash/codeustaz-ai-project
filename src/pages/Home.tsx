import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { lessons } from '../data';
import { CheckCircle, Lock, PlayCircle, Flame, Target, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home({ onSelectLesson }: { onSelectLesson: (id: number) => void }) {
  const { state, t, currentStudent } = useApp();
  const [quote, setQuote] = useState(t('quotes')[0]);

  useEffect(() => {
    const quotes = t('quotes');
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, [currentStudent?.language]);

  if (!currentStudent) return null;

  const studentProgress = state.progress[currentStudent.id] || {};

  const completedTasks = Object.values(studentProgress).reduce((acc: number, lesson: any) => {
    return acc + Object.values(lesson.tasks).filter((t: any) => t.status === 'completed').length;
  }, 0) as number;

  const totalTasks = lessons.length * 3;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const getLessonStatus = (lessonId: number) => {
    if (lessonId === 1) return 'active'; // First lesson always active
    const prevLesson = studentProgress[lessonId - 1] as any;
    if (prevLesson && Object.values(prevLesson.tasks).every((t: any) => t.status === 'completed')) {
      return 'active';
    }
    const currentLesson = studentProgress[lessonId] as any;
    if (currentLesson && (currentLesson.visualizationWatched || Object.values(currentLesson.tasks).some((t: any) => t.status === 'completed'))) {
      return 'active';
    }
    return 'locked';
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-gray-900 mb-2">
            {t('welcome').replace('{name}', currentStudent.name)}
          </h1>
          <p className="text-gray-500 italic">"{quote}"</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 p-4 rounded-xl text-center min-w-[100px]">
            <Flame className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-600">{currentStudent.streak}</div>
            <div className="text-xs text-amber-600/70 uppercase tracking-wider font-bold">{t('streak')}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl text-center min-w-[100px]">
            <Target className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-600">{completedTasks}</div>
            <div className="text-xs text-blue-600/70 uppercase tracking-wider font-bold">{t('tasksCompleted')}</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl text-center min-w-[100px]">
            <Award className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-emerald-600">{progressPercent}%</div>
            <div className="text-xs text-emerald-600/70 uppercase tracking-wider font-bold">{t('progress')}</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, index) => {
          const status = getLessonStatus(lesson.id);
          const isCompleted = studentProgress[lesson.id] && Object.values((studentProgress[lesson.id] as any).tasks).every((t: any) => t.status === 'completed');
          
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              key={lesson.id}
              onClick={() => status !== 'locked' && onSelectLesson(lesson.id)}
              className={`relative bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 ${
                status === 'locked' 
                  ? 'opacity-60 grayscale-[50%] cursor-not-allowed border-gray-200' 
                  : 'cursor-pointer hover:shadow-md hover:-translate-y-1 border-blue-100'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A56DB] flex items-center justify-center font-bold text-lg">
                  {lesson.id}
                </div>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                ) : status === 'locked' ? (
                  <Lock className="w-6 h-6 text-gray-400" />
                ) : (
                  <PlayCircle className="w-6 h-6 text-[#1A56DB]" />
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-[56px] font-['Space_Grotesk']">
                {lesson.title[currentStudent.language]}
              </h3>
              
              <div className="flex gap-1.5 mt-4">
                {['easy', 'medium', 'hard'].map((diff) => {
                  const taskStatus = studentProgress[lesson.id]?.tasks[diff as keyof typeof studentProgress[number]['tasks']]?.status;
                  return (
                    <div 
                      key={diff} 
                      className={`h-2 flex-1 rounded-full ${
                        taskStatus === 'completed' ? 'bg-[#10B981]' : 
                        taskStatus === 'active' ? 'bg-[#F59E0B]' : 
                        'bg-gray-100'
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
