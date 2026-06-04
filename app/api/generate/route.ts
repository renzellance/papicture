/* papicture — studio photo generation.
 *
 * THIS IS THE AI SEAM. Today it does honest, real work: it takes the uploaded
 * selfie and produces a cleaned "studio" version (auto-orient, even exposure,
 * gentle colour + sharpness lift) with sharp. It does NOT fabricate attire or
 * reshape the face — that keeps document-safe / visa looks truthful.
 *
 * To make the attire/background swap real later, set USE_AI_STUDIO=1 and call
 * an image model where marked below (input: the buffer + `look`; output: a PNG
 * buffer). The rest of the funnel already layouts the result on top per format.
 */
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const maxDuration = 30;

function dataUrlToBuffer(dataUrl: string): Buffer {
  const comma = dataUrl.indexOf(',');
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Buffer.from(b64, 'base64');
}

export async function POST(req: NextRequest) {
  try {
    const { image, look } = await req.json();
    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const input = dataUrlToBuffer(image);

    // --- AI seam ---------------------------------------------------------
    // if (process.env.USE_AI_STUDIO === '1' && look && look !== 'docsafe' && look !== 'original') {
    //   const out = await callImageModel(input, look); // returns Buffer
    //   return NextResponse.json({ studio: `data:image/jpeg;base64,${out.toString('base64')}` });
    // }
    // ---------------------------------------------------------------------

    // Honest studio cleanup: orient, even out exposure, gentle lift + sharpen.
    const docSafe = look === 'docsafe' || look === 'original';
    let pipe = sharp(input).rotate().normalize();
    if (!docSafe) {
      // a touch more polish for the non-document looks
      pipe = pipe.modulate({ brightness: 1.04, saturation: 1.07 });
    }
    const out = await pipe.sharpen({ sigma: 0.6 }).jpeg({ quality: 90 }).toBuffer();

    return NextResponse.json({
      studio: `data:image/jpeg;base64,${out.toString('base64')}`,
      mode: process.env.USE_AI_STUDIO === '1' ? 'ai' : 'cleanup',
    });
  } catch (err) {
    console.error('[generate] failed', err);
    return NextResponse.json({ error: 'Could not process the photo.' }, { status: 500 });
  }
}
