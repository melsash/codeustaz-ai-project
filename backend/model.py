import torch
import torch.nn as nn
import re


class ErrorClassifierMLP(nn.Module):
    """
    MLP модель — оқушының кодындағы қате түрін анықтайды.

    Кіріс: 12 белгі (code features)
    Шығыс: 5 қате түрі
      0 - index_error      (индекс қатесі)
      1 - loop_logic       (цикл логикасы)
      2 - wrong_condition  (шарт қатесі)
      3 - edge_case        (шеткі жағдай)
      4 - syntax_error     (синтаксис қатесі)
    """
    def __init__(self, input_size=12, hidden_sizes=[64, 128, 64], output_size=5, dropout=0.3):
        super(ErrorClassifierMLP, self).__init__()
        layers = []
        prev_size = input_size
        for hs in hidden_sizes:
            layers += [nn.Linear(prev_size, hs), nn.BatchNorm1d(hs), nn.ReLU(), nn.Dropout(dropout)]
            prev_size = hs
        layers.append(nn.Linear(prev_size, output_size))
        self.network = nn.Sequential(*layers)
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
                nn.init.zeros_(m.bias)

    def forward(self, x):
        return self.network(x)


class CodeFeatureExtractor:
    """Python кодынан 12 белгі шығарады."""
    @staticmethod
    def extract(code: str, lesson_id: int = 1, difficulty: str = "easy", attempt: int = 1) -> list:
        cl = code.lower()
        has_loop      = 1.0 if any(k in cl for k in ['for ', 'while ']) else 0.0
        has_index     = 1.0 if ('[' in code and ']' in code) else 0.0
        has_condition = 1.0 if any(k in cl for k in ['if ', 'elif ', 'else:']) else 0.0
        has_range     = 1.0 if 'range(' in cl else 0.0
        code_length   = min(len(code) / 500.0, 1.0)
        ob = code.count('(') + code.count('[')
        cb = code.count(')') + code.count(']')
        bracket_ok    = 1.0 if ob == cb else 0.0
        lesson_norm   = (lesson_id - 1) / 8.0
        diff_val      = {"easy": 0.0, "medium": 0.5, "hard": 1.0}.get(difficulty, 0.0)
        attempt_norm  = min((attempt - 1) / 5.0, 1.0)
        has_return    = 1.0 if 'return ' in cl else 0.0
        has_append    = 1.0 if any(k in cl for k in ['append(', 'insert(']) else 0.0
        var_count     = min(len(set(re.findall(r'\b([a-zA-Z_]\w*)\s*=', code))) / 10.0, 1.0)
        return [has_loop, has_index, has_condition, has_range,
                code_length, bracket_ok, lesson_norm, diff_val,
                attempt_norm, has_return, has_append, var_count]


ERROR_LABELS    = {0: "index_error", 1: "loop_logic", 2: "wrong_condition", 3: "edge_case", 4: "syntax_error"}
ERROR_LABELS_KK = {0: "Индекс қатесі", 1: "Цикл логикасы", 2: "Шарт қатесі", 3: "Шеткі жағдай", 4: "Синтаксис қатесі"}

HINTS_KK = {
    "index_error": [
        "💡 Бағыт: Массив индексі 0-ден басталады. Соңғы элементтің индексі len(A)-1.",
        "📝 Псевдокод: for i in range(len(A)) — бұл дұрыс жол. range(len(A)+1) қате!",
        "🎯 Нақты жол: i < len(A) шартын тексер: егер i тең немесе үлкен болса — қате."
    ],
    "loop_logic": [
        "💡 Бағыт: Циклдің шарты дұрыс па? Барлық элементтерді қамтып тұр ма?",
        "📝 Псевдокод: for i in range(0, len(A)) — бастапқы және соңғы мәндерді тексер.",
        "🎯 Нақты жол: Соңғы элементті өткізіп жіберіп жатырсың ба? range(len(A)-1) → range(len(A))"
    ],
    "wrong_condition": [
        "💡 Бағыт: Салыстыру операторын тексер: > және >= айырмашылығы бар.",
        "📝 Псевдокод: if A[i] > 0 (оң) немесе if A[i] >= 0 (нөл қосылады)?",
        "🎯 Нақты жол: Шартыңды қағазға жаз, сосын кодпен салыстыр."
    ],
    "edge_case": [
        "💡 Бағыт: Массив бос болса не болады? Бір ғана элемент болса ше?",
        "📝 Псевдокод: if len(A) == 0: return [] — бос массив жағдайын өңде.",
        "🎯 Нақты жол: Кодыңды A=[] және A=[5] мысалдарымен қолмен тексер."
    ],
    "syntax_error": [
        "💡 Бағыт: Қос нүкте ':' қойылды ма? Шегіністер (indent) дұрыс па?",
        "📝 Псевдокод: for i in range(n):  ← қос нүкте міндетті!",
        "🎯 Нақты жол: Әр for/if/while жолының соңында ':' бар-жоғын тексер."
    ]
}

ERROR_DISPLAY = {
    "index_error": "Index out of range",
    "loop_logic": "Loop logic",
    "wrong_condition": "Wrong condition",
    "edge_case": "Missing edge case",
    "syntax_error": "Syntax error"
}


# ── Backward compat ───────────────────────────────────────────────
class StudentMLP(nn.Module):
    def __init__(self, input_size=12, hidden_sizes=[64,128,64], output_size=3, dropout=0.3):
        super().__init__()
        layers, prev = [], input_size
        for hs in hidden_sizes:
            layers += [nn.Linear(prev, hs), nn.BatchNorm1d(hs), nn.ReLU(), nn.Dropout(dropout)]
            prev = hs
        layers.append(nn.Linear(prev, output_size))
        self.network = nn.Sequential(*layers)
    def forward(self, x): return self.network(x)

class FeatureExtractor:
    TOTAL_LESSONS = 9; TOTAL_TASKS = 27
    @staticmethod
    def extract(d):
        p = d.get("progress", {})
        lc=tc=ed=md=hd=vw=sl=0
        for _, ld in p.items():
            t = ld.get("tasks", {})
            if ld.get("visualizationWatched"): vw+=1
            eo=t.get("easy",{}).get("status")=="completed"
            mo=t.get("medium",{}).get("status")=="completed"
            ho=t.get("hard",{}).get("status")=="completed"
            if eo: ed+=1
            if mo: md+=1
            if ho: hd+=1
            done=sum([eo,mo,ho]); tc+=done
            if done==3: lc+=1
            elif done>0 or ld.get("visualizationWatched"): sl+=1
        s=d.get("streak",0); h=d.get("hintsUsed",0)
        return [lc/9,tc/27,ed/9,md/9,hd/9,min(s/30,1),vw/9,lc/9,hd/max(lc,1),sl/9,tc/27,min(h/10,1)]

RISK_LABELS={0:"at_risk",1:"average",2:"excellent"}
RISK_LABELS_KK={0:"Қауіпті аймақ",1:"Орташа деңгей",2:"Үздік деңгей"}
RISK_DESCRIPTIONS_KK={0:"Қосымша көмек қажет.",1:"Қалыпты қарқын.",2:"Үздік нәтиже."}