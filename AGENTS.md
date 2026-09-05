# AGENTS.md

This repo is Ray Cashmore's Astro portfolio site, including a RAG-backed "Virtual Ray" chat experience.

- Use `bun` for installs and scripts (`bun.lock` is the source-of-truth lockfile; `package.json` requires `bun >= 1.0.0`).
- Standard project commands: `bun run dev`, `bun run build`, `bun run preview`.
- A dedicated typecheck script is not configured. `bun run astro check` currently prompts to install `@astrojs/check`.

## Before finishing a change

- Run `bun x prettier --write <changed-files>` on the source and documentation files you changed, then `bun x prettier --check <changed-files>`. Use the existing `.prettierrc`; avoid unrelated repository-wide formatting.
- Run relevant behavioural tests with `bun test <test-files>` while working. For code changes, finish with `bun test` and `bun run build`.
- Run an appropriate TypeScript check for changed TypeScript modules; see [verification commands and limitations](docs/agents/runtime-and-commands.md#verification). A successful Astro build is not a typecheck.
- For visual or interaction changes, inspect the running page in a browser at desktop and mobile sizes. Verify relevant reduced-motion behaviour, visible content, and browser errors.
- Run `git diff --check`. Report checks performed and any failures or checks that could not run; do not claim unperformed checks passed.
- Documentation-only changes need formatting, link-target verification, and `git diff --check`; skip builds and tests unless runtime behaviour also changed.

Read more only when the task needs it:

- [Runtime and commands](docs/agents/runtime-and-commands.md)
- [Architecture overview](docs/agents/architecture-overview.md)
- [AI, RAG, and content data](docs/agents/ai-rag-and-content.md)
- [UI stack](docs/agents/ui-stack.md)
- [Design aesthetic](docs/agents/design-aesthetic.md) — read before changing visuals or motion.
