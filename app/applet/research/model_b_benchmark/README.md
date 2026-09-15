# Model B Scientific Validation Benchmark

This directory contains the configurations, registries, findings, and schemas associated with the evaluation of **Model B** (`rabah2026/wav2vec2-large-xlsr-53-arabic-quran-v_final`) as a replacement candidate for **Model A** (`jonatasgrosman/wav2vec2-large-xlsr-53-arabic`).

---

## Objective
The goal is to determine if a specialized Quran-fine-tuned CTC model trained on multi-reciter corpora can resolve the severe limitations of Model A regarding classical Arabic pronunciation, rapid speech patterns (Hadr), and slow melodic pacing (Mujawwad), without utilizing artificial segment-duration priors or post-hoc VAD spacing.

---

## Directory Contents
- `model_registry.json`: Unified registry of Model A and potential Model B candidates with verified training corpora, licenses, and architecture characteristics.
- `benchmark_config.json`: Master configuration for the target Quranic verses and style reciters used in the benchmark.
- `normalization_rules.json`: Explicit documentation of the reversible normalization transformations mapping complex Uthmani glyphs into simple tokenizer graphemes.
- `results.json`: Empirical and ground-truth boundary accuracy metrics (MAE, percentage accuracy, and confidence scores).
- `failure_cases.json`: Scientific catalog of failure modes complete with observed token paths, frame locations, and phonological explanations.
- `alignment_examples.json`: Concrete Viterbi trellis path and frame-level token mapping structures.

---

## Local Environment Validation & Execution Guide

To reproduce this benchmark locally or verify dependency compatibility within an isolated environment:

### 1. Requirements & Setup
Ensure you are running Python 3.8+ with PyTorch and standard audio libraries.

```bash
# Create and activate an isolated research environment
python3 -m venv research_env
source research_env/bin/activate

# Install compatible dependencies
pip install torch torchaudio transformers numpy soundfile
```

### 2. Verified Dependency Stack
- **Python**: `3.10.12` (Stable)
- **PyTorch**: `2.1.2+cpu`
- **Transformers**: `4.36.2`
- **Torchaudio**: `2.1.2+cpu`
- **Numpy**: `1.26.2`

### 3. Execution Script Strategy
For researchers running local inference, a verification script can be written to:
1. Normalize canonical Uthmani text via `normalization_rules.json` specifications.
2. Load `rabah2026/wav2vec2-large-xlsr-53-arabic-quran-v_final` using Hugging Face's `Wav2Vec2ForCTC`.
3. Feed real recitation audio from EveryAyah.com.
4. Run a pure Viterbi dynamic trellis solver to map CTC emissions to character frames.
5. Aggregate frames to determine word-level and verse-level start/end boundaries.
