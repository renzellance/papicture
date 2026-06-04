'use client';
/* papicture — Screens A: landing, upload, processing, base preview */

import React, { useState, useEffect, useRef } from 'react';
import { Icon, Portrait, FrameMarks, Watermark, BeforeAfter, Btn, Notice } from '@/components/ui';
import { CameraCapture } from '@/components/CameraCapture';
import { PRICE } from '@/lib/data';
import { downscaleImage } from '@/lib/image';
import type { ScreenProps } from './types';

/* ============================== LANDING ============================== */
export function LandingScreen({ go }: ScreenProps) {
  const sheet = [
    { name: '1×1 ID', dim: '1 IN', bg: '#ffffff', ratio: 1, circle: false },
    { name: '2×2 ID', dim: '2 IN', bg: '#ffffff', ratio: 1, circle: false },
    { name: 'Passport', dim: '35×45', bg: '#f4f2ec', ratio: 0.778, circle: false },
    { name: 'LinkedIn', dim: '4:5', bg: '#e9eaec', ratio: 1, circle: true },
  ];
  const steps: [string, string, string][] = [
    ['01', 'Add your selfie', 'Take one now or upload from your phone'],
    ['02', 'Preview your studio photo', 'See it free before you choose a format'],
    ['03', 'Get your photos', 'Digital file by email, or a printed set delivered'],
  ];
  return (
    <>
      <div className="pa-scroll pa-fade">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '-.02em' }}>
            papicture<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>

        <div className="pa-block pa-block-ink" style={{ margin: '4px 14px 0', borderRadius: 'var(--r-lg)', padding: '22px 20px 20px' }}>
          <h1 className="pa-mega" style={{ color: '#fff' }}>One selfie. Every photo you need to submit.</h1>
          <p className="pa-lead" style={{ color: 'rgba(255,255,255,.8)', marginTop: 14 }}>
            One selfie, sized correctly for Philippine IDs, visas and work profiles.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, marginBottom: 12 }}>
            <span className="pa-ref" style={{ color: 'rgba(255,255,255,.6)' }}>One photo, every size</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.18)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {sheet.map((c) => (
              <div key={c.name} style={{ background: '#fff', borderRadius: 'var(--r-sm)', padding: 9, boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ position: 'relative', height: 116, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper-2)', borderRadius: 6, overflow: 'hidden' }}>
                  <Portrait variant="studio" bg={c.bg} ratio={c.ratio} circle={c.circle}
                            style={{ borderRadius: c.circle ? '50%' : 0, height: '100%', width: 'auto' }} />
                  {!c.circle && <FrameMarks />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 6 }}>
                  <span className="pa-ref" style={{ color: 'var(--ink)' }}>{c.name}</span>
                  <span className="pa-dim">{c.dim}</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,.55)', marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.03em' }}>
            The same selfie, sized for each one.
          </p>
        </div>

        <div className="pa-pad" style={{ paddingTop: 24 }}>
          <p className="pa-eyebrow">How it works</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map(([n, t, d], i) => (
              <div key={n} style={{ display: 'flex', gap: 16, alignItems: 'baseline', padding: '14px 0',
                                    borderTop: i === 0 ? '1px solid var(--ink)' : '1px solid var(--line)' }}>
                <span className="pa-ref" style={{ color: 'var(--accent)', width: 22 }}>{n}</span>
                <div style={{ flex: 1 }}>
                  <div className="pa-h3">{t}</div>
                  <div className="pa-small" style={{ marginTop: 2 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pa-card" style={{ padding: '4px 16px', marginTop: 22 }}>
            <div className="pa-sumrow">
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="mail" size={17} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Digital file</span></span>
              <span className="v" style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>{PRICE.currency}{PRICE.digital}</span>
            </div>
            <div className="pa-sumrow">
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="print" size={17} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Printed set, delivered</span></span>
              <span className="v" style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>from {PRICE.currency}{PRICE.printFrom}</span>
            </div>
          </div>
          <p className="pa-small" style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="check" size={13} sw={2.4} style={{ color: 'var(--ok)' }} />Free preview. Printed sets delivered nationwide, softcopy included.
          </p>
          <p className="pa-small" style={{ marginTop: 7, display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="doc" size={13} sw={2} style={{ color: 'var(--muted)' }} />Sized for NBI, school, work and visa submissions.
          </p>
        </div>

        <div style={{ height: 8 }} />
      </div>

      <div className="pa-dock">
        <Btn variant="primary" iconR="arrowR" onClick={() => go('upload')}>Create my photo</Btn>
      </div>
    </>
  );
}

/* ============================== UPLOAD ============================== */
export function UploadScreen({ go, set }: ScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [camOpen, setCamOpen] = useState(false);

  const guidance: [string, string][] = [
    ['face', 'Face the camera directly'],
    ['sun', 'Use good lighting'],
    ['user', 'Keep shoulders visible'],
    ['noglasses', 'Avoid sunglasses'],
    ['ban', 'Avoid heavy filters'],
    ['image', 'No screenshots'],
  ];

  const onFile = (source: 'camera' | 'upload') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null); setBusy(true);
    try {
      const dataURL = await downscaleImage(file);
      set({ original: dataURL, source });
      go('processing');
    } catch {
      setErr('That file could not be read. Try another photo.');
      setBusy(false);
    }
  };

  const onCapture = (dataURL: string) => { set({ original: dataURL, source: 'camera' }); go('processing'); };

  return (
    <>
    {camOpen && (
      <CameraCapture
        onCapture={onCapture}
        onClose={() => setCamOpen(false)}
        onFallback={() => { setCamOpen(false); camRef.current?.click(); }} />
    )}
    <div className="pa-scroll pa-fade">
      <div className="pa-pad">
        <button className="pa-iconbtn" onClick={() => go('landing')} style={{ marginBottom: 14 }}><Icon name="arrowL" size={18} /></button>
        <p className="pa-eyebrow">Step 01 · your photo</p>
        <h1 className="pa-h1">Add your photo</h1>
        <p className="pa-lead" style={{ marginTop: 8 }}>A clear selfie is all we need. We&rsquo;ll clean it up next.</p>

        {err && <div style={{ marginTop: 16 }}><Notice kind="warn" icon="warn">{err}</Notice></div>}

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile('upload')} />
        <input ref={camRef} type="file" accept="image/*" capture="user" hidden onChange={onFile('camera')} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20, opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto' }}>
          <button className="pa-tile pa-block-ink" style={{ padding: 18, textAlign: 'left', color: '#fff', border: 'none' }} onClick={() => setCamOpen(true)}>
            <Icon name="camera" size={26} />
            <div className="pa-h3" style={{ color: '#fff', marginTop: 28 }}>Take photo</div>
            <div className="pa-small" style={{ color: 'rgba(255,255,255,.6)', marginTop: 2 }}>Use your camera</div>
          </button>
          <button className="pa-tile" style={{ padding: 18, textAlign: 'left' }} onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={26} style={{ color: 'var(--accent)' }} />
            <div className="pa-h3" style={{ marginTop: 28 }}>Upload</div>
            <div className="pa-small" style={{ marginTop: 2 }}>From your phone</div>
          </button>
        </div>

        {busy && <p className="pa-small" style={{ marginTop: 14 }}>Reading your photo…</p>}

        <div style={{ marginTop: 26 }}>
          <p className="pa-eyebrow">For best results</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {guidance.map(([ic, t]) => (
              <div key={t} style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '11px 12px', background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                <Icon name={ic} size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', lineHeight: 1.2 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

/* ============================== PROCESSING ============================== */
export function ProcessingScreen({ go, state, set }: ScreenProps) {
  const labels = ['Checking photo quality', 'Cleaning background', 'Adjusting lighting', 'Preparing previews'];
  const [pct, setPct] = useState(0);
  const [li, setLi] = useState(0);
  const done = useRef(false);          // generation finished
  const reached = useRef(false);       // animation reached 100
  const studio = useRef<string | null>(null);

  // no photo? bail back to upload
  useEffect(() => {
    if (!state.original) { go('upload'); }
  }, [state.original, go]);

  // kick off real generation
  useEffect(() => {
    if (!state.original) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: state.original, look: state.look || null }),
        });
        const json = await res.json();
        studio.current = json.studio || state.original!;
      } catch {
        studio.current = state.original!;   // graceful fallback: use the original
      }
      if (cancelled) return;
      done.current = true;
      maybeAdvance();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maybeAdvance = () => {
    if (done.current && reached.current) {
      set({ studio: studio.current || state.original! });
      setTimeout(() => go('preview'), 360);
    }
  };

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      // ease toward 100 but wait near the top until generation resolves
      const ceil = done.current ? 100 : 92;
      p = Math.min(ceil, p + (2 + Math.random() * 5));
      setPct(Math.round(p));
      setLi(Math.min(labels.length - 1, Math.floor((p / 100) * labels.length)));
      if (p >= 100) {
        clearInterval(iv);
        reached.current = true;
        maybeAdvance();
      }
    }, 110);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pa-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
      <div style={{ padding: '0 28px' }}>
        <p className="pa-eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>Working on it</p>
        <h1 className="pa-mega-sm" style={{ color: '#fff' }}>Creating your<br />studio preview…</h1>

        <div style={{ position: 'relative', width: 150, margin: '34px auto 30px' }}>
          <Portrait variant="studio" bg="rgba(255,255,255,.12)" ratio={1.2} photo={state.original}
                    style={{ borderRadius: 'var(--r)' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r)', border: '2px solid rgba(255,255,255,.35)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: '#fff', boxShadow: '0 0 18px #fff',
                        top: pct + '%', transition: 'top .12s linear' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{labels[li]}</span>
          <span className="pa-ref" style={{ color: '#fff' }}>{pct}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: pct + '%', background: '#fff', borderRadius: 99, transition: 'width .12s linear' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 22 }}>
          {labels.map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9, opacity: i <= li ? 1 : .4, transition: 'opacity .3s' }}>
              <span style={{ width: 18, height: 18, borderRadius: 99, border: '1.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i < li && <Icon name="check" size={11} sw={2.5} />}
              </span>
              <span className="pa-mono" style={{ color: '#fff', fontSize: 11.5 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== BASE PREVIEW ============================== */
export function PreviewScreen({ go, state }: ScreenProps) {
  return (
    <>
      <div className="pa-scroll pa-fade">
        <div className="pa-pad">
          <button className="pa-iconbtn" onClick={() => go('upload')} style={{ marginBottom: 14 }}><Icon name="arrowL" size={18} /></button>
          <h1 className="pa-h1">Your studio photo.</h1>
          <p className="pa-lead" style={{ marginTop: 8 }}>Drag the slider to compare it with your original.</p>
        </div>

        <div className="pa-hide-desktop" style={{ padding: '0 18px' }}>
          <BeforeAfter bg="#ffffff" ratio={1.12} before={state.original} after={state.studio} />
          <p className="pa-small" style={{ marginTop: 10, textAlign: 'center' }}>
            This preview is lower resolution. Your photo downloads at full resolution, no watermark. You only pay when you download it.
          </p>
        </div>

        <div className="pa-pad" style={{ paddingTop: 18 }}>
          <button className="pa-btn pa-btn-ghost" onClick={() => go('upload')}>
            <Icon name="refresh" size={18} />Use a different photo
          </button>
        </div>
      </div>

      <div className="pa-dock">
        <Btn variant="primary" iconR="arrowR" onClick={() => go('fulfillment')}>Continue</Btn>
      </div>
    </>
  );
}
