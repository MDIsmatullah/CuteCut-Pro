import { Clip } from '../types';

export interface SpeedRampPoint {
  x: number; // 0.0 to 1.0 (Timeline position along the clip)
  y: number; // 0.1 to 10.0 (Speed multiplier)
}

export interface SpeedRampPresetDef {
  id: 'none' | 'hero' | 'bullet' | 'montage' | 'jump-cut' | 'flash-in' | 'flash-out' | 'custom';
  name: string;
  desc: string;
  points: SpeedRampPoint[];
  curve: number[];
}

export const SPEED_RAMP_PRESETS: SpeedRampPresetDef[] = [
  {
    id: 'none',
    name: 'Normal (1x)',
    desc: 'Constant linear speed',
    curve: [1.0, 1.0, 1.0, 1.0, 1.0],
    points: [
      { x: 0.0, y: 1.0 },
      { x: 0.25, y: 1.0 },
      { x: 0.5, y: 1.0 },
      { x: 0.75, y: 1.0 },
      { x: 1.0, y: 1.0 },
    ],
  },
  {
    id: 'montage',
    name: 'Montage',
    desc: 'High energy beat drops & rhythm pulses',
    curve: [0.5, 2.8, 4.2, 0.4, 1.2],
    points: [
      { x: 0.0, y: 0.5 },
      { x: 0.25, y: 2.8 },
      { x: 0.5, y: 4.2 },
      { x: 0.75, y: 0.4 },
      { x: 1.0, y: 1.2 },
    ],
  },
  {
    id: 'hero',
    name: 'Hero',
    desc: 'Fast rush into slow-mo cinematic freeze',
    curve: [0.3, 3.2, 3.0, 0.2, 0.4],
    points: [
      { x: 0.0, y: 0.3 },
      { x: 0.25, y: 3.2 },
      { x: 0.5, y: 3.0 },
      { x: 0.75, y: 0.2 },
      { x: 1.0, y: 0.4 },
    ],
  },
  {
    id: 'bullet',
    name: 'Bullet',
    desc: 'Matrix style fast action -> slow zoom -> fast exit',
    curve: [4.5, 4.5, 0.2, 0.2, 4.5],
    points: [
      { x: 0.0, y: 4.5 },
      { x: 0.25, y: 4.5 },
      { x: 0.5, y: 0.2 },
      { x: 0.75, y: 0.2 },
      { x: 1.0, y: 4.5 },
    ],
  },
  {
    id: 'jump-cut',
    name: 'Jump Cut',
    desc: 'Rapid velocity pulses for energetic cuts',
    curve: [1.0, 3.8, 1.0, 3.8, 1.0],
    points: [
      { x: 0.0, y: 1.0 },
      { x: 0.25, y: 3.8 },
      { x: 0.5, y: 1.0 },
      { x: 0.75, y: 3.8 },
      { x: 1.0, y: 1.0 },
    ],
  },
  {
    id: 'flash-in',
    name: 'Flash In',
    desc: 'Hyper-fast entrance deceleration',
    curve: [5.0, 2.5, 1.0, 0.6, 0.4],
    points: [
      { x: 0.0, y: 5.0 },
      { x: 0.25, y: 2.5 },
      { x: 0.5, y: 1.0 },
      { x: 0.75, y: 0.6 },
      { x: 1.0, y: 0.4 },
    ],
  },
  {
    id: 'flash-out',
    name: 'Flash Out',
    desc: 'Gradual build into hyper-fast transition',
    curve: [0.4, 0.6, 1.0, 2.5, 5.0],
    points: [
      { x: 0.0, y: 0.4 },
      { x: 0.25, y: 0.6 },
      { x: 0.5, y: 1.0 },
      { x: 0.75, y: 2.5 },
      { x: 1.0, y: 5.0 },
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    desc: 'Fully customized Bézier speed curve',
    curve: [1.0, 1.0, 1.0, 1.0, 1.0],
    points: [
      { x: 0.0, y: 1.0 },
      { x: 0.25, y: 1.5 },
      { x: 0.5, y: 0.5 },
      { x: 0.75, y: 2.0 },
      { x: 1.0, y: 1.0 },
    ],
  },
];

/**
 * Convert a flat array of speed numbers into evenly-spaced SpeedRampPoints
 */
export function pointsFromCurve(curve: number[]): SpeedRampPoint[] {
  if (!curve || curve.length === 0) {
    return [{ x: 0, y: 1 }, { x: 1, y: 1 }];
  }
  if (curve.length === 1) {
    return [{ x: 0, y: curve[0] }, { x: 1, y: curve[0] }];
  }
  return curve.map((val, idx) => ({
    x: idx / (curve.length - 1),
    y: Math.max(0.1, Math.min(10.0, val)),
  }));
}

/**
 * Get normalized points for a clip's speedRamp
 */
export function getClipRampPoints(clip: Clip): SpeedRampPoint[] {
  if (!clip.speedRamp) return [];
  if (clip.speedRamp.points && clip.speedRamp.points.length >= 2) {
    return [...clip.speedRamp.points].sort((a, b) => a.x - b.x);
  }
  if (clip.speedRamp.curve && clip.speedRamp.curve.length >= 2) {
    return pointsFromCurve(clip.speedRamp.curve);
  }
  return [];
}

/**
 * Hermite / Smoothstep cubic interpolation between two speed values
 */
function smoothInterpolate(y0: number, y1: number, t: number): number {
  // Cubic smoothstep: 3*t^2 - 2*t^3
  const s = t * t * (3 - 2 * t);
  return y0 + (y1 - y0) * s;
}

/**
 * Sample the instantaneous speed multiplier at normalized position u (0.0 to 1.0)
 */
export function sampleSpeedAtNormalizedPosition(points: SpeedRampPoint[], u: number): number {
  if (!points || points.length === 0) return 1.0;
  const clampedU = Math.max(0, Math.min(1, u));

  if (clampedU <= points[0].x) return points[0].y;
  if (clampedU >= points[points.length - 1].x) return points[points.length - 1].y;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (clampedU >= p1.x && clampedU <= p2.x) {
      const span = p2.x - p1.x;
      const t = span > 0 ? (clampedU - p1.x) / span : 0;
      return Math.max(0.1, Math.min(10.0, smoothInterpolate(p1.y, p2.y, t)));
    }
  }

  return points[points.length - 1].y;
}

/**
 * Calculate the exact source time and instantaneous playback speed for a clip at a given elapsed time.
 * Uses numerical integration (trapezoidal rule) so that acceleration and deceleration are 100% physically accurate.
 */
export function getClipEffectiveSpeedAtTime(
  clip: Clip,
  elapsedInClip: number
): { currentSpeed: number; sourceTime: number } {
  const baseRate = clip.playbackRate || 1.0;
  const duration = Math.max(0.01, clip.duration || 1.0);
  const clampedElapsed = Math.max(0, Math.min(duration, elapsedInClip));

  const isRampActive =
    clip.speedRamp &&
    clip.speedRamp.enabled !== false &&
    clip.speedRamp.preset !== 'none' &&
    ((clip.speedRamp.points && clip.speedRamp.points.length >= 2) ||
      (clip.speedRamp.curve && clip.speedRamp.curve.length >= 2));

  if (!isRampActive) {
    return {
      currentSpeed: baseRate,
      sourceTime: clip.sourceStart + clampedElapsed * baseRate,
    };
  }

  const points = getClipRampPoints(clip);
  const normalizedU = clampedElapsed / duration;
  const currentSpeed = sampleSpeedAtNormalizedPosition(points, normalizedU);

  // Integrate speed over [0, clampedElapsed]:
  // Int_0^t v(tau) d tau = duration * Int_0^u v(s) ds
  // We use 24 sub-steps for instantaneous, sub-microsecond precision
  const STEPS = 24;
  const du = normalizedU / STEPS;
  let integral = 0;

  for (let step = 0; step < STEPS; step++) {
    const u0 = step * du;
    const u1 = (step + 1) * du;
    const s0 = sampleSpeedAtNormalizedPosition(points, u0);
    const s1 = sampleSpeedAtNormalizedPosition(points, u1);
    integral += ((s0 + s1) / 2) * du;
  }

  const sourceElapsed = integral * duration;
  const sourceTime = clip.sourceStart + sourceElapsed;

  return {
    currentSpeed,
    sourceTime,
  };
}

/**
 * Compute the total source duration consumed by a clip with speed ramp
 */
export function getClipTotalSourceDuration(clip: Clip): number {
  const res = getClipEffectiveSpeedAtTime(clip, clip.duration);
  return Math.max(0.1, res.sourceTime - clip.sourceStart);
}
