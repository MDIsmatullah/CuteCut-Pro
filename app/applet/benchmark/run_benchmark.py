import os
import sys
import json
import urllib.request
import time
import numpy as np
import torch
import torchaudio
from transformers import Wav2Vec2Processor, Wav2Vec2ForCTC

# Define directories
BENCHMARK_DIR = "benchmark"
AUDIO_DIR = os.path.join(BENCHMARK_DIR, "audio")
OUTPUT_DIR = os.path.join(BENCHMARK_DIR, "output")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------
# PHASE 1: CONFIGURABLE BENCHMARK DATASET
# ---------------------------------------------------------
TEST_CASES = [
    {
        "id": "case_1_alafasy_murattal",
        "surah": 67,
        "ayah_range": (1, 3),
        "reciter": "Mishary_Alafasy_128kbps",
        "style": "Clear Murattal (Standard pacing, modern studio recording)",
        "audio_urls": [
            "https://everyayah.com/data/Mishary_Alafasy_128kbps/067001.mp3",
            "https://everyayah.com/data/Mishary_Alafasy_128kbps/067002.mp3",
            "https://everyayah.com/data/Mishary_Alafasy_128kbps/067003.mp3"
        ],
        "canonical_text": [
            "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
            "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَٰوةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ",
            "ٱلَّذِى خَلَقَ سَبْعَ سَمَٰوَٰتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَٰنِ مِن تَفَٰوُتٍ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ"
        ]
    },
    {
        "id": "case_2_basit_mujawwad",
        "surah": 67,
        "ayah_range": (1, 2),
        "reciter": "Abdul_Basit_Mujawwad_128kbps",
        "style": "Slow Mujawwad (Extreme vowel elongations/Madd, highly melodic, long breaths)",
        "audio_urls": [
            "https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/067001.mp3",
            "https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/067002.mp3"
        ],
        "canonical_text": [
            "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
            "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَٰوةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ"
        ]
    },
    {
        "id": "case_3_shuraim_fast",
        "surah": 67,
        "ayah_range": (1, 3),
        "reciter": "Saood_ash_Shuraym_128kbps",
        "style": "Fast Hadr (Rapid continuous recitation, words bleed together, minimal pauses)",
        "audio_urls": [
            "https://everyayah.com/data/Saood_ash_Shuraym_128kbps/067001.mp3",
            "https://everyayah.com/data/Saood_ash_Shuraym_128kbps/067002.mp3",
            "https://everyayah.com/data/Saood_ash_Shuraym_128kbps/067003.mp3"
        ],
        "canonical_text": [
            "تَبَٰرَكَ ٱلَّذِى بِيَدِهِ ٱلْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَىْءٍ قَدِيرٌ",
            "ٱلَّذِى خَلَقَ ٱلْمَوْتَ وَٱلْحَيَٰوةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ ٱلْعَزِيزُ ٱلْغَفُورُ",
            "ٱلَّذِى خَلَقَ سَبْعَ سَمَٰوَٰتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِى خَلْقِ ٱلرَّحْمَٰنِ مِن تَفَٰوُتٍ ۖ فَٱرْجِعِ ٱلْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ"
        ]
    }
]

# ---------------------------------------------------------
# PHASE 4: REVERSIBLE NORMALIZATION LAYER
# ---------------------------------------------------------
def normalize_quran_text(text: str) -> tuple[str, list[dict]]:
    """
    Normalizes complex Uthmani script into bare Arabic characters 
    suitable for the generic Wav2Vec2 tokenizer vocabulary, 
    while preserving strict word-level and letter-level offsets mapping back
    to the original Canonical Uthmani text.
    """
    # Character maps
    alif_normalize = {'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا'}
    ta_marbouta = {'ة': 'ه'}
    alif_maqsura = {'ى': 'ا'}
    hamza_normalization = {'ؤ': 'ء', 'ئ': 'ء'}
    
    canonical_words = text.split()
    normalized_words = []
    mapping = []
    
    for word_idx, word in enumerate(canonical_words):
        norm_word_chars = []
        for char_idx, char in enumerate(word):
            # Skip diacritics / tajweed marks
            if '\u064B' <= char <= '\u065F' or '\u0670' <= char <= '\u0671' or '\u06D6' <= char <= '\u06ED' or '\u0610' <= char <= '\u061A':
                if char == '\u0671':
                    norm_char = 'ا'
                else:
                    continue
            else:
                norm_char = char
            
            # Map specific characters
            if norm_char in alif_normalize:
                norm_char = alif_normalize[norm_char]
            elif norm_char in ta_marbouta:
                norm_char = ta_marbouta[norm_char]
            elif norm_char in alif_maqsura:
                norm_char = alif_maqsura[norm_char]
            elif norm_char in hamza_normalization:
                norm_char = hamza_normalization[norm_char]
            
            # Strip Tatweel/Kashida
            if norm_char == '\u0640':
                continue
                
            # Filter to strictly Arabic letters
            if '\u0621' <= norm_char <= '\u064A':
                norm_word_chars.append(norm_char)
                mapping.append({
                    "char": norm_char,
                    "canonical_word_idx": word_idx,
                    "canonical_word": word,
                    "char_in_word_idx": char_idx
                })
        
        normalized_words.append("".join(norm_word_chars))
        if word_idx < len(canonical_words) - 1:
            mapping.append({
                "char": " ",
                "canonical_word_idx": -1,
                "canonical_word": " ",
                "char_in_word_idx": -1
            })
            
    normalized_full_text = " ".join(normalized_words)
    return normalized_full_text, mapping

# ---------------------------------------------------------
# PHASE 3: CTC TRELLIS FORCED ALIGNMENT ENGINE
# ---------------------------------------------------------
def ctc_forced_alignment(emissions: torch.Tensor, target_ids: list[int], blank_id: int = 0) -> tuple[list[int], float]:
    """
    Computes CTC trellis forced alignment via Viterbi.
    """
    num_frames = emissions.shape[0]
    expanded_targets = []
    for t in target_ids:
        expanded_targets.extend([blank_id, t])
    expanded_targets.append(blank_id)
    
    num_states = len(expanded_targets)
    trellis = torch.full((num_frames, num_states), -float("inf"), dtype=torch.float32)
    backpointers = torch.full((num_frames, num_states), -1, dtype=torch.int32)
    
    trellis[0, 0] = emissions[0, blank_id]
    if num_states > 1:
        trellis[0, 1] = emissions[0, expanded_targets[1]]
        
    for t in range(1, num_frames):
        for s in range(num_states):
            p_stay = trellis[t-1, s]
            best_prev_state = s
            
            if s > 0:
                p_prev = trellis[t-1, s-1]
                if p_prev > p_stay:
                    p_stay = p_prev
                    best_prev_state = s - 1
            
            if s > 1:
                current_token = expanded_targets[s]
                skip_token = expanded_targets[s-2]
                if current_token != blank_id and skip_token != blank_id and current_token != skip_token:
                    p_skip = trellis[t-1, s-2]
                    if p_skip > p_stay:
                        p_stay = p_skip
                        best_prev_state = s - 2
                        
            token_id = expanded_targets[s]
            em_prob = emissions[t, token_id].item()
            trellis[t, s] = p_stay + em_prob
            backpointers[t, s] = best_prev_state
            
    s_end = num_states - 1
    if trellis[num_frames-1, num_states-2] > trellis[num_frames-1, num_states-1]:
        s_end = num_states - 2
        
    path_score = trellis[num_frames-1, s_end].item()
    if path_score == -float("inf"):
        return [], path_score
        
    state_path = []
    curr_s = s_end
    for t in range(num_frames - 1, -1, -1):
        state_path.append(curr_s)
        curr_s = backpointers[t, curr_s].item()
        
    state_path.reverse()
    aligned_token_frames = []
    for s in state_path:
        if s % 2 == 1:
            target_idx = (s - 1) // 2
            aligned_token_frames.append(target_idx)
        else:
            aligned_token_frames.append(-1)
            
    return aligned_token_frames, path_score

def download_audio_files(case_id: str, urls: list[str]) -> list[str]:
    local_paths = []
    for idx, url in enumerate(urls):
        filename = f"{case_id}_ayah_{idx+1}.mp3"
        local_path = os.path.join(AUDIO_DIR, filename)
        if not os.path.exists(local_path):
            print(f"  -> Downloading real audio: {url}...")
            try:
                urllib.request.urlretrieve(url, local_path)
            except Exception as e:
                print(f"  ⚠️ Warning: Failed to download: {e}")
                return []
        local_paths.append(local_path)
    return local_paths

def detect_tajweed_features(canonical_words: list[str]) -> list[dict]:
    detected = []
    for idx, word in enumerate(canonical_words):
        features = []
        if '\u0653' in word or '\u0670' in word:
            features.append("Madd (Elongation)")
        if idx < len(canonical_words) - 1:
            next_word = canonical_words[idx+1]
            if word.endswith('اً') or word.endswith('ٍ') or word.endswith('ٌ') or word.endswith('نْ') or word.endswith('ن'):
                if next_word.startswith('ي') or next_word.startswith('م') or next_word.startswith('ل') or next_word.startswith('و') or next_word.startswith('ر'):
                    features.append("Idgham (Assimilation)")
        if 'نۢ' in word or 'ن' in word and idx < len(canonical_words) - 1 and canonical_words[idx+1].startswith('ب'):
            features.append("Iqlab (Conversion)")
        if any(c in word for c in ['ق', 'ط', 'ب', 'ج', 'د']):
            features.append("Qalqalah (Echo)")
        if features:
            detected.append({
                "word_idx": idx,
                "word": word,
                "features": features
            })
    return detected

def run_benchmark():
    print("==================================================")
    print("QURAN AUDIO-TO-TEXT FORCED ALIGNMENT RESEARCH BENCHMARK")
    print("==================================================")
    
    model_name = "jonatasgrosman/wav2vec2-large-xlsr-53-arabic"
    print(f"\n[Phase 2] Loading Generic Arabic Grapheme-Based CTC Model: {model_name}...")
    
    start_load = time.time()
    try:
        processor = Wav2Vec2Processor.from_pretrained(model_name)
        model = Wav2Vec2ForCTC.from_pretrained(model_name)
        model.eval()
        print(f"  ✔ Model loaded successfully in {time.time() - start_load:.2f}s!")
    except Exception as e:
        print(f"❌ Failed to load Model A ({model_name}): {e}")
        sys.exit(1)
        
    vocab = processor.tokenizer.get_vocab()
    print(f"  Tokenizer Vocabulary Size: {len(vocab)} tokens")
    print(f"  Blank Token Index: {processor.tokenizer.pad_token_id}")
    
    global_results = []
    
    for case in TEST_CASES:
        print(f"\nTEST CASE: {case['id']}")
        audio_paths = download_audio_files(case["id"], case["audio_urls"])
        if not audio_paths:
            print("❌ Skipping test case because audio is unavailable.")
            continue
            
        waveforms = []
        ayah_boundaries_ground_truth = []
        current_time_offset = 0.0
        
        for idx, path in enumerate(audio_paths):
            try:
                waveform, sr = torchaudio.load(path)
                if sr != 16000:
                    resampler = torchaudio.transforms.Resample(orig_freq=sr, new_freq=16000)
                    waveform = resampler(waveform)
                    sr = 16000
                if waveform.shape[0] > 1:
                    waveform = torch.mean(waveform, dim=0, keepdim=True)
                duration = waveform.shape[1] / sr
                waveforms.append(waveform)
                ayah_boundaries_ground_truth.append({
                    "ayah": case["ayah_range"][0] + idx,
                    "start": current_time_offset,
                    "end": current_time_offset + duration
                })
                current_time_offset += duration
            except Exception as e:
                print(f"❌ Failed to load audio file {path}: {e}")
                
        if not waveforms:
            continue
            
        full_waveform = torch.cat(waveforms, dim=1)
        sr = 16000
        total_duration = full_waveform.shape[1] / sr
        
        canonical_scripture = case["canonical_text"]
        normalized_scripture_list = []
        letter_mapping_list = []
        total_words_count = 0
        
        for text in canonical_scripture:
            norm, mapping = normalize_quran_text(text)
            normalized_scripture_list.append(norm)
            letter_mapping_list.append(mapping)
            total_words_count += len(text.split())
            
        full_normalized_text = " ".join(normalized_scripture_list)
        tajweed_stresses = detect_tajweed_features([w for txt in canonical_scripture for w in txt.split()])
        
        input_values = processor(full_normalized_text, return_tensors="pt").input_ids[0]
        target_token_ids = input_values.tolist()
        
        with torch.no_grad():
            inputs = processor(full_waveform[0].numpy(), sampling_rate=16000, return_tensors="pt")
            logits = model(inputs.input_values).logits[0]
            emissions = torch.log_softmax(logits, dim=-1)
            
        num_frames = emissions.shape[0]
        frame_resolution = total_duration / num_frames
        
        aligned_frames, path_score = ctc_forced_alignment(emissions, target_token_ids, blank_id=processor.tokenizer.pad_token_id)
        
        alignment_success = True
        failure_reasons = []
        if path_score == -float("inf") or len(aligned_frames) == 0:
            alignment_success = False
            failure_reasons.append("Trellis alignment path blocked")
            aligned_frames = [-1] * num_frames
            
        token_spans = []
        for token_idx in range(len(target_token_ids)):
            token_frames = [f for f, t in enumerate(aligned_frames) if t == token_idx]
            if token_frames:
                token_spans.append({
                    "token_idx": token_idx,
                    "char": processor.decode([target_token_ids[token_idx]]),
                    "start_frame": min(token_frames),
                    "end_frame": max(token_frames) + 1
                })
            else:
                token_spans.append({
                    "token_idx": token_idx,
                    "char": processor.decode([target_token_ids[token_idx]]),
                    "start_frame": -1,
                    "end_frame": -1
                })
                char_token = processor.decode([target_token_ids[token_idx]])
                if char_token != " " and alignment_success:
                    alignment_success = False
                    failure_reasons.append(f"Acoustic drop for character: '{char_token}'")
                    
        word_results = []
        flat_letter_mapping = []
        for ayah_idx, mapping in enumerate(letter_mapping_list):
            for m in mapping:
                m_copy = dict(m)
                m_copy["ayah_num"] = case["ayah_range"][0] + ayah_idx
                flat_letter_mapping.append(m_copy)
                
        word_accum_chars = []
        for idx, span in enumerate(token_spans):
            if idx >= len(flat_letter_mapping):
                break
            map_info = flat_letter_mapping[idx]
            if map_info["canonical_word_idx"] != -1:
                word_accum_chars.append({"span": span, "map_info": map_info})
                
            is_last = (idx == len(token_spans) - 1)
            is_next_space = False if is_last else (flat_letter_mapping[idx+1]["canonical_word_idx"] == -1)
            
            if (is_next_space or is_last) and word_accum_chars:
                valid_spans = [wc["span"] for wc in word_accum_chars if wc["span"]["start_frame"] != -1]
                if valid_spans:
                    start_sec = min(s["start_frame"] for s in valid_spans) * frame_resolution
                    end_sec = max(s["end_frame"] for s in valid_spans) * frame_resolution
                    score = path_score / num_frames
                    success_flag = True
                else:
                    start_sec = 0.0
                    end_sec = 0.0
                    score = 0.0
                    success_flag = False
                    
                first_char_map = word_accum_chars[0]["map_info"]
                word_results.append({
                    "surah": case["surah"],
                    "ayah": first_char_map["ayah_num"],
                    "canonicalWord": first_char_map["canonical_word"],
                    "normalizedWord": "".join(wc["span"]["char"] for wc in word_accum_chars),
                    "start": round(start_sec, 3),
                    "end": round(end_sec, 3),
                    "score": round(score, 2),
                    "aligned": success_flag
                })
                word_accum_chars = []
                
        ayah_results = []
        for idx in range(len(canonical_scripture)):
            ayah_num = case["ayah_range"][0] + idx
            ayah_words = [w for w in word_results if w["ayah"] == ayah_num and w["aligned"]]
            if ayah_words:
                pred_start = min(w["start"] for w in ayah_words)
                pred_end = max(w["end"] for w in ayah_words)
                duration = pred_end - pred_start
                score = np.mean([w["score"] for w in ayah_words])
            else:
                pred_start = 0.0
                pred_end = 0.0
                duration = 0.0
                score = 0.0
                alignment_success = False
                failure_reasons.append(f"Ayah {ayah_num} has no aligned words.")
                
            ayah_results.append({
                "surah": case["surah"],
                "ayah": ayah_num,
                "predictedStart": round(pred_start, 3),
                "predictedEnd": round(pred_end, 3),
                "duration": round(duration, 3),
                "alignmentScore": round(score, 2)
            })
            
        absolute_errors = []
        for idx, gt in enumerate(ayah_boundaries_ground_truth):
            pred = ayah_results[idx]
            if pred["predictedStart"] > 0.0:
                start_err = abs(pred["predictedStart"] - gt["start"]) * 1000
                end_err = abs(pred["predictedEnd"] - gt["end"]) * 1000
                absolute_errors.append((start_err + end_err) / 2)
                
        valid_errors = [e for e in absolute_errors if e != float("inf")]
        mae = np.mean(valid_errors) if valid_errors else float("inf")
        rating = "Excellent" if mae < 200 else "Good" if mae < 500 else "Needs Improvement" if mae < 1000 else "Failure"
        
        case_report = {
            "test_case_id": case["id"],
            "model_name": model_name,
            "alignment_success": alignment_success,
            "failure_reasons": failure_reasons,
            "ground_truth_accuracy": {
                "mae_ms": round(mae, 1) if mae != float("inf") else "FAILED",
                "category_rating": rating
            },
            "word_level_results": word_results,
            "ayah_level_results": ayah_results
        }
        
        global_results.append(case_report)
        with open(os.path.join(OUTPUT_DIR, f"{case['id']}_report.json"), "w", encoding="utf-8") as f:
            json.dump(case_report, f, indent=2, ensure_ascii=False)
            
    print("\nBenchmark ran successfully!")

if __name__ == "__main__":
    run_benchmark()
