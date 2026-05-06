# UI Stack

## Frontend Stack

- Astro provides routing and page composition.
- React is used for interactive islands such as chat.
- Tailwind CSS v4 is wired in through the Vite plugin configured in `astro.config.mjs`.

## Styling

- Global styles live in `src/styles/global.css`.
- Tailwind is imported through the global stylesheet rather than a separate Tailwind config file.

## Content

- Astro content collections are configured in `src/content.config.ts`.
- Thought posts live under `src/content/thoughts/`.
