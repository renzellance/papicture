'use client';
/* papicture — Screens C: fulfillment, checkout, confirmation */

import React, { useState } from 'react';
import { Icon, Portrait, Watermark, FrameMarks, Btn, Notice } from '@/components/ui';
import { LOOKS, FORMATS, BG, PRICE } from '@/lib/data';
import { saveOrder } from '@/lib/storage';
import { downloadFinalPhoto } from '@/lib/order';
import type { Order } from '@/lib/types';
import type { ScreenProps } from './types';
import { FunnelHeader } from './ScreensB';

function lookLabel(state: Order) {
  const lk = LOOKS.find((l) => l.id === state.look);
  if (!lk) return '—';
  return lk.name + (state.lookSub ? ' · ' + state.lookSub : '');
}

/* mini order preview thumbnail */
function OrderThumb({ state, size = 64 }: { state: Order; size?: number }) {
  const fmt = FORMATS.find((f) => f.id === state.format);
  const bg = BG[state.bg || 'white'] || BG.white;
  const ratio = fmt ? fmt.ratio : 1;
  return (
    <div style={{ width: size, flexShrink: 0, borderRadius: 12, overflow: 'hidden', position: 'relative', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Portrait variant="studio" bg={bg.hex} ratio={ratio} darkTop={fmt && fmt.darkTop} circle={state.circle} photo={state.studio}
                style={{ borderRadius: state.circle ? '50%' : 0, width: '100%' }} />
      <Watermark text="papicture" />
      {!state.circle && <FrameMarks />}
    </div>
  );
}

/* ============================== FULFILLMENT ============================== */
export function FulfillmentScreen({ go, state, set }: ScreenProps) {
  const [choice, setChoice] = useState<string | null>(state.fulfillment || null);

  const digital = {
    id: 'digital', name: 'Digital file', priceLabel: PRICE.currency + PRICE.digital, icon: 'mail',
    sub: 'Ready right after payment',
    items: ['Full-resolution file, ready to upload or print', 'Works for online forms and IDs', 'Download right after payment'],
  };
  const print = {
    id: 'print', name: 'Printed set, delivered', priceLabel: 'from ' + PRICE.currency + PRICE.printFrom, icon: 'print',
    sub: 'Cut and delivered nationwide',
    items: ['Printed and cut to size', 'Delivery included. 2–4 days Metro Manila, 5–7 days provinces', 'Softcopy always included'],
  };

  const cont = () => { set({ fulfillment: choice as Order['fulfillment'] }); go('format'); };

  const Card = (o: typeof digital) => {
    const on = choice === o.id;
    return (
      <div key={o.id} className="pa-tile" data-sel={on} onClick={() => setChoice(o.id)} role="button" tabIndex={0}
           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChoice(o.id); } }}
           style={{ padding: 16 }}>
        <div className="pa-tile-check"><Icon name="check" size={14} sw={2.6} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: on ? 'var(--accent)' : 'var(--accent-wash)', color: on ? '#fff' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
            <Icon name={o.icon} size={22} />
          </span>
          <div style={{ flex: 1 }}>
            <div className="pa-h3">{o.name}</div>
            {o.sub && <div className="pa-small" style={{ marginTop: 2 }}>{o.sub}</div>}
          </div>
          <div className="pa-dock-price" style={{ alignItems: 'flex-end' }}>
            <span className="amt" style={{ fontSize: o.priceLabel.startsWith('from') ? 16 : 20 }}>{o.priceLabel}</span>
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {o.items.map((it) => (
            <div key={it} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <Icon name="check" size={15} sw={2.4} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: 'var(--ink-2)', flex: 1, minWidth: 0 }}>{it}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <FunnelHeader back={() => go('preview')} stepIndex={0} title="Delivery" />
      <div className="pa-scroll pa-fade">
        <div className="pa-pad" style={{ paddingTop: 14 }}>
          <h1 className="pa-h2">How do you want it?</h1>
          <p className="pa-body" style={{ marginTop: 6 }}>Get the digital file, or a printed set delivered to your door. Choose first and we&rsquo;ll show the formats that fit.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {Card(digital)}
            {Card(print)}
          </div>
        </div>
      </div>
      <div className="pa-dock pa-dock-solid">
        <Btn variant="primary" iconR="arrowR" disabled={!choice} onClick={cont}>Choose a format</Btn>
      </div>
    </>
  );
}

/* hoisted so input identity is stable across re-renders */
function CheckoutField({ value, onChange, onBlur, label, ph, type = 'text', inputMode, req, area, error }:
  { value: string; onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onBlur?: () => void; label: string; ph: string; type?: string; inputMode?: any;
    req?: boolean; area?: boolean; error?: string | null }) {
  const im = inputMode || (type === 'tel' ? 'tel' : type === 'email' ? 'email' : 'text');
  return (
    <div className="pa-field">
      <label>{label}{req && <span className="req"> *</span>}</label>
      {area
        ? <textarea className="pa-textarea" placeholder={ph} value={value} onChange={onChange} onBlur={onBlur} />
        : <input className="pa-input" type={type === 'numeric' ? 'text' : type} placeholder={ph} value={value} onChange={onChange} onBlur={onBlur} inputMode={im}
                 style={error ? { borderColor: 'var(--strict)' } : undefined} />}
      {error && <span style={{ fontSize: 12, color: 'var(--strict)', fontWeight: 600 }}>{error}</span>}
    </div>
  );
}

const PAY_METHODS = ['GCash', 'Maya', 'GrabPay', 'ShopeePay', 'Card'];

const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim());
/* PH mobile: 09xxxxxxxxx, 9xxxxxxxxx or +639xxxxxxxxx, spaces and dashes ignored */
const validPhone = (v: string) => /^(0|63)?9\d{9}$/.test(v.replace(/[\s\-+()]/g, ''));

/* ============================== CHECKOUT ============================== */
export function CheckoutScreen({ go, state, set }: ScreenProps) {
  const isPrint = state.fulfillment === 'print';
  const [f, setF] = useState({ name: '', email: '', phone: '', street: '', barangay: '', city: '', province: '', zip: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const blur = (k: keyof typeof f) => () => setTouched((t) => ({ ...t, [k]: true }));

  const emailErr = touched.email && f.email && !validEmail(f.email) ? 'Check the email address.' : null;
  const phoneErr = touched.phone && f.phone && !validPhone(f.phone) ? 'Use a PH mobile number, e.g. 09XX XXX XXXX.' : null;

  const valid = f.name && validEmail(f.email) && validPhone(f.phone)
    && (!isPrint || (f.street && f.barangay && f.city && f.province && f.zip));

  const pay = async () => {
    if (busy) return;
    setErr(null); setBusy(true);
    const orderNo = 'PAP-2026-' + String(Math.floor(1000 + Math.random() * 8999));
    const order: Order = { ...state, ...f, orderNo };
    set({ ...f, orderNo });
    saveOrder(order);  // survive the redirect to the gateway and back
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: state.price,
          orderNo,
          label: `${state.formatName} · ${isPrint ? 'printed set' : 'digital file'}`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || 'No checkout URL');
      window.location.href = json.url;
    } catch (e: any) {
      setErr('Could not start payment. Please try again.');
      setBusy(false);
    }
  };

  return (
    <>
      <FunnelHeader back={() => go('look')} stepIndex={3} title="Checkout" />
      <div className="pa-scroll pa-fade">
        <div className="pa-pad" style={{ paddingTop: 14 }}>
          <div className="pa-card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <OrderThumb state={state} size={70} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pa-h3">{state.formatName}</div>
                <div className="pa-small" style={{ marginTop: 3 }}>{lookLabel(state)} · {state.bgName} bg</div>
                <div style={{ marginTop: 8 }}>
                  <span className="pa-chip pa-chip-accent">{isPrint ? 'Printed set' : 'Digital file'}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="pa-eyebrow" style={{ marginTop: 22 }}>Your details</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <CheckoutField value={f.name} onChange={upd('name')} label="Full name" ph="Juan Dela Cruz" req />
            <CheckoutField value={f.email} onChange={upd('email')} onBlur={blur('email')} error={emailErr} label="Email" ph="you@email.com" type="email" req />
            <CheckoutField value={f.phone} onChange={upd('phone')} onBlur={blur('phone')} error={phoneErr} label="Mobile number" ph="09XX XXX XXXX" type="tel" req />
          </div>

          {isPrint && <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginTop: 22 }}>
              <p className="pa-eyebrow" style={{ margin: 0 }}>Delivery address</p>
              <span className="pa-small" style={{ fontSize: 11.5 }}>We deliver within the Philippines</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
              <CheckoutField value={f.street} onChange={upd('street')} label="House / unit no., building, street" ph="12B Acacia St., Sunrise Bldg." req />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}><CheckoutField value={f.barangay} onChange={upd('barangay')} label="Barangay" ph="Brgy. San Antonio" req /></div>
                <div style={{ width: 104, flexShrink: 0 }}><CheckoutField value={f.zip} onChange={upd('zip')} label="ZIP code" ph="1010" inputMode="numeric" req /></div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}><CheckoutField value={f.city} onChange={upd('city')} label="City / municipality" ph="Pasig City" req /></div>
                <div style={{ flex: 1, minWidth: 0 }}><CheckoutField value={f.province} onChange={upd('province')} label="Province" ph="Metro Manila" req /></div>
              </div>
              <CheckoutField value={f.notes} onChange={upd('notes')} label="Delivery notes (optional)"
                ph="e.g. building and tower, unit or room number, gate or guard instructions, nearest landmark, best time to deliver" area />
            </div>
          </>}

          <div style={{ marginTop: 16 }}>
            <Notice kind="info" icon="lock">No account needed. We email your files to the address above.</Notice>
          </div>

          <div style={{ marginTop: 16 }}>
            <p className="pa-eyebrow">Pay with</p>
            <div className="pa-pays">
              {PAY_METHODS.map((m) => <span key={m} className="pa-pay">{m}</span>)}
            </div>
          </div>

          <div className="pa-card-flat" style={{ padding: '4px 14px', marginTop: 16 }}>
            <div className="pa-sumrow"><span className="k">{isPrint ? 'Printed set, delivered' : 'Digital file'}</span><span className="v">{PRICE.currency}{state.price}</span></div>
            {isPrint && <div className="pa-sumrow"><span className="k">Nationwide delivery</span><span className="v" style={{ color: 'var(--ok)' }}>Included</span></div>}
            <div className="pa-sumrow"><span className="k">Full resolution, no watermark</span><span className="v" style={{ color: 'var(--ok)' }}>Included</span></div>
            <div className="pa-sumrow"><span className="k" style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 14 }}>Total</span><span className="v" style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{PRICE.currency}{state.price}.00</span></div>
          </div>
          <p className="pa-small" style={{ marginTop: 10 }}>
            If a file is unusable because of an error on our side, we reprocess or refund it. See the <a href="/terms" target="_blank" style={{ color: 'var(--accent-ink)', fontWeight: 700 }}>terms</a>.
          </p>

          {err && <div style={{ marginTop: 12 }}><Notice kind="warn" icon="warn">{err}</Notice></div>}
          <div style={{ height: 6 }} />
        </div>
      </div>

      <div className="pa-dock pa-dock-solid">
        <div className="pa-dock-row">
          <div className="pa-dock-price">
            <span className="lbl">Total</span>
            <span className="amt">{PRICE.currency}{state.price}.00</span>
          </div>
          <div style={{ flex: 1 }}>
            <Btn variant="primary" icon={busy ? undefined : 'lock'} disabled={!valid || busy} onClick={pay}>
              {busy ? 'Starting checkout…' : 'Pay & get my photos'}
            </Btn>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================== CONFIRMATION ============================== */
export function ConfirmationScreen({ state, reset }: ScreenProps) {
  const isPrint = state.fulfillment === 'print';
  const firstName = (state.name || '').trim().split(' ')[0];
  const [dl, setDl] = useState(false);

  const rows: [string, string | undefined][] = [
    ['Order', state.orderNo],
    ['Product', state.formatName],
    ['Size', state.formatSize],
    ['Look', lookLabel(state)],
    ['Background', state.bgName],
    ['Delivery', isPrint ? 'Printed set, delivered' : 'Digital file'],
    ['Email', state.email],
  ];

  const download = async () => {
    if (!state.studio || dl) return;
    setDl(true);
    try { await downloadFinalPhoto(state); } finally { setDl(false); }
  };

  return (
    <>
      <div className="pa-scroll pa-fade">
        <div className="pa-block pa-block-accent" style={{ borderRadius: '0 0 var(--r-xl) var(--r-xl)', padding: '28px 18px 24px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 99, background: '#fff', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon name="check" size={28} sw={2.6} />
          </div>
          <p className="pa-eyebrow">Payment received</p>
          <h1 className="pa-mega-sm" style={{ color: '#fff' }}>You&rsquo;re all set{firstName ? ', ' + firstName : ''}.</h1>
          <p className="pa-lead" style={{ color: 'rgba(255,255,255,.86)', marginTop: 12 }}>Here is what happens next.</p>
          <div className="pa-meta-grid" style={{ marginTop: 18 }}>
            <div><div className="n">{state.orderNo ? state.orderNo.split('-').pop() : '0000'}</div><div className="l">Order no.</div></div>
            <div><div className="n">{PRICE.currency}{state.price}</div><div className="l">Paid</div></div>
          </div>
        </div>

        <div className="pa-pad" style={{ paddingTop: 20 }}>
          {state.studio && (
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14, marginBottom: 12 }} className="pa-card pa-hide-desktop">
              <OrderThumb state={state} size={64} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pa-h3">Your photo is ready</div>
                <div className="pa-small" style={{ marginTop: 3 }}>Full resolution, no watermark.</div>
              </div>
              <button className="pa-btn pa-btn-dark pa-btn-sm" onClick={download} disabled={dl}>
                <Icon name="download" size={16} />{dl ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
              <Icon name="download" size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Save your photo now</div>
                <div className="pa-small" style={{ marginTop: 2 }}>Use the download button to save the full-resolution file. A copy also goes to {state.email || 'your email'}.</div>
              </div>
            </div>
            {isPrint && (
              <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '13px 14px', background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                <Icon name="print" size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>Your prints are being prepared</div>
                  <div className="pa-small" style={{ marginTop: 2 }}>We will email delivery updates once your order ships.</div>
                </div>
              </div>
            )}
          </div>

          <div className="pa-card-flat" style={{ padding: '4px 14px', marginTop: 16 }}>
            {rows.map(([k, v]) => (
              <div key={k} className="pa-sumrow"><span className="k">{k}</span><span className="v">{v || '—'}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="pa-dock">
        <Btn variant="ghost" icon="arrowL" onClick={reset}>Go back</Btn>
      </div>
    </>
  );
}
