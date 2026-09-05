export type Point = { x: number; y: number };
export type Rect = Point & { w: number; h: number };
export type Stroke = {
  points: Point[];
  width: number;
  opacity: number;
  start: number;
  duration: number;
};

export const STUDY_SIZE = { w: 860, h: 470 };
export const DRAW_DURATION = 4800;

// Fit the complete study into the larger clear space above or beside the name.
// Both the animated and reduced-motion compositions use the same safe bounds.
export function fitStudy(width: number, height: number, content: Rect | null): Rect | null {
  const margin = width < 640 ? 24 : 48;
  const top = 92;
  const zones: Rect[] = content
    ? [
        { x: margin, y: top, w: width - margin * 2, h: content.y - top - 32 },
        {
          x: content.x + content.w + 32,
          y: top,
          w: width - content.x - content.w - 32 - margin,
          h: height - top - margin
        }
      ]
    : [{ x: margin, y: top, w: width - margin * 2, h: height - top - margin }];
  const candidates = zones
    .filter((zone) => zone.w > 0 && zone.h > 0)
    .map((zone) => {
      const scale = Math.min(zone.w / STUDY_SIZE.w, zone.h / STUDY_SIZE.h, 1.15);
      const w = STUDY_SIZE.w * scale;
      const h = STUDY_SIZE.h * scale;
      return { x: zone.x + (zone.w - w) * 0.78, y: zone.y + (zone.h - h) * 0.5, w, h };
    });
  return candidates.sort((a, b) => b.w - a.w)[0] ?? null;
}

// Authored perspective study: geometry stays coherent, while each individual
// stroke has a small fixed bow and a pressure taper. No frame-to-frame jitter.
export function createPavilion(): Stroke[] {
  const strokes: Stroke[] = [];
  function line(
    from: [number, number],
    to: [number, number],
    start: number,
    duration: number,
    width = 1.3,
    opacity = 0.46
  ) {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const count = Math.max(3, Math.ceil(length / 3));
    const bow = Math.sin(strokes.length * 2.4) * 2.2;
    const points = Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const deviation =
        Math.sin(t * Math.PI) * bow + Math.sin(t * Math.PI * 3 + strokes.length) * Math.sin(t * Math.PI) * 0.65;
      return {
        x: from[0] + (to[0] - from[0]) * t - ((to[1] - from[1]) / length) * deviation,
        y: from[1] + (to[1] - from[1]) * t + ((to[0] - from[0]) / length) * deviation
      };
    });
    strokes.push({ points, start, duration, width, opacity });
  }
  function path(points: [number, number][], start: number, duration: number, width = 1.3, opacity = 0.46) {
    for (let i = 1; i < points.length; i++)
      line(points[i - 1], points[i], start + (i - 1) * duration, duration, width, opacity);
  }

  // Thinking lightly: extended vanishing lines, plumb lines, and an earlier roof.
  line([45, 232], [810, 90], 0, 250, 0.7, 0.12);
  line([66, 75], [822, 264], 70, 230, 0.7, 0.12);
  line([85, 383], [817, 202], 220, 190, 0.7, 0.1);
  line([87, 289], [801, 438], 300, 190, 0.7, 0.1);
  line([167, 155], [163, 407], 390, 150, 0.8, 0.15);
  line([480, 76], [484, 448], 460, 160, 0.8, 0.13);
  line([738, 144], [739, 369], 540, 140, 0.8, 0.12);
  path(
    [
      [106, 218],
      [432, 117],
      [782, 196]
    ],
    520,
    120,
    0.9,
    0.19
  );

  // Long decisive gestures establish a cantilevered roof in two-point perspective.
  path(
    [
      [105, 205],
      [425, 98],
      [791, 182],
      [460, 292],
      [105, 205]
    ],
    850,
    160,
    1.65,
    0.62
  );
  path(
    [
      [105, 205],
      [107, 217],
      [460, 307],
      [791, 193],
      [791, 182]
    ],
    1510,
    72,
    1.05,
    0.42
  );
  line([460, 292], [460, 307], 1740, 70, 1.7, 0.61);

  // Glazing and recessed structural volume, leaving the roof to float above it.
  path(
    [
      [172, 235],
      [174, 345],
      [484, 425],
      [740, 338],
      [740, 212]
    ],
    1900,
    100,
    1.3,
    0.49
  );
  line([484, 311], [484, 425], 2250, 115, 1.8, 0.6);
  line([174, 345], [432, 267], 2360, 130, 0.9, 0.24);
  line([432, 267], [740, 338], 2480, 110, 0.9, 0.23);
  line([432, 267], [432, 306], 2540, 80, 0.9, 0.21);
  for (let i = 1; i <= 5; i++) {
    const t = i / 6;
    line([172 + 312 * t, 235 + 76 * t], [174 + 310 * t, 345 + 80 * t], 2600 + i * 42, 85, 0.85, i % 2 ? 0.3 : 0.43);
  }
  for (let i = 1; i <= 4; i++) {
    const t = i / 5;
    line([484 + 256 * t, 311 - 99 * t], [484 + 256 * t, 425 - 87 * t], 2800 + i * 35, 75, 0.8, 0.3);
  }
  // Ground plane and a pair of low steps anchor the sketch.
  path(
    [
      [147, 350],
      [482, 437],
      [766, 341]
    ],
    3000,
    110,
    1.2,
    0.43
  );
  path(
    [
      [148, 350],
      [147, 359],
      [482, 446],
      [768, 350],
      [766, 341]
    ],
    3160,
    50,
    0.9,
    0.3
  );
  path(
    [
      [133, 366],
      [286, 405],
      [331, 390]
    ],
    3300,
    65,
    0.9,
    0.32
  );
  line([115, 375], [269, 415], 3400, 90, 0.85, 0.25);

  // A second pass revises the leading edge; the tentative line remains visible.
  line([101, 202], [429, 94], 3510, 170, 1.1, 0.46);
  line([458, 294], [795, 182], 3740, 155, 1.2, 0.51);

  // Fast pencil hatching: roof plane, shaded soffit, and a ground shadow.
  for (let i = 0; i < 30; i++) {
    const t = 0.32 + i / 46;
    const reach = 0.22 + Math.sin(i * 1.7) * 0.055;
    const x = 425 + 366 * t;
    const y = 101 + 84 * t;
    line([x, y], [x - 317 * reach, y + 106 * reach], 3940 + i * 12, 48, 0.8, 0.16 + (i % 3) * 0.035);
  }
  for (let i = 0; i < 23; i++) {
    const t = i / 23;
    line([486 + 248 * t, 319 - 98 * t], [502 + 232 * t, 327 - 96 * t], 4250 + i * 10, 45, 0.8, 0.25);
  }
  for (let i = 0; i < 19; i++) {
    const t = i / 19;
    line([496 + 249 * t, 449 - 83 * t], [539 + 244 * t, 452 - 79 * t], 4510 + i * 10, 48, 0.7, 0.19);
  }
  line([169, 238], [171, 345], 3430, 85, 0.9, 0.3);
  line([486, 313], [487, 425], 3610, 90, 1.0, 0.38);
  line([146, 348], [486, 438], 3720, 130, 0.8, 0.29);
  // Reflections are incomplete gestures, not a regular facade grid.
  line([254, 270], [270, 330], 3860, 65, 0.7, 0.19);
  line([260, 275], [277, 334], 3920, 50, 0.7, 0.14);
  line([645, 273], [624, 344], 4020, 65, 0.7, 0.17);
  return strokes;
}
