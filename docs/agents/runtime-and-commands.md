# Runtime and Commands

## Runtime

- Use `bun`.
- The repo declares `bun >= 1.0.0` in `package.json`.
- `bun.lock` is present, so avoid switching package managers unless the project is intentionally being migrated.

## Commands

- `bun run dev` starts the Astro dev server.
- `bun run build` creates the production build.
- `bun run preview` serves the production build locally.
- `bun run generate-embeddings` runs `scripts/generate-embeddings.ts`.

## Typechecking

- There is no dedicated typecheck script in `package.json`.
- `bun run astro check` is the closest project-native path, but it currently prompts to install `@astrojs/check`.

## Environment Variables

- `OPENAI_API_KEY` is used for embeddings and the OpenAI chat provider.
- `ANTHROPIC_API_KEY` is used for the Anthropic chat provider.
- `LAUNCHDARKLY_SDK_KEY` is used for server-side feature flag evaluation.
- `AI_PROVIDER` selects the chat provider: `anthropic` or `openai`.
