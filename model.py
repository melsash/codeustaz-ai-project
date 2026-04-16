import torch
import torch.nn as nn

class StudentMLP(nn.Module):
    def __init__(self, input_size=12, hidden_sizes=[64, 128, 64], output_size=3, dropout=0.3):
        super(StudentMLP, self).__init__()
        layers = []
        prev_size = input_size
        for hidden_size in hidden_sizes:
            layers += [
                nn.Linear(prev_size, hidden_size),
                nn.BatchNorm1d(hidden_size),
                nn.ReLU(),
                nn.Dropout(dropout)
            ]
            prev_size = hidden_size
        layers.append(nn.Linear(prev_size, output_size))
        self.network = nn.Sequential(*layers)
        self._init_weights()

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, nonlinearity='relu')
                nn.init.zeros_(m.bias)

    def forward(self, x):
        return self.network(x)


class FeatureExtractor:
    TOTAL_LESSONS = 9
    TOTAL_TASKS = 27

    @staticmethod
    def extract(student_data: dict) -> list:
        progress = student_data.get("progress", {})
        lessons_completed = 0
        tasks_completed = 0
        easy_done = 0
        medium_done = 0
        hard_done = 0
        visualizations_watched = 0
        stalled_lessons = 0

        for lesson_id, lesson_data in progress.items():
            tasks = lesson_data.get("tasks", {})
            if lesson_data.get("visualizationWatched"):
                visualizations_watched += 1
            easy_ok = tasks.get("easy", {}).get("status") == "completed"
            med_ok = tasks.get("medium", {}).get("status") == "completed"
            hard_ok = tasks.get("hard", {}).get("status") == "completed"
            if easy_ok: easy_done += 1
            if med_ok: medium_done += 1
            if hard_ok: hard_done += 1
            lesson_tasks_done = sum([easy_ok, med_ok, hard_ok])
            tasks_completed += lesson_tasks_done
            if lesson_tasks_done == 3:
                lessons_completed += 1
            elif lesson_tasks_done > 0 or lesson_data.get("visualizationWatched"):
                stalled_lessons += 1

        streak = student_data.get("streak", 0)
        help_needed = student_data.get("hintsUsed", 0)
        completion_rate = tasks_completed / FeatureExtractor.TOTAL_TASKS
        hard_ratio = hard_done / max(lessons_completed, 1)
        avg_lesson_score = lessons_completed / FeatureExtractor.TOTAL_LESSONS

        return [
            lessons_completed / FeatureExtractor.TOTAL_LESSONS,
            tasks_completed / FeatureExtractor.TOTAL_TASKS,
            easy_done / FeatureExtractor.TOTAL_LESSONS,
            medium_done / FeatureExtractor.TOTAL_LESSONS,
            hard_done / FeatureExtractor.TOTAL_LESSONS,
            min(streak / 30.0, 1.0),
            visualizations_watched / FeatureExtractor.TOTAL_LESSONS,
            avg_lesson_score,
            hard_ratio,
            stalled_lessons / FeatureExtractor.TOTAL_LESSONS,
            completion_rate,
            min(help_needed / 10.0, 1.0),
        ]


RISK_LABELS = {0: "at_risk", 1: "average", 2: "excellent"}
RISK_LABELS_KK = {0: "Қауіпті аймақ", 1: "Орташа деңгей", 2: "Үздік деңгей"}
RISK_DESCRIPTIONS_KK = {
    0: "Оқушыға қосымша көмек қажет. Мұғалімнің назары керек.",
    1: "Оқушы қалыпты қарқынмен жүріп жатыр.",
    2: "Оқушы үздік нәтиже көрсетуде. Күрделі тапсырмаларға дайын."
}
