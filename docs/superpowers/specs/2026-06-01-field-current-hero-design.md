# Field Current Hero Design

## Summary

Replace the homepage hero's wavy dot grid with a faint canvas animation that suggests a designer sketching toward a vision. The effect should use lingering curved pencil-like lines, not literal buildings, cars, software diagrams, boxes, or arrows.

The animation should feel like software architecture expressed through elegant industrial-design marks: partial, searching, and unresolved.

## Context

The homepage hero currently renders a full-screen black section with a canvas dot grid behind the name and cycling title. The implementation lives in `src/pages/index.astro` and uses Canvas 2D with `requestAnimationFrame`.

The site uses Astro, Tailwind CSS v4 through `src/styles/global.css`, and a restrained black-and-white visual language. The new effect should preserve that restraint and keep the hero typography dominant.

## Goals

- Remove the existing wavy dot grid from the hero.
- Add a faint "field current" sketch effect made mostly of long curved strokes.
- Make the animation feel like something is forming over time.
- Let strokes linger before fading so the scene feels accumulated, not flickery.
- Keep the marks abstract enough that they never become a concrete object.
- Preserve legibility for "Ray Cashmore" and the cycling title.
- Show a plain black hero background for users who prefer reduced motion.
- Avoid new runtime dependencies.

## Non-Goals

- Do not draw literal buildings, cars, system diagrams, boxes, arrows, or recognizable objects.
- Do not add a reusable animation framework.
- Do not add an external sketching library unless implementation proves native Canvas 2D cannot achieve the desired feel.
- Do not redesign the hero layout, typography, or downstream page sections.

## Visual Direction

The effect should resemble a dark drafting surface with a few pale graphite marks. Curves do most of the expressive work. Straight guide lines can appear rarely and faintly as background texture, but curves must dominate the composition.

Each stroke should draw in slowly, remain visible for several seconds, then fade out. The canvas should always contain a small number of active and fading marks so the viewer senses a thought taking shape. The result should feel deliberate, not random.

The composition should leave breathing room around the hero text. Strokes can pass behind the text at very low alpha, but the text must remain readable at all times.

## Technical Design

Keep the effect local to `src/pages/index.astro` and replace the current dot-grid script. Use Canvas 2D directly.

Model the animation with a bounded list of stroke objects. Each stroke should include:

- Geometry: curve control points or line endpoints.
- Timing: age, draw duration, linger duration, fade duration, and total lifetime.
- Appearance: opacity, width, jitter seed, and type.
- State: calculated reveal progress and fade progress.

Use two stroke factories:

- `createCurveStroke()` generates long, designerly Bezier curves biased toward broad arcs and diagonal movement.
- `createGuideStroke()` generates rare, faint technical guide lines.

Use one render function:

- `drawStroke()` renders the revealed portion of a stroke and applies alpha from its draw, linger, and fade phase.

The animation loop should:

1. Clear the canvas.
2. Add new strokes at a slow cadence.
3. Advance each stroke's age.
4. Draw active strokes.
5. Remove expired strokes.
6. Schedule the next frame with `requestAnimationFrame`.

Resize should reset the canvas for the current device pixel ratio and rebuild the composition cleanly. The code should avoid unbounded arrays, excessive per-frame allocation, and noisy layout reads.

## Reduced Motion

If `window.matchMedia('(prefers-reduced-motion: reduce)')` matches, do not start the animation. Leave the hero background plain black.

If the preference changes while the page is open, the implementation should stop and clear the animation when reduced motion turns on. It should restart the animation when reduced motion turns off.

## Acceptance Criteria

- The old dot grid no longer appears.
- The hero shows faint curved sketch lines when motion is allowed.
- Lines draw slowly, linger, and fade slowly.
- The effect suggests formation and discovery.
- The effect never resolves into a literal object or software diagram.
- The hero text remains legible at desktop and mobile sizes.
- Reduced-motion users see a plain black hero background.
- The canvas handles resize and high-DPI displays.
- No new runtime dependency is added.

## Verification

Run:

```bash
bun run build
```

Then start the local site:

```bash
bun run dev
```

Use the browser to inspect the homepage at desktop and mobile widths. Confirm the canvas is visible when motion is allowed and absent when reduced motion is emulated.
