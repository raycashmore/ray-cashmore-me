# Field Current Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage dot-grid canvas with a faint, lingering, curved "field current" sketch animation.

**Architecture:** Move the animation into a focused client-side TypeScript module and keep the Astro page responsible only for rendering the canvas and starting the effect. The module owns stroke generation, reduced-motion handling, resize behavior, animation lifecycle, and drawing.

**Tech Stack:** Astro 5, TypeScript, Canvas 2D, browser `matchMedia`, browser `requestAnimationFrame`, Bun scripts.

---

## File Structure

- Create `src/lib/field-current-hero.ts`: Client-only Canvas 2D animation module. Exports `startFieldCurrentHero(canvas)` and returns a cleanup function.
- Modify `src/pages/index.astro`: Rename the canvas from `dot-grid` to `field-current-canvas`, remove the inline dot-grid script, and import/start the new module.
- No new dependency, test framework, CSS file, or shared animation system is needed.

## Task 1: Create The Field Current Animation Module

**Files:**

- Create: `src/lib/field-current-hero.ts`

- [ ] **Step 1: Add the module**

Create `src/lib/field-current-hero.ts` with this content:

```ts
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
  const bandTop = height * randomBetween(0.12, 0.46);
  const bandBottom = height * randomBetween(0.48, 0.82);
  const startX = width * randomBetween(0.34, 0.82);
  const endX = width * randomBetween(0.42, 0.95);
  const direction = Math.random() > 0.5 ? 1 : -1;

  return {
    type: 'curve',
    start: {
      x: startX,
      y: bandTop
    },
    controlA: {
      x: width * randomBetween(0.58, 1.02),
      y: height * randomBetween(0.08, 0.34)
    },
    controlB: {
      x: width * randomBetween(0.22, 0.76),
      y: bandBottom + height * randomBetween(-0.14, 0.1) * direction
    },
    end: {
      x: endX,
      y: bandBottom
    },
    age: 0,
    drawDuration: randomBetween(2200, 4200),
    lingerDuration: randomBetween(5200, 9200),
    fadeDuration: randomBetween(4200, 7000),
    opacity: randomBetween(0.08, 0.18),
    width: randomBetween(0.45, 1.15),
    jitter: randomBetween(0, Math.PI * 2)
  };
}

function createGuideStroke(width: number, height: number): GuideStroke {
  const horizontal = Math.random() > 0.35;
  const y = height * randomBetween(0.18, 0.78);
  const x = width * randomBetween(0.38, 0.88);
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
    opacity: randomBetween(0.035, 0.07),
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
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    strokes.length = 0;
    nextCurveAt = 0;
    nextGuideAt = GUIDE_INTERVAL * 0.6;
    clear();
  }

  function clear() {
    context.clearRect(0, 0, width, height);
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

    context.fillStyle = BACKGROUND_COLOR;
    context.fillRect(0, 0, width, height);

    nextCurveAt -= delta;
    nextGuideAt -= delta;

    if (nextCurveAt <= 0 && strokes.length < MAX_STROKES) {
      strokes.push(createCurveStroke(width, height));
      nextCurveAt = randomBetween(CURVE_INTERVAL * 0.7, CURVE_INTERVAL * 1.4);
    }

    if (nextGuideAt <= 0 && strokes.length < MAX_STROKES) {
      strokes.push(createGuideStroke(width, height));
      nextGuideAt = randomBetween(GUIDE_INTERVAL * 0.75, GUIDE_INTERVAL * 1.45);
    }

    for (const stroke of strokes) {
      stroke.age += delta;
      drawStroke(context, stroke);
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
```

- [ ] **Step 2: Check the module for TypeScript syntax**

Run:

```bash
bun build src/lib/field-current-hero.ts --outdir /tmp/field-current-plan-check
```

Expected:

- Bun exits successfully.
- If the build fails with a syntax error in `src/lib/field-current-hero.ts`, fix the exact line before continuing.

- [ ] **Step 3: Commit the module**

Run:

```bash
git add src/lib/field-current-hero.ts
git commit -m "Add field current hero animation module"
```

Expected:

- Commit succeeds.

## Task 2: Replace The Homepage Dot Grid Integration

**Files:**

- Modify: `src/pages/index.astro`

- [ ] **Step 1: Rename the hero canvas**

In `src/pages/index.astro`, replace:

```astro
<canvas id="dot-grid" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
```

with:

```astro
<canvas
  id="field-current-canvas"
  aria-hidden="true"
  class="absolute inset-0 w-full h-full pointer-events-none"
></canvas>
```

- [ ] **Step 2: Replace the dot-grid script**

In `src/pages/index.astro`, remove the whole script that starts with:

```astro
<script>
  const canvas = document.getElementById('dot-grid') as HTMLCanvasElement;
```

and ends with:

```astro
  resize();
  window.addEventListener('resize', resize);
  animationId = requestAnimationFrame(draw);
</script>
```

Replace it with:

```astro
<script>
  import { startFieldCurrentHero } from '../lib/field-current-hero';

  const canvas = document.getElementById('field-current-canvas') as HTMLCanvasElement | null;

  if (canvas) {
    startFieldCurrentHero(canvas);
  }
</script>
```

- [ ] **Step 3: Confirm old dot-grid code is gone**

Run:

```bash
rg -n "dot-grid|DOT_SPACING|DOT_RADIUS|WAVE_OPACITY|createDots|dots" src/pages/index.astro src/lib/field-current-hero.ts
```

Expected:

- No matches.

- [ ] **Step 4: Build the site**

Run:

```bash
bun run build
```

Expected:

- Build exits successfully.
- No dependency install prompt appears.

- [ ] **Step 5: Commit the integration**

Run:

```bash
git add src/pages/index.astro
git commit -m "Replace hero dot grid with field current canvas"
```

Expected:

- Commit succeeds.

## Task 3: Browser Verification And Tuning

**Files:**

- Modify if needed: `src/lib/field-current-hero.ts`
- Modify if needed: `src/pages/index.astro`

- [ ] **Step 1: Start the dev server**

Run:

```bash
bun run dev
```

Expected:

- Astro starts a local dev server.
- Use the printed localhost URL for browser checks.

- [ ] **Step 2: Verify desktop motion**

Open the homepage in the browser at a desktop viewport around `1440x900`.

Expected:

- The old dot grid is absent.
- Faint curved strokes appear behind the hero text.
- Strokes draw slowly, linger, and fade slowly.
- Curves dominate; straight guide lines are rare and very faint.
- The animation reads as formation and discovery, not random flicker.
- The name and cycling title remain legible.

- [ ] **Step 3: Verify mobile motion**

Resize the browser to a mobile viewport around `390x844`.

Expected:

- The canvas still fills the hero.
- The animation does not crowd the name.
- The hero text remains legible.
- The animation remains faint enough for the black-and-white visual language.

- [ ] **Step 4: Verify reduced motion**

Use the browser's emulation controls to set `prefers-reduced-motion: reduce`, then reload the homepage.

Expected:

- The hero background is plain black.
- No sketch strokes appear.
- No visible fallback pattern appears.

- [ ] **Step 5: Tune only if acceptance criteria fail**

If the desktop, mobile, or reduced-motion checks fail, tune constants in `src/lib/field-current-hero.ts` with these bounded changes:

```ts
const MAX_STROKES = 18;
const CURVE_INTERVAL = 1350;
const GUIDE_INTERVAL = 6200;
```

Use these ranges:

- `MAX_STROKES`: `12` to `22`
- `CURVE_INTERVAL`: `1200` to `2200`
- `GUIDE_INTERVAL`: `6000` to `10000`
- Curve opacity in `createCurveStroke()`: `0.06` to `0.18`
- Guide opacity in `createGuideStroke()`: `0.025` to `0.07`

Do not add new shapes, colors, dependencies, UI controls, or page layout changes during tuning.

- [ ] **Step 6: Rebuild after any tuning**

Run:

```bash
bun run build
```

Expected:

- Build exits successfully.

- [ ] **Step 7: Commit tuning if changes were made**

If `src/lib/field-current-hero.ts` or `src/pages/index.astro` changed during verification, run:

```bash
git add src/lib/field-current-hero.ts src/pages/index.astro
git commit -m "Tune field current hero animation"
```

Expected:

- Commit succeeds.

If no tuning changes were made, do not create a commit.

## Final Acceptance Check

Run:

```bash
git status --short
bun run build
```

Expected:

- `git status --short` shows no unstaged or uncommitted implementation changes.
- `bun run build` exits successfully.
- Browser verification confirms the field current animation meets the design spec.
