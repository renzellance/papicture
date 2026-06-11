'use client';
/* papicture — site chrome: brand + navigation, shared by the app shell
   (desktop page chrome, outside the focus card) and the legal pages, plus the
   mobile landing top bar + footer. Links are real:
   - sections (How it works / Pricing) scroll the landing
   - Privacy / Terms are real routes; Contact is a mailto */

import React, { useState } from 'react';
import Link from 'next/link';

type Item = { label: string; section?: string; href?: string };

const SECTIONS: Item[] = [
  { label: 'How it works', section: 'how-it-works' },
  { label: 'Pricing', section: 'pricing' },
  { label: 'FAQ', section: 'faq' },
];
const LEGAL: Item[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: 'mailto:hello@papicture.com' },
];
export const DISCLAIMER =
  'papicture is not affiliated with any government agency. Acceptance is decided by the requesting office, so please check the latest requirements before you submit.';

export function scrollToId(id: string) {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionLink({ item, onSection, onClick, className = 'pa-navlink' }:
  { item: Item; onSection?: (id: string) => void; onClick?: () => void; className?: string }) {
  if (onSection) {
    return <button className={className} onClick={() => { onClick?.(); onSection(item.section!); }}>{item.label}</button>;
  }
  return <a className={className} href={'/#' + item.section}>{item.label}</a>;
}

function LegalLink({ item, onClick, className = 'pa-navlink' }:
  { item: Item; onClick?: () => void; className?: string }) {
  if (item.href!.startsWith('mailto')) {
    return <a className={className} href={item.href}>{item.label}</a>;
  }
  return <Link className={className} href={item.href!} onClick={onClick}>{item.label}</Link>;
}

/* ---- desktop page chrome (hidden on mobile in the app; visible on legal pages) ---- */
export function SiteHeader({ onHome, onSection }:
  { onHome?: () => void; onSection?: (id: string) => void }) {
  return (
    <header className="pa-site-top">
      {onHome
        ? <button className="pa-brand" onClick={onHome}>papicture<span>.</span></button>
        : <Link className="pa-brand" href="/">papicture<span>.</span></Link>}
      <nav className="pa-site-nav">
        {SECTIONS.map((s) => <SectionLink key={s.label} item={s} onSection={onSection} />)}
      </nav>
    </header>
  );
}

export function SiteFooter({ onSection }: { onSection?: (id: string) => void }) {
  return (
    <footer className="pa-site-foot">
      <nav className="pa-foot-links">
        {SECTIONS.map((s) => <SectionLink key={s.label} item={s} onSection={onSection} />)}
        {LEGAL.map((l) => <LegalLink key={l.label} item={l} />)}
        <span className="pa-foot-cp">© 2026 papicture</span>
      </nav>
      <p className="pa-foot-disc">{DISCLAIMER}</p>
    </footer>
  );
}

/* ---- mobile landing chrome (hidden on desktop) ---- */
export function LandingTopBar({ onSection }: { onSection: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="pa-mtop">
      <span className="pa-brand">papicture<span>.</span></span>
      <div style={{ position: 'relative' }}>
        <button className="pa-menu-btn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Menu</button>
        {open && (
          <>
            <div className="pa-menu-scrim" onClick={() => setOpen(false)} />
            <div className="pa-menu-sheet">
              {SECTIONS.map((s) => <SectionLink key={s.label} item={s} onSection={onSection} onClick={() => setOpen(false)} className="pa-menu-item" />)}
              {LEGAL.map((l) => <LegalLink key={l.label} item={l} onClick={() => setOpen(false)} className="pa-menu-item" />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function LandingFooter({ onSection }: { onSection: (id: string) => void }) {
  return (
    <div className="pa-mfoot">
      <span className="pa-brand" style={{ fontSize: 17 }}>papicture<span>.</span></span>
      <nav className="pa-mfoot-links">
        {SECTIONS.map((s) => <SectionLink key={s.label} item={s} onSection={onSection} />)}
        {LEGAL.map((l) => <LegalLink key={l.label} item={l} />)}
      </nav>
      <p className="pa-foot-disc">{DISCLAIMER}</p>
      <p className="pa-foot-cp">© 2026 papicture</p>
    </div>
  );
}
