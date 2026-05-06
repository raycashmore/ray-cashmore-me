# AI, RAG, and Content Data

## Provider Selection

- The chat adapter reads `AI_PROVIDER` from the environment.
- If `AI_PROVIDER` is unset, the default provider is `anthropic`.
- The Anthropic provider is configured as `claude-sonnet-4`.
- The OpenAI provider is configured as `gpt-4o`.

## RAG Data

- `data/knowledge-source.json` is the human-authored source of truth.
- `data/knowledge.json` is the generated artifact with embeddings included.
- If `data/knowledge-source.json` changes, regenerate `data/knowledge.json` with `bun run generate-embeddings`.
- Embeddings are generated with OpenAI `text-embedding-3-small`.

## Retrieval Flow

- The app embeds the latest user message, retrieves the top matching knowledge chunks, and builds a system prompt from those results.
- If no knowledge base loads or no relevant chunks are found, the app falls back to a limited prompt instead of inventing context.

## Feature Flags

- LaunchDarkly is initialized server-side through a singleton helper in `src/lib/launchdarkly.ts`.
- Feature flags are evaluated against an anonymous server-side context and fall back to the provided default value if evaluation fails.
