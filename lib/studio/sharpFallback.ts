/* papicture — non-generative cleanup provider (zero-key mock + document-safe path)
   and shared tier-fitting. This is honest: orient, even exposure, gentle lift —
   it never fabricates attire or alters the face, which is what visa / doc-safe
   formats require. */

import sharp from 'sharp';
import type { StudioProvider, StudioRequest, StudioOutput } from './types';
import type { Tier } from './types';

export function sharpProvider(): StudioProvider {
  return {
    name: 'sharp-cleanup',
    async convert(req: StudioRequest): Promise<StudioOutput> {
      const out = await sharp(req.image)
        .rotate()
        .normalize()
        .modulate({ brightness: 1.03, saturation: 1.05 })
        .sharpen({ sigma: 0.6 })
        .jpeg({ quality: 90 })
        .toBuffer();
      return { image: out, mime: 'image/jpeg', meta: { note: 'non-generative cleanup' } };
    },
  };
}

/** Resize + encode for a tier: preview is shown pre-pay, final is post-pay. */
export async function fitTier(buf: Buffer, tier: Tier): Promise<Buffer> {
  const max = tier === 'preview' ? 1024 : 1600;
  return sharp(buf)
    .rotate()
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: tier === 'preview' ? 86 : 94 })
    .toBuffer();
}
