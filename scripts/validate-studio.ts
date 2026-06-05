/* papicture — studio validation harness (NOT wired into the live funnel).
 *
 * Runs a real selfie through the selfie -> studio conversion across the looks so
 * you can eyeball identity + quality before committing the full integration.
 *
 *   STUDIO_PROVIDER=gemini GEMINI_API_KEY=... npm run validate:studio -- ./selfie.jpg
 *   STUDIO_PROVIDER=mock npm run validate:studio -- ./selfie.jpg   # plumbing test, no key
 *
 * Outputs land in ./validation-output/. Use stock / your-own faces on the free
 * tier — not real customer photos (see .env.example).
 */
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getProvider, isGenerative, fitTier, sharpProvider } from '../lib/studio';

const MATRIX: { label: string; lookId: string; sub?: string; bgName?: string }[] = [
  { label: 'as-is',         lookId: 'original',    bgName: 'neutral gray' },
  { label: 'smartcasual',   lookId: 'smartcasual', sub: 'collared polo', bgName: 'white' },
  { label: 'formal-blazer', lookId: 'formal',      sub: 'a dark blazer over a white shirt', bgName: 'light gray' },
  { label: 'formal-barong', lookId: 'formal',      sub: 'a traditional Filipino Barong Tagalog', bgName: 'white' },
  { label: 'linkedin',      lookId: 'linkedin',    bgName: 'soft blue' },
];

async function main() {
  const input = process.argv[2];
  if (!input) { console.error('Usage: npm run validate:studio -- <selfie.jpg>'); process.exit(1); }

  const providerName = process.env.STUDIO_PROVIDER || 'gemini';
  const provider = getProvider(providerName);
  const outDir = path.resolve('validation-output');
  await fs.mkdir(outDir, { recursive: true });

  // normalize the input the way the app does (downscale to <= 1280)
  const raw = await fs.readFile(input);
  const image = await sharp(raw).rotate()
    .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90 }).toBuffer();
  await fs.writeFile(path.join(outDir, '_input.jpg'), image);

  console.log(`\nprovider: ${provider.name}`);
  console.log(`input:    ${input}\n`);

  for (const m of MATRIX) {
    const t0 = Date.now();
    try {
      const useGen = isGenerative(m.lookId) && providerName !== 'mock' && providerName !== 'sharp';
      const p = useGen ? provider : sharpProvider();
      const res = await p.convert({ image, mime: 'image/jpeg', lookId: m.lookId, sub: m.sub, bgName: m.bgName, tier: 'preview' });
      const file = path.join(outDir, `${m.label}.jpg`);
      await fs.writeFile(file, await fitTier(res.image, 'preview'));
      console.log(`  OK   ${m.label.padEnd(15)} ${((Date.now() - t0) / 1000).toFixed(1)}s  ${p.name}`);
    } catch (e: any) {
      console.log(`  FAIL ${m.label.padEnd(15)} ${((Date.now() - t0) / 1000).toFixed(1)}s  ${e.message}`);
    }
  }

  // document-safe reference (always non-generative)
  try {
    const res = await sharpProvider().convert({ image, mime: 'image/jpeg', lookId: 'docsafe', tier: 'preview' });
    await fs.writeFile(path.join(outDir, 'docsafe.jpg'), await fitTier(res.image, 'preview'));
    console.log(`  OK   ${'docsafe'.padEnd(15)} (non-AI reference)`);
  } catch { /* ignore */ }

  console.log(`\nDone. Open ./validation-output/ and check identity + quality.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
