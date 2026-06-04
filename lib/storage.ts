/* papicture — order persistence across the payment redirect.
   The funnel state lives in React, but a full-page redirect to the payment
   gateway (and back) would lose it, so we mirror it into sessionStorage. */

import type { Order } from './types';

const KEY = 'papicture.order';

export function saveOrder(order: Order) {
  try { sessionStorage.setItem(KEY, JSON.stringify(order)); } catch { /* quota / SSR */ }
}

export function loadOrder(): Order | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order) : null;
  } catch { return null; }
}

export function clearOrder() {
  try { sessionStorage.removeItem(KEY); } catch { /* noop */ }
}
