import type { APIRoute } from 'astro';
import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { getAdapter } from '../../lib/ai-adapter';
import { getFeatureFlag } from '../../lib/launchdarkly';

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

  const stream = chat({
    adapter,
    messages,
  });

  return toServerSentEventsResponse(stream);
};
