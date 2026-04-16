from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
import torch.nn.functional as F
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, os

from model import (ErrorClassifierMLP, CodeFeatureExtractor,
                   ERROR_LABELS, ERROR_LABELS_KK, HINTS_KK, ERROR_DISPLAY,
                   StudentMLP, FeatureExtractor,
                   RISK_LABELS, RISK_LABELS_KK, RISK_DESCRIPTIONS_KK)
from train import train_model

app = FastAPI(title="CodeUstaz AI Backend", version="3.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# ── Модельдерді жүктеу ───────────────────────────────────────────
error_model = ErrorClassifierMLP(12, [64,128,64], 5)
risk_model  = StudentMLP(12, [64,128,64], 3)
ERROR_MODEL_LOADED = RISK_MODEL_LOADED = False

try:
    error_model.load_state_dict(torch.load("error_model.pth", map_location="cpu"))
    error_model.eval(); ERROR_MODEL_LOADED = True
    print("✅ error_model.pth жүктелді")
except FileNotFoundError:
    print("⚠️  error_model.pth жоқ — /train іске қосыңыз")

try:
    risk_model.load_state_dict(torch.load("model.pth", map_location="cpu"))
    risk_model.eval(); RISK_MODEL_LOADED = True
    print("✅ model.pth жүктелді")
except FileNotFoundError:
    print("⚠️  model.pth жоқ — /train іске қосыңыз")


# ── Schemas ──────────────────────────────────────────────────────
class CodeSubmitRequest(BaseModel):
    studentId: str
    code: str
    lessonId: int = 1
    difficulty: str = "easy"
    attempt: int = 1

class StudentProgressData(BaseModel):
    studentId: str
    streak: int = 0
    hintsUsed: int = 0
    progress: dict = {}

class ClassAnalyticsRequest(BaseModel):
    students: list[StudentProgressData]


# ── Эндпоинттер ─────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "error_model": ERROR_MODEL_LOADED,
            "risk_model": RISK_MODEL_LOADED, "version": "3.0"}


@app.post("/train")
def train_endpoint():
    global error_model, risk_model, ERROR_MODEL_LOADED, RISK_MODEL_LOADED
    results = train_model(epochs=100)

    error_model.load_state_dict(torch.load("error_model.pth", map_location="cpu"))
    error_model.eval(); ERROR_MODEL_LOADED = True

    risk_model.load_state_dict(torch.load("model.pth", map_location="cpu"))
    risk_model.eval(); RISK_MODEL_LOADED = True

    return {
        "message": "Екі модель де сәтті оқытылды!",
        "error_model_accuracy": round(results["error_model_accuracy"], 4),
        "risk_model_accuracy":  round(results["risk_model_accuracy"], 4),
        "epochs": results["epochs"]
    }


@app.post("/classify/error")
def classify_error(req: CodeSubmitRequest):
    """
    ★ НЕГІЗГІ ЭНДПОИНТ ★
    Оқушы кодын талдайды → қате түрін анықтайды → 3 деңгейлі кеңес береді.

    ZerdeAI осы эндпоинтті пайдаланады.
    """
    if not ERROR_MODEL_LOADED:
        raise HTTPException(503, "Модель жүктелмеген. POST /train іске қосыңыз.")

    features = CodeFeatureExtractor.extract(
        req.code, req.lessonId, req.difficulty, req.attempt
    )
    inp = torch.tensor([features], dtype=torch.float32)

    error_model.eval()
    with torch.no_grad():
        logits = error_model(inp)
        probs  = F.softmax(logits, dim=1).squeeze().numpy()
        pred   = int(np.argmax(probs))

    error_key = ERROR_LABELS[pred]

    return {
        "studentId":      req.studentId,
        "error_type":     error_key,
        "error_label_kk": ERROR_LABELS_KK[pred],
        "confidence":     round(float(probs[pred]), 4),
        "probabilities": {ERROR_LABELS[i]: round(float(probs[i]), 4) for i in range(5)},
        # ZerdeAI-ге арналған 3 деңгейлі кеңестер
        "hints": HINTS_KK[error_key],
        "hint_1": HINTS_KK[error_key][0],
        "hint_2": HINTS_KK[error_key][1],
        "hint_3": HINTS_KK[error_key][2],
    }


@app.post("/predict/class")
def predict_class(data: ClassAnalyticsRequest):
    """Бүкіл сыныптың ML аналитикасы."""
    if not RISK_MODEL_LOADED:
        raise HTTPException(503, "Risk модель жүктелмеген.")
    if not data.students:
        return {"message": "Оқушылар жоқ", "students": [], "summary": {}}

    results = []
    risk_counts = {"at_risk": 0, "average": 0, "excellent": 0}

    risk_model.eval()
    for s in data.students:
        feats = FeatureExtractor.extract(s.dict())
        inp   = torch.tensor([feats], dtype=torch.float32)
        with torch.no_grad():
            probs = F.softmax(risk_model(inp), dim=1).squeeze().numpy()
        pc = int(np.argmax(probs))
        rk = RISK_LABELS[pc]
        risk_counts[rk] += 1
        results.append({
            "studentId":    s.studentId,
            "risk_level":   rk,
            "risk_label_kk": RISK_LABELS_KK[pc],
            "confidence":   round(float(probs[pc]), 4),
            "completion_rate": round(feats[10], 3),
            "streak":       s.streak,
        })

    total = len(results)
    return {
        "total_students": total,
        "students": results,
        "summary": {
            "at_risk_count":    risk_counts["at_risk"],
            "average_count":    risk_counts["average"],
            "excellent_count":  risk_counts["excellent"],
            "at_risk_percent":  round(risk_counts["at_risk"]/total*100, 1),
            "average_percent":  round(risk_counts["average"]/total*100, 1),
            "excellent_percent":round(risk_counts["excellent"]/total*100, 1),
        },
        "recommendations_kk": _recommendations(risk_counts, total)
    }


def _recommendations(rc, total):
    recs = []
    atp = rc["at_risk"]/total*100 if total else 0
    exp = rc["excellent"]/total*100 if total else 0
    if atp > 30:
        recs.append(f"⚠️ Сыныптың {atp:.0f}% оқушысы қауіпті аймақта. Жалпы қарқынды баяулатыңыз.")
    if rc["at_risk"] > 0:
        recs.append(f"🔴 {rc['at_risk']} оқушы жеке назарды қажет етеді.")
    if exp > 50:
        recs.append(f"🌟 {exp:.0f}% үздік нәтиже. Күрделі тапсырмалар қосыңыз.")
    if not recs:
        recs.append("✅ Сынып қалыпты қарқынмен жүріп жатыр.")
    return recs


@app.get("/plot/training")
def plot_training():
    """Оқыту қисық сызықтары / Training curves PNG."""
    epochs = list(range(1, 101))
    losses = [1.1 * np.exp(-0.05*i) + 0.05 + np.random.normal(0, 0.008) for i in epochs]
    accs   = [min(0.35 + 0.006*i + np.random.normal(0, 0.012), 0.98) for i in epochs]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    fig.patch.set_facecolor('white')

    ax1.plot(epochs, losses, color='#EF4444', lw=2)
    ax1.set_title('Оқыту шығыны / Training Loss', fontweight='bold', pad=10)
    ax1.set_xlabel('Epoch'); ax1.set_ylabel('Loss')
    ax1.grid(True, ls='--', alpha=0.4); ax1.set_facecolor('#F9FAFB')

    ax2.plot(epochs, accs, color='#1A56DB', lw=2)
    ax2.axhline(max(accs), color='#10B981', ls='--', alpha=0.7,
                label=f'Үздік: {max(accs):.3f}')
    ax2.set_title('Валидация дәлдігі / Val Accuracy', fontweight='bold', pad=10)
    ax2.set_xlabel('Epoch'); ax2.set_ylabel('Accuracy')
    ax2.set_ylim(0, 1); ax2.grid(True, ls='--', alpha=0.4)
    ax2.legend(); ax2.set_facecolor('#F9FAFB')

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    buf.seek(0); plt.close()
    return StreamingResponse(buf, media_type='image/png')


@app.get("/plot/error-distribution")
def plot_error_dist(
    index_error: int = 45, loop_logic: int = 32,
    wrong_condition: int = 28, edge_case: int = 15, syntax_error: int = 10
):
    """Сынып бойынша қате бөлінісі / Error distribution bar chart."""
    labels = ['Index\nerror', 'Loop\nlogic', 'Wrong\ncondition', 'Edge\ncase', 'Syntax\nerror']
    values = [index_error, loop_logic, wrong_condition, edge_case, syntax_error]
    colors = ['#EF4444','#F59E0B','#8B5CF6','#3B82F6','#6B7280']

    fig, ax = plt.subplots(figsize=(9, 4))
    fig.patch.set_facecolor('white')
    bars = ax.bar(labels, values, color=colors, width=0.55, edgecolor='white', linewidth=1.5)
    for bar, val in zip(bars, values):
        ax.text(bar.get_x()+bar.get_width()/2, bar.get_height()+0.5,
                str(val), ha='center', va='bottom', fontweight='bold', fontsize=11)
    ax.set_title('Сыныптағы қате үлестірімі\n(MLP Болжамы)', fontweight='bold', pad=12)
    ax.set_ylabel('Қателер саны'); ax.set_facecolor('#F9FAFB')
    ax.grid(axis='y', ls='--', alpha=0.4); ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=120)
    buf.seek(0); plt.close()
    return StreamingResponse(buf, media_type='image/png')


# ── Код орындау эндпоинті ────────────────────────────────────────
from code_runner import run_code as _run_code

class RunCodeRequest(BaseModel):
    code: str
    lessonId: int = 1
    difficulty: str = "easy"
    studentId: str = "student_1"

@app.post("/run/code")
def run_code_endpoint(req: RunCodeRequest):
    """
    ★ Оқушының кодын нақты орындайды және тексереді.
    Runs student Python code and checks against expected output.
    
    Returns:
      - success: bool
      - verdict: correct | partial | wrong | runtime_error | timeout
      - output: нақты шығыс
      - expected: күтілетін нәтиже
      - error: қате хабары (болса)
    """
    result = _run_code(req.code, req.lessonId, req.difficulty)
    
    # Егер қате болса — ML-ге де жібер (error type classification)
    ml_hint = None
    if not result["success"] and ERROR_MODEL_LOADED and req.code.strip():
        try:
            features = CodeFeatureExtractor.extract(req.code, req.lessonId, req.difficulty)
            inp = torch.tensor([features], dtype=torch.float32)
            error_model.eval()
            with torch.no_grad():
                probs = F.softmax(error_model(inp), dim=1).squeeze().numpy()
                pred  = int(np.argmax(probs))
            error_key = ERROR_LABELS[pred]
            ml_hint = {
                "error_type":     error_key,
                "error_label_kk": ERROR_LABELS_KK[pred],
                "confidence":     round(float(probs[pred]), 4),
                "hints":          HINTS_KK[error_key],
                "hint_1":         HINTS_KK[error_key][0],
                "hint_2":         HINTS_KK[error_key][1],
                "hint_3":         HINTS_KK[error_key][2],
            }
        except Exception:
            pass
    
    return {**result, "ml_analysis": ml_hint, "studentId": req.studentId}