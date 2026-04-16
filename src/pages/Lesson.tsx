import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { lessons } from '../data';
import Visualization from '../components/Visualization';
import TaskEditor from '../components/TaskEditor';
import ZerdeAI from '../components/ZerdeAI';
import { ArrowLeft, CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

const taskDatasets: Record<number, Record<string, any[]>> = {
  1: { easy: [4, -2, 8, -5, 10], medium: [5, 48, 125, 14, 8, 96], hard: [10, 12, 96, 32, 69, 15, 207] },
  2: { easy: [12, 5, 8, 19, 2, 7], medium: [141, 605, 786, 989, 545, 100], hard: [15, -6, 3, 0, 17, 6] },
  3: { easy: [4, 9, 5, 17, 3], medium: [10, 3, 6, 8, 2], hard: [8, 6, 11, 25, 3] },
  4: { easy: [[3,4,1,9],[4,5,6,2],[7,8,90,11],[20,3,14,68]], medium: [[-5,0,4,11],[12,-7,0,8],[-9,0,0,7],[15,-8,0,0]], hard: [[12,47,38],[17,15,69],[70,11,7]] },
  5: { easy: [[1,2,3,6],[2,5,6,9],[1,7,8,9],[4,8,9,5]], medium: [[3,4,5,5,3],[4,4,5,5,3],[5,5,5,5,5],[5,5,5,5,4]], hard: [[3,4,5,4,5,5],[4,5,4,4,4,4],[5,5,5,5,5,5],[3,3,3,3,4,4],[4,4,5,4,4,4]] },
  6: { easy: [15, 24, 8, 33, 40, 7], medium: [22, 45, 36, 27, 34, 49], hard: [21, 26, 46, 87, 41, 5, 16, 10, 15, 3, 8, 70] },
  7: { easy: [87015, 87023, 87075, 87046, 87065], medium: [15, -6, 3, 9, 17, 6, 25, -42, 0, 1], hard: [80, 32, 78, 98, 47, 85, 65, 110, 34, 119] },
  8: { easy: [4, 9, 5, 17, 27, 6, 3, 15, 11, 0], medium: [152, 14, 24, 29, 80, 26, 10, 40], hard: [14, 15, 86, 68, 74, 65, 89, 32, 41, 65] },
  9: { easy: [58, 62, 44, 478, 2, 32, 6, 88, 64, 55], medium: [[5,12,7],[8,3,14],[1,9,6]], hard: [175, 160, 182, 190, 165, 178, 185, 192, 168, 170, 188, 172, 180, 195, 177] }
};

export default function Lesson({ lessonId, onBack }: { lessonId: number, onBack: () => void }) {
  const { state, updateProgress, updateTask, t, currentStudent } = useApp();
  const lesson = lessons.find(l => l.id === lessonId);

  if (!currentStudent || !lesson) return <div>Lesson not found</div>;

  const progress = state.progress[currentStudent.id]?.[lessonId] || {
    visualizationWatched: false,
    tasks: { easy: { status: 'locked' }, medium: { status: 'locked' }, hard: { status: 'locked' } }
  };

  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'partial' | 'wrong' | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState<number>(1);

  useEffect(() => {
    setActiveTask(null);
    setFeedbackType(null);
    setSubmittedCode('');
    setAttemptCount(1);
  }, [lessonId]);

  const handleVisualizationComplete = () => {
    updateProgress(currentStudent.id, lessonId, { visualizationWatched: true });
    if (progress.tasks.easy.status === 'locked') {
      updateTask(currentStudent.id, lessonId, 'easy', { status: 'active' });
    }
  };

  // ★ НЕГІЗГІ ЛОГИКА — verdict бэкенддан келеді
  const handleTaskSubmit = (code: string, verdict: string) => {
    setSubmittedCode(code);
    setAttemptCount(prev => prev + 1);

    if (verdict === 'correct') {
      setFeedbackType('correct');
      updateTask(currentStudent.id, lessonId, activeTask as any, { status: 'completed' });
      if (activeTask === 'easy')   updateTask(currentStudent.id, lessonId, 'medium', { status: 'active' });
      if (activeTask === 'medium') updateTask(currentStudent.id, lessonId, 'hard',   { status: 'active' });
    } else if (verdict === 'partial') {
      setFeedbackType('partial');
    } else {
      // wrong | runtime_error | timeout | error — барлығы қате
      setFeedbackType('wrong');
    }
  };

  const currentDifficulty = activeTask || 'easy';
  const currentData = taskDatasets[lessonId]?.[currentDifficulty] || taskDatasets[1].easy;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-6xl mx-auto flex gap-8"
    >
      <div className="flex-1">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('home')}
        </button>

        <header className="mb-10">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-gray-900 mb-4">
            {lesson.title[currentStudent.language as keyof typeof lesson.title]}
          </h1>
        </header>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 mb-6 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-[#1A56DB]" />
            {t('visualization')}
          </h2>
          <div className="h-[400px]">
            <Visualization
              lessonId={lessonId}
              data={currentData}
              difficulty={currentDifficulty}
              onComplete={handleVisualizationComplete}
            />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold font-['Space_Grotesk'] text-gray-900 mb-6">
            {t('tasks')}
          </h2>
          <div className="grid gap-4">
            {lesson.tasks.map((task) => {
              const isCompleted = progress.tasks[task.difficulty as keyof typeof progress.tasks].status === 'completed';
              const isLocked    = progress.tasks[task.difficulty as keyof typeof progress.tasks].status === 'locked';
              const isActive    = activeTask === task.difficulty;

              return (
                <div
                  key={task.id}
                  onClick={() => { if (!isLocked) { setActiveTask(task.difficulty); setFeedbackType(null); } }}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    isActive    ? 'border-[#1A56DB] bg-blue-50/50 shadow-md' :
                    isLocked    ? 'border-gray-100 bg-gray-50 opacity-75 cursor-not-allowed' :
                    isCompleted ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300' :
                                  'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      task.difficulty === 'easy'   ? 'bg-emerald-100 text-emerald-700' :
                      task.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                     'bg-rose-100 text-rose-700'
                    }`}>
                      {t('difficulty')[task.difficulty as keyof typeof t.difficulty]}
                    </span>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6 text-[#10B981]" /> :
                     isLocked    ? <Lock className="w-6 h-6 text-gray-400" /> :
                                   <PlayCircle className="w-6 h-6 text-[#1A56DB]" />}
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {task.text[currentStudent.language as keyof typeof task.text]}
                  </p>
                </div>
              );
            })}
          </div>

          {activeTask && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <TaskEditor
                lessonId={lessonId}
                taskId={`${lessonId}_${activeTask}`}
                difficulty={activeTask}
                onSubmit={(code, verdict) => handleTaskSubmit(code, verdict)}
              />
            </motion.div>
          )}
        </section>
      </div>

      {feedbackType && (
        <ZerdeAI
          feedbackType={feedbackType}
          onClose={() => setFeedbackType(null)}
          code={submittedCode}
          lessonId={lessonId}
          difficulty={activeTask || 'easy'}
          studentId={currentStudent.id}
          attempt={attemptCount}
        />
      )}
    </motion.div>
  );
}