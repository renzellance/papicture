/* papicture — fal.ai provider for the selfie -> studio conversion.
   Runs the same identity-locked prompt on a hosted model (defaults to
   nano-banana edit — same model as the Gemini path, but billed via fal's
   $20 free signup credit instead of Google billing).

   Env: FAL_KEY, FAL_MODEL (default fal-ai/nano-banana/edit). */

import type { StudioProvider, StudioRequest, StudioOutput } from './types';
import { buildPrompt } from './prompts';
import { fetchWithRetry } from './http';

export function falProvider(): StudioProvider {
  const model = process.env.FAL_MODEL || 'fal-ai/nano-banana/edit';
  return {
    name: `fal:${model}`,
    async convert(req: StudioRequest): Promise<StudioOutput> {
      const key = process.env.FAL_KEY;
      if (!key) throw new Error('FAL_KEY is not set. Get one at https://fal.ai/dashboard/keys');

      const prompt = buildPrompt({ lookId: req.lookId, sub: req.sub, bgName: req.bgName });
      const dataUri = `data:${req.mime};base64,${req.image.toString('base64')}`;
      const body: any = { prompt, image_urls: [dataUri], num_images: 1 };
      if (req.aspectRatio) body.aspect_ratio = req.aspectRatio;

      const res = await fetchWithRetry(`https://fal.run/${model}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Key ${key}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`fal ${res.status}: ${t.slice(0, 500)}`);
      }

      const json: any = await res.json();
      const url = json?.images?.[0]?.url || json?.image?.url;
      if (!url) throw new Error(`No image returned (${JSON.stringify(json).slice(0, 200)})`);

      // fal returns a hosted URL (or an inline data URI) — fetch the bytes
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error(`Could not fetch fal output (${imgRes.status})`);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      return {
        image: buf,
        mime: json?.images?.[0]?.content_type || 'image/png',
        meta: { model, prompt },
      };
    },
  };
}
