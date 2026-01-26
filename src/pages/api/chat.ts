import type { APIRoute } from 'astro';
import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { getAdapter } from '../../lib/ai-adapter';
import { getFeatureFlag } from '../../lib/launchdarkly';
import { buildRAGContext, getLatestUserMessage } from '../../lib/rag';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const isChatEnabled = await getFeatureFlag('ai-chat', false);

  if (!isChatEnabled) {
    return new Response(JSON.stringify({ error: 'Feature not available' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = await request.json();
  const adapter = getAdapter();

  // Get RAG context based on the latest user message
  const latestMessage = getLatestUserMessage(messages);
  const ragContext = latestMessage
    ? await buildRAGContext(latestMessage)
    : null;

  const stream = chat({
    adapter,
    messages,
    systemPrompts: ragContext ? [ragContext.systemPrompt] : undefined,
    temperature: 0.2,
  });

  return toServerSentEventsResponse(stream);
};
