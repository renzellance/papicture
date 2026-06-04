'use client';
/* papicture — mock PayRex hosted checkout.
   Stands in for the real gateway when no PAYREX_SECRET_KEY is configured, so the
   prototype is clickable end-to-end. Visually mimics a PH hosted checkout. */

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const METHODS = [
  { id: 'gcash', name: 'GCash' },
  { id: 'maya', name: 'Maya' },
  { id: 'grabpay', name: 'GrabPay' },
  { id: 'card', name: 'Card' },
];

function MockPay() {
  const sp = useSearchParams();
  const amount = sp.get('amount') || '0';
  const order = sp.get('order') || 'PAP';
  const label = sp.get('label') || 'papicture order';
  const success = sp.get('success') || '/';
  const cancel = sp.get('cancel') || '/';

  const [method, setMethod] = useState('gcash');
  const [busy, setBusy] = useState(false);

  const pay = () => {
    setBusy(true);
    // simulate gateway processing latency, then redirect like PayRex would
    setTimeout(() => { window.location.href = success; }, 1400);
  };

  return (
    <div className="pa-host">
      <div className="pa-device">
        <div className="pa-app">
          <div className="pa-scroll">
            <div style={{ background: 'var(--ink)', color: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>P</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>PayRex</div>
              <span className="pa-ref-pill" style={{ marginLeft: 'auto' }}>Test mode</span>
            </div>

            <div className="pa-pad">
              <p className="pa-eyebrow">Secure checkout</p>
              <h1 className="pa-h2">{label}</h1>
              <div className="pa-card-flat" style={{ padding: '4px 14px', marginTop: 14 }}>
                <div className="pa-sumrow"><span className="k">Order</span><span className="v">{order}</span></div>
                <div className="pa-sumrow"><span className="k">Amount due</span><span className="v" style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>₱{amount}.00</span></div>
              </div>

              <p className="pa-eyebrow" style={{ marginTop: 22 }}>Pay with</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {METHODS.map((m) => (
                  <button key={m.id} className="pa-tile" data-sel={method === m.id} onClick={() => setMethod(m.id)}
                          style={{ padding: 16, textAlign: 'left' }}>
                    <div className="pa-tile-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.2L19 7" /></svg></div>
                    <div className="pa-h3">{m.name}</div>
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 12 }} className="pa-notice pa-notice-info">
                <div>This is a simulated gateway. No card or e-wallet details are collected and no money moves. Set <b>PAYREX_SECRET_KEY</b> to use real PayRex test mode.</div>
              </div>
            </div>
          </div>

          <div className="pa-dock pa-dock-solid">
            <button className="pa-btn pa-btn-primary" disabled={busy} onClick={pay}>
              {busy ? <span className="pa-spin" /> : null}
              {busy ? 'Processing…' : `Pay ₱${amount}.00`}
            </button>
            <button className="pa-btn pa-btn-quiet" style={{ marginTop: 6 }} disabled={busy}
                    onClick={() => { window.location.href = cancel; }}>Cancel and go back</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="pa-host"><div className="pa-device" /></div>}>
      <MockPay />
    </Suspense>
  );
}
