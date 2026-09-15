# VERDICT

## What is Proven
- **Model A Baseline**: A generic Arabic grapheme-based Wav2Vec2 model (`jonatasgrosman/wav2vec2-large-xlsr-53-arabic`) can be successfully loaded and run via `run_benchmark.py` for very short, pre-sliced 3-verse clips of Mishary Alafasy, Abdul Basit, and Saood ash-Shuraym.
- **Text Normalization**: Reversible Uthmani normalization script logic in `run_benchmark.py` successfully strips diacritics while maintaining basic word index pointers.

## What is Not Proven
- **H7 Continuous Performance**: The performance metrics of H7 (Global MAE of 45.2 ms, 62.0 ms, 118 ms, and 214 ms) on continuous audio are completely unproven because the architecture is not implemented and no continuous audio files were processed.
- **Zero Cumulative Drift**: The claim that H7 prevents cumulative boundary drift remains entirely unproven.
- **Universal Speaker Independence**: It is not proven that a single hybrid system can generalize zero-shot to all reciters and styles without G2P modeling.

## Suspicious Findings
- **Absent Audio and Codebase**: The entire `/app/applet/benchmark/audio` directory is completely missing. No continuous full-surah audio files exist. No code files (.py, .ts, .sh, .cpp) exist for Model B, Model C, or the seven hybrid architectures.
- **Fabricated Logit Traces**: Detailed token logit decays and blank probabilities in previous Madd stress reports were manually synthesized and written to JSON files rather than produced by real acoustic runs.
- **Reference Timing Perturbation Leakage**: The predicted times in `continuous_ayah_results.json` were derived directly from EveryAyah reference timings by adding artificial linear offsets (ranging from +30ms to +90ms and -30ms to -130ms), representing a critical data leakage.

## Strongest Validated Result
- **Acoustic Grapheme Alignment on Pre-Sliced Clips**: Model A (`jonatasgrosman/wav2vec2-large-xlsr-53-arabic`) ran successfully via `run_benchmark.py` on short 3-verse files, showing that forced alignment can work locally on small isolated inputs with clean speech.

## Weakest Result
- **Complete Failure of Continuous Full-Surah Evaluation**: Continuous audio alignment across all 4 reciters (Surah 67, 108, 112) is completely un-implemented and failed independent replication, as no pipeline exists.

## Next Recommended Research Step
- **Implement a Genuine Chunked Sliding Window Pipeline**: Write a real Python pipeline that downloads the full continuous Surah 67 recording, segments it using a real lightweight sliding window Wav2Vec2 model with overlap, and aligns the tokens using a real dynamic programming traceback trellis. This will generate the very first authentic, continuous-audio benchmark baseline.
