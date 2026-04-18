import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { lessons } from '../data';
import { CheckCircle, Lock, Play } from 'lucide-react';

const DS = {
  bg: '#f5f5f5', white: '#ffffff', border: '#e2e2e2',
  text: '#1a1a1a', textMuted: '#6b6b6b', textLight: '#9a9a9a',
  blue: '#1a56db', blueBg: '#eff4ff', green: '#15803d', greenBg: '#f0fdf4',
  font: "'Georgia', 'Times New Roman', serif",
  radius: '3px', radiusMd: '4px',
};

export default function Home({ onSelectLesson }: { onSelectLesson: (id: number) => void }) {
  const { state, t, currentStudent } = useApp();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const quotes = t('quotes');
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [currentStudent?.language]);

  if (!currentStudent) return null;

  const studentProgress = state.progress[currentStudent.id] || {};

  const completedTasks = Object.values(studentProgress).reduce((acc: number, lesson: any) =>
    acc + Object.values(lesson.tasks).filter((t: any) => t.status === 'completed').length, 0) as number;

  const totalTasks = lessons.length * 3;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const getLessonStatus = (lessonId: number) => {
    if (lessonId === 1) return 'active';
    const prevLesson = studentProgress[lessonId - 1] as any;
    if (prevLesson && Object.values(prevLesson.tasks).every((t: any) => t.status === 'completed')) return 'active';
    const cur = studentProgress[lessonId] as any;
    if (cur && (cur.visualizationWatched || Object.values(cur.tasks).some((t: any) => t.status === 'completed'))) return 'active';
    return 'locked';
  };

  const statCard = (value: string | number, label: string) => (
    <div style={{ textAlign: 'center', padding: '16px 24px', background: DS.white, border: `1px solid ${DS.border}`, borderRadius: DS.radiusMd, minWidth: '100px' }}>
      <div style={{ fontSize: '24px', fontWeight: '700', color: DS.text, fontFamily: DS.font }}>{value}</div>
      <div style={{ fontSize: '11px', color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '2px', fontFamily: DS.font }}>{label}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: DS.font }}>
      {/* Welcome bar */}
      <div style={{ background: DS.white, border: `1px solid ${DS.border}`, borderRadius: DS.radiusMd, padding: '24px 28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: DS.text, margin: '0 0 4px', fontFamily: DS.font }}>
            Қош келдіңіз, {currentStudent.name}
          </h1>
          <p style={{ fontSize: '13px', color: DS.textMuted, margin: 0, fontStyle: 'italic' }}>"{quote}"</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {statCard(currentStudent.streak, 'Streak')}
          {statCard(completedTasks, 'Тапсырма')}
          {statCard(`${progressPercent}%`, 'Прогресс')}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', color: DS.textMuted, fontFamily: DS.font }}>Жалпы прогресс</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: DS.text, fontFamily: DS.font }}>{completedTasks} / {totalTasks}</span>
        </div>
        <div style={{ height: '4px', background: DS.border, borderRadius: '2px' }}>
          <div style={{ height: '100%', width: `${progressPercent}%`, background: DS.blue, borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Lessons grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
        {lessons.map((lesson) => {
          const status = getLessonStatus(lesson.id);
          const lessonProg = studentProgress[lesson.id] as any;
          const isCompleted = lessonProg && Object.values(lessonProg.tasks).every((t: any) => t.status === 'completed');
          const locked = status === 'locked';

          return (
            <div
              key={lesson.id}
              onClick={() => !locked && onSelectLesson(lesson.id)}
              style={{
                background: DS.white,
                border: `1px solid ${isCompleted ? '#bbf7d0' : locked ? DS.border : DS.border}`,
                borderRadius: DS.radiusMd,
                padding: '20px',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.55 : 1,
                transition: 'border-color 0.15s, box-shadow 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = '#a5b4fc'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = isCompleted ? '#bbf7d0' : DS.border; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '28px', height: '28px', background: locked ? '#f0f0f0' : DS.blueBg, borderRadius: DS.radius, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: locked ? DS.textLight : DS.blue, fontFamily: DS.font }}>
                  {lesson.id}
                </div>
                {isCompleted ? <CheckCircle size={16} color="#15803d" /> : locked ? <Lock size={15} color={DS.textLight} /> : <Play size={15} color={DS.blue} />}
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: '600', color: DS.text, margin: '0 0 12px', fontFamily: DS.font, lineHeight: '1.4', minHeight: '40px' }}>
                {lesson.title['kk']}
              </h3>

              {/* Task progress bars */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['easy', 'medium', 'hard'] as const).map(diff => {
                  const taskStatus = lessonProg?.tasks[diff]?.status;
                  return (
                    <div key={diff} style={{ flex: 1, height: '3px', borderRadius: '2px', background: taskStatus === 'completed' ? '#15803d' : taskStatus === 'active' ? '#f59e0b' : '#e5e5e5' }} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}