# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
bun install      # Install dependencies
bun run dev      # Start development server
bun run build    # Production build
bun run preview  # Preview production build
```

## Tech Stack

- **Framework**: Astro 5
- **Package Manager**: Bun (required: >=1.0.0)
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite plugin)
- **TypeScript**: Strict mode (extends astro/tsconfigs/strict)

## Architecture

- `src/pages/` - Astro pages (file-based routing)
- `src/styles/global.css` - Global styles with Tailwind import
- `public/` - Static assets served at root
- Tailwind is configured as a Vite plugin in `astro.config.mjs`