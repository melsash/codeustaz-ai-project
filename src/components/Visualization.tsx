import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, SkipForward, RotateCcw, ArrowUp, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- ТИПТЕР ---
type Step = {
  type: 'start' | 'check' | 'found' | 'not_found' | 'modify' | 'row_result' | 'done';
  indices: number[]; 
  array?: any[]; 
  matrix?: any[][]; 
  message: string;
  resultValue: string | number;
  resultLabel: string;
};

// ==========================================
// 1. 1D МАССИВТЕР (1,2,3,6,7)
// ==========================================
function generate1DSteps(initialArray: number[], lessonId: number, difficulty: string): Step[] {
  const steps: Step[] = [];
  const arr = initialArray.map((val, i) => ({ id: `id-init-${i}`, value: val }));
  
  let resultType = 'count';
  if (lessonId === 1) resultType = 'count';
  if (lessonId === 2) resultType = 'collect';
  if (lessonId === 3) resultType = difficulty === 'hard' ? 'sum' : 'modify';
  if (lessonId === 6) resultType = difficulty === 'hard' ? 'sum' : 'collect';
  if (lessonId === 7) resultType = difficulty === 'medium' ? 'sum' : 'collect';

  let resultLabel = resultType === 'count' ? 'Санағыш:' : resultType === 'sum' ? 'Қосынды:' : resultType === 'collect' ? 'Табылғандар:' : 'Өзгертілді:';
  let currentResult: string | number = resultType === 'collect' ? '[ ]' : 0;
  let collected: number[] = [];
  let sum = 0, count = 0;

  steps.push({ type: 'start', indices: [], array: [...arr], message: 'Бастапқы 1D массив', resultValue: currentResult, resultLabel });

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i].value;
    steps.push({ type: 'check', indices: [i], array: [...arr.map(a => ({...a}))], message: `i=${i}. Тексереміз: A[${i}] = ${val}`, resultValue: currentResult, resultLabel });

    let isMatch = false, doBreak = false, newValue = val;
    let matchMsg = '✅ Шарт орындалды!', failMsg = '❌ Шарт орындалмады.';

    if (lessonId === 1) {
      if (difficulty === 'easy') { isMatch = val > 0; matchMsg = `✅ ${val} — оң сан.`; failMsg = `❌ ${val} — оң емес.`; }
      if (difficulty === 'medium') { isMatch = Math.abs(val) >= 10 && Math.abs(val) <= 99; matchMsg = `✅ ${val} — екі таңбалы.`; }
      if (difficulty === 'hard') { isMatch = val % 3 === 0; matchMsg = `✅ ${val} саны 3-ке бөлінеді!`; failMsg = `❌ 3-ке бөлінбейді.`; }
    } else if (lessonId === 2) {
      if (difficulty === 'easy') { isMatch = val >= 5 && val <= 10; matchMsg = `✅ ${val} [5; 10] аралығында!`; }
      if (difficulty === 'medium') { const s = String(Math.abs(val)); isMatch = s.length === 3 && s[0] === s[2]; matchMsg = `✅ 1-ші мен соңғы цифры бірдей!`; }
      if (difficulty === 'hard') { if (val === 0) { failMsg = '🛑 Нөл кездесті! Тоқтаймыз.'; doBreak = true; } else { isMatch = true; matchMsg = `✅ Қосылды.`; } }
    } else if (lessonId === 3) {
      if (difficulty === 'easy') { if (val > 8) { isMatch = true; newValue = 0; matchMsg = `🔄 ${val} > 8. 0-ге ауыстырамыз.`; } else failMsg = `❌ ${val} <= 8.`; }
      if (difficulty === 'medium') { if (val < 5) { isMatch = true; newValue = val * 2; matchMsg = `🔄 ${val} < 5. Екі еселенді.`; } else failMsg = `❌ ${val} >= 5.`; }
      if (difficulty === 'hard') { if (i === 1 || i === 3) { isMatch = true; matchMsg = `✅ Көрші элемент!`; } else failMsg = `❌ Көрші емес.`; }
    } else if (lessonId === 6) {
      if (difficulty === 'easy') { isMatch = val % 8 === 0; matchMsg = `✅ 8-ге бөлінеді.`; }
      if (difficulty === 'medium') { isMatch = i % 2 !== 0 && val % 2 === 0; matchMsg = `✅ Тақ орындағы жұп сан!`; }
      if (difficulty === 'hard') { isMatch = i % 2 === 0 && val % 2 !== 0; matchMsg = `✅ Жұп орындағы тақ сан!`; }
    } else if (lessonId === 7) {
      if (difficulty === 'easy') { isMatch = Math.abs(val) % 10 === 5; matchMsg = `✅ 5-пен аяқталады!`; }
      if (difficulty === 'medium') { isMatch = true; matchMsg = `✅ Жалпы қосындыға.`; }
      if (difficulty === 'hard') { isMatch = val >= 47 && val <= 92; matchMsg = `✅ Қабылданады!`; failMsg = `❌ Салмақ сай емес.`; }
    }

    if (doBreak) { steps.push({ type: 'not_found', indices: [i], array: [...arr.map(a => ({...a}))], message: failMsg, resultValue: currentResult, resultLabel }); break; }

    if (isMatch) {
      if (resultType === 'count' || resultType === 'modify') { count++; currentResult = count; }
      else if (resultType === 'sum') { sum += val; currentResult = sum; }
      else if (resultType === 'collect') { collected.push(val); currentResult = `[ ${collected.join(', ')} ]`; }

      arr[i].value = newValue;
      steps.push({ type: newValue !== val ? 'modify' : 'found', indices: [i], array: [...arr.map(a => ({...a}))], message: matchMsg, resultValue: currentResult, resultLabel });
    } else {
      steps.push({ type: 'not_found', indices: [i], array: [...arr.map(a => ({...a}))], message: failMsg, resultValue: currentResult, resultLabel });
    }
  }

  steps.push({ type: 'done', indices: [], array: [...arr.map(a => ({...a}))], message: `Аяқталды!`, resultValue: currentResult, resultLabel });
  return steps;
}

// ==========================================
// 2. 2D МАССИВТЕР (4, 5 және 9-Орташа)
// ==========================================
function generate2DSteps(initialMatrix: number[][], lessonId: number, difficulty: string): Step[] {
  const steps: Step[] = [];
  const mat = initialMatrix.map((row, i) => row.map((val, j) => ({ id: `r${i}c${j}`, value: val })));
  
  let resultLabel = 'Санағыш:';
  let currentResult: number | string = 0;
  
  if (lessonId === 4 && difficulty === 'easy') { resultLabel = 'Max:'; currentResult = -Infinity; }
  else if (lessonId === 4 && difficulty === 'hard') { resultLabel = 'Қосынды:'; }
  else if (lessonId === 9 && difficulty === 'medium') { resultLabel = 'Тақ сандар:'; currentResult = '[ ]'; }

  const cloneMat = () => mat.map(row => row.map(cell => ({...cell})));
  let collected: number[] = [];

  steps.push({ type: 'start', indices: [], matrix: cloneMat(), message: 'Бастапқы матрица', resultValue: currentResult === -Infinity ? '?' : currentResult, resultLabel });

  for (let i = 0; i < mat.length; i++) {
    let rowValid = true; 
    for (let j = 0; j < mat[i].length; j++) {
      const val = mat[i][j].value;
      const displayRes = currentResult === -Infinity ? '?' : currentResult;
      
      steps.push({ type: 'check', indices: [i, j], matrix: cloneMat(), message: `i=${i}, j=${j}. Тексереміз: C[${i}][${j}] = ${val}`, resultValue: displayRes, resultLabel });

      let isMatch = false;
      let matchMsg = '', failMsg = '';

      if (lessonId === 4) {
        if (difficulty === 'easy') { if (val > (currentResult as number)) { isMatch = true; currentResult = val; matchMsg = `✅ ${val} — жаңа максимум!`; } else failMsg = `❌ ${val} үлкен емес.`; } 
        else if (difficulty === 'medium') { if (val === 0) { isMatch = true; matchMsg = `✅ Нөл табылды!`; } else failMsg = `❌ Нөл емес.`; } 
        else if (difficulty === 'hard') { if (Math.abs(val) % 10 === 7) { isMatch = true; matchMsg = `✅ 7-мен аяқталады!`; } else failMsg = `❌ 7-мен аяқталмайды.`; }
      } else if (lessonId === 5) {
        if (difficulty === 'easy') { if (i === j) { if (val % 2 !== 0) { isMatch = true; matchMsg = `✅ Диагональ, тақ сан!`; } else failMsg = `❌ Жұп сан.`; } else failMsg = `❌ Диагональ емес.`; } 
        else if (difficulty === 'medium') { if (val !== 5) { rowValid = false; failMsg = `❌ ${val} бағасы бар.`; } else { isMatch = true; matchMsg = `⏳ Бестік!`; } } 
        else if (difficulty === 'hard') { if (val !== 4 && val !== 5) { rowValid = false; failMsg = `❌ ${val} бағасы бар.`; } else { isMatch = true; matchMsg = `⏳ Жақсы баға.`; } }
      } else if (lessonId === 9 && difficulty === 'medium') {
        if (val % 2 !== 0) { isMatch = true; matchMsg = `✅ Тақ сан! Жинап аламыз.`; } else failMsg = `❌ Жұп сан. Керек емес.`;
      }

      if (isMatch && lessonId === 4) {
        if (difficulty === 'medium') currentResult = (currentResult as number) + 1;
        if (difficulty === 'hard') currentResult = (currentResult as number) + val;
      } else if (isMatch && lessonId === 9) {
        collected.push(val);
        currentResult = `[ ${collected.join(', ')} ]`;
      }

      steps.push({ type: isMatch ? 'found' : 'not_found', indices: [i, j], matrix: cloneMat(), message: isMatch ? matchMsg : failMsg, resultValue: currentResult === -Infinity ? '?' : currentResult, resultLabel });
    }

    if (lessonId === 5 && (difficulty === 'medium' || difficulty === 'hard')) {
      if (rowValid) { currentResult = (currentResult as number) + 1; steps.push({ type: 'row_result', indices: [i, -1], matrix: cloneMat(), message: `🎉 ${i}-ші қатар шарттан өтті! Санағыш +1.`, resultValue: currentResult, resultLabel }); } 
      else { steps.push({ type: 'row_result', indices: [i, -1], matrix: cloneMat(), message: `⚠️ ${i}-ші қатар шарттан өтпеді.`, resultValue: currentResult, resultLabel }); }
    }
  }
  steps.push({ type: 'done', indices: [], matrix: cloneMat(), message: `Аяқталды!`, resultValue: currentResult, resultLabel });
  return steps;
}

// ==========================================

// ==========================================
function generateMutationSteps(initialArray: number[], lessonId: number, difficulty: string): Step[] {
  const steps: Step[] = [];
  
  // Қауіпсіздік тексеруі: егер массив бос немесе қате болса, тоқтату
  if (!initialArray || !Array.isArray(initialArray)) return steps;

  let currentArr = initialArray.map((val, i) => ({ id: `init-${Date.now()}-${i}`, value: val }));
  
  let resultLabel = 'Ұзындығы:';
  let currentResult = currentArr.length;

  steps.push({ type: 'start', indices: [], array: [...currentArr], message: 'Бастапқы массив', resultValue: currentResult, resultLabel });

  if (lessonId === 8) {
    if (difficulty === 'easy') {
      let i = 0;
      while (i < currentArr.length) {
        // ТҮЗЕТІЛДІ: Элементтің бар екеніне көз жеткізу
        const item = currentArr[i];
        if (!item) {
          i++;
          continue;
        }

        steps.push({ type: 'check', indices: [i], array: [...currentArr], message: `i=${i}. A[${i}] = ${item.value} > 10?`, resultValue: currentResult, resultLabel });
        if (item.value > 10) {
          steps.push({ type: 'not_found', indices: [i], array: [...currentArr], message: `❌ ${item.value} > 10. Бұл элементті ӨШІРЕМІЗ!`, resultValue: currentResult, resultLabel });
          currentArr.splice(i, 1); // Массивтен қиып алып тастаймыз
          currentResult = currentArr.length;
          
          const nextIndex = i < currentArr.length ? i : currentArr.length - 1;
          steps.push({ type: 'found', indices: [nextIndex >= 0 ? nextIndex : 0], array: [...currentArr], message: `Массив қысқарды! Келесі элементке өтеміз.`, resultValue: currentResult, resultLabel });
        } else {
          steps.push({ type: 'found', indices: [i], array: [...currentArr], message: `✅ Шартқа сай емес, қалдырамыз.`, resultValue: currentResult, resultLabel });
          i++;
        }
      }
    } else if (difficulty === 'medium') {
      if (currentArr.length === 0) return steps;
      
      const avg = Math.round(currentArr.reduce((s, el) => s + (el?.value || 0), 0) / currentArr.length);
      steps.push({ type: 'check', indices: [], array: [...currentArr], message: `Алдымен орташа мәнді табамыз: Орташа = ${avg}`, resultValue: avg, resultLabel: 'Орташа мән:' });
      
      let i = 0;
      while (i < currentArr.length) {
        // ТҮЗЕТІЛДІ: Элементтің бар екеніне көз жеткізу
        const item = currentArr[i];
        if (!item) {
          i++;
          continue;
        }

        steps.push({ type: 'check', indices: [i], array: [...currentArr], message: `i=${i}. A[${i}] = ${item.value} > ${avg} (Орташа)?`, resultValue: currentResult, resultLabel });
        if (item.value > avg) {
           steps.push({ type: 'not_found', indices: [i], array: [...currentArr], message: `❌ Орташадан үлкен. Өшіреміз!`, resultValue: currentResult, resultLabel });
           currentArr.splice(i, 1);
           currentResult = currentArr.length;
        } else {
           steps.push({ type: 'found', indices: [i], array: [...currentArr], message: `✅ Орташадан кіші не тең. Қалдырамыз.`, resultValue: currentResult, resultLabel });
           i++;
        }
      }
    } else if (difficulty === 'hard') {
       steps.push({ type: 'check', indices: [0], array: [...currentArr], message: `Массивтің БАСЫНА T=10 санын қосамыз (insert)`, resultValue: currentResult, resultLabel });
       currentArr.unshift({ id: `new-10-${Date.now()}`, value: 10 });
       currentResult = currentArr.length;
       steps.push({ type: 'found', indices: [0], array: [...currentArr], message: `✅ 10 саны басына қосылды!`, resultValue: currentResult, resultLabel });

       steps.push({ type: 'check', indices: [currentArr.length-1], array: [...currentArr], message: `Массивтің СОҢЫНА K=43 санын қосамыз (append)`, resultValue: currentResult, resultLabel });
       currentArr.push({ id: `new-43-${Date.now()}`, value: 43 });
       currentResult = currentArr.length;
       steps.push({ type: 'found', indices: [currentArr.length-1], array: [...currentArr], message: `✅ 43 саны соңына қосылды!`, resultValue: currentResult, resultLabel });
    }
  } else if (lessonId === 9) {
     if (difficulty === 'easy') {
        steps.push({ type: 'check', indices: [3,4,5,6], array: [...currentArr], message: `3-тен 6-ға дейінгі индекстерді бірден өшіреміз (slice/splice)`, resultValue: currentResult, resultLabel });
        
        // ТҮЗЕТІЛДІ: Элементтер саны жететінін тексеру
        if (currentArr.length > 3) {
          currentArr.splice(3, 4); 
        }
        currentResult = currentArr.length;
        steps.push({ type: 'found', indices: [], array: [...currentArr], message: `✅ Элементтер массивтен кесіп алынды!`, resultValue: currentResult, resultLabel });
     } else if (difficulty === 'hard') {
        resultLabel = 'Команда:';
        let selected = [];
        for (let i = 0; i < currentArr.length; i++) {
            // ТҮЗЕТІЛДІ: Элементтің бар екеніне көз жеткізу
            const item = currentArr[i];
            if (!item) continue;

            steps.push({ type: 'check', indices: [i], array: [...currentArr], message: `i=${i}, Бойы = ${item.value} > 175?`, resultValue: selected.length, resultLabel });
            if (item.value > 175) {
                selected.push(item);
                steps.push({ type: 'found', indices: [i], array: [...currentArr], message: `✅ Командаға алынды!`, resultValue: selected.length, resultLabel });
            } else {
                steps.push({ type: 'not_found', indices: [i], array: [...currentArr], message: `❌ Бойы жетпейді.`, resultValue: selected.length, resultLabel });
            }
        }
        currentArr = selected;
        currentResult = currentArr.length;
        steps.push({ type: 'done', indices: [], array: [...currentArr], message: currentResult >= 12 ? `🎉 Команда құрылды! (${currentResult} оқушы)` : `⚠️ Команда құру мүмкін емес (12 оқушы керек, бізде ${currentResult})`, resultValue: currentResult, resultLabel });
     }
  }

  steps.push({ type: 'done', indices: [], array: [...currentArr], message: 'Аяқталды!', resultValue: currentResult, resultLabel });
  return steps;
}

export default function Visualization({ 
  lessonId = 1,
  data = [], 
  difficulty = 'easy',
  onComplete 
}: { 
  lessonId?: number,
  data?: any[],
  difficulty?: string,
  onComplete?: () => void 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState(1);

  const is2D = data.length > 0 && Array.isArray(data[0]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [data, difficulty, lessonId]);

  const steps = useMemo(() => {
    if (is2D) return generate2DSteps(data as number[][], lessonId, difficulty);
    if (lessonId === 8 || (lessonId === 9 && !is2D)) return generateMutationSteps(data as number[], lessonId, difficulty);
    return generate1DSteps(data as number[], lessonId, difficulty);
  }, [data, lessonId, difficulty, is2D]);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      const isRowResult = currentStep?.type === 'row_result';
      timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, (isRowResult ? 2500 : 1500) / speed);
    } else if (currentStepIndex === steps.length - 1) {
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, speed, onComplete, currentStep?.type]);

  if (!currentStep) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl font-medium text-sm font-mono border border-blue-100 max-w-[65%] leading-relaxed shadow-sm">
          {currentStep.message}
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold border border-emerald-100 flex items-center gap-3 shadow-sm min-w-37.5">
          <span className="text-sm whitespace-nowrap">{currentStep.resultLabel}</span>
          <motion.span 
            key={String(currentStep.resultValue)}
            initial={{ scale: 1.2, color: '#10B981' }}
            animate={{ scale: 1, color: '#047857' }}
            className="text-xl tracking-tight"
          >
            {currentStep.resultValue}
          </motion.span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center min-h-50 overflow-x-auto overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {is2D && currentStep.matrix ? (
            <div className="flex flex-col gap-2 relative bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex gap-2 ml-10 mb-2">
                {currentStep.matrix[0].map((_, j) => (
                  <div key={`col-${j}`} className="w-12 text-center text-xs font-mono text-gray-400 font-bold">j={j}</div>
                ))}
              </div>
              {currentStep.matrix.map((row, i) => {
                const isRowActive = currentStep.indices[0] === i;
                const isRowResult = currentStep.type === 'row_result' && isRowActive;

                return (
                  <div key={`row-${i}`} className="flex gap-2 items-center relative">
                    <div className={`w-8 text-right pr-2 text-xs font-mono font-bold transition-colors ${isRowActive ? 'text-[#1A56DB]' : 'text-gray-400'}`}>i={i}</div>
                    <div className={`flex gap-2 p-1 rounded-xl transition-all duration-500 ${isRowResult ? (currentStep.message.includes('🎉') ? 'bg-emerald-100 ring-4 ring-emerald-300' : 'bg-rose-100 ring-4 ring-rose-300 opacity-60') : 'bg-transparent'}`}>
                      {row.map((cell: any, j: number) => {
                        const isTarget = currentStep.indices[0] === i && currentStep.indices[1] === j;
                        let bgColor = "bg-white text-gray-800 border-gray-200";
                        if (isTarget) {
                          if (currentStep.type === 'check') bgColor = "bg-amber-100 border-amber-400 border-2 text-amber-900 shadow-lg scale-110 z-10";
                          if (currentStep.type === 'found') bgColor = "bg-emerald-500 border-emerald-600 text-white shadow-lg scale-110 z-10";
                          if (currentStep.type === 'not_found') bgColor = "bg-rose-50 border-rose-200 text-rose-500 opacity-50 scale-95"; 
                        } else if (currentStep.type === 'done') bgColor = "bg-gray-100 text-gray-500 border-gray-200";

                        return (
                          <motion.div key={cell.id} layout className={`w-12 h-12 flex items-center justify-center rounded-lg font-bold text-sm border transition-all duration-300 ${bgColor}`}>{cell.value}</motion.div>
                        );
                      })}
                    </div>
                    {isRowActive && !isRowResult && currentStep.type !== 'done' && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="absolute -left-6 text-[#1A56DB]"><ArrowRight className="w-5 h-5" /></motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-4 items-end flex-wrap justify-center">
              {currentStep.array?.map((item: any, index: number) => {
                const isTarget = currentStep.indices.includes(index);
                let bgColor = "bg-blue-100 text-blue-900 border-blue-200";
                if (isTarget) {
                  if (currentStep.type === 'check') bgColor = "bg-amber-100 border-amber-400 border-2 text-amber-900 shadow-lg scale-110";
                  if (currentStep.type === 'found') bgColor = "bg-emerald-500 border-emerald-600 text-white shadow-lg scale-110";
                  if (currentStep.type === 'not_found') bgColor = "bg-rose-500 border-rose-600 text-white shadow-xl scale-90 rotate-6"; // ӨШІРУ АНИМАЦИЯСЫ
                  if (currentStep.type === 'modify') bgColor = "bg-purple-500 border-purple-600 text-white shadow-lg scale-125 rotate-3"; 
                } else if (currentStep.type === 'done') bgColor = "bg-gray-100 text-gray-600 border-gray-200"; 

                return (
                  <motion.div 
                    key={item.id} 
                    layout 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, y: -50 }} // ЖОҒАЛУ АНИМАЦИЯСЫ
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className={`min-w-16 h-16 px-2 flex items-center justify-center rounded-xl font-bold text-xl border transition-all duration-300 ${bgColor}`}>
                      {item.value}
                    </div>
                    <div className="h-8 flex flex-col items-center justify-center">
                      {isTarget && currentStep.type !== 'done' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[#1A56DB] flex flex-col items-center">
                          <ArrowUp className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold font-mono">i={index}</span>
                        </motion.div>
                      )}
                      {!isTarget && <span className="text-xs text-gray-400 font-mono">i={index}</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsPlaying(!isPlaying)} disabled={currentStepIndex === steps?.length - 1} className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#1A56DB] text-white hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          <button onClick={() => setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1))} disabled={isPlaying || currentStepIndex === steps?.length - 1} className="px-4 py-3 rounded-xl bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors">
            Келесі қадам <SkipForward className="w-4 h-4" />
          </button>
          <button onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }} className="w-12 h-12 flex items-center justify-center rounded-xl bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 px-4">
          <span className="text-sm font-medium text-gray-500 hidden sm:inline">Жылдамдық</span>
          <div className="flex bg-gray-200/50 rounded-lg p-1">
            {[0.5, 1, 2].map(s => (
              <button key={s} onClick={() => setSpeed(s)} className={`px-3 py-1.5 text-sm rounded-md transition-all ${speed === s ? 'bg-white shadow-sm font-bold text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>{s}x</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}