import { Clip } from '../types';

export interface BezierControlPoint {
  x: number; // 0.0 to 1.0
  y: number; // 0.1 to 10.0
}

export interface SpeedRampPoint {
  x: number; // 0.0 to 1.0 (Timeline position along the clip)
  y: number; // 0.1 to 10.0 (Speed multiplier)
  cpIn?: BezierControlPoint; // Incoming Bezier tangent handle
  cpOut?: BezierControlPoint; // Outgoing Bezier tangent handle
  handleType?: 'smooth' | 'free' | 'linear'; // Tangent continuity mode
}

export interface SpeedRampPresetDef {
  id: 'none' | 'hero' | 'bullet' | 'montage' | 'jump-cut' | 'flash-in' | 'flash-out' | 'fast-in-slow-out' | 'ramp-up' | 'ramp-down' | 'wave' | 'custom' | string;
  name: string;
  category: 'Classic' | 'Cinematic' | 'Music & Beat' | 'Action';
  desc: string;
  points: SpeedRampPoint[];
  curve: number[];
}

export const SPEED_RAMP_PRESETS: SpeedRampPresetDef[] = [
  {
    id: 'none',
    name: 'Normal (1x)',
    category: 'Classic',
    desc: 'Constant linear speed with no acceleration',
    curve: [1.0, 1.0, 1.0, 1.0, 1.0],
    points: [
      { x: 0.0, y: 1.0, handleType: 'linear' },
      { x: 0.25, y: 1.0, handleType: 'linear' },
      { x: 0.5, y: 1.0, handleType: 'linear' },
      { x: 0.75, y: 1.0, handleType: 'linear' },
      { x: 1.0, y: 1.0, handleType: 'linear' },
    ],
  },
  {
    id: 'hero',
    name: 'Hero Freeze',
    category: 'Cinematic',
    desc: 'Fast rush into slow-mo cinematic freeze, then swift recovery',
    curve: [0.4, 3.2, 3.0, 0.2, 0.4],
    points: [
      { x: 0.0, y: 0.4, handleType: 'smooth' },
      { x: 0.22, y: 3.5, handleType: 'smooth' },
      { x: 0.45, y: 0.25, handleType: 'smooth' },
      { x: 0.75, y: 0.35, handleType: 'smooth' },
      { x: 1.0, y: 1.2, handleType: 'smooth' },
    ],
  },
  {
    id: 'bullet',
    name: 'Bullet Time',
    category: 'Action',
    desc: 'Matrix style ultra-fast surge -> deep slow motion -> exit snap',
    curve: [4.5, 4.5, 0.2, 0.2, 4.5],
    points: [
      { x: 0.0, y: 4.5, handleType: 'smooth' },
      { x: 0.25, y: 4.5, handleType: 'smooth' },
      { x: 0.45, y: 0.2, handleType: 'smooth' },
      { x: 0.65, y: 0.2, handleType: 'smooth' },
      { x: 1.0, y: 4.5, handleType: 'smooth' },
    ],
  },
  {
    id: 'montage',
    name: 'Montage Beat',
    category: 'Music & Beat',
    desc: 'High energy rhythm pulses aligned with beat drops',
    curve: [0.5, 2.8, 4.2, 0.4, 1.2],
    points: [
      { x: 0.0, y: 0.5, handleType: 'smooth' },
      { x: 0.25, y: 3.2, handleType: 'smooth' },
      { x: 0.5, y: 0.3, handleType: 'smooth' },
      { x: 0.75, y: 3.5, handleType: 'smooth' },
      { x: 1.0, y: 0.8, handleType: 'smooth' },
    ],
  },
  {
    id: 'jump-cut',
    name: 'Jump Cut Rhythm',
    category: 'Music & Beat',
    desc: 'Rapid rhythmic speed snaps for dynamic transitions',
    curve: [1.0, 4.0, 0.8, 4.0, 1.0],
    points: [
      { x: 0.0, y: 1.0, handleType: 'smooth' },
      { x: 0.2, y: 4.0, handleType: 'smooth' },
      { x: 0.4, y: 0.8, handleType: 'smooth' },
      { x: 0.7, y: 4.0, handleType: 'smooth' },
      { x: 1.0, y: 1.0, handleType: 'smooth' },
    ],
  },
  {
    id: 'flash-in',
    name: 'Flash In (Decel)',
    category: 'Cinematic',
    desc: 'Hyper-fast entrance smoothly decelerating into normal pace',
    curve: [5.0, 2.5, 1.0, 0.6, 0.4],
    points: [
      { x: 0.0, y: 5.5, handleType: 'smooth' },
      { x: 0.25, y: 2.2, handleType: 'smooth' },
      { x: 0.55, y: 1.0, handleType: 'smooth' },
      { x: 0.8, y: 0.6, handleType: 'smooth' },
      { x: 1.0, y: 0.5, handleType: 'smooth' },
    ],
  },
  {
    id: 'flash-out',
    name: 'Flash Out (Accel)',
    category: 'Cinematic',
    desc: 'Dramatic build up into a warp speed exit cut',
    curve: [0.4, 0.6, 1.0, 2.5, 5.0],
    points: [
      { x: 0.0, y: 0.5, handleType: 'smooth' },
      { x: 0.3, y: 0.7, handleType: 'smooth' },
      { x: 0.6, y: 1.2, handleType: 'smooth' },
      { x: 0.85, y: 3.0, handleType: 'smooth' },
      { x: 1.0, y: 6.0, handleType: 'smooth' },
    ],
  },
  {
    id: 'fast-in-slow-out',
    name: 'S-Curve (Ease Out)',
    category: 'Classic',
    desc: 'Fast start smoothly easing out into a gentle slow roll',
    curve: [3.0, 2.2, 1.2, 0.5, 0.3],
    points: [
      { x: 0.0, y: 3.5, handleType: 'smooth' },
      { x: 0.35, y: 1.8, handleType: 'smooth' },
      { x: 0.7, y: 0.6, handleType: 'smooth' },
      { x: 1.0, y: 0.3, handleType: 'smooth' },
    ],
  },
  {
    id: 'wave',
    name: 'Sine Pulse',
    category: 'Action',
    desc: 'Harmonic wave oscillating smoothly between fast and slow',
    curve: [0.6, 3.0, 0.4, 3.0, 0.6],
    points: [
      { x: 0.0, y: 0.6, handleType: 'smooth' },
      { x: 0.25, y: 3.5, handleType: 'smooth' },
      { x: 0.5, y: 0.4, handleType: 'smooth' },
      { x: 0.75, y: 3.5, handleType: 'smooth' },
      { x: 1.0, y: 0.6, handleType: 'smooth' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Bezier',
    category: 'Classic',
    desc: 'Fully customized curve with interactive Bézier handles',
    curve: [1.0, 1.5, 0.5, 2.0, 1.0],
    points: [
      { x: 0.0, y: 1.0, handleType: 'smooth' },
      { x: 0.25, y: 2.2, handleType: 'smooth' },
      { x: 0.5, y: 0.4, handleType: 'smooth' },
      { x: 0.75, y: 2.8, handleType: 'smooth' },
      { x: 1.0, y: 1.0, handleType: 'smooth' },
    ],
  },
];

/**
 * Convert a flat array of speed numbers into evenly-spaced SpeedRampPoints
 */
export function pointsFromCurve(curve: number[]): SpeedRampPoint[] {
  if (!curve || curve.length === 0) {
    return [{ x: 0, y: 1, handleType: 'smooth' }, { x: 1, y: 1, handleType: 'smooth' }];
  }
  if (curve.length === 1) {
    return [{ x: 0, y: curve[0], handleType: 'smooth' }, { x: 1, y: curve[0], handleType: 'smooth' }];
  }
  return curve.map((val, idx) => ({
    x: idx / (curve.length - 1),
    y: Math.max(0.1, Math.min(10.0, val)),
    handleType: 'smooth',
  }));
}

/**
 * Ensures points have automatic Bezier control points if not explicitly defined
 */
export function ensureBezierHandles(points: SpeedRampPoint[]): SpeedRampPoint[] {
  if (!points || points.length < 2) return points;
  const sorted = [...points].sort((a, b) => a.x - b.x);

  return sorted.map((pt, i) => {
    if (pt.handleType === 'linear') {
      return {
        ...pt,
        cpIn: undefined,
        cpOut: undefined,
      };
    }

    const prev = sorted[Math.max(0, i - 1)];
    const next = sorted[Math.min(sorted.length - 1, i + 1)];

    // Tangent slope based on neighboring points (Catmull-Rom style)
    const dx = Math.max(0.01, next.x - prev.x);
    const dy = next.y - prev.y;
    const slope = dy / dx;

    // Outgoing handle
    const spanRight = (next.x - pt.x) / 3;
    const defaultCpOut = {
      x: Math.min(1, pt.x + spanRight),
      y: Math.max(0.1, Math.min(10.0, pt.y + slope * spanRight)),
    };

    // Incoming handle
    const spanLeft = (pt.x - prev.x) / 3;
    const defaultCpIn = {
      x: Math.max(0, pt.x - spanLeft),
      y: Math.max(0.1, Math.min(10.0, pt.y - slope * spanLeft)),
    };

    return {
      ...pt,
      cpIn: pt.cpIn || (i > 0 ? defaultCpIn : undefined),
      cpOut: pt.cpOut || (i < sorted.length - 1 ? defaultCpOut : undefined),
      handleType: pt.handleType || 'smooth',
    };
  });
}

/**
 * Get normalized points for a clip's speedRamp
 */
export function getClipRampPoints(clip: Clip): SpeedRampPoint[] {
  if (!clip.speedRamp) return [];
  if (clip.speedRamp.points && clip.speedRamp.points.length >= 2) {
    const raw = [...clip.speedRamp.points].sort((a, b) => a.x - b.x);
    return ensureBezierHandles(raw);
  }
  if (clip.speedRamp.curve && clip.speedRamp.curve.length >= 2) {
    return ensureBezierHandles(pointsFromCurve(clip.speedRamp.curve));
  }
  return [];
}

/**
 * Evaluates a cubic Bezier position given 4 scalar points at parameter t (0 <= t <= 1)
 */
function cubicBezier1D(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/**
 * Solve for parameter t given x on a cubic Bezier segment using binary search
 */
function solveBezierTForX(x0: number, x1: number, x2: number, x3: number, targetX: number): number {
  let low = 0;
  let high = 1;
  let t = (targetX - x0) / Math.max(0.0001, x3 - x0);

  for (let iter = 0; iter < 10; iter++) {
    const curX = cubicBezier1D(x0, x1, x2, x3, t);
    const err = curX - targetX;
    if (Math.abs(err) < 0.0005) break;

    if (err > 0) {
      high = t;
    } else {
      low = t;
    }
    t = (low + high) / 2;
  }
  return Math.max(0, Math.min(1, t));
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
      if (span <= 0.0001) return p1.y;

      if (p1.handleType === 'linear') {
        const linearT = (clampedU - p1.x) / span;
        return p1.y + (p2.y - p1.y) * linearT;
      }

      // Cubic Bezier interpolation with handles
      const cp1x = p1.cpOut ? p1.cpOut.x : p1.x + span / 3;
      const cp1y = p1.cpOut ? p1.cpOut.y : p1.y;
      const cp2x = p2.cpIn ? p2.cpIn.x : p2.x - span / 3;
      const cp2y = p2.cpIn ? p2.cpIn.y : p2.y;

      const t = solveBezierTForX(p1.x, cp1x, cp2x, p2.x, clampedU);
      const speed = cubicBezier1D(p1.y, cp1y, cp2y, p2.y, t);

      return Math.max(0.1, Math.min(10.0, speed));
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
  // We use 32 sub-steps for instantaneous, sub-microsecond precision
  const STEPS = 32;
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
  return Math.max(0.01, res.sourceTime - clip.sourceStart);
}

/**
 * Reverse / horizontally flip curve points (e.g. Flash-In -> Flash-Out)
 */
export function flipSpeedCurvePoints(points: SpeedRampPoint[]): SpeedRampPoint[] {
  return points
    .map((p) => ({
      ...p,
      x: 1 - p.x,
      cpIn: p.cpOut ? { x: 1 - p.cpOut.x, y: p.cpOut.y } : undefined,
      cpOut: p.cpIn ? { x: 1 - p.cpIn.x, y: p.cpIn.y } : undefined,
    }))
    .sort((a, b) => a.x - b.x);
}

/**
 * Multiply all velocity points by a factor (e.g. 0.5x, 1.5x, 2x)
 */
export function scaleSpeedCurvePoints(points: SpeedRampPoint[], factor: number): SpeedRampPoint[] {
  return points.map((p) => ({
    ...p,
    y: Math.max(0.1, Math.min(10.0, Math.round(p.y * factor * 100) / 100)),
    cpIn: p.cpIn ? { ...p.cpIn, y: Math.max(0.1, Math.min(10.0, p.cpIn.y * factor)) } : undefined,
    cpOut: p.cpOut ? { ...p.cpOut, y: Math.max(0.1, Math.min(10.0, p.cpOut.y * factor)) } : undefined,
  }));
}
