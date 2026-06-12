export type Pt = { x: number; y: number };

export type Segment = {
  points: Pt[];
  widths: number[];
  drawMs: number;
  pauseAfterMs: number;
};

export type Glyph = {
  segments: Segment[];
};

export type PlacedGlyph = {
  glyph: Glyph;
  // delay after the previous glyph in the cluster finishes drawing
  startDelayMs: number;
  // 0..1, mapped onto the theme's alpha range at render time
  alphaT: number;
};

export type ClusterRecipe = {
  glyphs: PlacedGlyph[];
  bounds: { w: number; h: number };
};

export type Rng = () => number;

const SAMPLE_STEP = 5;
const BASE_WIDTH = 2.2;
const PEN_SPEED_MIN = 90;
const PEN_SPEED_MAX = 140;

function rand(rng: Rng, min: number, max: number) {
  return min + rng() * (max - min);
}

function pick<T>(rng: Rng, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function distance(a: Pt, b: Pt) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

// Smooth pseudo-noise over t in [0,1] from a few cosine-interpolated control values.
function pressureProfile(rng: Rng, count: number): number[] {
  const controls = [rand(rng, 0, 1), rand(rng, 0, 1), rand(rng, 0, 1)];
  const widths: number[] = [];

  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1);
    const scaled = t * (controls.length - 1);
    const index = Math.min(controls.length - 2, Math.floor(scaled));
    const local = scaled - index;
    const eased = (1 - Math.cos(local * Math.PI)) / 2;
    const noise = controls[index] * (1 - eased) + controls[index + 1] * eased;
    widths.push(BASE_WIDTH * (0.75 + 0.5 * noise));
  }

  return widths;
}

function microSkew(rng: Rng, point: Pt): Pt {
  return {
    x: point.x + rand(rng, -0.75, 0.75),
    y: point.y + rand(rng, -0.75, 0.75)
  };
}

// One pen stroke between two points, with overshoot past the true end.
function lineSegment(rng: Rng, from: Pt, to: Pt, options?: { overshoot?: boolean; pauseAfterMs?: number }): Segment {
  const start = microSkew(rng, from);
  const trueEnd = microSkew(rng, to);
  const length = Math.max(1, distance(start, trueEnd));

  let end = trueEnd;
  if (options?.overshoot !== false && length > 16) {
    const over = rand(rng, 2, 4) / length;
    end = {
      x: trueEnd.x + (trueEnd.x - start.x) * over,
      y: trueEnd.y + (trueEnd.y - start.y) * over
    };
  }

  const drawnLength = distance(start, end);
  const count = Math.max(2, Math.ceil(drawnLength / SAMPLE_STEP) + 1);
  const points: Pt[] = [];

  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    points.push({ x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t });
  }

  return {
    points,
    widths: pressureProfile(rng, count),
    drawMs: (drawnLength / rand(rng, PEN_SPEED_MIN, PEN_SPEED_MAX)) * 1000,
    pauseAfterMs: options?.pauseAfterMs ?? rand(rng, 150, 450)
  };
}

function polyline(rng: Rng, corners: Pt[]): Segment[] {
  const segments: Segment[] = [];

  for (let i = 0; i < corners.length - 1; i++) {
    segments.push(lineSegment(rng, corners[i], corners[i + 1]));
  }

  return segments;
}

// Open-V arrowhead pointing along the direction from `fromward` to `tip`.
function arrowhead(rng: Rng, tip: Pt, fromward: Pt, size: number): Segment[] {
  const angle = Math.atan2(tip.y - fromward.y, tip.x - fromward.x);
  const spread = 0.46;
  const left: Pt = {
    x: tip.x - Math.cos(angle - spread) * size,
    y: tip.y - Math.sin(angle - spread) * size
  };
  const right: Pt = {
    x: tip.x - Math.cos(angle + spread) * size,
    y: tip.y - Math.sin(angle + spread) * size
  };

  return [
    lineSegment(rng, left, tip, { overshoot: false, pauseAfterMs: rand(rng, 120, 240) }),
    lineSegment(rng, right, tip, { overshoot: false })
  ];
}

export function wireframeBox(rng: Rng, origin: Pt, wUnits: number, hUnits: number, unit: number): Glyph {
  const w = wUnits * unit;
  const h = hUnits * unit;
  const { x, y } = origin;

  const segments = polyline(rng, [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
    { x, y }
  ]);

  const hasHeader = hUnits >= 3 && rng() < 0.4;
  if (hasHeader) {
    segments.push(lineSegment(rng, { x, y: y + unit }, { x: x + w, y: y + unit }));
  }

  if (rng() < 0.5 && hUnits >= 3) {
    const contentTop = y + (hasHeader ? unit : 0);
    const contentHeight = y + h - contentTop;
    const lines = Math.min(3, Math.max(2, Math.floor(contentHeight / unit) - 1));

    for (let i = 1; i <= lines; i++) {
      const lineY = contentTop + (contentHeight / (lines + 1)) * i;
      const lineW = w * rand(rng, 0.6, 0.85);
      segments.push(
        lineSegment(rng, { x: x + unit * 0.5, y: lineY }, { x: x + unit * 0.5 + lineW, y: lineY }, { overshoot: false })
      );
    }
  }

  return { segments };
}

export function arrowStraight(rng: Rng, from: Pt, to: Pt, unit: number): Glyph {
  return {
    segments: [lineSegment(rng, from, to), ...arrowhead(rng, to, from, unit * 0.35)]
  };
}

export function arrowElbow(rng: Rng, from: Pt, to: Pt, unit: number): Glyph {
  // Horizontal first, then vertical (or the reverse), like a connector in a diagram.
  const horizontalFirst = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
  const elbow: Pt = horizontalFirst ? { x: to.x, y: from.y } : { x: from.x, y: to.y };

  return {
    segments: [
      lineSegment(rng, from, elbow),
      lineSegment(rng, elbow, to),
      ...arrowhead(rng, to, elbow, unit * 0.35)
    ]
  };
}

export function circleNode(rng: Rng, center: Pt, radius: number): Glyph {
  // Start around 10 o'clock, sweep a full turn plus a slight overlap.
  const startAngle = Math.PI * 1.2 + rand(rng, -0.15, 0.15);
  const overlap = rand(rng, 0.1, 0.18);
  const total = Math.PI * 2 + overlap;
  const count = 26;
  const points: Pt[] = [];

  const wobbleSeed = rand(rng, 0, Math.PI * 2);
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const angle = startAngle + total * t;
    const r = radius + Math.sin(wobbleSeed + t * Math.PI * 2) * 0.6;
    points.push({ x: center.x + Math.cos(angle) * r, y: center.y + Math.sin(angle) * r });
  }

  const circumference = Math.PI * 2 * radius;

  return {
    segments: [
      {
        points,
        widths: pressureProfile(rng, count),
        drawMs: (circumference / rand(rng, PEN_SPEED_MIN, PEN_SPEED_MAX)) * 1000,
        pauseAfterMs: rand(rng, 150, 450)
      }
    ]
  };
}

export function diamondNode(rng: Rng, center: Pt, radius: number): Glyph {
  return {
    segments: polyline(rng, [
      { x: center.x, y: center.y - radius },
      { x: center.x + radius, y: center.y },
      { x: center.x, y: center.y + radius },
      { x: center.x - radius, y: center.y },
      { x: center.x, y: center.y - radius }
    ])
  };
}

export function crosshair(rng: Rng, center: Pt, unit: number): Glyph {
  const arm = unit * 0.5;
  const segments = [
    lineSegment(rng, { x: center.x - arm, y: center.y }, { x: center.x + arm, y: center.y }, { overshoot: false }),
    lineSegment(rng, { x: center.x, y: center.y - arm }, { x: center.x, y: center.y + arm }, { overshoot: false })
  ];

  if (rng() < 0.5) {
    segments.push(...circleNode(rng, center, arm * 0.55).segments);
  }

  return { segments };
}

export function dimensionLine(rng: Rng, from: Pt, to: Pt, unit: number): Glyph {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const tick = unit * 0.3;
  const perpX = Math.cos(angle + Math.PI / 2) * tick;
  const perpY = Math.sin(angle + Math.PI / 2) * tick;

  const tickAt = (p: Pt) =>
    lineSegment(rng, { x: p.x - perpX, y: p.y - perpY }, { x: p.x + perpX, y: p.y + perpY }, { overshoot: false });

  return {
    segments: [tickAt(from), lineSegment(rng, from, to, { overshoot: false }), tickAt(to)]
  };
}

export function underline(rng: Rng, from: Pt, length: number): Glyph {
  return {
    segments: [lineSegment(rng, from, { x: from.x + length, y: from.y })]
  };
}

function glyphDelay(rng: Rng) {
  return rand(rng, 600, 1200);
}

// --- Cluster recipes -------------------------------------------------------
// Recipes lay out glyphs in local coordinates starting at (0,0) and report
// their footprint so the engine can place and collision-test the cluster.

function boxPair(rng: Rng, unit: number, small: boolean): ClusterRecipe {
  const aW = small ? 3 : Math.floor(rand(rng, 3, 6));
  const aH = small ? 2 : Math.floor(rand(rng, 2, 5));
  const bW = small ? 3 : Math.floor(rand(rng, 3, 6));
  const bH = small ? 2 : Math.floor(rand(rng, 2, 4));
  const gap = Math.floor(rand(rng, small ? 2 : 3, small ? 4 : 6));
  const vertical = rng() < 0.35;

  const a: Pt = { x: 0, y: 0 };
  const b: Pt = vertical
    ? { x: Math.floor(rand(rng, 0, 2)) * unit, y: (aH + gap) * unit }
    : { x: (aW + gap) * unit, y: Math.floor(rand(rng, -1, 2)) * unit };

  const shift = { x: Math.max(0, -b.x), y: Math.max(0, -b.y) };
  a.x += shift.x;
  a.y += shift.y;
  b.x += shift.x;
  b.y += shift.y;

  const arrowFrom: Pt = vertical
    ? { x: a.x + (aW * unit) / 2, y: a.y + aH * unit }
    : { x: a.x + aW * unit, y: a.y + (aH * unit) / 2 };
  const arrowTo: Pt = vertical
    ? { x: b.x + (bW * unit) / 2, y: b.y - unit * 0.3 }
    : { x: b.x - unit * 0.3, y: b.y + (bH * unit) / 2 };

  const arrow =
    Math.abs(arrowFrom.x - arrowTo.x) > unit && Math.abs(arrowFrom.y - arrowTo.y) > unit
      ? arrowElbow(rng, arrowFrom, arrowTo, unit)
      : arrowStraight(rng, arrowFrom, arrowTo, unit);

  return {
    glyphs: [
      { glyph: wireframeBox(rng, a, aW, aH, unit), startDelayMs: 0, alphaT: rng() },
      { glyph: wireframeBox(rng, b, bW, bH, unit), startDelayMs: glyphDelay(rng), alphaT: rng() },
      { glyph: arrow, startDelayMs: glyphDelay(rng), alphaT: rng() }
    ],
    bounds: {
      w: Math.max(a.x + aW * unit, b.x + bW * unit),
      h: Math.max(a.y + aH * unit, b.y + bH * unit)
    }
  };
}

function flowTriple(rng: Rng, unit: number): ClusterRecipe {
  const nodeR = unit * rand(rng, 1, 1.4);
  const boxW = Math.floor(rand(rng, 3, 5));
  const boxH = Math.floor(rand(rng, 2, 3));
  const gap = Math.floor(rand(rng, 2, 4)) * unit;

  const midY = Math.max(nodeR, (boxH * unit) / 2);
  const startNode: Pt = { x: nodeR, y: midY };
  const boxOrigin: Pt = { x: startNode.x + nodeR + gap, y: midY - (boxH * unit) / 2 };
  const endCenter: Pt = { x: boxOrigin.x + boxW * unit + gap + nodeR, y: midY };

  const endNode = rng() < 0.5 ? circleNode(rng, endCenter, nodeR) : diamondNode(rng, endCenter, nodeR);

  return {
    glyphs: [
      { glyph: circleNode(rng, startNode, nodeR), startDelayMs: 0, alphaT: rng() },
      {
        glyph: arrowStraight(rng, { x: startNode.x + nodeR, y: midY }, { x: boxOrigin.x - unit * 0.3, y: midY }, unit),
        startDelayMs: glyphDelay(rng),
        alphaT: rng()
      },
      { glyph: wireframeBox(rng, boxOrigin, boxW, boxH, unit), startDelayMs: glyphDelay(rng), alphaT: rng() },
      {
        glyph: arrowStraight(
          rng,
          { x: boxOrigin.x + boxW * unit, y: midY },
          { x: endCenter.x - nodeR - unit * 0.3, y: midY },
          unit
        ),
        startDelayMs: glyphDelay(rng),
        alphaT: rng()
      },
      { glyph: endNode, startDelayMs: glyphDelay(rng), alphaT: rng() }
    ],
    bounds: { w: endCenter.x + nodeR, h: Math.max(nodeR * 2, boxH * unit) }
  };
}

function annotatedBox(rng: Rng, unit: number): ClusterRecipe {
  const boxW = Math.floor(rand(rng, 4, 7));
  const boxH = Math.floor(rand(rng, 3, 5));
  const pad = unit;
  const origin: Pt = { x: pad, y: pad };

  const dimY = origin.y + boxH * unit + unit * 0.5;
  const crossCenter: Pt = { x: origin.x + boxW * unit + unit * 0.75, y: origin.y - unit * 0.25 };

  return {
    glyphs: [
      { glyph: wireframeBox(rng, origin, boxW, boxH, unit), startDelayMs: 0, alphaT: rng() },
      {
        glyph: dimensionLine(rng, { x: origin.x, y: dimY }, { x: origin.x + boxW * unit, y: dimY }, unit),
        startDelayMs: glyphDelay(rng),
        alphaT: rng()
      },
      { glyph: crosshair(rng, crossCenter, unit), startDelayMs: glyphDelay(rng), alphaT: rng() }
    ],
    bounds: { w: pad + boxW * unit + unit * 1.5, h: pad + boxH * unit + unit }
  };
}

function soloMark(rng: Rng, unit: number): ClusterRecipe {
  if (rng() < 0.5) {
    const center: Pt = { x: unit, y: unit };
    return {
      glyphs: [
        { glyph: crosshair(rng, center, unit), startDelayMs: 0, alphaT: rng() },
        {
          glyph: underline(rng, { x: unit * 0.25, y: unit * 2.2 }, unit * rand(rng, 2, 4)),
          startDelayMs: glyphDelay(rng),
          alphaT: rng()
        }
      ],
      bounds: { w: unit * 4.5, h: unit * 2.6 }
    };
  }

  const radius = unit * rand(rng, 1, 1.5);
  return {
    glyphs: [{ glyph: diamondNode(rng, { x: radius, y: radius }, radius), startDelayMs: 0, alphaT: rng() }],
    bounds: { w: radius * 2, h: radius * 2 }
  };
}

const RECIPES: { weight: number; small: boolean; build: (rng: Rng, unit: number, small: boolean) => ClusterRecipe }[] = [
  { weight: 3, small: true, build: (rng, unit, small) => boxPair(rng, unit, small) },
  { weight: 2, small: false, build: (rng, unit) => flowTriple(rng, unit) },
  { weight: 2, small: false, build: (rng, unit) => annotatedBox(rng, unit) },
  { weight: 1, small: true, build: (rng, unit) => soloMark(rng, unit) }
];

export function createCluster(rng: Rng, unit: number, smallOnly: boolean): ClusterRecipe {
  const candidates = smallOnly ? RECIPES.filter((recipe) => recipe.small) : RECIPES;
  const totalWeight = candidates.reduce((sum, recipe) => sum + recipe.weight, 0);
  let roll = rng() * totalWeight;

  for (const recipe of candidates) {
    roll -= recipe.weight;
    if (roll <= 0) {
      return recipe.build(rng, unit, smallOnly);
    }
  }

  return candidates[candidates.length - 1].build(rng, unit, smallOnly);
}

export function createStaticCluster(rng: Rng, unit: number): ClusterRecipe {
  return annotatedBox(rng, unit);
}
