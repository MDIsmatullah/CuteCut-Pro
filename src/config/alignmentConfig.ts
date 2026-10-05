/**
 * STRICT REAL-AUDIO ALIGNMENT CONFIGURATION (PRODUCTION GOVERNANCE)
 * 
 * Absolute hard rules governing Quranic audio alignment and AutoSegment.
 * In strict real-audio mode, mathematical proportional splits, duration-based
 * interpolation, and synthetic fallback boundaries are strictly forbidden.
 */

export const STRICT_REAL_AUDIO: boolean = true;

export const ALLOW_PROPORTIONAL_SPLIT: boolean = false;
export const ALLOW_INTERPOLATION: boolean = false;
export const ALLOW_LEGACY_FALLBACK: boolean = false;
export const ALLOW_PROVIDER_OVERRIDE: boolean = false;

export const REQUIRE_ACOUSTIC_OR_INDEPENDENT_ALIGNMENT: boolean = true;
export const ABSTAIN_ON_LOW_EVIDENCE: boolean = true;

export interface AlignmentExecutionGovernance {
  strictRealAudio: boolean;
  allowProportionalSplit: boolean;
  allowInterpolation: boolean;
  allowLegacyFallback: boolean;
  allowProviderOverride: boolean;
  requireAcousticOrIndependentAlignment: boolean;
  abstainOnLowEvidence: boolean;
}

export const DEFAULT_ALIGNMENT_GOVERNANCE: AlignmentExecutionGovernance = {
  strictRealAudio: STRICT_REAL_AUDIO,
  allowProportionalSplit: ALLOW_PROPORTIONAL_SPLIT,
  allowInterpolation: ALLOW_INTERPOLATION,
  allowLegacyFallback: ALLOW_LEGACY_FALLBACK,
  allowProviderOverride: ALLOW_PROVIDER_OVERRIDE,
  requireAcousticOrIndependentAlignment: REQUIRE_ACOUSTIC_OR_INDEPENDENT_ALIGNMENT,
  abstainOnLowEvidence: ABSTAIN_ON_LOW_EVIDENCE,
};
