/* papicture — Gemini 2.5 Flash Image ("nano banana") provider.
   The real selfie -> studio portrait transformation. Identity-preserving edit.

   Key: https://aistudio.google.com/apikey  (free tier OK for testing with
   non-real faces; use a PAID key + Zero Data Retention for real user selfies). */

import type { StudioProvider, StudioRequest, StudioOutput } from './types';
import { buildPrompt } from './prompts';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export function geminiProvider(): StudioProvider {
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  return {
    name: `gemini:${model}`,
    async convert(req: StudioRequest): Promise<StudioOutput> {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error('GEMINI_API_KEY is not set. Get one at https://aistudio.google.com/apikey');

      const prompt = buildPrompt({ lookId: req.lookId, sub: req.sub, bgName: req.bgName });
      const generationConfig: any = { responseModalities: ['IMAGE'] };
      if (req.aspectRatio) generationConfig.imageConfig = { aspectRatio: req.aspectRatio };
      const body = {
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: req.mime, data: req.image.toString('base64') } },
            { text: prompt },
          ],
        }],
        generationConfig,
      };

      const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gemini ${res.status}: ${t.slice(0, 500)}`);
      }

      const json: any = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find((p: any) => p.inlineData || p.inline_data);
      if (!imgPart) {
        const text = parts.find((p: any) => p.text)?.text;
        const reason = json?.candidates?.[0]?.finishReason || json?.promptFeedback?.blockReason;
        throw new Error(`No image returned${reason ? ` (${reason})` : ''}${text ? `: ${text.slice(0, 200)}` : ''}`);
      }
      const inline = imgPart.inlineData || imgPart.inline_data;
      return {
        image: Buffer.from(inline.data, 'base64'),
        mime: inline.mimeType || inline.mime_type || 'image/png',
        meta: { model, prompt },
      };
    },
  };
}
