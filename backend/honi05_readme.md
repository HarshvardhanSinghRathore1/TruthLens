---
language:
  - en
license: mit
library_name: pytorch
pipeline_tag: image-classification
tags:
  - deepfake-detection
  - deepfake
  - media-forensics
  - video-forensics
  - face-detection
  - computer-vision
  - image-classification
  - video-classification
  - efficientnet
  - grad-cam
  - explainable-ai
  - xai
  - pytorch
  - gradio
  - celeb-df
datasets:
  - celeb-df-v2
metrics:
  - accuracy
  - f1
  - roc_auc
model-index:
  - name: EfficientNet-B4 Deepfake Detector
    results:
      - task:
          type: image-classification
          name: Deepfake Detection (frame-level)
        dataset:
          name: Celeb-DF v2
          type: celeb-df-v2
        metrics:
          - type: roc_auc
            value: 0.9933
            name: Frame-Level AUC-ROC
          - type: accuracy
            value: 0.9746
            name: Frame Accuracy
          - type: f1
            value: 0.9855
            name: Frame F1 Score
      - task:
          type: video-classification
          name: Deepfake Detection (video-level)
        dataset:
          name: Celeb-DF v2
          type: celeb-df-v2
        metrics:
          - type: roc_auc
            value: 0.9990
            name: Video-Level AUC-ROC
---

# EfficientNet-B4 Deepfake Detector with Grad-CAM Explainability

A high-accuracy deepfake face detector trained on **Celeb-DF v2**, combining an EfficientNet-B4 backbone with Grad-CAM spatial attribution and a deterministic forensic report generator. The model classifies face images as real or fake and highlights *which facial region* triggered the decision.

**Bachelor project — Sapienza Università di Roma, AI & Applied Computer Science**

---

## Model Performance

| Metric | Score |
|---|---|
| Frame-Level AUC-ROC | **0.9933** |
| Video-Level AUC-ROC | **0.9990** |
| Frame Accuracy | **97.46%** |
| Frame F1 Score | **98.55%** |
| False Negative Rate | **0.44%** (37 / 8,475 fakes missed) |

> Video-level scores are computed by mean-aggregating frame probabilities per video ID, which suppresses single-frame noise and reflects real-world deployment.

---

## What Makes This Different

- **Explainable predictions** — Grad-CAM heatmaps highlight the exact facial zone (forehead, eyes, nose, jaw, or hairline) that triggered the detection.
- **Forensic text output** — A template engine converts confidence + activated zones into a structured human-readable forensic report (4 confidence tiers).
- **Video-level reasoning** — Frame scores are aggregated per video for a single robust verdict.
- **Interactive demo** — Gradio app supports both image and video input.

---

## Architecture

```
Input (224×224 face crop)
  └─ EfficientNet-B4 backbone (ImageNet pretrained)
       ├─ Blocks 0–4  →  frozen (feature extraction)
       └─ Blocks 5–8  →  fine-tuned (LR = 1e-4)
           └─ Global Average Pooling
               └─ Dropout(0.4) → Linear(1792→256) → ReLU → Dropout(0.2) → Linear(256→1)
                   └─ Sigmoid → probability [0, 1]  (≥ 0.5 = Fake)
```

- **Loss:** Focal Loss (α=0.25, γ=2.0) — handles the 5:1 fake/real imbalance
- **Optimizer:** AdamW with differential learning rates (backbone 1e-4, head 5e-4)
- **Scheduler:** CosineAnnealingLR over 20 epochs with early stopping (patience=5)
- **GPU:** NVIDIA RTX A4000

---

## Dataset

**Celeb-DF v2** — 590 real celebrity videos + 5,639 high-quality deepfake videos.

- 15 frames extracted per video (uniform temporal sampling)
- MTCNN face detection → 224×224 crops, 20 px margin
- Split **by video ID** (80/10/10) — prevents identity leakage between train and test
- ~74,000 real face crops · ~477,000 fake face crops

---

## Usage

### Quick inference (image)

```python
import torch
from torchvision import transforms
from PIL import Image
from huggingface_hub import hf_hub_download

# Download checkpoint
ckpt_path = hf_hub_download(repo_id="honi05/deepfake-detection", filename="best_model.pt")

# Load model
from src.model import DeepfakeClassifier
model = DeepfakeClassifier(freeze_blocks=5, dropout=0.4, backbone='b4')
state = torch.load(ckpt_path, map_location="cpu", weights_only=True)
model.load_state_dict(state["model_state_dict"])
model.eval()

# Preprocess
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

img = Image.open("face.jpg").convert("RGB")
x = transform(img).unsqueeze(0)

with torch.no_grad():
    logit = model(x)
    prob = torch.sigmoid(logit).item()

print(f"Fake probability: {prob:.3f}")
print("Verdict:", "FAKE" if prob >= 0.5 else "REAL")
```

### Grad-CAM explainability

```python
from src.gradcam import GradCAM

grad_cam = GradCAM(model)
heatmap, confidence = grad_cam.compute(img_tensor)   # (224,224) heatmap in [0,1]
overlay = grad_cam.overlay(img_pil, heatmap)         # PIL image with jet overlay

top_zones = grad_cam.get_top_zones(heatmap, top_k=2)
print("Most activated zones:", top_zones)
```

### Forensic report

```python
from src.forensic_text import generate_forensic_report

report = generate_forensic_report(confidence=0.91, zone1="eyes", zone2="jaw")
print(report)
# HIGH CONFIDENCE FAKE (91.0%) — Eyes region shows unnatural reflection/texture
# patterns inconsistent with genuine facial geometry. Jaw area exhibits visible
# blending seam characteristic of face-swap artefacts.
```

### Gradio demo (image + video)

```bash
python demo/app.py
```

---

## Explainability — Facial Zones

The model maps Grad-CAM activations to 5 facial zones (pixel rows in the 224×224 crop):

| Zone | Rows | Common deepfake artefacts |
|---|---|---|
| Forehead | 0–60 | Hair boundary blending, skin tone mismatch |
| Eyes | 60–100 | Unnatural reflection, pupil shape, lash generation |
| Nose | 100–145 | Texture discontinuity, geometry distortion |
| Jaw | 145–185 | Blending seam at jaw-line, edge softening |
| Hairline | 185–224 | Hair generation artefacts, boundary warping |

The top-2 activated zones are included in the forensic report.

---

## Ablation Results

| Configuration | Test AUC | vs Baseline |
|---|---|---|
| **Baseline (this model)** | **0.9933** | — |
| No data augmentation | 0.9701 | −2.32% |
| EfficientNet-B0 backbone | 0.9612 | −3.21% |
| BCE loss (no focal) | 0.9814 | −1.19% |
| Fully fine-tuned (no freezing) | 0.9878 | −0.55% |

Key findings: data augmentation and the larger B4 backbone provide the biggest gains. Focal loss measurably improves handling of the class imbalance. Selective freezing slightly outperforms full fine-tuning (likely due to overfitting risk with the large backbone).

---

## Limitations

- Binary classification only (real vs. fake) — does not identify the generation method
- No temporal modelling — each frame is classified independently
- Trained on Celeb-DF v2 only — may not generalise equally to StyleGAN or diffusion-based fakes
- High-compression video can suppress the artefacts the model relies on
- False Positive Rate of ~15.9% on the test set

---

## Files

| File | Description |
|---|---|
| `best_model.pt` | Trained weights (`model_state_dict` + training metadata) |
| `app.py` | Gradio demo (image + video tabs) |
| `requirements.txt` | Python dependencies |

Full source code: [github.com/Honi05/DeepFakeDetector](https://github.com/Honi05/DeepFakeDetector)

---

## Citation

If you use this model, please cite:

```bibtex
@misc{arora2026deepfake,
  title   = {Deepfake Detection with Explainable Forensic Analysis Using EfficientNet-B4 and Grad-CAM},
  author  = {Arora, Honi},
  year    = {2026},
  url     = {https://huggingface.co/honi05/deepfake-detection}
}
```

---

## Acknowledgements

- [Celeb-DF v2](https://github.com/yuezunli/celeb-deepfakeforensics) — Li et al., CVPR 2020
- [EfficientNet](https://arxiv.org/abs/1905.11946) — Tan & Le, ICML 2019
- [Grad-CAM](https://arxiv.org/abs/1610.02391) — Selvaraju et al., ICCV 2017
- [Focal Loss](https://arxiv.org/abs/1708.02002) — Lin et al., ICCV 2017
- [facenet-pytorch](https://github.com/timesler/facenet-pytorch) — MTCNN implementation
