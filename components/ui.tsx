'use client';
/* papicture — shared UI primitives (ported from the design bundle). */

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import type { Swatch } from '@/lib/types';

/* ---------- icons (simple line set) ---------- */
const ICONS: Record<string, string> = {
  camera: 'M4 8.5a2 2 0 0 1 2-2h1.2l.8-1.4a1 1 0 0 1 .87-.5h4.26a1 1 0 0 1 .87.5l.8 1.4H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM12 10a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z',
  upload: 'M12 15V4m0 0L8 8m4-4 4 4M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2',
  check: 'M5 12.5l4.2 4.2L19 7',
  arrowR: 'M5 12h14m0 0-6-6m6 6-6 6',
  arrowL: 'M19 12H5m0 0 6-6m-6 6 6 6',
  chevR: 'M9 5l7 7-7 7',
  chevL: 'M15 5l-7 7 7 7',
  chevD: 'M5 9l7 7 7-7',
  x: 'M6 6l12 12M18 6 6 18',
  lock: 'M7 10V8a5 5 0 0 1 10 0v2m-11 0h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z',
  mail: 'M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm0 .5 8 5.5 8-5.5',
  print: 'M7 9V4h10v5M7 18H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1M7 14h10v6H7z',
  shield: 'M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM18 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z',
  info: 'M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  warn: 'M12 4l9 16H3zM12 10v4m0 3h.01',
  sun: 'M12 5V3m0 18v-2m7-7h2M3 12h2m12.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m12.8 0 1.4 1.4M4.9 4.9l1.4 1.4M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
  face: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM9 10h.01M15 10h.01M9 14.5s1.2 1.5 3 1.5 3-1.5 3-1.5',
  noglasses: 'M3 11h18M7 11a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm10 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4 5l16 14',
  image: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 17l4.5-5 3 3.2L16 12l3 4',
  crop: 'M6 2v14a2 2 0 0 0 2 2h14M2 6h14a2 2 0 0 1 2 2v14',
  refresh: 'M20 11A8 8 0 0 0 6.3 6.3L4 8.5m0 0V4m0 4.5h4.5M4 13a8 8 0 0 0 13.7 4.7L20 15.5m0 0V20m0-4.5h-4.5',
  download: 'M12 4v10m0 0 4-4m-4 4-4-4M5 18h14',
  zap: 'M13 3L5 13h5l-1 8 8-10h-5z',
  ban: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM6 6l12 12',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5',
  clock: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  pin: 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11zM12 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  phone: 'M5 4h3l1.5 5-2 1.5a12 12 0 0 0 6 6l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0',
  plus: 'M12 5v14M5 12h14',
};

export function Icon({ name, size = 20, sw = 1.8, fill = false, style }:
  { name: string; size?: number; sw?: number; fill?: boolean; style?: CSSProperties }) {
  const d = ICONS[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'}
         stroke={fill ? 'none' : 'currentColor'} strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ---------- portrait: renders the real photo when present, else a placeholder ---------- */
export function Portrait({ variant = 'studio', bg = '#fff', ratio = 0.82, headScale = 1,
                    circle = false, guides = false, darkTop = false, photo, style = {} }:
  { variant?: 'raw' | 'studio'; bg?: string; ratio?: number; headScale?: number;
    circle?: boolean; guides?: boolean; darkTop?: boolean; photo?: string; style?: CSSProperties }) {
  const isRaw = variant === 'raw';

  if (photo) {
    return (
      <div className={'pa-portrait ' + (isRaw ? 'raw' : 'studio')}
           style={{ aspectRatio: String(1 / ratio), background: bg,
                    borderRadius: circle ? '50%' : undefined, ...style }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pa-photo" src={photo} alt="" style={{ borderRadius: circle ? '50%' : undefined }} />
      </div>
    );
  }

  // head sizing relative to frame
  const headW = 30 * headScale;
  const headTop = 17;
  const shoulderW = 64 * (0.9 + 0.1 * headScale);
  const shoulderTop = headTop + headW * 0.95;
  const skin = isRaw ? 'linear-gradient(155deg,#cdbfae,#a8967f)' : 'linear-gradient(155deg,#c8d0da,#9ba6b4)';
  const cloth = darkTop
    ? 'linear-gradient(160deg,#3a4250,#222932)'
    : (isRaw ? 'linear-gradient(160deg,#b8a892,#8d7d68)' : 'linear-gradient(160deg,#aeb7c3,#828e9d)');
  return (
    <div className={'pa-portrait ' + (isRaw ? 'raw' : 'studio')}
         style={{ aspectRatio: String(1 / ratio), background: isRaw ? undefined : bg,
                  borderRadius: circle ? '50%' : undefined, ...style }}>
      <div className="subj-wrap" style={{ position: 'absolute', inset: 0 }}>
        <div className="shoulders" style={{ width: shoulderW + '%', aspectRatio: '1.7', top: shoulderTop + '%', background: cloth }} />
        <div className="head" style={{ width: headW + '%', aspectRatio: '0.82', top: headTop + '%', background: skin }} />
      </div>
      {guides && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: (headTop - 3) + '%', borderTop: '1px dashed rgba(42,111,219,.6)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: (shoulderTop + 2) + '%', borderTop: '1px dashed rgba(42,111,219,.6)' }} />
        </div>
      )}
    </div>
  );
}

/* watermark overlay */
export function Watermark({ text = 'papicture · preview' }: { text?: string }) {
  const reps = new Array(7).fill(text.toUpperCase());
  return (
    <div className="pa-wm">
      <div className="pa-wm-text"><span>{reps.join('   ·   ')}</span></div>
    </div>
  );
}

/* photo-lab frame marks */
export function FrameMarks({ dark = false, radius = 0, keyline = true, ticks = true }:
  { dark?: boolean; radius?: number; keyline?: boolean; ticks?: boolean }) {
  return (
    <>
      {ticks && <div className={'pa-ticks' + (dark ? ' on-dark' : '')} />}
      {keyline && <div className="pa-frame-key" style={radius ? { borderRadius: radius } : undefined} />}
    </>
  );
}

/* ---------- before / after compare: drag the handle, or tap a side ---------- */
export function BeforeAfter({ bg = '#fff', ratio = 1.0, watermark = true, before, after }:
  { bg?: string; ratio?: number; watermark?: boolean; before?: string; after?: string }) {
  const [pos, setPos] = useState(26);
  const [snap, setSnap] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    let p = ((clientX - r.left) / r.width) * 100;
    p = Math.max(0, Math.min(100, p));
    setPos(p);
  }, []);

  useEffect(() => {
    const mm = (e: any) => { if (dragging.current) move(e.touches ? e.touches[0].clientX : e.clientX); };
    const mu = () => { dragging.current = false; };
    window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu);
    window.addEventListener('touchmove', mm, { passive: true }); window.addEventListener('touchend', mu);
    return () => {
      window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu);
      window.removeEventListener('touchmove', mm); window.removeEventListener('touchend', mu);
    };
  }, [move]);

  const start = (e: any) => { setSnap(false); dragging.current = true; move(e.touches ? e.touches[0].clientX : e.clientX); };
  const snapTo = (p: number) => (e: any) => { e.stopPropagation(); setSnap(true); setPos(p); };

  const beforeFull = pos >= 92;
  const studioFull = pos <= 8;
  const tr = snap ? 'clip-path .42s cubic-bezier(.22,.61,.36,1)' : 'none';
  const trHandle = (snap ? 'left .42s cubic-bezier(.22,.61,.36,1), ' : '') + 'opacity .25s ease';

  return (
    <div className="pa-ba" ref={ref} style={{ aspectRatio: String(1 / ratio) }}
         onMouseDown={start} onTouchStart={start}>
      <div className="pa-ba-after">
        <Portrait variant="studio" bg={bg} ratio={ratio} photo={after} style={{ borderRadius: 0, height: '100%' }} />
        {watermark && <Watermark />}
      </div>
      <div className="pa-ba-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, transition: tr }}>
        <Portrait variant="raw" ratio={ratio} photo={before} style={{ borderRadius: 0, height: '100%' }} />
      </div>
      <button className="pa-ba-tag" data-on={beforeFull} style={{ left: 12 }}
              onClick={snapTo(100)} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>Before</button>
      <button className="pa-ba-tag" data-on={studioFull} style={{ right: 12 }}
              onClick={snapTo(0)} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>Studio</button>
      <div className="pa-ba-handle" style={{ left: pos + '%', transition: trHandle, opacity: (beforeFull || studioFull) ? 0 : 1 }}>
        <div className="pa-ba-knob">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 7l-4 5 4 5M15 7l4 5-4 5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ---------- small bits ---------- */
export function Chip({ kind, children }: { kind?: string; children: React.ReactNode }) {
  const cls = kind === 'flexible' ? 'pa-chip-flexible'
            : kind === 'standard' ? 'pa-chip-standard'
            : kind === 'strict' ? 'pa-chip-strict'
            : kind === 'accent' ? 'pa-chip-accent' : '';
  return <span className={'pa-chip ' + cls}><span className="dot" />{children}</span>;
}

export function Btn({ variant = 'primary', size, icon, iconR, children, ...rest }:
  { variant?: string; size?: 'sm'; icon?: string; iconR?: string; children?: React.ReactNode } &
  React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `pa-btn pa-btn-${variant}${size === 'sm' ? ' pa-btn-sm' : ''}`;
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={size === 'sm' ? 17 : 19} />}
      {children}
      {iconR && <Icon name={iconR} size={size === 'sm' ? 17 : 19} />}
    </button>
  );
}

export function Swatches({ options, value, onChange }:
  { options: Swatch[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="pa-swatches">
      {options.map((o) => (
        <button key={o.id} className="pa-swatch" data-on={value === o.id}
                onClick={() => onChange(o.id)} title={o.name}
                style={{ background: o.hex, borderColor: o.ring }} aria-label={o.name} />
      ))}
    </div>
  );
}

export function Seg<T>({ options, value, onChange }:
  { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="pa-seg">
      {options.map((o) => (
        <button key={String(o.value)} data-on={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Notice({ kind = 'info', icon = 'info', children }:
  { kind?: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className={'pa-notice pa-notice-' + kind}>
      <span className="ic"><Icon name={icon} size={17} /></span>
      <div>{children}</div>
    </div>
  );
}

export function StepBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="pa-steps">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="pa-step-seg" data-on={i <= current} data-cur={i === current}><i /></div>
      ))}
    </div>
  );
}
