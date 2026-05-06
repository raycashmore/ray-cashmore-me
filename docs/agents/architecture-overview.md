# Architecture Overview

## Framework

- The site uses Astro 5 with React 19 islands.
- The deployment target is Vercel via the Astro Vercel adapter.

## Key Directories

- `src/pages/` contains file-based routes, including `src/pages/api/` for server endpoints.
- `src/components/` contains Astro components and React islands.
- `src/layouts/` contains page and post layouts.
- `src/lib/` contains shared application logic.
- `src/lib/rag/` contains retrieval, embeddings, prompt-building, and RAG orchestration.
- `src/content/` contains markdown content used by Astro content collections.
- `data/` contains the RAG knowledge source and the generated embedding dataset.
- `public/` contains static assets served at the site root.

## Important Flows

- The chat API route builds RAG context from the latest user message before calling the configured model adapter.
- The knowledge base is loaded from `data/knowledge.json` at runtime.
- Blog content is served from Astro content collections under `src/content/`.
