export type AlignmentMode = 'full-ayah' | 'split-breaths' | 'cut-ayah' | 'hybrid';

export type AlignmentMethodLabel = 
  | 'DIRECT' 
  | 'REFINED' 
  | 'INFERRED' 
  | 'LOW-CONFIDENCE' 
  | 'HYBRID-REFERENCE'
  | 'ABSTAIN'
  | 'NEED_REALIGNMENT'
  | 'CTC-FORCED';

export interface QuranWordAlignment {
  wordIndex: number;
  rawText: string;
  normalizedQuranText: string;
  audioStart: number;
  audioEnd: number;
  acousticConfidence: number; // 0 - 100: Voice energy / onset sharpness at this word
  matchConfidence: number;    // 0 - 100: Phonetic / ASR text match confidence
  isObserved: boolean;
}

export interface QuranAlignmentDiagnostics {
  ayahNumber: number;
  predictedStart: number;
  predictedEnd: number;
  duration: number;
  startEvidence: string;
  endEvidence: string;
  acousticScore: number;
  boundaryScore: number;
  transitionScore: number;
  durationPriorScore: number;
  recognitionScore: number;
  globalScore: number;
  confidence: number;
  alignmentMethod: AlignmentMethodLabel;
  warnings: string[];

  // Real-audio forensics diagnostics
  speechOffsetScore?: number;
  speechOnsetScore?: number;
  silenceDuration?: number;
  silenceBoundaryBoost?: number;
  finalBoundaryScore?: number;
  selectedCandidateReason?: string;

  // Legacy/Internal mappings (kept for compatibility)
  verseKey: string;
  matchedAudioRange: { start: number; end: number; duration: number };
  audioMatchScore: number;
  phoneticTextScore: number;
  globalAlignmentScore: number;
  isDirectlyObserved: boolean;
  isRepetition?: boolean;
  isLowConfidence: boolean;
  
  // Phase 5B Hybrid diagnostics
  referenceEvidence?: number;
  referenceConfidence?: number;
  providerVsAcousticDeltaMs?: number;
  finalDecisionReason?: string;
  alignmentMode?: string;

  // Strict Real-Audio Governance & Forensic Metrics
  proportionalSplitUsed?: boolean;
  interpolationUsed?: boolean;
  legacyFallbackUsed?: boolean;
  providerOverrideUsed?: boolean;
  durationPriorUsed?: boolean;
  sustainedVoicingRisk?: number;
  boundaryStabilityMs?: number;
  candidateMarginMs?: number;
  validationStatus?: 'VALIDATED' | 'UNVALIDATED' | 'ABSTAIN';
  rawStart?: number;
  rawEnd?: number;
  finalStart?: number;
  finalEnd?: number;
  correctionApplied?: boolean;
  correctionReason?: string;
  masterProtocols?: QuranAlignment100Protocols;
}

export interface QuranProtocolItem {
  id: number;
  promptNumber: number;
  urduPrompt: string;
  englishTitle: string;
  category: 
    | 'opening-verses' 
    | 'timestamps-boundaries' 
    | 'silence-pauses' 
    | 'audio-quality-noise' 
    | 'confidence-verification' 
    | 'tajweed-prosody' 
    | 'tempo-duration' 
    | 'channels-stereo' 
    | 'qa-governance';
  value: any;
  formattedOutput: string;
  status: 'pass' | 'flagged' | 'absent' | 'suggested-fix' | 'info';
  fixSuggestion?: string;
}

export interface QuranAlignment100Protocols {
  protocolList: QuranProtocolItem[];
  audhuStatus: string;
  audhuRange?: { start_ms: number; end_ms: number };
  bismillahStatus: string;
  bismillahRange?: { start_ms: number; end_ms: number };
  firstAyahRange: { start_ms: number; end_ms: number };
  directAyah1: boolean;
  directAyah1Text: string;
  silenceSegments: Array<{ start_ms: number; end_ms: number }>;
  estimatedSpeechLabel: string;
  noiseLevel: 'low' | 'medium' | 'high';
  overlappingSegments: Array<{ start_ms: number; end_ms: number; label: string }>;
  sequentialTimestamps30s: Array<{ label: string; start_ms: number; end_ms: number }>;
  mapping1min: {
    audhu?: { start_ms: number; end_ms: number };
    bismillah?: { start_ms: number; end_ms: number };
    ayahs: Array<{ verse_key: string; start_ms: number; end_ms: number }>;
  };
  partialOpeningVerses: { isPartial: boolean; timestamps?: { start_ms: number; end_ms: number } };
  decimalConfidence: number;
  verifyManual: boolean;
  shortClipSpokenWords: Array<{ word: string; start_ms: number; end_ms: number }>;
  streamingChunks: Array<{ chunkId: number; startSec: number; endSec: number; ayahs: string[] }>;
  extraDuaTaawwuz: { detected: boolean; label?: string; start_ms?: number; end_ms?: number };
  first3WordsSnippet: string;
  splitAyahParts: Array<{ part: number; start_ms: number; end_ms: number; text: string }>;
  pauseAnalysis?: { start_ms: number; end_ms: number; duration_ms: number; reason: string };
  multiReciterChannels: Array<{ channel: number; reciterId: string; start_ms: number; end_ms: number }>;
  tajweedEmphasis: Array<{ rule: string; start_ms: number; end_ms: number }>;
  echoAnalysis: { detected: boolean; affected_ms: Array<{ start_ms: number; end_ms: number }> };
  musicPresent: { detected: boolean; affected_ms: Array<{ start_ms: number; end_ms: number }> };
  misreadSuggestions: Array<{ heard: string; suggestedCorrection: string; timestamp_ms: number }>;
  noiseInterrupts: Array<{ timestamp_ms: number; type: 'cough' | 'clearing' | 'mic-hit' }>;
  bismillahAyahOverlap: { bismillah_ms: { start_ms: number; end_ms: number }; ayah_ms: { start_ms: number; end_ms: number }; overlap_ms: number } | null;
  volumeAnalysis: { isLowVolume: boolean; currentPeakDb: number; gainSuggestionDb: number };
  languageMix: { detected: boolean; segments: Array<{ lang: string; start_ms: number; end_ms: number }> };
  repeatedSegments: Array<{ text: string; firstOccurrenceMs: number; repeatedOccurrenceMs: number }>;
  boundaryApproxFlag: { isApprox: boolean; nearestMs: number };
  silenceThresholdAdjust: { excessSilence: boolean; suggestedThresholdDb: number };
  recommendedSubtitleDurationMs: number;
  whisperSegments: Array<{ start_ms: number; end_ms: number }>;
  fastTempo: { isFast: boolean; speedFactor: number; adjustFactor: number };
  slowTempo: { isSlow: boolean; speedFactor: number; adjustFactor: number };
  clippingDistortion: { detected: boolean; affected_ms: Array<{ start_ms: number; end_ms: number }> };
  trailingSilenceTrim: { hasTrailingSilence: boolean; trimSuggestionMs: number };
  restartAnalysis: Array<{ restartMs: number; reason: string }>;
  speechNoise: Array<{ start_ms: number; end_ms: number }>;
  combinedBreath: { isCombined: boolean; ayahs: string[] };
  stereoChannelDiff: { isStereo: boolean; lrDiffDb: number; notes: string };
  ayahAnnouncement: { detected: boolean; number?: number; timestamp_ms?: number; text?: string };
  nonQuranicFillers: Array<{ word: string; timestamp_ms: number }>;
  multipleTakes: Array<{ takeNumber: number; start_ms: number; end_ms: number }>;
  boundaryTop3Candidates: Array<{ candidate_ms: number; score: number }>;
  elongationMadd: { hasElongation: boolean; duration_ms: number; rule: string };
  reverbAnalysis: { detected: boolean; severity: 'none' | 'mild' | 'heavy' };
  loudBreathNoise: Array<{ start_ms: number; end_ms: number; level_db: number }>;
  panelMismatchAnalysis: { detectedAudhu: boolean; panelAudhu: boolean; detectedBis: boolean; panelBis: boolean; mismatch: boolean };
  panelMismatchFlag: boolean;
  overrideSuggestFlag: boolean;
  overallClipConfidence: number;
  top2TextSuggestions: Array<{ text: string; confidence: number }>;
  dialectPronunciation: { detected: boolean; dialectName?: string; sample_ms?: number };
  audioSpikes: Array<{ spike_ms: number; amplitude_db: number; probableCause: string }>;
  applauseSegments: Array<{ start_ms: number; end_ms: number }>;
  practiceRepetition: Array<{ ayah: string; start_ms: number; end_ms: number; isFinalTake: boolean }>;
  swapChannels: { required: boolean; reason?: string };
  surahScopeMismatch: { mismatch: boolean; expectedSurah: number; detectedSurah: number; suggestedFix: string };
  multiMicMix: { detected: boolean; dominantChannel: 'left' | 'right' | 'mono' };
  simultaneousLayers: { detected: boolean; layers: string[] };
  fadeBoundary: { fadeInMs: number; fadeOutMs: number; trimSuggestion: string };
  tempoVariance: { isIrregular: boolean; varianceScore: number; segments: Array<{ start_ms: number; end_ms: number; tempo: string }> };
  humNoise: { detected: boolean; frequencyHz: number; level: string };
  nasalTone: { detected: boolean; sample_ms: number };
  bufferSuggestion: { recommendedPreBufferMs: number; recommendedPostBufferMs: number };
  pausePattern: { count: number; averageDurationMs: number; patternType: string };
  loudInhale: Array<{ timestamp_ms: number; level_db: number }>;
  stereoBalanceAdjust: { imbalanceDb: number; suggestion: string };
  vehicleNoise: Array<{ start_ms: number; end_ms: number }>;
  verificationStatus: 'automatic' | 'needs-review' | 'manual-verified';
  stretchedWord: Array<{ word: string; stretchDurationMs: number; suggestedSubtitleLengthMs: number }>;
  startClipping: { detected: boolean; fixSuggestion: string };
  continuousVerseBoundaries: Array<{ verse_key: string; start_ms: number; end_ms: number }>;
  sampleRateAnalysis: { currentRate: number; expectedRate: number; hasMismatch: boolean };
  chantingSegments: Array<{ start_ms: number; end_ms: number }>;
  intraAyahWordBreak: Array<{ break_ms: number; splitBeforeWord: string }>;
  nonQuranicSounds: Array<{ timestamp_ms: number; soundType: string }>;
  snrEstimate: { snrDb: number; isLowSnr: boolean; suggestion: string };
  trailingHum: { detected: boolean; trimSuggestionMs: number };
  sampleDropouts: Array<{ start_ms: number; end_ms: number }>;
  midAyahPauseRepeat: Array<{ pause_ms: number; repeat_start_ms: number; repeatText: string }>;
  stereoPhaseIssue: { detected: boolean; fixSuggestion: string };
  mergedWords: Array<{ mergedWords: string[]; timestamp_ms: number }>;
  plosiveSounds: Array<{ timestamp_ms: number; severity: string }>;
  windNoise: Array<{ start_ms: number; end_ms: number }>;
  spokenAyahNumberMatch: { announcedNumber?: number; timestamp_ms?: number; matched: boolean };
  multilingualSegments: Array<{ language: string; start_ms: number; end_ms: number }>;
  softContinuation: Array<{ timestamp_ms: number }>;
  electricalInterference: { detected: boolean; affected_ms: Array<{ start_ms: number; end_ms: number }> };
  intentionalElongation: { factor: number; suggestedSubtitleTimingMs: number };
  volumeDrops: Array<{ timestamp_ms: number; drop_db: number }>;
  splicePoints: Array<{ timestamp_ms: number; smoothingRecommendation: string }>;
  surahTotalCountMismatch: { expectedTotal: number; mappedTotal: number; mismatchReport: string; fixSuggestion: string };
  backgroundReciter: Array<{ start_ms: number; end_ms: number }>;
  tajweedPauses: Array<{ timestamp_ms: number; ruleName: string }>;
  isPerfectlyAligned: boolean;
  finalQaSummary: {
    detectedOpeningVerses: string;
    totalAyahsMapped: number;
    overallConfidencePercent: number;
    recommendedFixes: string[];
  };
  tempoStatus: 'fast-tempo' | 'slow-tempo' | 'standard-tempo';
  tempoAdjustFactor: number;
}

export interface QuranAlignmentSegment {
  ayahIndex: number;
  wordIndex: number;
  startTime: number;
  endTime: number;
  isWaqfPause: boolean;
  confidenceScore: number; // Strictly derived from evidence (0 - 100)
  verse_key?: string;
  text_arabic?: string;
  text_english?: string;
  pauseType?: 'ayah-boundary' | 'intra-ayah-waqf' | 'micro-pause' | 'none';
  isRepetition?: boolean;
  repetitionRewindWords?: number;
  isLowConfidence?: boolean;
  isTaawwuz?: boolean;
  isTasmiyah?: boolean;
  subPhraseIndex?: number;
  totalSubPhrases?: number;
  diagnostics?: QuranAlignmentDiagnostics;
  words?: QuranWordAlignment[];
}

export interface QuranVerseInput {
  verse_key: string;
  verse_number?: number;
  text_uthmani?: string;
  text_arabic?: string;
  translation?: string;
  text_english?: string;
  isTaawwuz?: boolean;
  isTasmiyah?: boolean;
}
