# MODEL B vs MODEL C FORENSIC BENCHMARK COMPARISON

This document summarizes the scientific validation comparing **Model B** (`rabah2026/wav2vec2-large-xlsr-53-arabic-quran-v_final`) and **Model C** (`TBOGamer22/wav2vec2-quran-phonetics`) on identical real audio test files across Surahs 67, 108, and 112.

---

## 1. COMPARISON MATRIX

| Parameter | MODEL B | MODEL C |
| :--- | :---: | :---: |
| **Real inference** | **YES** | **YES** |
| **CTC logits** | **YES** | **YES** |
| **CTC alignment** | **YES** | **NO** (Blocks on standard text) |
| **Token timestamps** | **YES** | **NO** |
| **Word timestamps** | **YES** | **NO** |
| **Ayah timestamps** | **YES** | **NO** |
| **Uthmani handling** | **YES** (With Normalization Layer) | **NO** (Treats Arabic as `[UNK]`) |
| **Murattal** | **PASS** | **FAIL** (Requires external G2P) |
| **Mujawwad** | **FAIL** | **FAIL** |
| **Hadr** | **PASS** | **FAIL** |
| **Unseen reciter** | **PASS** | **FAIL** |
| **Drift** | **PASS** (Mild Drift) | **FAIL** (Catastrophic Drift) |
| **Independent ground truth** | **YES** (Ayah-only) | **YES** (Ayah-only) |
| **Numerical MAE available** | **YES** (Ayah-only) | **NO** (Failed tokenization) |
| **License clear** | **NO** (Needs Resolution) | **NO** (Non-commercial training corpus) |
| **Production ready** | **NO** | **NO** |

---

## 2. FINAL CLASSIFICATIONS

### MODEL B Classification: **B (Usable only under restricted conditions)**
- **Scientific Verdict**: Model B represents an exceptional academic achievement, offering highly precise, sub-frame alignments for clear Murattal studio recitations. However, it fails on slow Mujawwad elongations due to CTC emission decay on sustained vowels, and has licensing ambiguities that must be resolved before commercial or unrestricted open-source distribution.

### MODEL C Classification: **D (Not performing the claimed alignment)**
- **Scientific Verdict**: Model C cannot be used for forced alignment of standard Quranic texts. Because its vocabulary is strictly Latin transliteration, it instantly rejects Uthmani Arabic script. It is an ASR phonetic transcriber, not an out-of-the-box forced aligner.

---

## 3. ARCHITECTURAL DECISION
**DO NOT DEPLOY ANY CANDIDATE TO PRODUCTION.**

Retain the active, high-performance **VAD/Acoustic Engine** in the production application. Integrating either of these models directly into the React editor is strictly postponed until a robust Grapheme-to-Phoneme (G2P) translation layer is fully engineered.
