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

## Verification

- Format edited source and documentation with `bun x prettier --write <changed-files>`, then confirm with `bun x prettier --check <changed-files>`. Prettier and its Astro plugin are already installed and configured in `.prettierrc`.
- Run focused tests with `bun test <test-files>` and the full existing suite with `bun test` before finishing code changes.
- Run `bun run build` for code changes. Static generation evaluates LaunchDarkly flags and can require network access; an initialization failure or hang is not a successful build.
- For standalone browser TypeScript modules, a targeted check is available without adding dependencies:

  ```sh
  bun x tsc --noEmit --strict --target es2022 --module esnext --moduleResolution bundler --lib es2022,dom --skipLibCheck <changed-module-files>
  ```

  This checks the supplied modules and their imports, not Astro templates, the whole application, or Bun test files. For framework-dependent changes, use a suitable project check and state any tooling gaps. Do not describe a targeted check as full-project validation.

- No dedicated lint script or ESLint configuration is currently present. Prettier checks formatting, not application correctness.
- Run `git diff --check` for whitespace errors. For new documentation, also confirm relative links resolve to existing files and headings.

## Environment Variables

- `OPENAI_API_KEY` is used for embeddings and the OpenAI chat provider.
- `ANTHROPIC_API_KEY` is used for the Anthropic chat provider.
- `LAUNCHDARKLY_SDK_KEY` is used for server-side feature flag evaluation.
- `AI_PROVIDER` selects the chat provider: `anthropic` or `openai`.
