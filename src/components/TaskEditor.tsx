import React, { useState, useRef } from 'react';
import { Play, Send, CheckCircle2, XCircle, AlertCircle, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../store';

const API_BASE = 'http://localhost:8000';

interface TaskEditorProps {
  lessonId: number;
  taskId: string;
  difficulty: string;
  onSubmit: (code: string, verdict: string) => void;
}

interface RunResult {
  success: boolean;
  verdict: 'correct' | 'partial' | 'wrong' | 'runtime_error' | 'timeout' | 'error';
  output: string;
  expected: string;
  error: string;
  description?: string;
  ml_analysis?: {
    error_type: string;
    error_label_kk: string;
    confidence: number;
    hint_1: string;
    hint_2: string;
    hint_3: string;
  } | null;
}

const VERDICT_CONFIG = {
  correct:       { color: 'emerald', icon: CheckCircle2, label: '✅ Дұрыс!' },
  partial:       { color: 'amber',   icon: AlertCircle,  label: '⚠️ Жартылай дұрыс' },
  wrong:         { color: 'rose',    icon: XCircle,      label: '❌ Қате нәтиже' },
  runtime_error: { color: 'rose',    icon: XCircle,      label: '🐛 Runtime қатесі' },
  timeout:       { color: 'amber',   icon: AlertCircle,  label: '⏱ Уақыт өтіп кетті' },
  error:         { color: 'rose',    icon: XCircle,      label: '❌ Қате' },
};

export default function TaskEditor({ lessonId, taskId, difficulty, onSubmit }: TaskEditorProps) {
  const { currentStudent } = useApp();
  const [code, setCode] = useState(getDefaultCode(lessonId, difficulty));
  const [isRunning, setIsRunning]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult]   = useState<RunResult | null>(null);
  const [showExpected, setShowExpected] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tab батырмасын ұстап алу
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end   = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd   = start + 4;
        }
      }, 0);
    }
  };

  // Іске қосу (тексермей)
  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setRunResult(null);
    try {
      const res = await fetch(`${API_BASE}/run/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code, lessonId, difficulty,
          studentId: currentStudent?.id || 'guest'
        })
      });
      const data: RunResult = await res.json();
      setRunResult(data);
    } catch {
      setRunResult({
        success: false, verdict: 'error',
        output: '', expected: '',
        error: 'Backend байланысы жоқ. Сервер іске қосулы ма?'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Тапсыру (тексеріп)
  const handleSubmit = async () => {
    if (!code.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/run/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code, lessonId, difficulty,
          studentId: currentStudent?.id || 'guest'
        })
      });
      const data: RunResult = await res.json();
      setRunResult(data);
      // Lesson.tsx-ке нәтижені хабарла
      onSubmit(code, data.verdict);
    } catch {
      const fallback: RunResult = {
        success: false, verdict: 'error',
        output: '', expected: '',
        error: 'Backend байланысы жоқ.'
      };
      setRunResult(fallback);
      onSubmit(code, 'wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cfg = runResult ? VERDICT_CONFIG[runResult.verdict] : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-gray-400 text-xs font-mono">solution.py</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          difficulty === 'easy'   ? 'bg-emerald-900/50 text-emerald-400' :
          difficulty === 'medium' ? 'bg-amber-900/50 text-amber-400' :
                                    'bg-rose-900/50 text-rose-400'
        }`}>
          {difficulty === 'easy' ? 'Жеңіл' : difficulty === 'medium' ? 'Орташа' : 'Күрделі'}
        </span>
      </div>

      {/* Код редакторы */}
      <div className="relative bg-gray-950">
        {/* Жол нөмірлері */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gray-900/50 flex flex-col pt-4 select-none">
          {code.split('\n').map((_, i) => (
            <div key={i} className="text-gray-600 text-xs text-right pr-2 leading-6 font-mono">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[220px] pl-12 pr-4 pt-4 pb-4 bg-transparent text-green-300 font-mono text-sm
                     leading-6 resize-y outline-none border-none caret-green-400 selection:bg-green-900/50"
          placeholder="# Кодыңды осында жаз..."
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>

      {/* Нәтиже панелі */}
      <AnimatePresence>
        {runResult && cfg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-t ${
              cfg.color === 'emerald' ? 'border-emerald-200 bg-emerald-50' :
              cfg.color === 'amber'   ? 'border-amber-200 bg-amber-50' :
                                        'border-rose-200 bg-rose-50'
            }`}
          >
            <div className="p-4 space-y-3">
              {/* Verdict */}
              <div className="flex items-center gap-2">
                <cfg.icon className={`w-5 h-5 ${
                  cfg.color === 'emerald' ? 'text-emerald-600' :
                  cfg.color === 'amber'   ? 'text-amber-600' : 'text-rose-600'
                }`} />
                <span className={`font-bold text-sm ${
                  cfg.color === 'emerald' ? 'text-emerald-700' :
                  cfg.color === 'amber'   ? 'text-amber-700' : 'text-rose-700'
                }`}>{cfg.label}</span>
              </div>

              {/* Output */}
              {runResult.output && (
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Шығыс / Output:</div>
                  <pre className="bg-gray-900 text-green-300 rounded-lg px-3 py-2 text-xs font-mono overflow-x-auto">
                    {runResult.output}
                  </pre>
                </div>
              )}

              {/* Runtime error */}
              {runResult.error && (
                <div>
                  <div className="text-xs font-bold text-rose-500 uppercase mb-1">Қате / Error:</div>
                  <pre className="bg-rose-900/20 text-rose-300 rounded-lg px-3 py-2 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {runResult.error}
                  </pre>
                </div>
              )}

              {/* Expected (toggle) */}
              {runResult.expected && !runResult.success && (
                <div>
                  <button
                    onClick={() => setShowExpected(v => !v)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
                  >
                    {showExpected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Күтілетін нәтижені көру
                  </button>
                  {showExpected && (
                    <pre className="mt-1 bg-gray-100 text-gray-700 rounded-lg px-3 py-2 text-xs font-mono">
                      {runResult.expected}
                    </pre>
                  )}
                </div>
              )}

              {/* ML кеңес */}
              {runResult.ml_analysis && (
                <div className="bg-white/70 rounded-xl p-3 border border-blue-100">
                  <div className="text-xs font-bold text-[#1A56DB] mb-1 flex items-center gap-1">
                    🧠 DL Талдауы: {runResult.ml_analysis.error_label_kk}
                    <span className="text-gray-400 font-normal">
                      ({(runResult.ml_analysis.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{runResult.ml_analysis.hint_1}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Батырмалар */}
      <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={handleRun}
          disabled={isRunning || isSubmitting || !code.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:opacity-50
                     text-white rounded-xl font-medium text-sm transition-colors"
        >
          {isRunning
            ? <Loader className="w-4 h-4 animate-spin" />
            : <Play className="w-4 h-4" />}
          Іске қосу
        </button>

        <button
          onClick={handleSubmit}
          disabled={isRunning || isSubmitting || !code.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2
                     bg-[#1A56DB] hover:bg-blue-700 disabled:opacity-50
                     text-white rounded-xl font-bold text-sm transition-colors"
        >
          {isSubmitting
            ? <Loader className="w-4 h-4 animate-spin" />
            : <Send className="w-4 h-4" />}
          Тапсыру
        </button>
      </div>
    </div>
  );
}

// Әр тапсырма үшін бастапқы код шаблоны
function getDefaultCode(lessonId: number, difficulty: string): string {
  const templates: Record<string, string> = {
    '1_easy':   '# A массивінің оң элементтер санын тап\ncount = 0\nfor x in A:\n    if x > 0:\n        count += 1\nprint(count)',
    '1_medium': '# Екі таңбалы сандарды тап\ncount = 0\nfor x in A:\n    pass  # мұнда жаз\nprint(count)',
    '1_hard':   '# P=3-ке еселік сандарды шығар\nfor x in B:\n    pass  # мұнда жаз',
    '2_easy':   '# [c, d] аралығындағы элементтерді шығар\nfor x in A:\n    pass  # мұнда жаз',
    '2_medium': '# Бірінші және соңғы цифрлары бірдей сандарды тап\nfor x in X:\n    pass  # мұнда жаз',
    '2_hard':   '# Нөлге дейінгі элементтерді шығар\nfor x in A:\n    pass  # мұнда жаз',
  };
  return templates[`${lessonId}_${difficulty}`] ||
    `# ${lessonId}-сабақ, ${difficulty} деңгей\n# Кодыңды осында жаз\n`;
}