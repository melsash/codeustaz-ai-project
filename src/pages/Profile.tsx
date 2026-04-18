import React, { useState } from 'react';
import { useApp } from '../store';
import { Check } from 'lucide-react';

const DS = {
  bg: '#f5f5f5', white: '#ffffff', border: '#e2e2e2',
  text: '#1a1a1a', textMuted: '#6b6b6b', textLight: '#9a9a9a',
  blue: '#1a56db', blueBg: '#eff4ff', green: '#15803d',
  font: "'Georgia', 'Times New Roman', serif",
  radius: '3px', radiusMd: '4px',
};

const card = (children: React.ReactNode, style: React.CSSProperties = {}) => (
  <div style={{ background: DS.white, border: `1px solid ${DS.border}`, borderRadius: DS.radiusMd, padding: '24px', ...style }}>
    {children}
  </div>
);

const sectionTitle = (text: string) => (
  <div style={{ fontSize: '13px', fontWeight: '700', color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px', fontFamily: DS.font, borderBottom: `1px solid ${DS.border}`, paddingBottom: '8px' }}>
    {text}
  </div>
);

export default function Profile() {
  const { state, updateStudent, t, currentStudent } = useApp();
  if (!currentStudent) return null;

  const [name, setName] = useState(currentStudent.name);
  const [isEditing, setIsEditing] = useState(false);

  const studentProgress = state.progress[currentStudent.id] || {};
  const completedTasks = Object.values(studentProgress).reduce((acc: number, lesson: any) =>
    acc + Object.values(lesson.tasks).filter((t: any) => t.status === 'completed').length, 0) as number;

  const handleSaveName = () => {
    updateStudent(currentStudent.id, { name });
    setIsEditing(false);
  };

  const langBtn = (lang: 'kk' | 'ru' | 'en', label: string) => (
    <button
      onClick={() => updateStudent(currentStudent.id, { language: lang })}
      style={{
        flex: 1, padding: '8px', border: `1px solid ${currentStudent.language === lang ? DS.blue : DS.border}`,
        borderRadius: DS.radius, background: currentStudent.language === lang ? DS.blueBg : DS.white,
        color: currentStudent.language === lang ? DS.blue : DS.textMuted,
        fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: DS.font,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ fontFamily: DS.font, maxWidth: '800px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: DS.text, margin: '0 0 20px', fontFamily: DS.font }}>Профиль</h1>

      {/* Info */}
      {card(
        <>
          {sectionTitle('Жеке мәліметтер')}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', background: DS.blueBg, border: `1px solid #c7d7fd`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: DS.blue, fontFamily: DS.font }}>
              {currentStudent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input value={name} onChange={e => setName(e.target.value)}
                    style={{ padding: '6px 10px', border: `1px solid ${DS.blue}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, outline: 'none' }}
                    autoFocus
                  />
                  <button onClick={handleSaveName} style={{ padding: '6px 10px', background: DS.blue, color: '#fff', border: 'none', borderRadius: DS.radius, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Check size={14} />
                  </button>
                  <button onClick={() => setIsEditing(false)} style={{ padding: '6px 10px', background: '#f0f0f0', color: DS.textMuted, border: `1px solid ${DS.border}`, borderRadius: DS.radius, cursor: 'pointer', fontSize: '13px', fontFamily: DS.font }}>
                    Болдырмау
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: DS.text, fontFamily: DS.font }}>{currentStudent.name}</span>
                  <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DS.blue, fontSize: '12px', fontFamily: DS.font, textDecoration: 'underline' }}>
                    Өңдеу
                  </button>
                </div>
              )}
              <div style={{ fontSize: '12px', color: DS.textMuted, marginTop: '2px' }}>
                Сынып: <strong style={{ color: DS.text }}>{currentStudent.classCode}</strong>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { val: currentStudent.streak, label: 'Streak' },
              { val: completedTasks, label: 'Тапсырмалар' },
              { val: Math.floor(completedTasks / 3) + 1, label: 'Деңгей' },
            ].map(({ val, label }) => (
              <div key={label} style={{ flex: 1, padding: '12px', background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: DS.radius, textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: DS.text, fontFamily: DS.font }}>{val}</div>
                <div style={{ fontSize: '11px', color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: DS.font }}>{label}</div>
              </div>
            ))}
          </div>
        </>
      , { marginBottom: '12px' })}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Achievements */}
        {card(
          <>
            {sectionTitle('Жетістіктер')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {Array.from({ length: 9 }).map((_, i) => {
                const lessonProg = studentProgress[i + 1] as any;
                const unlocked = lessonProg && Object.values(lessonProg.tasks).every((t: any) => t.status === 'completed');
                return (
                  <div key={i} style={{ padding: '10px 8px', border: `1px solid ${unlocked ? '#bbf7d0' : DS.border}`, borderRadius: DS.radius, background: unlocked ? DS.white : '#fafafa', textAlign: 'center', opacity: unlocked ? 1 : 0.5 }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: unlocked ? '#dcfce7' : '#f0f0f0', border: `1px solid ${unlocked ? '#86efac' : DS.border}`, margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: unlocked ? DS.green : DS.textLight, fontFamily: DS.font }}>
                      {i + 1}
                    </div>
                    <div style={{ fontSize: '11px', color: DS.textMuted, fontFamily: DS.font }}>Сабақ {i + 1}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Settings */}
        {card(
          <>
            {sectionTitle('Баптаулар')}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px', fontFamily: DS.font }}>Тіл</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {langBtn('kk', 'Қазақша')}
                {langBtn('ru', 'Русский')}
                {langBtn('en', 'English')}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}