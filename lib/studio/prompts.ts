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
  const bg = bgName
    ? `Place the person on a clean, smooth, evenly lit ${bgName.toLowerCase()} studio backdrop with no clutter.`
    : 'Place the person on a clean, smooth, evenly lit neutral light-gray studio backdrop with no clutter.';

  return [
    'Transform this casual selfie into a professional photo-studio portrait of the SAME person.',
    'Critically preserve the exact facial identity: features, bone structure, skin tone, age, hair and natural expression.',
    'Do not beautify, slim, smooth, reshape, or alter the face in any way.',
    'Keep it fully photorealistic with natural skin texture — no plastic, waxy or over-retouched look.',
    'Relight with soft, even professional studio lighting and gentle catchlights in the eyes.',
    'Compose as a forward-facing head-and-shoulders portrait.',
    bg,
    attireClause(lookId, sub),
    'Return a single realistic photograph.',
  ].join(' ');
}
