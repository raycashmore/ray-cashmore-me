import { afterEach, expect, test } from 'bun:test';
import { createPavilion, DRAW_DURATION, fitStudy, STUDY_SIZE } from './sketch-glyphs';
import { createAtrium } from './sketch-atrium';
import { createCoupe } from './sketch-coupe';
import { FADE_DURATION, HOLD_DURATION, startSketchHero } from './sketch-hero';

for (const [width, height, text] of [
  [390, 844, { x: 32, y: 530, w: 240, h: 220 }],
  [1280, 720, { x: 96, y: 240, w: 585, h: 380 }],
  [320, 568, { x: 32, y: 280, w: 250, h: 220 }],
  [844, 390, { x: 32, y: 30, w: 440, h: 320 }]
] as const) {
  test(`study fits around content at ${width} × ${height}`, () => {
    const study = fitStudy(width, height, text);
    expect(study).not.toBeNull();
    if (!study) return;
    expect(study.x).toBeGreaterThanOrEqual(0);
    expect(study.y).toBeGreaterThanOrEqual(92);
    expect(study.x + study.w).toBeLessThanOrEqual(width);
    expect(study.y + study.h).toBeLessThanOrEqual(height);
    expect(study.w / study.h).toBeCloseTo(STUDY_SIZE.w / STUDY_SIZE.h);
    expect(
      study.x < text.x + text.w && study.x + study.w > text.x && study.y < text.y + text.h && study.y + study.h > text.y
    ).toBe(false);
  });
}

test('all studies finish within the animation and stay inside the safe footprint', () => {
  for (const stroke of [...createPavilion(), ...createCoupe(), ...createAtrium()]) {
    expect(stroke.start + stroke.duration).toBeLessThanOrEqual(45000);
    for (const point of stroke.points) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(STUDY_SIZE.w);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(STUDY_SIZE.h);
    }
  }
});

const originals = new Map<string, PropertyDescriptor | undefined>();
function stub(name: string, value: unknown) {
  originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
}
afterEach(() => {
  for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
  originals.clear();
});

function scene(reduced: boolean, choice = 0) {
  let drawn = 0;
  let nextFrame: FrameRequestCallback | undefined;
  const listeners = new Map<string, () => void>();
  const motion = {
    matches: reduced,
    addEventListener(name: string, callback: () => void) {
      listeners.set(name, callback);
    },
    removeEventListener() {}
  };
  let toggle = () => {};
  const button = {
    hidden: true,
    textContent: '',
    setAttribute() {},
    addEventListener(_name: string, callback: () => void) {
      toggle = callback;
    },
    removeEventListener() {}
  };
  const hero = {
    querySelector(selector: string) {
      return selector === '[data-sketch-pause]' ? button : null;
    }
  };
  const doc = {
    hidden: false,
    fonts: { ready: Promise.resolve() },
    addEventListener(name: string, listener: () => void) {
      listeners.set(name, listener);
    },
    removeEventListener() {}
  };
  const context = {
    clearRect() {
      drawn = 0;
    },
    beginPath() {},
    arc() {},
    fill() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
    moveTo() {},
    lineTo() {},
    setTransform() {},
    stroke() {
      drawn++;
    }
  };
  const canvas = {
    getContext: () => context,
    parentElement: hero,
    getBoundingClientRect: () => ({ width: 1000, height: 700, left: 0, top: 0 })
  } as unknown as HTMLCanvasElement;
  stub('window', { matchMedia: () => motion, devicePixelRatio: 1 });
  stub('document', doc);
  stub(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
  stub(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
  stub('requestAnimationFrame', (callback: FrameRequestCallback) => {
    nextFrame = callback;
    return 1;
  });
  stub('cancelAnimationFrame', () => {
    nextFrame = undefined;
  });
  const cleanup = startSketchHero(canvas, () => choice);
  return {
    cleanup,
    doc,
    motion,
    button,
    toggle: () => toggle(),
    listeners,
    drawn: () => drawn,
    pending: () => Boolean(nextFrame),
    advance(time: number) {
      const callback = nextFrame;
      nextFrame = undefined;
      callback?.(time);
    }
  };
}

test('reduced motion paints a finished coupé without scheduling animation', () => {
  const staticScene = scene(true);
  expect(staticScene.drawn()).toBeGreaterThan(0);
  expect(staticScene.pending()).toBe(false);
  staticScene.cleanup();
});

test('rotation pauses in hidden tabs and responds to pause/resume', () => {
  const animated = scene(false);
  expect(animated.pending()).toBe(true);
  animated.doc.hidden = true;
  animated.listeners.get('visibilitychange')?.();
  expect(animated.pending()).toBe(false);
  animated.doc.hidden = false;
  animated.listeners.get('visibilitychange')?.();
  const now = performance.now();
  for (let i = 1; i <= Math.ceil(DRAW_DURATION / 64) + 1; i++) animated.advance(now + i * 64);
  expect(animated.drawn()).toBeGreaterThan(0);
  expect(animated.pending()).toBe(true);
  animated.toggle();
  expect(animated.pending()).toBe(false);
  expect(animated.button.textContent).toBe('Resume sketches');
  animated.toggle();
  expect(animated.pending()).toBe(true);
  animated.cleanup();
  expect(animated.pending()).toBe(false);
});

for (const choice of [0, 0.99]) {
  test(`rotation changes the study after its hold and fade (choice ${choice})`, () => {
    const animated = scene(false, choice);
    const now = performance.now();
    let step = 0;
    const advance = (duration: number) => {
      for (let i = 0; i < Math.ceil(duration / 64); i++) animated.advance(now + ++step * 64);
    };
    const firstDuration = Math.max(
      ...(choice === 0 ? createCoupe() : createAtrium()).map((stroke) => stroke.start + stroke.duration)
    );
    const nextDuration = Math.max(
      ...(choice === 0 ? createAtrium() : createCoupe()).map((stroke) => stroke.start + stroke.duration)
    );
    advance(firstDuration);
    const first = animated.drawn();
    advance(1000);
    expect(animated.drawn()).toBe(first);
    advance(HOLD_DURATION + FADE_DURATION + nextDuration);
    expect(animated.drawn()).toBeGreaterThan(0);
    expect(animated.drawn()).not.toBe(first);
    animated.motion.matches = true;
    animated.listeners.get('change')?.();
    expect(animated.pending()).toBe(false);
    expect(animated.button.hidden).toBe(true);
    animated.cleanup();
  });
}

test('coupé detail continues beyond the original outline timing', () => {
  const strokes = createCoupe();
  expect(strokes.some((stroke) => stroke.start > DRAW_DURATION)).toBe(true);
  expect(Math.max(...strokes.map((stroke) => stroke.start + stroke.duration))).toBeGreaterThan(DRAW_DURATION * 1.5);
});

test('reduced motion paints a finished atrium without scheduling animation', () => {
  const staticScene = scene(true, 0.99);
  expect(staticScene.drawn()).toBeGreaterThan(0);
  expect(staticScene.pending()).toBe(false);
  expect(staticScene.button.hidden).toBe(true);
  staticScene.cleanup();
});
