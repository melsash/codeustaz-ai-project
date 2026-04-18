import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface ZerdeAIProps {
  feedbackType: 'correct' | 'partial' | 'wrong';
  onClose: () => void;
  code?: string;
  lessonId?: number;
  difficulty?: string;
  studentId?: string;
  attempt?: number;
}

interface MLFeedback {
  error_label_kk: string;
  confidence: number;
  hint_1: string;
  hint_2: string;
  hint_3: string;
}

export default function ZerdeAI({
  feedbackType, onClose,
  code = '', lessonId = 1, difficulty = 'easy',
  studentId = 'student_1', attempt = 1
}: ZerdeAIProps) {
  const [mlFeedback, setMlFeedback] = useState<MLFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shownHints, setShownHints] = useState(0);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (feedbackType === 'wrong' && code.trim().length > 5) {
      setIsLoading(true);
      fetch(`${API_BASE}/classify/error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, code, lessonId, difficulty, attempt })
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) { setMlFeedback(data); setShownHints(1); } })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [feedbackType, code]);

  const cfg = {
    correct: { bg: '#166534', body: '#f0fdf4', border: '#86efac', title: 'Дұрыс орындалды', text: 'Тапсырма толық дұрыс.' },
    partial:  { bg: '#92400e', body: '#fffbeb', border: '#fcd34d', title: 'Жартылай дұрыс',  text: 'Логика дұрыс, нәтиже толық емес.' },
    wrong:    { bg: '#991b1b', body: '#fff5f5', border: '#fca5a5', title: 'Қате нәтиже',     text: 'Нәтиже күтілгенмен сәйкес келмеді.' },
  }[feedbackType];

  const clean = (h: string) => h.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27FF}\s]+/u, '').replace(/^[^\w\u0400-\u04FF]+/, '').trim();

  return (
    <div style={{
      width: '300px', flexShrink: 0,
      border: `1px solid ${cfg.border}`, borderRadius: '4px',
      overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.09)',
      fontFamily: "'Georgia', serif",
      alignSelf: 'flex-start'  /* не растягивается на всю высоту */
    }}>
      {/* Header */}
      <div style={{ background: cfg.bg, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>ZerdeAI</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '2px', letterSpacing: '0.8px' }}>AI MENTOR</span>
        </div>
        <div style={{ display: 'flex', gap: '2px' }}>
          <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: '2px', display: 'flex' }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: '2px', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ background: cfg.body, padding: '14px' }}>

          {/* General */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Жалпы баға</div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', margin: 0, lineHeight: '1.4' }}>
              {cfg.title}. {cfg.text}
            </p>
          </div>

          {/* ML block — only for wrong */}
          {feedbackType === 'wrong' && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '3px', padding: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#1a56db', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                Терең оқыту талдауы
              </div>

              {isLoading && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Талдануда...</p>}

              {!isLoading && mlFeedback && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#1a56db', background: '#eff6ff', padding: '2px 8px', borderRadius: '2px', border: '1px solid #bfdbfe' }}>
                      {mlFeedback.error_label_kk}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{(mlFeedback.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {shownHints >= 1 && (
                      <div style={{ background: '#f0f4ff', border: '1px solid #c7d7fd', borderRadius: '3px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#3b5bdb', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>1-кеңес</div>
                        <p style={{ fontSize: '13px', color: '#1a1a2e', margin: 0, lineHeight: '1.5' }}>{clean(mlFeedback.hint_1)}</p>
                      </div>
                    )}
                    {shownHints >= 2 && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '3px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>2-кеңес</div>
                        <p style={{ fontSize: '13px', color: '#1a1a2e', margin: 0, lineHeight: '1.5' }}>{clean(mlFeedback.hint_2)}</p>
                      </div>
                    )}
                    {shownHints >= 3 && (
                      <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '3px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#991b1b', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>3-кеңес</div>
                        <p style={{ fontSize: '13px', color: '#1a1a2e', margin: 0, lineHeight: '1.5' }}>{clean(mlFeedback.hint_3)}</p>
                      </div>
                    )}
                  </div>

                  {shownHints < 3 && (
                    <button
                      onClick={() => setShownHints(h => Math.min(h + 1, 3))}
                      style={{ width: '100%', marginTop: '8px', padding: '8px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Georgia', serif", letterSpacing: '0.4px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1547c0')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#1a56db')}
                    >
                      {shownHints === 1 ? '2-КЕҢЕС АЛУ' : '3-КЕҢЕС АЛУ'}
                    </button>
                  )}
                </div>
              )}

              {!isLoading && !mlFeedback && (
                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>Кодты қадамма-қадам тексеріңіз.</p>
              )}
            </div>
          )}

          {/* Direction for correct/partial */}
          {feedbackType !== 'wrong' && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Бағыт</div>
              <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                {feedbackType === 'correct' ? 'Келесі деңгейге өтуге дайынсың.' : 'Шарт операторларын тексеріңіз.'}
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            style={{ width: '100%', padding: '10px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Georgia', serif", letterSpacing: '0.3px' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2d2d44')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1a1a2e')}
          >
            Түсіндім, тапсырмаға өтемін
          </button>
        </div>
      )}
    </div>
  );
}