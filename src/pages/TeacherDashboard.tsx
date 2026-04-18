import React, { useState } from 'react';
import { useApp } from '../store';
import { Plus, Copy, Check, Users } from 'lucide-react';

const DS = {
  bg: '#f5f5f5', white: '#ffffff', border: '#e2e2e2',
  text: '#1a1a1a', textMuted: '#6b6b6b', textLight: '#9a9a9a',
  blue: '#1a56db', blueHover: '#1547c0', blueBg: '#eff4ff',
  green: '#15803d',
  font: "'Georgia', 'Times New Roman', serif",
  radius: '3px', radiusMd: '4px',
};

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
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    const formattedCode = `${code.substring(0, 3)}-${code.substring(3, 6)}`;
    const newClassId = `class_${Date.now()}`;
    setState(prev => ({
      ...prev,
      classes: { ...prev.classes, [newClassId]: { id: newClassId, name: newClassName, code: formattedCode, teacherId: currentTeacher.id } }
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
    <div style={{ fontFamily: DS.font }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: DS.text, margin: '0 0 4px', fontFamily: DS.font }}>Мұғалім панелі</h1>
          <p style={{ fontSize: '13px', color: DS.textMuted, margin: 0 }}>{currentTeacher.name} — {currentTeacher.schoolName}</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: DS.blue, color: '#fff', border: 'none', borderRadius: DS.radius, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: DS.font, transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = DS.blueHover)}
          onMouseLeave={e => (e.currentTarget.style.background = DS.blue)}
        >
          <Plus size={14} /> Жаңа сынып қосу
        </button>
      </div>

      {/* Add class form */}
      {isAdding && (
        <div style={{ background: DS.white, border: `1px solid ${DS.border}`, borderRadius: DS.radiusMd, padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '12px', fontFamily: DS.font }}>
            Жаңа сынып
          </div>
          <form onSubmit={handleAddClass} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '5px', fontFamily: DS.font }}>Сынып атауы</div>
              <input
                type="text" required value={newClassName} onChange={e => setNewClassName(e.target.value)}
                placeholder="Мысалы: 9А"
                style={{ width: '100%', padding: '8px 12px', border: `1px solid ${DS.border}`, borderRadius: DS.radius, fontSize: '14px', fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => (e.target.style.borderColor = DS.blue)}
                onBlur={e => (e.target.style.borderColor = DS.border)}
                autoFocus
              />
            </div>
            <button type="submit" style={{ padding: '8px 16px', background: DS.green, color: '#fff', border: 'none', borderRadius: DS.radius, fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: DS.font, whiteSpace: 'nowrap' }}>
              Сақтау
            </button>
            <button type="button" onClick={() => setIsAdding(false)} style={{ padding: '8px 14px', background: '#f0f0f0', color: DS.textMuted, border: `1px solid ${DS.border}`, borderRadius: DS.radius, fontSize: '13px', cursor: 'pointer', fontFamily: DS.font }}>
              Болдырмау
            </button>
          </form>
        </div>
      )}

      {/* Classes grid */}
      {teacherClasses.length === 0 && !isAdding ? (
        <div style={{ background: DS.white, border: `1px dashed ${DS.borderDark || '#c8c8c8'}`, borderRadius: DS.radiusMd, padding: '48px', textAlign: 'center' }}>
          <Users size={28} color={DS.textLight} style={{ margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '14px', color: DS.textMuted, margin: '0 0 4px', fontFamily: DS.font, fontWeight: '600' }}>Сыныптар әлі жоқ</p>
          <p style={{ fontSize: '13px', color: DS.textLight, margin: 0, fontFamily: DS.font }}>Жаңа сынып қосып, оқушыларға код беріңіз</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {teacherClasses.map((cls: any) => {
            const studentCount = (Object.values(state.students) as any[]).filter(s => s.classCode === cls.code).length;
            return (
              <div key={cls.id} style={{ background: DS.white, border: `1px solid ${DS.border}`, borderRadius: DS.radiusMd, padding: '20px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#a5b4fc')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = DS.border)}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: DS.text, margin: '0 0 16px', fontFamily: DS.font }}>{cls.name}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: DS.textMuted, fontFamily: DS.font }}>Код:</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: DS.blue, background: DS.blueBg, padding: '2px 10px', borderRadius: DS.radius, border: '1px solid #c7d7fd', fontFamily: "'Courier New', monospace" }}>{cls.code}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: DS.textMuted, fontFamily: DS.font }}>Оқушылар:</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: DS.text, fontFamily: DS.font }}>{studentCount}</span>
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(cls.code)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: '#f5f5f5', color: copiedCode === cls.code ? DS.green : DS.textMuted, border: `1px solid ${DS.border}`, borderRadius: DS.radius, fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: DS.font, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ebebeb'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f5'; }}
                >
                  {copiedCode === cls.code ? <><Check size={13} /> Көшірілді</> : <><Copy size={13} /> Кодты көшіру</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};