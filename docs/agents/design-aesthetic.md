# Design Aesthetic

## Swiss Style foundation

The target aesthetic is **Swiss Style (International Typographic Style)**: clear typographic hierarchy, disciplined grids, asymmetric composition, generous negative space, and restrained colour. Apply these principles responsively within the existing portfolio.

Retain the oversized name and Outfit typography. Use scale, spacing, alignment, and occasional thin rules to organise content. The result should feel personal, premium, editorial, and a little unexpected, while keeping experience and Virtual Ray easy to find.

## Personal expression

The sketches bring a personal, exploratory quality to the structured Swiss Style foundation. The guiding image is someone thinking on paper: developing an idea through construction, revision, and refinement.

- Use architecture, automotive studies, and rough doodling as themes. Prefer recognisable, intentionally composed studies.
- Combine faint construction guides with confident contours, imperfect retracing, and selective hatching. Suggest depth and discovery without dense detail or frame-to-frame jitter.
- Keep the hero near-black with white typography and warm off-white strokes. The dot grid stays faint and subordinate; any colour accent should have a clear purpose.
- Fit artwork around text and controls. Recompose on mobile rather than shrinking the desktop layout wholesale.

## Motion and accessibility

Drawing should feel gestural: varied stroke speeds, brief thinking pauses, and quick shading. Let the finished study remain visible. The current pavilion develops and settles in roughly five seconds; automotive sketches and doodles are future possibilities.

Keep motion decorative. Preserve semantic HTML, readable content, navigation, and existing feature-flag behaviour. The canvas must not intercept input or appear to assistive technology. Show the completed study immediately for reduced motion, pause animation offscreen or in hidden tabs, and stop scheduling frames when complete.

Use the existing Astro and Canvas approach. Check text-safe placement at desktop and mobile sizes, including after resizing and font loading.

## Relevant files

- [Homepage](../../src/pages/index.astro): hero, content, and chat entry point.
- [Global styles](../../src/styles/global.css): typography and theme tokens.
- [Sketch renderer](../../src/lib/sketch-hero.ts): drawing, placement, and lifecycle.
- [Pavilion study](../../src/lib/sketch-glyphs.ts): authored strokes, timing, and fit calculation.
- [Sketch tests](../../src/lib/sketch-hero.test.ts): safe placement, completion, and reduced motion.
