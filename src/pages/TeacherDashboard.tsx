import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../store';
import { Plus, Copy, CheckCircle2, Users } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { state, setState, t, currentTeacher } = useApp();
  const [newClassName, setNewClassName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!currentTeacher) return null;

  const teacherClasses = (Object.values(state.classes) as any[]).filter(c => c.teacherId === currentTeacher.id);

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    // Generate random 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXX-XXX
    const formattedCode = `${code.substring(0, 3)}-${code.substring(3, 6)}`;

    const newClassId = `class_${Date.now()}`;
    setState(prev => ({
      ...prev,
      classes: {
        ...prev.classes,
        [newClassId]: {
          id: newClassId,
          name: newClassName,
          code: formattedCode,
          teacherId: currentTeacher.id
        }
      }
    }));

    setNewClassName('');
    setIsAdding(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-['Space_Grotesk'] mb-2">
            {t('auth.teacherDashboard')}
          </h1>
          <p className="text-gray-500">
            {currentTeacher.name} • {currentTeacher.schoolName}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-[#1A56DB] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('auth.addClass')}
        </button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8"
        >
          <form onSubmit={handleAddClass} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.className')}</label>
              <input
                type="text"
                required
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Мысалы: 9А"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A56DB] focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#10B981] hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              {t('save')}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              Болдырмау
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teacherClasses.map((cls: any) => {
          const studentCount = (Object.values(state.students) as any[]).filter(s => s.classCode === cls.code).length;
          
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-['Space_Grotesk']">{cls.name}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Код:</span>
                  <span className="font-mono font-bold text-[#1A56DB] bg-blue-50 px-3 py-1 rounded-lg">
                    {cls.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{t('auth.studentsCount')}</span>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                    <Users className="w-4 h-4 text-gray-400" />
                    {studentCount}
                  </div>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(cls.code)}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium transition-colors"
              >
                {copiedCode === cls.code ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[#10B981]">{t('auth.codeCopied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {t('auth.copyCode')}
                  </>
                )}
              </button>
            </motion.div>
          );
        })}

        {teacherClasses.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Сыныптар әлі жоқ</h3>
            <p className="text-gray-500">Жаңа сынып қосу үшін жоғарыдағы батырманы басыңыз</p>
          </div>
        )}
      </div>
    </div>
  );
};
