import React from 'react';
import { translations } from '../translations';

interface LandingProps {
  onSelect: (type: 'student' | 'teacher') => void;
  language: 'kk' | 'ru' | 'en';
}

export const Landing: React.FC<LandingProps> = ({ onSelect, language }) => {
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
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{
          width: '56px',
          height: '56px',
          background: '#1a56db',
          borderRadius: '4px',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: '#fff', fontSize: '22px', fontWeight: '700', fontFamily: 'monospace' }}>C</span>
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1a1a2e',
          margin: '0 0 8px',
          fontFamily: "'Georgia', serif",
          letterSpacing: '-0.5px'
        }}>
          CodeUstaz
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 36px',
          fontFamily: "'Georgia', serif"
        }}>
          Python жиымдарын үйренуге арналған платформа
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => onSelect('student')}
            style={{
              width: '100%',
              padding: '13px',
              background: '#1a56db',
              color: '#ffffff',
              border: 'none',
              borderRadius: '3px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'Georgia', serif",
              letterSpacing: '0.3px',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1547c0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1a56db')}
          >
            Оқушы ретінде кіру
          </button>

          <button
            onClick={() => onSelect('teacher')}
            style={{
              width: '100%',
              padding: '13px',
              background: '#ffffff',
              color: '#1a56db',
              border: '1.5px solid #1a56db',
              borderRadius: '3px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'Georgia', serif",
              letterSpacing: '0.3px',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
          >
            Мұғалім ретінде кіру
          </button>
        </div>
      </div>
    </div>
  );
};