/* papicture — studio photo generation.
 *
 * The selfie -> studio portrait transformation (the moat). Uses lib/studio:
 *   - generative looks (As is / smart casual / formal / studio / linkedin) go to
 *     the configured provider (e.g. nano banana) — identity-locked relight +
 *     attire + clean backdrop.
 *   - document-safe / visa formats are NEVER generative: honest sharp cleanup
 *     only (crop/resize/bg/exposure), so visa photos stay truthful.
 * Falls back to sharp cleanup if the provider errors, so the funnel never breaks.
 *
 * Provider + key via env: STUDIO_PROVIDER (mock | gemini), GEMINI_API_KEY.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getProvider, isGenerative, fitTier, sharpProvider } from '@/lib/studio';
import { FORMATS } from '@/lib/data';

export const runtime = 'nodejs';
export const maxDuration = 30;

function dataUrlToBuffer(dataUrl: string): Buffer {
  const comma = dataUrl.indexOf(',');
  return Buffer.from(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl, 'base64');
}

export async function POST(req: NextRequest) {
  try {
    const { image, lookId = 'original', sub = null, bgName, format, tier = 'preview' } = await req.json();
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const buf = dataUrlToBuffer(image);
    const fmt = format ? FORMATS.find((f) => f.id === format) : null;
    const strict = fmt?.strict === 'strict';          // visa: never generative
    const providerName = process.env.STUDIO_PROVIDER || 'mock';
    const wantGenerative = isGenerative(lookId) && !strict && providerName !== 'mock' && providerName !== 'sharp';

    let outBuf: Buffer;
    let mode: string;

    if (wantGenerative) {
      try {
        const res = await getProvider(providerName).convert({ image: buf, mime: 'image/jpeg', lookId, sub, bgName, tier });
        outBuf = await fitTier(res.image, tier);
        mode = 'ai';
      } catch (err) {
        console.error('[generate] provider failed, falling back to cleanup', err);
        const res = await sharpProvider().convert({ image: buf, mime: 'image/jpeg', lookId, tier });
        outBuf = await fitTier(res.image, tier);
        mode = 'fallback';
      }
    } else {
      const res = await sharpProvider().convert({ image: buf, mime: 'image/jpeg', lookId, tier });
      outBuf = await fitTier(res.image, tier);
      mode = strict ? 'docsafe' : 'cleanup';
    }

    return NextResponse.json({ studio: `data:image/jpeg;base64,${outBuf.toString('base64')}`, mode });
  } catch (err) {
    console.error('[generate] failed', err);
    return NextResponse.json({ error: 'Could not process the photo.' }, { status: 500 });
  }
}
