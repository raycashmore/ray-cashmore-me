import { createPavilion, fitStudy, STUDY_SIZE } from './sketch-glyphs';
import type { Rect, Stroke } from './sketch-glyphs';
import { createCoupe } from './sketch-coupe';

const STUDIES = [createCoupe, createPavilion];
export const HOLD_DURATION = 12000;
export const FADE_DURATION = 1400;

export function startSketchHero(canvas: HTMLCanvasElement, random = Math.random) {
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  const ctx = context;
  const hero = canvas.parentElement;
  const content = hero?.querySelector<HTMLElement>('[data-hero-content]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pauseButton = hero?.querySelector<HTMLButtonElement>('[data-sketch-pause]');
  let studyIndex = Math.floor(random() * STUDIES.length);
  let strokes = STUDIES[studyIndex]();
  let drawDuration = Math.max(...strokes.map((stroke) => stroke.start + stroke.duration));
  let paused = false;
  let width = 0;
  let height = 0;
  let frame = 0;
  let elapsed = 260;
  let previous = 0;
  let inView = true;
  let disposed = false;
  let placement: Rect | null = null;

  function drawStroke(stroke: Stroke, time: number, scale: number) {
    const progress = Math.min(1, Math.max(0, (time - stroke.start) / stroke.duration));
    if (!progress) return;
    // Long strokes travel almost uniformly; the slight acceleration suggests a
    // pen gesture rather than the repeated ease-in/ease-out of a UI transition.
    const end = (stroke.points.length - 1) * Math.pow(progress, 0.85);
    ctx.strokeStyle = `rgba(238, 239, 230, ${stroke.opacity})`;
    for (let start = 0; start < end; start += 8) {
      const stop = Math.min(start + 8, end);
      const pressure = 0.72 + Math.sin(((start + stop) / 2 / (stroke.points.length - 1)) * Math.PI) * 0.28;
      ctx.lineWidth = (stroke.width * pressure) / Math.pow(scale, 0.28);
      ctx.beginPath();
      ctx.moveTo(stroke.points[start].x, stroke.points[start].y);
      for (let i = start + 1; i <= Math.floor(stop); i++) ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      const index = Math.floor(stop);
      const next = stroke.points[Math.min(index + 1, stroke.points.length - 1)];
      const fraction = stop - index;
      ctx.lineTo(
        stroke.points[index].x + (next.x - stroke.points[index].x) * fraction,
        stroke.points[index].y + (next.y - stroke.points[index].y) * fraction
      );
      ctx.stroke();
    }
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    const unit = width >= 1280 ? 28 : 24;
    for (let y = 0; y < height; y += unit) {
      for (let x = 0; x < width; x += unit) {
        ctx.beginPath();
        ctx.arc(x, y, 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (!placement) return;
    const scale = placement.w / STUDY_SIZE.w;
    ctx.save();
    ctx.globalAlpha =
      motion.matches || paused ? 1 : 1 - Math.max(0, (elapsed - drawDuration - HOLD_DURATION) / FADE_DURATION);
    ctx.translate(placement.x, placement.y);
    ctx.scale(scale, scale);
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'round';
    for (const stroke of strokes) drawStroke(stroke, motion.matches ? drawDuration : elapsed, scale);
    ctx.restore();
  }

  function shouldRun() {
    return !disposed && !document.hidden && inView && !motion.matches && !paused;
  }

  function tick(now: number) {
    frame = 0;
    const before = elapsed;
    elapsed += Math.min(now - previous, 64);
    previous = now;
    if (elapsed >= drawDuration + HOLD_DURATION + FADE_DURATION) {
      // Choose among the other studies; with two, this naturally alternates
      // after a random first choice. More studies can join without repeats.
      studyIndex = (studyIndex + 1 + Math.floor(random() * (STUDIES.length - 1))) % STUDIES.length;
      strokes = STUDIES[studyIndex]();
      drawDuration = Math.max(...strokes.map((stroke) => stroke.start + stroke.duration));
      elapsed = 0;
    }
    if (before < drawDuration || elapsed >= drawDuration + HOLD_DURATION || elapsed === 0) render();
    if (shouldRun()) frame = requestAnimationFrame(tick);
  }

  function sync() {
    if (pauseButton) {
      pauseButton.hidden = motion.matches;
      pauseButton.textContent = paused ? 'Resume sketches' : 'Pause sketches';
      pauseButton.setAttribute('aria-pressed', String(paused));
    }
    if (shouldRun()) {
      if (!frame) {
        previous = performance.now();
        frame = requestAnimationFrame(tick);
      }
    } else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    render();
  }

  function togglePause() {
    paused = !paused;
    sync();
  }

  function resize() {
    if (disposed) return;
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // The content wrapper includes broad empty columns. Measure the actual text
    // so the study can use that space without ever crossing a name or tagline.
    const textRects: DOMRect[] = [];
    if (content) {
      const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        if (!walker.currentNode.textContent?.trim()) continue;
        range.selectNodeContents(walker.currentNode);
        textRects.push(range.getBoundingClientRect());
      }
    }
    const text = textRects.length
      ? {
          x: Math.min(...textRects.map((rect) => rect.left)) - bounds.left,
          y: Math.min(...textRects.map((rect) => rect.top)) - bounds.top,
          w: Math.max(...textRects.map((rect) => rect.right)) - Math.min(...textRects.map((rect) => rect.left)),
          h: Math.max(...textRects.map((rect) => rect.bottom)) - Math.min(...textRects.map((rect) => rect.top))
        }
      : null;
    placement = fitStudy(width, height, text);
    render();
  }

  const visibility = new IntersectionObserver(
    (entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      sync();
    },
    { threshold: 0.05 }
  );
  const sizing = new ResizeObserver(resize);
  sizing.observe(canvas);
  if (content) sizing.observe(content);
  if (hero) visibility.observe(hero);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  pauseButton?.addEventListener('click', togglePause);
  // Font loading can move the text exclusion zone without resizing the canvas.
  void document.fonts.ready.then(resize);
  resize();
  sync();

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    sizing.disconnect();
    visibility.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', sync);
    pauseButton?.removeEventListener('click', togglePause);
    ctx.clearRect(0, 0, width, height);
  };
}
