/* papicture — per-look prompt templates for the selfie -> studio conversion.
   Identity-lock language is baked in: change attire / light / background only,
   never the face. Document-safe / visa looks are NOT generative (see isGenerative). */

// looks that get the real generative studio transformation
const GENERATIVE = ['original', 'smartcasual', 'formal', 'studio', 'linkedin'];

export function isGenerative(lookId: string): boolean {
  return GENERATIVE.includes(lookId);
}

function attireClause(lookId: string, sub?: string | null): string {
  switch (lookId) {
    case 'original':
      return 'Keep their current clothing exactly as it is. Do not change, replace, or restyle the outfit.';
    case 'smartcasual':
      return `Dress the person in a neat ${sub || 'plain collared shirt'} for a tidy smart-casual look.`;
    case 'formal':
      return `Dress the person in ${sub || 'a dark blazer over a white shirt'} for a formal, professional look.`;
    case 'studio':
    case 'linkedin':
      return `Dress the person in clean, professional smart-casual attire suitable for a ${lookId === 'linkedin' ? 'LinkedIn or résumé' : 'profile'} headshot.`;
    default:
      return 'Keep their current clothing.';
  }
}

export function buildPrompt({ lookId, sub, bgName }:
  { lookId: string; sub?: string | null; bgName?: string }): string {
  const colour = bgName ? bgName.toLowerCase() : 'neutral light-gray';
  const bg = `Completely remove and replace the original background with a seamless, smooth, evenly lit ${colour} professional studio backdrop. None of the original surroundings may remain.`;

  return [
    'Transform this casual phone selfie into a professional photo-studio portrait of the SAME person.',
    'Critically preserve the exact facial identity: features, bone structure, skin tone, age, hair and natural expression.',
    'Do not beautify, slim, smooth, reshape, or alter the face in any way.',
    'Keep it fully photorealistic with natural skin texture — no plastic, waxy or over-retouched look.',
    'Completely re-light the photo with soft, even, professional studio lighting and gentle catchlights in the eyes, removing harsh phone-camera shadows.',
    'Recompose as a forward-facing head-and-shoulders studio portrait.',
    bg,
    attireClause(lookId, sub),
    'The result must clearly look like a studio photo, not the original snapshot. Return a single realistic photograph.',
  ].join(' ');
}
