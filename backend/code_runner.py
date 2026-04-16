"""
code_runner.py — оқушының Python кодын нақты орындайды және тексереді.
Runs student Python code in a sandbox and checks against expected output.
"""
import subprocess
import sys
import tempfile
import os
import textwrap
from typing import Any

# ── Күтілетін нәтижелер (expected outputs) ───────────────────────
# Кілт: (lesson_id, difficulty)
# Мән: { "expected": ..., "check": callable }

TASK_SPECS: dict[tuple, dict] = {
    # Сабақ 1 — Бір өлшемді массив
    (1, "easy"):   {"expected": "3",           "desc": "A=[4,-2,8,-5,10] оң элементтер саны"},
    (1, "medium"): {"expected": "3",           "desc": "A=[5,48,125,14,8,96] екі таңбалы сандар"},
    (1, "hard"):   {"expected": "12\n96\n15",  "desc": "B=[10,12,96,32,69,15,207] P=3 еселіктер"},

    # Сабақ 2 — Іздеу
    (2, "easy"):   {"expected": "5\n8\n7",     "desc": "A=[12,5,8,19,2,7] [5,10] аралығы"},
    (2, "medium"): {"expected": "141\n545",    "desc": "X=[141,605,786,989,545,100] бірінші=соңғы"},
    (2, "hard"):   {"expected": "15\n-6\n3",   "desc": "A=[15,-6,3,0,17,6] нөлге дейін"},

    # Сабақ 3 — Ауыстыру
    (3, "easy"):   {"expected": "[4, 0, 5, 0, 3]",   "desc": "X=8-ден үлкендерді 0-мен ауыстыр"},
    (3, "medium"): {"expected": "2\n4",               "desc": "K=5-тен кіші элементтерді екі еселе"},
    (3, "hard"):   {"expected": "14",                 "desc": "3-ші элементтің (11) көршілер қосындысы"},

    # Сабақ 4 — 2D массив
    (4, "easy"):   {"expected": "90",   "desc": "C матрицасынан ең үлкен элемент"},
    (4, "medium"): {"expected": "6",    "desc": "A матрицасындағы нөлдер саны"},
    (4, "hard"):   {"expected": "141",  "desc": "B матрицасы K=7-мен аяқталатын сандар қосындысы"},

    # Сабақ 5 — 2D аралау
    (5, "easy"):   {"expected": "1\n3", "desc": "Бас диагональдағы тақ сандар"},
    (5, "medium"): {"expected": "1",    "desc": "Барлығы 5 алған оқушылар саны"},
    (5, "hard"):   {"expected": "3",    "desc": "Тек 4 және 5 алған үздік оқушылар"},

    # Сабақ 6 — Сұрыптау (іздеу)
    (6, "easy"):   {"expected": "24\n8\n40", "desc": "A=[15,24,8,33,40,7] P=8-ге бөлінетіндер"},
    (6, "medium"): {"expected": "",          "desc": "Тақ орындағы жұп элементтер (random)"},
    (6, "hard"):   {"expected": "99",        "desc": "A=[21..70] жұп орындағы тақ сандар қосындысы"},

    # Сабақ 7 — Массив сұрыптау
    (7, "easy"):   {"expected": "87015\n87075\n87065", "desc": "5-пен аяқталатын нөмірлер"},
    (7, "medium"): {"expected": "28",                  "desc": "A=[15,-6,3,9,17,6,25,-42,0,1] қосынды"},
    (7, "hard"):   {"expected": "6\n47 80 78 85 65",   "desc": "W=[80..119] 47≤m≤92 оқушылар"},

    # Сабақ 8 — Жою/кірістіру
    (8, "easy"):   {"expected": "[4, 9, 5, 6, 3, 0]",         "desc": "P=10-нан үлкендерді өшір"},
    (8, "medium"): {"expected": "[14.6, 24.0, 29.5, 26.0, 10.2, 40.6]", "desc": "Орташадан үлкендерді алып тастау"},
    (8, "hard"):   {"expected": "[10, 14, 15, 86, 68, 74, 65, 89, 32, 41, 65, 43]", "desc": "Басына 10, соңына 43 кірістір"},

    # Сабақ 9 — Қорытынды
    (9, "easy"):   {"expected": "[58, 62, 44, 88, 64, 55]", "desc": "Индекс 3-6 аралығын өшір"},
    (9, "medium"): {"expected": "[1, 3, 5, 7, 9]",          "desc": "2D тақ сандарды өсу ретімен сұрыпта"},
    (9, "hard"):   {"expected": "12",                        "desc": "H массивінен P=175-тен жоғары 12 оқушы"},
}

# ── Жұмыс аймағы коды (harness) — кодты қоршауға алады ──────────
# Оқушы коды орындалмас бұрын, деректер инициализацияланады
HARNESS_TEMPLATES: dict[tuple, str] = {
    (1, "easy"):   "A = [4, -2, 8, -5, 10]\n{code}",
    (1, "medium"): "A = [5, 48, 125, 14, 8, 96]\n{code}",
    (1, "hard"):   "B = [10, 12, 96, 32, 69, 15, 207]\nP = 3\n{code}",

    (2, "easy"):   "A = [12, 5, 8, 19, 2, 7]\nc, d = 5, 10\n{code}",
    (2, "medium"): "X = [141, 605, 786, 989, 545, 100]\n{code}",
    (2, "hard"):   "A = [15, -6, 3, 0, 17, 6]\n{code}",

    (3, "easy"):   "A = [4, 9, 5, 17, 3]\nX = 8\nM = 0\n{code}",
    (3, "medium"): "A = [10, 3, 6, 8, 2]\nK = 5\n{code}",
    (3, "hard"):   "A = [8, 6, 11, 25, 3]\n{code}",

    (4, "easy"):   "C = [[3,4,1,9],[4,5,6,2],[7,8,90,11],[20,3,14,68]]\n{code}",
    (4, "medium"): "A = [[-5,0,4,11],[12,-7,0,8],[-9,0,0,7],[15,-8,0,0]]\n{code}",
    (4, "hard"):   "B = [[12,47,38],[17,15,69],[70,11,7]]\nK = 7\n{code}",

    (5, "easy"):   "A = [[1,2,3,6],[2,5,6,9],[1,7,8,9],[4,8,9,5]]\n{code}",
    (5, "medium"): "X = [[3,4,5,5,3],[4,4,5,5,3],[5,5,5,5,5],[5,5,5,5,4]]\n{code}",
    (5, "hard"):   "Grades = [[3,4,5,4,5,5],[4,5,4,4,4,4],[5,5,5,5,5,5],[3,3,3,3,4,4],[4,4,5,4,4,4]]\n{code}",

    (6, "easy"):   "A = [15, 24, 8, 33, 40, 7]\nP = 8\n{code}",
    (6, "medium"): "import random\nA = [random.randint(20,50) for _ in range(20)]\n{code}",
    (6, "hard"):   "A = [21,26,46,87,41,5,16,10,15,3,8,70]\n{code}",

    (7, "easy"):   "phones = [87015, 87023, 87075, 87046, 87065]\n{code}",
    (7, "medium"): "A = [15,-6,3,9,17,6,25,-42,0,1]\n{code}",
    (7, "hard"):   "W = [80,32,78,98,47,85,65,110,34,119]\n{code}",

    (8, "easy"):   "A = [4,9,5,17,27,6,3,15,11,0]\nP = 10\n{code}",
    (8, "medium"): "K = [152.5,14.6,24.0,29.5,80.0,26.0,10.2,40.6]\n{code}",
    (8, "hard"):   "A = [14,15,86,68,74,65,89,32,41,65]\nT = 10\nK = 43\n{code}",

    (9, "easy"):   "A = [58,62,44,478,2,32,6,88,64,55]\n{code}",
    (9, "medium"): "A = [[5,12,7],[8,3,14],[1,9,6]]\n{code}",
    (9, "hard"):   "H = [175,160,182,190,165,178,185,192,168,170,188,172,180,195,177]\nP = 175\n{code}",
}


def run_code(code: str, lesson_id: int, difficulty: str, timeout: int = 5) -> dict:
    """
    Оқушының кодын sandbox-та орындайды.
    Returns: { success, output, error, verdict, expected }
    """
    key = (lesson_id, difficulty)
    spec = TASK_SPECS.get(key)
    harness_tmpl = HARNESS_TEMPLATES.get(key, "{code}")

    if not spec:
        return {
            "success": False,
            "output": "",
            "error": f"Тапсырма спецификациясы табылмады: сабақ {lesson_id}, {difficulty}",
            "verdict": "error",
            "expected": ""
        }

    # Кодты harness-ке кірістіру
    full_code = harness_tmpl.replace("{code}", textwrap.dedent(code))

    # Уақытша файл жасау
    with tempfile.NamedTemporaryFile(
        mode='w', suffix='.py', delete=False, encoding='utf-8'
    ) as f:
        f.write(full_code)
        tmp_path = f.name

    try:
        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            env={**os.environ, "PYTHONPATH": ""}
        )
        output = result.stdout.strip()
        stderr = result.stderr.strip()

        if result.returncode != 0:
            # Runtime error — ML-ге жібер
            return {
                "success": False,
                "output": output,
                "error": _clean_error(stderr),
                "verdict": "runtime_error",
                "expected": spec["expected"]
            }

        # Нәтижені тексер
        verdict = _check_output(output, spec["expected"], lesson_id, difficulty)

        return {
            "success": verdict == "correct",
            "output": output,
            "error": "",
            "verdict": verdict,
            "expected": spec["expected"],
            "description": spec["desc"]
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": "Уақыт шектеуі өтіп кетті (5 сек). Шексіз цикл бар ма?",
            "verdict": "timeout",
            "expected": spec["expected"]
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "error": str(e),
            "verdict": "error",
            "expected": spec["expected"]
        }
    finally:
        os.unlink(tmp_path)


def _check_output(actual: str, expected: str, lesson_id: int, difficulty: str) -> str:
    """Нәтижені тексеру логикасы."""
    # 6-medium random болғандықтан — кез келген output дұрыс
    if lesson_id == 6 and difficulty == "medium":
        return "correct" if actual else "wrong"

    if not actual and not expected:
        return "correct"
    if not actual:
        return "wrong"

    # Нормализация — пробелдер мен регистрді елемеу
    actual_norm   = " ".join(actual.lower().split())
    expected_norm = " ".join(expected.lower().split())

    if actual_norm == expected_norm:
        return "correct"

    # Жолдарды жеке тексер
    actual_lines   = [l.strip() for l in actual.splitlines() if l.strip()]
    expected_lines = [l.strip() for l in expected.splitlines() if l.strip()]

    if actual_lines == expected_lines:
        return "correct"

    # Сандарды тексер (тізім форматтары үшін)
    try:
        import ast
        a_val = ast.literal_eval(actual)
        e_val = ast.literal_eval(expected)
        if a_val == e_val:
            return "correct"
    except Exception:
        pass

    # Жартылай дұрыс — кейбір жолдар дұрыс
    if expected_lines:
        matches = sum(1 for el in expected_lines if el in actual_lines)
        if matches / len(expected_lines) >= 0.5:
            return "partial"

    return "wrong"


def _clean_error(stderr: str) -> str:
    """Қате хабарын тазарту — уақытша файл жолын жасырады."""
    lines = stderr.splitlines()
    cleaned = []
    for line in lines:
        if 'tmp' in line.lower() or 'temp' in line.lower():
            continue
        cleaned.append(line)
    return "\n".join(cleaned).strip() or stderr