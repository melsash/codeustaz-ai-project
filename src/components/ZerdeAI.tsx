import React, { useState, useEffect } from 'react';
import { X, Brain, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE = 'http://localhost:8000';

interface ZerdeAIProps {
  feedbackType: 'correct' | 'partial' | 'wrong';
  onClose: () => void;
  // ML қосымша деректер
  code?: string;
  lessonId?: number;
  difficulty?: string;
  studentId?: string;
  attempt?: number;
}

interface MLFeedback {
  error_type: string;
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
  const [shownHints, setShownHints] = useState<number>(0);
  const [expanded, setExpanded] = useState(true);

  // Қате болса ML-ден талдау алу
  useEffect(() => {
    if (feedbackType === 'wrong' && code.trim().length > 5) {
      fetchMLAnalysis();
    }
  }, [feedbackType, code]);

  const fetchMLAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/classify/error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId, code, lessonId,
          difficulty, attempt
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMlFeedback(data);
        setShownHints(1); // Бірінші кеңесті бірден көрсет
      }
    } catch {
      // Backend жоқ болса — статикалық feedback-ті пайдалан
    } finally {
      setIsLoading(false);
    }
  };

  // Статикалық feedback (ML жоқ болса немесе дұрыс жауап)
  const staticFeedback = {
    correct: {
      icon: '🎉',
      color: 'emerald',
      title: 'Керемет!',
      general: 'Тапсырманы толық дұрыс орындадың.',
      issue: 'Қате табылған жоқ.',
      direction: 'Келесі қиындық деңгейіне өтуге дайынсың ба?',
      encouragement: 'Осы қарқыннан тайма!'
    },
    partial: {
      icon: '💛',
      color: 'amber',
      title: 'Жақсы бастама!',
      general: 'Логиканы дұрыс ойладың.',
      issue: 'Циклдің шарты дұрыс па? Соңғы индексті тексер.',
      direction: 'Егер массив бос болса, не болады деп ойлайсың?',
      encouragement: 'Кішкене ғана қалды, сенің қолыңнан келеді!'
    },
    wrong: {
      icon: '🤔',
      color: 'rose',
      title: 'Талпынысың жақсы!',
      general: 'Нәтиже әлі шықпады.',
      issue: 'Айнымалылардың бастапқы мәндері дұрыс берілмеген сияқты.',
      direction: 'Есептің шартын қайта оқып, әр қадамды қағазға жазып көр.',
      encouragement: 'Қателіктер — үйренудің ең жақсы жолы!'
    }
  }[feedbackType];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200',
    amber:   'bg-amber-50 border-amber-200',
    rose:    'bg-rose-50 border-rose-200',
  };
  const headerColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    rose:    'bg-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="w-80 shrink-0"
    >
      <div className={`rounded-2xl border-2 overflow-hidden shadow-lg ${colorMap[staticFeedback.color]}`}>
        {/* Header */}
        <div className={`${headerColorMap[staticFeedback.color]} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-white" />
            <span className="font-bold text-white font-['Space_Grotesk']">ZerdeAI</span>
            <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full">AI MENTOR</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(!expanded)} className="text-white/80 hover:text-white p-1">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">

                {/* Жалпы баға */}
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <span>●</span> ЖАЛПЫ БАҒА
                  </div>
                  <p className="text-gray-800 font-semibold text-sm">
                    {staticFeedback.icon} {staticFeedback.general}
                  </p>
                </div>

                {/* ML Қате талдауы (тек қате болғанда) */}
                {feedbackType === 'wrong' && (
                  <div className="bg-white/70 rounded-xl p-3 border border-gray-200">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Brain className="w-3 h-3 text-[#1A56DB]" />
                      DL ТАЛДАУЫ
                    </div>

                    {isLoading ? (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Loader className="w-4 h-4 animate-spin" />
                        Нейрондық желі талдауда...
                      </div>
                    ) : mlFeedback ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1A56DB] bg-blue-50 px-2 py-0.5 rounded-full">
                            {mlFeedback.error_label_kk}
                          </span>
                          <span className="text-xs text-gray-400">
                            {(mlFeedback.confidence * 100).toFixed(0)}% сенімділік
                          </span>
                        </div>

                        {/* 3 деңгейлі кеңестер */}
                        <div className="space-y-2 mt-2">
                          {shownHints >= 1 && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-gray-700 bg-blue-50 rounded-lg p-2 border border-blue-100">
                              {mlFeedback.hint_1}
                            </motion.div>
                          )}
                          {shownHints >= 2 && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-gray-700 bg-amber-50 rounded-lg p-2 border border-amber-100">
                              {mlFeedback.hint_2}
                            </motion.div>
                          )}
                          {shownHints >= 3 && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-gray-700 bg-rose-50 rounded-lg p-2 border border-rose-100">
                              {mlFeedback.hint_3}
                            </motion.div>
                          )}
                        </div>

                        {shownHints < 3 && (
                          <button
                            onClick={() => setShownHints(h => Math.min(h + 1, 3))}
                            className="w-full mt-2 py-1.5 bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                          >
                            {shownHints === 1 ? '2-кеңес алу 📝' : '3-кеңес алу 🎯'}
                          </button>
                        )}
                      </div>
                    ) : (
                      // ML жоқ болса статикалық
                      <p className="text-sm text-gray-600">{staticFeedback.issue}</p>
                    )}
                  </div>
                )}

                {/* Бағыт (ML жоқ болса немесе дұрыс/орташа) */}
                {feedbackType !== 'wrong' && (
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">💡 БАҒЫТ</div>
                    <p className="text-sm text-gray-700">"{staticFeedback.direction}"</p>
                  </div>
                )}

                {/* Марапаттау */}
                <div className="pt-1 border-t border-gray-200/60">
                  <p className="text-sm font-bold text-center text-gray-700">
                    ⭐ {staticFeedback.encouragement}
                  </p>
                </div>

                {/* Жабу батырмасы */}
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Түсіндім, тапсырмаға өтемін ➜
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}