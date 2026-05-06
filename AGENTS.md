# AGENTS.md

This repo is Ray Cashmore's Astro portfolio site, including a RAG-backed "Virtual Ray" chat experience.

- Use `bun` for installs and scripts (`bun.lock` is the source-of-truth lockfile; `package.json` requires `bun >= 1.0.0`).
- Standard project commands: `bun run dev`, `bun run build`, `bun run preview`.
- A dedicated typecheck script is not configured. `bun run astro check` currently prompts to install `@astrojs/check`.

Read more only when the task needs it:

- [Runtime and commands](docs/agents/runtime-and-commands.md)
- [Architecture overview](docs/agents/architecture-overview.md)
- [AI, RAG, and content data](docs/agents/ai-rag-and-content.md)
- [UI stack](docs/agents/ui-stack.md)
