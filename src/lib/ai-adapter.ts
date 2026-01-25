import 'dotenv/config';
import { anthropicText } from '@tanstack/ai-anthropic';
import { openaiText } from '@tanstack/ai-openai';

type Provider = 'anthropic' | 'openai';

const PROVIDER: Provider = (process.env.AI_PROVIDER as Provider) || 'anthropic';

export function getAdapter() {
  switch (PROVIDER) {
    case 'openai':
      return openaiText('gpt-4o', {
        apiKey: process.env.OPENAI_API_KEY,
      });
    case 'anthropic':
    default:
      return anthropicText('claude-sonnet-4', {
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
  }
}
