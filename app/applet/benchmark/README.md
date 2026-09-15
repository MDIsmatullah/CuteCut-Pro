# Quran Audio-to-Text Forced Alignment Research Benchmark

This directory contains an isolated offline Python research benchmark built to evaluate the viability of performing real audio-to-text forced alignment on Quranic recitations using a generic Arabic acoustic CTC model.

---

## Objective
The goal is to determine if a generic grapheme-based Arabic acoustic model can provide real, accurate letter-level and word-level timestamps on real recitation audio by solving the CTC emission path mathematically, rather than using duration heuristics, VAD-based spacing, or proportional time distribution.

---

## Strict Implementation Rules
This benchmark adheres to these rigid scientific principles:
1. **No Synthetic Timestamps**: All word and ayah timestamps must originate exclusively from the acoustic model's frame emissions and trellis back-tracking path.
2. **No Duration Derivation**: Timestamps must not be derived using syllable counts, text lengths, or expected durations.
3. **No Proportional Timing**: Distributing durations evenly or dividing word segments equally is strictly forbidden.
4. **Honest Failure Detection**: If a model drops character activations, blocks the trellis paths, or exhibits abnormal word durations, the engine marks the run as a failure (`alignmentSuccess = False`) rather than silently patching it.

---

## Directory Structure
- `run_benchmark.py`: Core execution script containing the CTC Viterbi trellis solver, reversible text normalization layer, audio fetcher, and Tajweed stress tester.
- `audio/`: Directory caching real downloaded audio recitations from EveryAyah.com.
- `output/`: Directory holding individual test case alignment reports and global run summaries.

---

## Phases of Evaluation

### Phase 1: Benchmark Input Configuration
Three test cases represent three distinct, difficult recitation styles:
1. **Clear Murattal**: Mishary Alafasy (Surah 67:1-3) - Standard pacing, modern high-fidelity studio recording.
2. **Slow Mujawwad**: Abdul Basit (Surah 67:1-2) - Extreme vowel elongations (Madd), melodic, dramatic timing.
3. **Fast Hadr**: Saood ash-Shuraym (Surah 67:1-3) - Rapid, continuous recitation with words bleeding together.

### Phase 2: Fact-Check of Model A
The model evaluated is `jonatasgrosman/wav2vec2-large-xlsr-53-arabic`. It is treated strictly as a **generic Arabic grapheme-based CTC model** and is never described as "Quran-trained" or "Tajweed-trained."

### Phase 3: CTC Trellis forced-alignment
A mathematically complete CTC trellis forced-alignment solver is implemented. It calculates the transitions:
- Self-loops (staying in the current token).
- Standard transitions (moving to the next token).
- CTC skip transitions (skipping intermediate blank states).

### Phase 4: Reversible Normalization Layer
An explicit mapping layer normalizes Uthmani text to matches the model's vocabulary:
- Strips diacritics and Tajweed marks (Tanween, Shaddah, Sukun, Waqf markers).
- Maps special Quranic characters (e.g., Alif Khanjariya `\u0670`, Alif Waslah `\u0671`) to generic targets.
- Preserves indices to map character-level frames back to original canonical words.

### Phase 5 & 6: Detailed Outputs and Failure Detection
Detects anomalies including blocked trellis paths, zero acoustic evidence for letters, repeated token collapses, or suspicously long word durations (>5 seconds) without Madd rules.

### Phase 7 & 8: Tajweed Stress Test and Accuracy Rating
Categorizes and detects error thresholds against ground truth:
- `<200ms` = Excellent
- `200–500ms` = Good
- `500–1000ms` = Needs Improvement
- `>1000ms` = Failure

---

## Setup & Running Locally

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv benchmark_env
   source benchmark_env/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install torch torchaudio transformers numpy soundfile
   ```

3. Run the benchmark:
   ```bash
   python benchmark/run_benchmark.py
   ```
