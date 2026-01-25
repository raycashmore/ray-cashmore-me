import type { APIRoute } from 'astro';
import { chat, toServerSentEventsResponse } from '@tanstack/ai';
import { getAdapter } from '../../lib/ai-adapter';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { messages } = await request.json();
  const adapter = getAdapter();

  const stream = chat({
    adapter,
    messages,
  });

  return toServerSentEventsResponse(stream);
};
