/* papicture — create a payment checkout.
 *
 * Real flow (PayRex test mode): when PAYREX_SECRET_KEY is set, we create a
 * hosted PayRex CheckoutSession server-side and hand back its redirect URL.
 * The customer pays with GCash / Maya / card, then PayRex redirects to
 * success_url. No real money moves in test mode.
 *
 * Zero-config flow: with no key set, we return a URL to the built-in /mock-pay
 * page that mimics the hosted checkout, so the prototype runs end-to-end on
 * Vercel out of the box. Add the key to flip to the real gateway.
 *
 * Docs: https://docs.payrexhq.com/docs/api/checkout_sessions/create
 */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const PAYREX_API = 'https://api.payrexhq.com/checkout_sessions';

function baseUrl(req: NextRequest): string {
  const origin = req.headers.get('origin');
  if (origin) return origin;
  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : '';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const price: number = Math.max(1, Math.round(Number(body.price) || 0));
    const orderNo: string = String(body.orderNo || '').slice(0, 40) || 'PAP';
    const label: string = String(body.label || 'papicture order').slice(0, 120);

    const base = baseUrl(req);
    const successUrl = `${base}/?paid=1&order=${encodeURIComponent(orderNo)}`;
    const cancelUrl = `${base}/?paid=0`;

    const secret = process.env.PAYREX_SECRET_KEY;

    // ---- Real PayRex test-mode checkout ----
    if (secret) {
      const methods = (process.env.PAYREX_PAYMENT_METHODS || 'card,gcash,maya')
        .split(',').map((m) => m.trim()).filter(Boolean);

      const form = new URLSearchParams();
      form.append('currency', 'PHP');
      form.append('line_items[][name]', label);
      form.append('line_items[][amount]', String(price * 100)); // centavos
      form.append('line_items[][quantity]', '1');
      form.append('success_url', successUrl);
      form.append('cancel_url', cancelUrl);
      form.append('metadata[order_no]', orderNo);
      methods.forEach((m) => form.append('payment_methods[]', m));

      const auth = Buffer.from(`${secret}:`).toString('base64');
      const res = await fetch(PAYREX_API, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error('[checkout] PayRex error', res.status, detail);
        return NextResponse.json({ error: 'Payment gateway error.' }, { status: 502 });
      }
      const session = await res.json();
      const url = session.url || session.checkout_url || session?.data?.url;
      if (!url) {
        console.error('[checkout] PayRex returned no url', session);
        return NextResponse.json({ error: 'No checkout URL.' }, { status: 502 });
      }
      return NextResponse.json({ url, provider: 'payrex', orderNo });
    }

    // ---- Zero-config mock checkout ----
    const mock = new URL(`${base}/mock-pay`);
    mock.searchParams.set('order', orderNo);
    mock.searchParams.set('amount', String(price));
    mock.searchParams.set('label', label);
    mock.searchParams.set('success', successUrl);
    mock.searchParams.set('cancel', cancelUrl);
    return NextResponse.json({ url: mock.toString(), provider: 'mock', orderNo });
  } catch (err) {
    console.error('[checkout] failed', err);
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 500 });
  }
}
