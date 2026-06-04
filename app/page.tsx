'use client';
/* papicture — app shell: funnel state machine + payment redirect + desktop chrome */

import React, { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { loadOrder, saveOrder, clearOrder } from '@/lib/storage';
import { LandingScreen, UploadScreen, ProcessingScreen, PreviewScreen } from '@/components/screens/ScreensA';
import { LookScreen, FormatScreen } from '@/components/screens/ScreensB';
import { FulfillmentScreen, CheckoutScreen, ConfirmationScreen } from '@/components/screens/ScreensC';
import { PreviewRail, LandingAside } from '@/components/PreviewRail';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome';

const IMMERSIVE: Record<string, boolean> = { processing: true };

export default function App() {
  const [screen, setScreen] = useState('landing');
  const [order, setOrder] = useState<Order>({});
  const [ready, setReady] = useState(false);
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  // restore funnel + react to the payment-gateway return / deep-link hash
  useEffect(() => {
    const restored = loadOrder();
    const params = new URLSearchParams(window.location.search);
    const paid = params.get('paid');
    const orderNo = params.get('order') || undefined;
    const hash = window.location.hash ? window.location.hash.slice(1) : '';

    if (paid === '1' && restored) {
      setOrder({ ...restored, ...(orderNo ? { orderNo } : {}) });
      setScreen('confirmation');
    } else if (paid === '0' && restored) {
      setOrder(restored);
      setScreen('checkout');
    } else {
      if (restored && restored.studio) setOrder(restored);
      if (hash) { setScreen('landing'); setPendingScroll(hash); }
    }

    if (paid || hash) window.history.replaceState({}, '', window.location.pathname);
    setReady(true);
  }, []);

  // mirror funnel state so it survives the redirect
  useEffect(() => { if (ready) saveOrder(order); }, [order, ready]);

  // perform a pending section scroll once landing is rendered
  useEffect(() => {
    if (screen === 'landing' && pendingScroll) {
      const id = pendingScroll;
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      setPendingScroll(null);
    }
  }, [screen, pendingScroll]);

  const go = (next: string, patch?: Partial<Order>) => {
    if (patch) setOrder((o) => ({ ...o, ...patch }));
    setScreen(next);
  };
  const set = (patch: Partial<Order>) => setOrder((o) => ({ ...o, ...patch }));
  const reset = () => { clearOrder(); setOrder({}); setScreen('landing'); };

  const goToSection = (id: string) => {
    if (screen === 'landing') document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else { setPendingScroll(id); setScreen('landing'); }
  };

  const immersive = IMMERSIVE[screen];
  const full = screen === 'processing';   // single-pane, fills the card
  const split = !full;                     // every other screen has a right pane

  const renderScreen = () => {
    switch (screen) {
      case 'landing':      return <LandingScreen go={go} set={set} state={order} />;
      case 'upload':       return <UploadScreen go={go} set={set} state={order} />;
      case 'processing':   return <ProcessingScreen go={go} set={set} state={order} />;
      case 'preview':      return <PreviewScreen go={go} set={set} state={order} />;
      case 'fulfillment':  return <FulfillmentScreen go={go} set={set} state={order} />;
      case 'format':       return <FormatScreen go={go} set={set} state={order} />;
      case 'look':         return <LookScreen go={go} set={set} state={order} />;
      case 'checkout':     return <CheckoutScreen go={go} set={set} state={order} />;
      case 'confirmation': return <ConfirmationScreen go={go} set={set} state={order} reset={reset} />;
      default:             return null;
    }
  };

  const rightPane = full ? null : (screen === 'landing' ? <LandingAside /> : <PreviewRail order={order} screen={screen} />);

  return (
    <div className="pa-host">
      <SiteHeader onHome={() => go('landing')} onSection={goToSection} />
      <div className={'pa-device' + (split ? ' pa-split' : '')}>
        <div className="pa-pane-left">
          <div className={'pa-app' + (immersive ? ' pa-block-accent' : '')} style={{ color: immersive ? '#fff' : undefined }}>
            <div key={screen} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {ready ? renderScreen() : null}
            </div>
          </div>
        </div>
        {ready && rightPane}
      </div>
      <SiteFooter onSection={goToSection} />
    </div>
  );
}
