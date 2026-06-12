import {
  createCluster,
  createStaticCluster,
  type ClusterRecipe,
  type Glyph,
  type PlacedGlyph,
  type Segment
} from './sketch-glyphs';

type Rect = { x: number; y: number; w: number; h: number };

type ActiveGlyph = {
  glyph: Glyph;
  startAt: number;
  alphaT: number;
  drawTotalMs: number;
};

type ActiveCluster = {
  glyphs: ActiveGlyph[];
  rect: Rect;
  doneAt: number;
  lingerMs: number;
  fadeMs: number;
};

const SPAWN_MIN = 5000;
const SPAWN_MAX = 9000;
const FIRST_SPAWN = 800;
const LINGER_MIN = 18000;
const LINGER_MAX = 28000;
const FADE_MIN = 8000;
const FADE_MAX = 12000;
const EXCLUSION_PAD = 48;
const PLACEMENT_ATTEMPTS = 20;

// The hero section is always dark, so strokes are always white.
const STROKE_COLOR = '255, 255, 255';
const ALPHA = { min: 0.08, max: 0.16 };

// Dot-grid "paper" beneath the sketches. Dots sit on the same grid the
// glyphs snap to, with a slow diagonal wave shimmer.
const DOT_RADIUS = 1;
const DOT_BASE_OPACITY = 0.03;
const DOT_WAVE_OPACITY = 0.18;
const DOT_STATIC_OPACITY = 0.06;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function intersects(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inflate(rect: Rect, amount: number): Rect {
  return { x: rect.x - amount, y: rect.y - amount, w: rect.w + amount * 2, h: rect.h + amount * 2 };
}

function segmentDuration(segment: Segment) {
  return segment.drawMs + segment.pauseAfterMs;
}

function glyphDrawMs(glyph: Glyph) {
  return glyph.segments.reduce((sum, segment) => sum + segmentDuration(segment), 0);
}

export function startSketchHero(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');

  if (!context) {
    return () => {};
  }

  const ctx: CanvasRenderingContext2D = context;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationId = 0;
  let engineTime = 0;
  let lastFrameAt = 0;
  let nextSpawnAt = FIRST_SPAWN;
  let clusters: ActiveCluster[] = [];
  let dots: { x: number; y: number; phase: number }[] = [];
  let tabVisible = !document.hidden;
  let heroInView = true;
  let resizeTimer = 0;

  function gridUnit() {
    return width >= 1280 ? 28 : 24;
  }

  function isNarrow() {
    return width < 640;
  }

  function exclusionZone(): Rect | null {
    const content = canvas.parentElement?.querySelector<HTMLElement>('[data-hero-content]');

    if (!content) {
      return null;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    return inflate(
      {
        x: contentRect.left - canvasRect.left,
        y: contentRect.top - canvasRect.top,
        w: contentRect.width,
        h: contentRect.height
      },
      EXCLUSION_PAD
    );
  }

  function placeCluster(recipe: ClusterRecipe): Rect | null {
    const unit = gridUnit();
    const margin = unit;
    const maxX = width - recipe.bounds.w - margin;
    const maxY = (isNarrow() ? height * 0.55 : height) - recipe.bounds.h - margin;

    if (maxX <= margin || maxY <= margin) {
      return null;
    }

    const exclusion = exclusionZone();
    const liveRects = clusters.map((cluster) => inflate(cluster.rect, unit * 2));

    for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt++) {
      const x = Math.round(rand(margin, maxX) / unit) * unit;
      const y = Math.round(rand(margin, maxY) / unit) * unit;
      const rect: Rect = { x, y, w: recipe.bounds.w, h: recipe.bounds.h };

      if (exclusion && intersects(rect, exclusion)) {
        continue;
      }

      if (liveRects.some((live) => intersects(rect, live))) {
        continue;
      }

      return rect;
    }

    return null;
  }

  function activateCluster(recipe: ClusterRecipe, rect: Rect, startAt: number): ActiveCluster {
    const glyphs: ActiveGlyph[] = [];
    let cursor = startAt;

    for (const placed of recipe.glyphs) {
      cursor += placed.startDelayMs;
      const offsetGlyph = offsetPlacedGlyph(placed, rect);
      const drawTotalMs = glyphDrawMs(offsetGlyph.glyph);
      glyphs.push({ glyph: offsetGlyph.glyph, startAt: cursor, alphaT: placed.alphaT, drawTotalMs });
      cursor += drawTotalMs;
    }

    return {
      glyphs,
      rect,
      doneAt: cursor,
      lingerMs: rand(LINGER_MIN, LINGER_MAX),
      fadeMs: rand(FADE_MIN, FADE_MAX)
    };
  }

  function offsetPlacedGlyph(placed: PlacedGlyph, rect: Rect): PlacedGlyph {
    const segments = placed.glyph.segments.map((segment) => ({
      ...segment,
      points: segment.points.map((point) => ({ x: point.x + rect.x, y: point.y + rect.y }))
    }));

    return { ...placed, glyph: { segments } };
  }

  function spawnCluster() {
    const maxClusters = isNarrow() ? 3 : 5;

    if (clusters.length >= maxClusters) {
      return;
    }

    const recipe = createCluster(Math.random, gridUnit(), isNarrow());
    const rect = placeCluster(recipe);

    if (!rect) {
      return;
    }

    clusters.push(activateCluster(recipe, rect, engineTime));
  }

  function clusterAlpha(cluster: ActiveCluster): number {
    const fadeStart = cluster.doneAt + cluster.lingerMs;

    if (engineTime <= fadeStart) {
      return 1;
    }

    return 1 - clamp((engineTime - fadeStart) / cluster.fadeMs, 0, 1);
  }

  // Draw in short runs with butt caps: per-point strokes with round caps
  // overlap at low alpha and read as stippled dots instead of a pen line.
  const RUN_LENGTH = 6;

  function drawSegmentPortion(segment: Segment, progress: number, alpha: number) {
    const eased = easeInOutQuad(clamp(progress, 0, 1));
    const lastIndex = Math.max(1, Math.floor(eased * (segment.points.length - 1)));

    ctx.strokeStyle = `rgba(${STROKE_COLOR}, ${alpha})`;
    ctx.lineCap = 'butt';

    for (let runStart = 0; runStart < lastIndex; runStart += RUN_LENGTH) {
      const runEnd = Math.min(runStart + RUN_LENGTH, lastIndex);
      let widthSum = 0;

      ctx.beginPath();
      ctx.moveTo(segment.points[runStart].x, segment.points[runStart].y);

      for (let i = runStart + 1; i <= runEnd; i++) {
        ctx.lineTo(segment.points[i].x, segment.points[i].y);
        widthSum += segment.widths[i];
      }

      ctx.lineWidth = widthSum / (runEnd - runStart);
      ctx.stroke();
    }
  }

  function drawGlyph(active: ActiveGlyph, clusterFade: number) {
    const elapsed = engineTime - active.startAt;

    if (elapsed <= 0) {
      return;
    }

    const alpha = (ALPHA.min + (ALPHA.max - ALPHA.min) * active.alphaT) * clusterFade;

    if (alpha <= 0.002) {
      return;
    }

    let budget = elapsed;

    for (const segment of active.glyph.segments) {
      if (budget <= 0) {
        break;
      }

      drawSegmentPortion(segment, budget / segment.drawMs, alpha);
      budget -= segmentDuration(segment);
    }
  }

  function createDots() {
    dots = [];
    const spacing = gridUnit();
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        dots.push({ x: col * spacing, y: row * spacing, phase: Math.random() * 0.5 });
      }
    }
  }

  function drawDots(animated: boolean) {
    for (const dot of dots) {
      let opacity = DOT_STATIC_OPACITY;

      if (animated) {
        const diagonal = (dot.x + dot.y) / 300;
        const wave1 = Math.sin(engineTime * 0.0008 + diagonal + dot.phase);
        const wave2 = Math.sin(engineTime * 0.0006 - diagonal * 0.7 + dot.phase * 1.3);
        const wave3 = Math.sin(engineTime * 0.001 + diagonal * 0.5 + dot.phase * 0.8);
        const combined = (wave1 + wave2 + wave3) / 3;
        opacity = DOT_BASE_OPACITY + (combined * 0.5 + 0.5) * DOT_WAVE_OPACITY;
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${STROKE_COLOR}, ${opacity})`;
      ctx.fill();
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawDots(true);

    for (const cluster of clusters) {
      const fade = clusterAlpha(cluster);

      for (const glyph of cluster.glyphs) {
        drawGlyph(glyph, fade);
      }
    }
  }

  function tick(time: number) {
    const delta = clamp(time - lastFrameAt, 0, 64);
    lastFrameAt = time;
    engineTime += delta;

    if (engineTime >= nextSpawnAt) {
      spawnCluster();
      nextSpawnAt = engineTime + rand(SPAWN_MIN, SPAWN_MAX);
    }

    clusters = clusters.filter((cluster) => engineTime < cluster.doneAt + cluster.lingerMs + cluster.fadeMs);

    render();
    animationId = requestAnimationFrame(tick);
  }

  function renderStaticScene() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawDots(false);

    const recipe = createStaticCluster(Math.random, gridUnit());
    const margin = gridUnit();
    const rect: Rect = {
      x: Math.max(margin, width - recipe.bounds.w - margin * 3),
      y: margin * 3,
      w: recipe.bounds.w,
      h: recipe.bounds.h
    };

    for (const placed of recipe.glyphs) {
      const { glyph } = offsetPlacedGlyph(placed, rect);

      for (const segment of glyph.segments) {
        drawSegmentPortion(segment, 1, 0.2);
      }
    }
  }

  function shouldRun() {
    return tabVisible && heroInView && !motionQuery.matches;
  }

  function syncRunning() {
    if (shouldRun()) {
      if (!animationId) {
        lastFrameAt = performance.now();
        animationId = requestAnimationFrame(tick);
      }
      return;
    }

    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    }

    if (motionQuery.matches) {
      renderStaticScene();
    }
  }

  function applySize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createDots();
  }

  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const rect = canvas.getBoundingClientRect();
      const widthChanged = Math.abs(rect.width - width) > 1;
      const heightChangedALot = Math.abs(rect.height - height) >= 120;

      if (!widthChanged && !heightChangedALot) {
        // Mobile URL-bar churn: refresh the backing store but keep the scene.
        applySize();
        if (motionQuery.matches) {
          renderStaticScene();
        } else {
          render();
        }
        return;
      }

      applySize();
      clusters = [];
      nextSpawnAt = engineTime + FIRST_SPAWN;

      if (motionQuery.matches) {
        renderStaticScene();
      }
    }, 200);
  }

  function handleVisibility() {
    tabVisible = !document.hidden;
    syncRunning();
  }

  function handleMotionChange() {
    if (motionQuery.matches) {
      clusters = [];
    } else {
      nextSpawnAt = engineTime + FIRST_SPAWN;
    }
    syncRunning();
  }

  const heroObserver = new IntersectionObserver(
    (entries) => {
      heroInView = entries.some((entry) => entry.isIntersecting);
      syncRunning();
    },
    { threshold: 0.05 }
  );

  applySize();
  heroObserver.observe(canvas.parentElement ?? canvas);
  window.addEventListener('resize', handleResize);
  document.addEventListener('visibilitychange', handleVisibility);
  motionQuery.addEventListener('change', handleMotionChange);
  syncRunning();

  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    }

    window.clearTimeout(resizeTimer);
    heroObserver.disconnect();
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibility);
    motionQuery.removeEventListener('change', handleMotionChange);
    ctx.clearRect(0, 0, width, height);
  };
}
