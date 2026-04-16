import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import random
from model import ErrorClassifierMLP, StudentMLP, FeatureExtractor


def generate_error_data(n=2000):
    """
    Синтетикалық қате деректерін жасайды.
    5 қате түрі, әрқайсысына тән белгілер паттерні бар.
    """
    X, y = [], []
    per = n // 5

    def r(lo, hi): return np.random.uniform(lo, hi)
    def rb(): return np.random.choice([0.0, 1.0])

    # 0: index_error — индекс бар, цикл бар, range жоқ немесе дұрыс емес
    for _ in range(per):
        X.append([r(0.7,1), r(0.7,1), r(0,0.5), r(0,0.4),
                  r(0.1,0.6), r(0.3,0.8), r(0,1), r(0,1),
                  r(0,0.8), r(0,0.5), r(0,0.3), r(0.1,0.5)])
        y.append(0)

    # 1: loop_logic — цикл бар, range бар, шарт орташа
    for _ in range(per):
        X.append([r(0.7,1), r(0.3,0.8), r(0.3,0.7), r(0.6,1),
                  r(0.1,0.5), r(0.5,1), r(0,1), r(0,1),
                  r(0,0.6), r(0,0.4), r(0,0.5), r(0.1,0.4)])
        y.append(1)

    # 2: wrong_condition — шарт бар, цикл орташа
    for _ in range(per):
        X.append([r(0.3,0.8), r(0.2,0.7), r(0.7,1), r(0.2,0.7),
                  r(0.1,0.5), r(0.5,1), r(0,1), r(0,1),
                  r(0,0.7), r(0,0.5), r(0,0.4), r(0.1,0.4)])
        y.append(2)

    # 3: edge_case — код қысқа, цикл жоқ немесе аз
    for _ in range(per):
        X.append([r(0,0.5), r(0.4,0.9), r(0.4,0.8), r(0.1,0.5),
                  r(0,0.3), r(0.6,1), r(0,1), r(0.3,1),
                  r(0.2,1), r(0,0.4), r(0,0.3), r(0,0.3)])
        y.append(3)

    # 4: syntax_error — жақша балансы дұрыс емес, код қысқа
    for _ in range(per):
        X.append([r(0.2,0.7), r(0.1,0.6), r(0.2,0.6), r(0.1,0.5),
                  r(0,0.3), r(0,0.4), r(0,1), r(0,1),
                  r(0,0.5), r(0,0.3), r(0,0.3), r(0,0.2)])
        y.append(4)

    combined = list(zip(X, y))
    random.shuffle(combined)
    X, y = zip(*combined)
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64)


def generate_risk_data(n=2000):
    """Risk classifier деректері (мұғалім аналитикасы үшін)."""
    X, y = [], []
    per = n // 3

    for _ in range(per):  # at_risk
        l=np.random.beta(1.5,5); t=l*np.random.uniform(0.3,0.7)
        X.append([l,t,t*0.8,t*0.4,t*0.1,min(np.random.exponential(0.05),1),
                  l*0.6,l*0.4,0.2,np.random.uniform(0.3,0.9),t*0.4,np.random.beta(4,2)])
        y.append(0)
    for _ in range(per):  # average
        l=np.random.beta(3,3); t=l*np.random.uniform(0.5,0.85)
        X.append([l,t,t*0.9,t*0.6,t*0.3,np.random.beta(2,3),
                  l*0.8,np.random.uniform(0.4,0.7),0.5,np.random.uniform(0.1,0.5),t*0.6,np.random.beta(2,3)])
        y.append(1)
    for _ in range(per):  # excellent
        l=np.random.beta(5,2); t=l*np.random.uniform(0.75,1)
        X.append([l,t,t*0.95,t*0.85,t*0.7,np.random.beta(4,2),
                  l*0.95,np.random.uniform(0.7,1),0.8,np.random.uniform(0,0.2),t*0.85,np.random.beta(1,4)])
        y.append(2)

    combined = list(zip(X, y))
    random.shuffle(combined)
    X, y = zip(*combined)
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64)


def _train(model, X, y, epochs, lr, tag):
    split = int(len(X) * 0.8)
    dl_tr = DataLoader(TensorDataset(torch.tensor(X[:split]), torch.tensor(y[:split])), batch_size=64, shuffle=True)
    dl_val = DataLoader(TensorDataset(torch.tensor(X[split:]), torch.tensor(y[split:])), batch_size=64)

    opt = optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    sch = optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
    crit = nn.CrossEntropyLoss()
    best_acc, losses = 0, []

    for ep in range(epochs):
        model.train()
        ep_loss = 0
        for xb, yb in dl_tr:
            opt.zero_grad()
            loss = crit(model(xb), yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
            ep_loss += loss.item()
        sch.step()
        losses.append(ep_loss / len(dl_tr))

        model.eval()
        correct = total = 0
        with torch.no_grad():
            for xb, yb in dl_val:
                pred = model(xb).argmax(1)
                correct += (pred == yb).sum().item()
                total += yb.size(0)
        acc = correct / total
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), f"{tag}.pth")
        if (ep+1) % 25 == 0:
            print(f"  [{tag}] Epoch {ep+1}/{epochs} | Loss: {losses[-1]:.4f} | Val Acc: {acc:.3f}")

    print(f"  [{tag}] Үздік нәтиже / Best acc: {best_acc:.3f}")
    return losses, best_acc


def train_model(epochs=100):
    print("1️⃣  Қате классификаторы оқытылуда / Training error classifier...")
    X_err, y_err = generate_error_data(2500)
    err_model = ErrorClassifierMLP(12, [64,128,64], 5)
    losses_err, acc_err = _train(err_model, X_err, y_err, epochs, 0.001, "error_model")

    print("2️⃣  Тәуекел классификаторы оқытылуда / Training risk classifier...")
    X_risk, y_risk = generate_risk_data(2000)
    risk_model = StudentMLP(12, [64,128,64], 3)
    losses_risk, acc_risk = _train(risk_model, X_risk, y_risk, epochs, 0.001, "model")

    return {
        "train_losses": losses_err,
        "val_accuracies": [],
        "best_val_accuracy": acc_err,
        "error_model_accuracy": acc_err,
        "risk_model_accuracy": acc_risk,
        "epochs": epochs
    }


if __name__ == "__main__":
    r = train_model()
    print(f"\nҚате моделі дәлдігі: {r['error_model_accuracy']:.3f}")
    print(f"Тәуекел моделі дәлдігі: {r['risk_model_accuracy']:.3f}")