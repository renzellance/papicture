/* shared HTTP helper for studio providers: retry transient 429/503 with backoff
   (these image models 429 sporadically even on paid tiers). */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let res: Response | null = null;
  for (let i = 0; i < attempts; i++) {
    res = await fetch(url, init);
    if (res.status !== 429 && res.status !== 503) return res;
    if (i < attempts - 1) await sleep(800 * Math.pow(2, i)); // 0.8s, 1.6s
  }
  return res!;
}
