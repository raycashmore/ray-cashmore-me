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

The automotive study follows the supplied rear three-quarter reference: a low roof, broad rear, unequal wheel ellipses, and a large wing. Preserve those proportions and perspective while omitting badges and annotations. Continue into selected wing, vent, and diffuser details after establishing the main form. Keep wheels as simple outlines without hubs or spokes. Use a few exploratory overdraws and patches of shading rather than a uniformly finished outline.

## Motion and accessibility

Drawing should feel gestural: varied stroke speeds, brief thinking pauses, and quick shading. The pavilion draws in roughly sixteen seconds; the coupé continues into a detail pass for roughly twenty-five seconds. Each holds for twelve seconds after its final stroke, then fades before the next begins. The pavilion and automotive study rotate from a random first choice without consecutive repeats; rough doodles are a future possibility.

Keep motion decorative. Preserve semantic HTML, readable content, navigation, and existing feature-flag behaviour. The canvas must not intercept input or appear to assistive technology. Show a completed static study immediately for reduced motion. Keep the pause/resume control visually hidden until keyboard focus, with screen-reader access, pause offscreen or in hidden tabs, and avoid repainting the canvas during the static hold.

Use the existing Astro and Canvas approach. Check text-safe placement at desktop and mobile sizes, including after resizing and font loading.

## Relevant files

- [Homepage](../../src/pages/index.astro): hero, content, and chat entry point.
- [Global styles](../../src/styles/global.css): typography and theme tokens.
- [Sketch renderer](../../src/lib/sketch-hero.ts): drawing, placement, and lifecycle.
- [Pavilion study](../../src/lib/sketch-glyphs.ts): authored strokes, timing, and fit calculation.
- [Coupé study](../../src/lib/sketch-coupe.ts): gesture curves, wheel studies, and shading.
- [Sketch tests](../../src/lib/sketch-hero.test.ts): safe placement, completion, and reduced motion.
