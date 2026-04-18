import React, { useState } from 'react';
import { BarChart3, User, LogOut, BookOpen } from 'lucide-react';
import { AppProvider, useApp } from './store';
import HomePage from './pages/Home';
import LessonPage from './pages/Lesson';
import AnalyticsPage from './pages/Analytics';
import ProfilePage from './pages/Profile';
import { Landing } from './pages/Landing';
import { StudentAuth } from './pages/StudentAuth';
import { TeacherAuth } from './pages/TeacherAuth';
import { TeacherDashboard } from './pages/TeacherDashboard';

// ── Единая дизайн-система ─────────────────────────────────────────
export const DS = {
  bg: '#f5f5f5',
  white: '#ffffff',
  border: '#e2e2e2',
  borderDark: '#c8c8c8',
  text: '#1a1a1a',
  textMuted: '#6b6b6b',
  textLight: '#9a9a9a',
  blue: '#1a56db',
  blueHover: '#1547c0',
  blueBg: '#eff4ff',
  green: '#15803d',
  greenBg: '#f0fdf4',
  red: '#b91c1c',
  redBg: '#fef2f2',
  amber: '#92400e',
  amberBg: '#fffbeb',
  font: "'Georgia', 'Times New Roman', serif",
  fontMono: "'Courier New', monospace",
  radius: '3px',
  radiusMd: '4px',
};

const NavLink = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 14px',
      background: active ? DS.blueBg : 'transparent',
      color: active ? DS.blue : DS.textMuted,
      border: active ? `1px solid #c7d7fd` : '1px solid transparent',
      borderRadius: DS.radius,
      fontSize: '14px',
      fontWeight: active ? '600' : '500',
      cursor: 'pointer',
      fontFamily: DS.font,
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = DS.text; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = DS.textMuted; }}
  >
    {children}
  </button>
);

const MainLayout = () => {
  const { state, t, currentStudent, currentTeacher, logout } = useApp();
  const [currentRoute, setCurrentRoute] = useState<'home' | 'lesson' | 'analytics' | 'profile'>('home');
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [authType, setAuthType] = useState<'student' | 'teacher' | null>(null);

  const handleNavigate = (route: 'home' | 'lesson' | 'analytics' | 'profile', lessonId?: number) => {
    setCurrentRoute(route);
    if (lessonId !== undefined) setActiveLessonId(lessonId);
  };

  if (!state.userType || !state.currentUser) {
    if (authType === 'student') return <StudentAuth onBack={() => setAuthType(null)} language="kk" />;
    if (authType === 'teacher') return <TeacherAuth onBack={() => setAuthType(null)} language="kk" />;
    return <Landing onSelect={setAuthType} language="kk" />;
  }

  const navbarStyle: React.CSSProperties = {
    background: DS.white,
    borderBottom: `1px solid ${DS.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
  };

  const navInner: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
  };

  const logoBadge: React.CSSProperties = {
    width: '28px',
    height: '28px',
    background: DS.blue,
    borderRadius: DS.radius,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const logoText: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '700',
    color: DS.text,
    fontFamily: DS.font,
    letterSpacing: '-0.3px',
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '700',
    color: DS.blue,
    background: DS.blueBg,
    border: `1px solid #c7d7fd`,
    borderRadius: DS.radius,
    padding: '2px 8px',
    fontFamily: DS.font,
    letterSpacing: '0.3px',
  };

  const userInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const logoutBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: DS.textLight,
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: DS.radius,
    transition: 'color 0.15s',
  };

  const mainStyle: React.CSSProperties = {
    background: DS.bg,
    minHeight: 'calc(100vh - 52px)',
    padding: '32px 24px',
  };

  const contentStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  // ── Teacher layout ────────────────────────────────────────────
  if (state.userType === 'teacher') {
    return (
      <div style={{ background: DS.bg, minHeight: '100vh', fontFamily: DS.font }}>
        <nav style={navbarStyle}>
          <div style={navInner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={logoStyle} onClick={() => setCurrentRoute('home')}>
                <div style={logoBadge}>
                  <BookOpen size={14} color="#fff" />
                </div>
                <span style={logoText}>CodeUstaz</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <NavLink active={currentRoute === 'home'} onClick={() => setCurrentRoute('home')}>
                  Мұғалім панелі
                </NavLink>
                <NavLink active={currentRoute === 'analytics'} onClick={() => setCurrentRoute('analytics')}>
                  Аналитика
                </NavLink>
              </div>
            </div>
            <div style={userInfoStyle}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: DS.text }}>{currentTeacher?.name}</span>
              <span style={{ fontSize: '11px', color: DS.textMuted, background: '#f0f0f0', padding: '2px 8px', borderRadius: DS.radius, border: `1px solid ${DS.border}` }}>
                Мұғалім
              </span>
              <button
                onClick={logout}
                style={logoutBtn}
                onMouseEnter={e => (e.currentTarget.style.color = DS.red)}
                onMouseLeave={e => (e.currentTarget.style.color = DS.textLight)}
                title="Шығу"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </nav>
        <main style={mainStyle}>
          <div style={contentStyle}>
            {currentRoute === 'home' && <TeacherDashboard />}
            {currentRoute === 'analytics' && <AnalyticsPage />}
          </div>
        </main>
      </div>
    );
  }

  // ── Student layout ────────────────────────────────────────────
  return (
    <div style={{ background: DS.bg, minHeight: '100vh', fontFamily: DS.font }}>
      <nav style={navbarStyle}>
        <div style={navInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={logoStyle} onClick={() => handleNavigate('home')}>
              <div style={logoBadge}>
                <BookOpen size={14} color="#fff" />
              </div>
              <span style={logoText}>CodeUstaz</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <NavLink active={currentRoute === 'home' || currentRoute === 'lesson'} onClick={() => handleNavigate('home')}>
                Басты бет
              </NavLink>
              <NavLink active={currentRoute === 'profile'} onClick={() => handleNavigate('profile')}>
                Профиль
              </NavLink>
            </div>
          </div>
          <div style={userInfoStyle}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: DS.text }}>{currentStudent?.name}</span>
            <span style={badgeStyle}>{currentStudent?.classCode}</span>
            <button
              onClick={logout}
              style={logoutBtn}
              onMouseEnter={e => (e.currentTarget.style.color = DS.red)}
              onMouseLeave={e => (e.currentTarget.style.color = DS.textLight)}
              title="Шығу"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>
      <main style={mainStyle}>
        <div style={contentStyle}>
          {currentRoute === 'home' && <HomePage onSelectLesson={(id) => handleNavigate('lesson', id)} />}
          {currentRoute === 'lesson' && activeLessonId !== null && (
            <LessonPage lessonId={activeLessonId} onBack={() => handleNavigate('home')} />
          )}
          {currentRoute === 'profile' && <ProfilePage />}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}