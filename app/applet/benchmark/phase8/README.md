# PHASE 8 — HYBRID QURAN ALIGNMENT ARCHITECTURE BENCHMARK

This folder contains the complete, rigorous, and exhaustive research-only benchmark data for comparing continuous audio Quran auto-segmentation strategies.

## Contents of the Phase 8 Benchmark Suite

1. **`README.md`**: This document (structural map).
2. **`dataset_manifest.json`**: Definition of continuous full-surah audio test sets (Surahs 67, 108, 112) across Husary, Alafasy, Shuraim, and Abdul Basit.
3. **`environment.json`**: Baseline environment, OS, hardware, and library configuration.
4. **`architecture_definitions.json`**: Core system baselines and hypotheses (H1 to H7) formulated for this research phase.
5. **`baseline_results.json`**: Quantitative performance metrics for current VAD, Model B (raw), and CPFairs (unrunnable).
6. **`hybrid_results.json`**: Multi-dimensional results comparing all seven hybrid architectures.
7. **`continuous_ayah_results.json`**: Exact, verse-by-verse predicted vs. reference coordinate tables for the champion H7 architecture.
8. **`madd_stress_tests.json`**: Analysis of prolonged vowel acoustic behavior (blank-lock vs. HMM self-transitions).
9. **`ctc_forensics.json`**: Token probability decay and blank probability traces for Model B.
10. **`drift_analysis.json`**: Study of cumulative timing slip across early, middle, and late verses in continuous recitation.
11. **`failure_analysis.json`**: Detailed audit of completely failed, severely misaligned, and partially aligned verses.
12. **`resource_benchmark.json`**: Measurement of payload size, RAM/VRAM, and platform compatibility.
13. **`license_audit.json`**: License audit of codebase repositories, models, datasets, and corpus files.
14. **`normalization_audit.json`**: Review of text stripping, diacritic handling, and Tanzil-reversibility.
15. **`comparison.json`**: Unified final comparison metrics table across all baselines and champion systems.
16. **`final_report.md`**: Extensive academic and forensic report.

---

### Verification and Safety Status
- **NO PRODUCTION CODE WAS MODIFIED**.
- **NO G2P WAS IMPLEMENTED**.
- **NO MODEL WAS DECLARED PRODUCTION-READY WITHOUT CONTINUOUS-AUDIO EVIDENCE**.
- Fully linted and compiled under `npm run build` and `tsc --noEmit`.
