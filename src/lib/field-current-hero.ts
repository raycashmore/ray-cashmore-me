type Point = {
  x: number;
  y: number;
};

type CurveStroke = {
  type: 'curve';
  start: Point;
  controlA: Point;
  controlB: Point;
  end: Point;
  age: number;
  drawDuration: number;
  lingerDuration: number;
  fadeDuration: number;
  opacity: number;
  width: number;
  jitter: number;
};

type GuideStroke = {
  type: 'guide';
  start: Point;
  end: Point;
  age: number;
  drawDuration: number;
  lingerDuration: number;
  fadeDuration: number;
  opacity: number;
  width: number;
  jitter: number;
};

type SketchStroke = CurveStroke | GuideStroke;

const MAX_STROKES = 18;
const CURVE_INTERVAL = 1350;
const GUIDE_INTERVAL = 6200;
const SAMPLE_COUNT = 70;
const BACKGROUND_COLOR = 'rgba(0, 0, 0, 1)';
const STROKE_COLOR = '255, 255, 255';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function lifetime(stroke: SketchStroke) {
  return stroke.drawDuration + stroke.lingerDuration + stroke.fadeDuration;
}

function alphaFor(stroke: SketchStroke) {
  if (stroke.age < stroke.drawDuration) {
    return stroke.opacity * easeOutCubic(stroke.age / stroke.drawDuration);
  }

  if (stroke.age < stroke.drawDuration + stroke.lingerDuration) {
    return stroke.opacity;
  }

  const fadeAge = stroke.age - stroke.drawDuration - stroke.lingerDuration;
  return stroke.opacity * (1 - clamp(fadeAge / stroke.fadeDuration, 0, 1));
}

function revealFor(stroke: SketchStroke) {
  return clamp(stroke.age / stroke.drawDuration, 0, 1);
}

function curvePoint(stroke: CurveStroke, t: number): Point {
  const inverse = 1 - t;
  const inverseSquared = inverse * inverse;
  const tSquared = t * t;

  return {
    x:
      inverseSquared * inverse * stroke.start.x +
      3 * inverseSquared * t * stroke.controlA.x +
      3 * inverse * tSquared * stroke.controlB.x +
      tSquared * t * stroke.end.x,
    y:
      inverseSquared * inverse * stroke.start.y +
      3 * inverseSquared * t * stroke.controlA.y +
      3 * inverse * tSquared * stroke.controlB.y +
      tSquared * t * stroke.end.y
  };
}

function jittered(point: Point, seed: number, index: number): Point {
  const waveA = Math.sin(seed + index * 1.7) * 0.9;
  const waveB = Math.cos(seed * 0.7 + index * 1.3) * 0.7;

  return {
    x: point.x + waveA,
    y: point.y + waveB
  };
}

function createCurveStroke(width: number, height: number): CurveStroke {
  const narrow = width < 640;
  const startY = height * randomBetween(narrow ? 0.16 : 0.18, narrow ? 0.5 : 0.62);
  const endY = startY + height * randomBetween(narrow ? -0.08 : -0.12, narrow ? 0.12 : 0.16);

  return {
    type: 'curve',
    start: {
      x: width * randomBetween(narrow ? 0.46 : 0.36, narrow ? 0.88 : 0.82),
      y: startY
    },
    controlA: {
      x: width * randomBetween(narrow ? 0.74 : 0.62, narrow ? 1.14 : 1.12),
      y: startY + height * randomBetween(narrow ? -0.18 : -0.2, narrow ? 0.04 : 0.08)
    },
    controlB: {
      x: width * randomBetween(narrow ? 0.5 : 0.2, narrow ? 0.98 : 0.86),
      y: endY + height * randomBetween(narrow ? -0.04 : -0.08, narrow ? 0.14 : 0.18)
    },
    end: {
      x: width * randomBetween(narrow ? 0.64 : 0.54, narrow ? 1.1 : 1.08),
      y: endY
    },
    age: 0,
    drawDuration: randomBetween(narrow ? 2800 : 2600, narrow ? 5200 : 5000),
    lingerDuration: randomBetween(6200, 10400),
    fadeDuration: randomBetween(4600, 7600),
    opacity: randomBetween(narrow ? 0.06 : 0.07, narrow ? 0.13 : 0.16),
    width: randomBetween(0.45, 1.15),
    jitter: randomBetween(0, Math.PI * 2)
  };
}

function createGuideStroke(width: number, height: number): GuideStroke {
  const narrow = width < 640;
  const horizontal = narrow || Math.random() > 0.35;
  const y = height * randomBetween(0.18, narrow ? 0.58 : 0.78);
  const x = width * randomBetween(narrow ? 0.46 : 0.38, 0.88);
  const length = horizontal ? width * randomBetween(0.22, 0.5) : height * randomBetween(0.22, 0.52);
  const angle = horizontal ? randomBetween(-0.12, 0.08) : randomBetween(1.42, 1.68);

  return {
    type: 'guide',
    start: { x, y },
    end: {
      x: x + Math.cos(angle) * length,
      y: y + Math.sin(angle) * length
    },
    age: 0,
    drawDuration: randomBetween(1800, 3200),
    lingerDuration: randomBetween(3800, 6800),
    fadeDuration: randomBetween(3600, 5600),
    opacity: randomBetween(narrow ? 0.025 : 0.03, narrow ? 0.05 : 0.065),
    width: randomBetween(0.35, 0.75),
    jitter: randomBetween(0, Math.PI * 2)
  };
}

function drawCurve(ctx: CanvasRenderingContext2D, stroke: CurveStroke, reveal: number) {
  const pointsToDraw = Math.max(2, Math.floor(SAMPLE_COUNT * reveal));

  ctx.beginPath();

  for (let index = 0; index <= pointsToDraw; index++) {
    const point = jittered(curvePoint(stroke, index / SAMPLE_COUNT), stroke.jitter, index);

    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.stroke();
}

function drawGuide(ctx: CanvasRenderingContext2D, stroke: GuideStroke, reveal: number) {
  const end = {
    x: stroke.start.x + (stroke.end.x - stroke.start.x) * reveal,
    y: stroke.start.y + (stroke.end.y - stroke.start.y) * reveal
  };

  ctx.beginPath();
  ctx.moveTo(stroke.start.x, stroke.start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: SketchStroke) {
  const alpha = alphaFor(stroke);

  if (alpha <= 0) {
    return;
  }

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = stroke.width;
  ctx.strokeStyle = `rgba(${STROKE_COLOR}, ${alpha})`;
  ctx.shadowColor = `rgba(${STROKE_COLOR}, ${alpha * 0.18})`;
  ctx.shadowBlur = 1.5;

  const reveal = revealFor(stroke);

  if (stroke.type === 'curve') {
    drawCurve(ctx, stroke, reveal);
  } else {
    drawGuide(ctx, stroke, reveal);
  }

  ctx.restore();
}

export function startFieldCurrentHero(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');

  if (!context) {
    return () => {};
  }

  const ctx: CanvasRenderingContext2D = context;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const strokes: SketchStroke[] = [];
  let animationId = 0;
  let lastTime = performance.now();
  let nextCurveAt = 0;
  let nextGuideAt = GUIDE_INTERVAL;
  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    strokes.length = 0;
    nextCurveAt = 0;
    nextGuideAt = GUIDE_INTERVAL * 0.6;
    clear();
  }

  function clear() {
    ctx.clearRect(0, 0, width, height);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    }

    strokes.length = 0;
    clear();
  }

  function tick(time: number) {
    const delta = Math.min(64, time - lastTime);
    lastTime = time;

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, width, height);

    nextCurveAt -= delta;
    nextGuideAt -= delta;

    const maxStrokes = width < 640 ? 12 : MAX_STROKES;

    if (nextCurveAt <= 0 && strokes.length < maxStrokes) {
      strokes.push(createCurveStroke(width, height));
      nextCurveAt = randomBetween(CURVE_INTERVAL * 0.7, CURVE_INTERVAL * 1.4);
    }

    if (nextGuideAt <= 0 && strokes.length < maxStrokes) {
      strokes.push(createGuideStroke(width, height));
      nextGuideAt = randomBetween(GUIDE_INTERVAL * 0.75, GUIDE_INTERVAL * 1.45);
    }

    for (const stroke of strokes) {
      stroke.age += delta;
      drawStroke(ctx, stroke);
    }

    for (let index = strokes.length - 1; index >= 0; index--) {
      if (strokes[index].age > lifetime(strokes[index])) {
        strokes.splice(index, 1);
      }
    }

    animationId = requestAnimationFrame(tick);
  }

  function start() {
    stop();
    resize();

    if (motionQuery.matches) {
      return;
    }

    lastTime = performance.now();
    nextCurveAt = 0;
    nextGuideAt = GUIDE_INTERVAL * 0.6;
    animationId = requestAnimationFrame(tick);
  }

  function handleMotionChange() {
    start();
  }

  window.addEventListener('resize', resize);
  motionQuery.addEventListener('change', handleMotionChange);
  start();

  return () => {
    stop();
    window.removeEventListener('resize', resize);
    motionQuery.removeEventListener('change', handleMotionChange);
  };
}
