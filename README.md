# Ray Cashmore

Personal portfolio website featuring an AI-powered conversational interface with RAG (Retrieval Augmented Generation).

## Technical Highlights

### RAG-Powered AI Chat

A "Virtual Ray" chat interface that answers questions about my experience and skills using semantic search:

- **Vector Embeddings**: OpenAI `text-embedding-3-small` with pre-computed 1536-dimensional vectors
- **Semantic Retrieval**: Custom cosine similarity search with configurable threshold filtering
- **Knowledge Base**: Structured chunks with typed metadata (experience, skills, identity, boundaries)
- **Prompt Engineering**: Context-aware system prompts with hallucination prevention

### Multi-Provider LLM Abstraction

- Environment-driven provider selection (Claude/GPT-4o)
- TanStack AI adapters with SSE streaming
- React hooks integration via `@tanstack/ai-react`

### Feature Flagging

- LaunchDarkly server-side SDK integration
- Singleton pattern with async initialization
- Graceful degradation with fallback defaults

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Astro 5 with React 19 islands |
| AI/ML | OpenAI Embeddings, Claude/GPT-4o, TanStack AI |
| Feature Flags | LaunchDarkly |
| Styling | Tailwind CSS v4 with custom theme system |
| Content | Astro Content Collections with Zod validation |
| Deployment | Vercel (serverless functions) |
| Runtime | Bun |

## Architecture

```
src/
├── lib/
│   ├── rag/           # RAG pipeline (embeddings, retrieval, prompts)
│   ├── ai-adapter.ts  # Multi-provider LLM abstraction
│   └── launchdarkly.ts
├── components/        # React islands (Chat, etc.)
├── pages/
│   ├── api/           # Serverless endpoints
│   └── thoughts/      # Blog with dynamic routing
└── content/           # Markdown content collections

data/
├── knowledge-source.json  # Human-authored knowledge base
└── knowledge.json         # Pre-computed embeddings (529KB)
```

## Getting Started

```bash
bun install      # Install dependencies
bun run dev      # Start development server
bun run build    # Production build
bun run preview  # Preview production build
```

### Environment Variables

```
OPENAI_API_KEY=         # For embeddings and GPT-4o
ANTHROPIC_API_KEY=      # For Claude
LAUNCHDARKLY_SDK_KEY=   # Feature flags
AI_PROVIDER=            # "anthropic" or "openai"
```
