import React, { useState } from 'react';
import { useApp } from '../store';
import { ArrowLeft } from 'lucide-react';

interface TeacherAuthProps {
  onBack: () => void;
  language: 'kk' | 'ru' | 'en';
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.8px',
  marginBottom: '5px',
  fontFamily: "'Georgia', serif"
};

export const TeacherAuth: React.FC<TeacherAuthProps> = ({ onBack, language }) => {
  const { state, setState } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const getInputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${focused === field ? '#1a56db' : '#d1d5db'}`,
    borderRadius: '3px',
    fontSize: '14px',
    color: '#1a1a2e',
    background: focused === field ? '#fff' : '#fafafa',
    fontFamily: "'Georgia', serif",
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const teacherId = Object.keys(state.teachers).find(id => state.teachers[id].email === email);
      if (teacherId) {
        setState(prev => ({ ...prev, userType: 'teacher', currentUser: teacherId }));
      } else {
        setError('Бұл email тіркелмеген.');
      }
    } else {
      if (password !== confirmPassword) { setError('Құпия сөздер сәйкес келмейді.'); return; }
      const newTeacherId = `teacher_${Date.now()}`;
      setState(prev => ({
        ...prev,
        teachers: { ...prev.teachers, [newTeacherId]: { id: newTeacherId, name, email, schoolName } },
        userType: 'teacher',
        currentUser: newTeacherId
      }));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      padding: '24px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '4px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
        padding: '40px',
        width: '100%',
        maxWidth: '440px'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', marginBottom: '24px',
            fontFamily: "'Georgia', serif", padding: 0
          }}
        >
          <ArrowLeft size={14} /> Артқа
        </button>

        <h2 style={{
          fontSize: '22px', fontWeight: '700', color: '#1a1a2e',
          margin: '0 0 6px', fontFamily: "'Georgia', serif", letterSpacing: '-0.3px'
        }}>
          {isLogin ? 'Кіру' : 'Тіркелу'}
        </h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 28px', fontFamily: "'Georgia', serif" }}>
          Мұғалім аккаунты
        </p>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '3px', padding: '10px 12px',
            fontSize: '13px', color: '#dc2626', marginBottom: '16px',
            fontFamily: "'Georgia', serif"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Аты-жөні</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  style={getInputStyle('name')} placeholder="Аты-жөніңіз"
                  onFocus={() => setFocused('name')} onBlur={() => setFocused('')} />
              </div>
              <div>
                <label style={labelStyle}>Мектеп</label>
                <input type="text" required value={schoolName} onChange={e => setSchoolName(e.target.value)}
                  style={getInputStyle('school')} placeholder="Мектеп атауы"
                  onFocus={() => setFocused('school')} onBlur={() => setFocused('')} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Электрондық пошта</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={getInputStyle('email')} placeholder="email@example.com"
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Құпия сөз</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={getInputStyle('pass')} placeholder="••••••••"
              onFocus={() => setFocused('pass')} onBlur={() => setFocused('')} />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Құпия сөзді растау</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={getInputStyle('confirm')} placeholder="••••••••"
                onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')} />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', padding: '12px',
              background: '#1a56db', color: '#fff',
              border: 'none', borderRadius: '3px',
              fontSize: '15px', fontWeight: '700',
              cursor: 'pointer', marginTop: '8px',
              fontFamily: "'Georgia', serif",
              letterSpacing: '0.5px'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1547c0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1a56db')}
          >
            {isLogin ? 'КІРУ' : 'ТІРКЕЛУ'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#1a56db', fontSize: '13px',
              fontFamily: "'Georgia', serif", textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Аккаунт жоқ па? Тіркелу' : 'Аккаунт бар ма? Кіру'}
          </button>
        </div>
      </div>
    </div>
  );
};