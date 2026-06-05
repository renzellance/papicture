/* papicture — studio provider selector.
   STUDIO_PROVIDER: mock (zero-key, sharp cleanup) | gemini (nano banana). */

import type { StudioProvider } from './types';
import { geminiProvider } from './gemini';
import { falProvider } from './fal';
import { sharpProvider } from './sharpFallback';

export * from './types';
export { isGenerative, buildPrompt } from './prompts';
export { fitTier, sharpProvider } from './sharpFallback';

export function getProvider(name = process.env.STUDIO_PROVIDER || 'mock'): StudioProvider {
  switch (name) {
    case 'gemini':
      return geminiProvider();
    case 'fal':
      return falProvider();
    case 'mock':
    case 'sharp':
      return sharpProvider();
    default:
      throw new Error(`Unknown STUDIO_PROVIDER: ${name}`);
  }
}
