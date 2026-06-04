'use client';
/* papicture — desktop preview rail.
   Persistent right pane: shows the user's real photo in the currently selected
   format + background, updating live as choices are made on the left. Hidden on
   mobile via CSS (the screens carry their own inline previews there). */

import React, { useState } from 'react';
import { Portrait, Watermark, FrameMarks, BeforeAfter, Icon } from './ui';
import { FORMATS, BG, LOOKS, PRICE } from '@/lib/data';
import { downloadFinalPhoto } from '@/lib/order';
import type { Order } from '@/lib/types';

export function PreviewRail({ order, screen }: { order: Order; screen: string }) {
  const [dl, setDl] = useState(false);
  const fmt = FORMATS.find((f) => f.id === order.format);
  const ratio = fmt ? fmt.ratio : 0.82;
  const bg = BG[order.bg || 'white']?.hex || '#fff';
  const lk = LOOKS.find((l) => l.id === order.look);

  const download = async () => { if (dl) return; setDl(true); try { await downloadFinalPhoto(order); } finally { setDl(false); } };

  // ---- before/after on the preview step ----
  if (screen === 'preview') {
    return (
      <aside className="pa-rail">
        <div className="pa-rail-inner">
          <span className="pa-rail-eyebrow">Before / after</span>
          <div className="pa-rail-stage"><BeforeAfter bg="#fff" ratio={1.12} before={order.original} after={order.studio} /></div>
          <div className="pa-rail-cap">
            <div className="l1">Your studio photo</div>
            <div className="l2">You only pay when you download it.</div>
          </div>
        </div>
      </aside>
    );
  }

  // ---- final, full-resolution result on the confirmation step ----
  if (screen === 'confirmation') {
    return (
      <aside className="pa-rail">
        <div className="pa-rail-inner">
          <span className="pa-rail-eyebrow">Ready · full resolution</span>
          <div className="pa-rail-stage">
            <Portrait variant="studio" bg={bg} ratio={ratio} circle={order.circle} darkTop={fmt?.darkTop} photo={order.studio}
                      style={{ borderRadius: order.circle ? '50%' : 'var(--r-sm)', width: '100%', boxShadow: 'var(--shadow-lg)' }} />
            {!order.circle && <FrameMarks />}
          </div>
          <div className="pa-rail-cap">
            <div className="l1">{order.formatName}</div>
            <div className="l2">{order.orderNo}</div>
          </div>
          <button className="pa-btn pa-btn-dark pa-btn-sm" onClick={download} disabled={dl}>
            <Icon name="download" size={16} />{dl ? 'Saving…' : 'Download photo'}
          </button>
        </div>
      </aside>
    );
  }

  // ---- live preview of the selection through the rest of the funnel ----
  const line2 = [order.bgName ? order.bgName + ' bg' : null, lk ? lk.name : null].filter(Boolean).join(' · ');
  return (
    <aside className="pa-rail">
      <div className="pa-rail-inner">
        <span className="pa-rail-eyebrow">{order.studio ? 'Live preview' : 'Your preview'}</span>
        <div className="pa-rail-stage">
          <Portrait variant="studio" bg={bg} ratio={ratio} circle={order.circle} darkTop={fmt?.darkTop} photo={order.studio}
                    style={{ borderRadius: order.circle ? '50%' : 'var(--r-sm)', width: '100%', boxShadow: 'var(--shadow-lg)' }} />
          <Watermark text="papicture preview" />
          {!order.circle && <FrameMarks />}
        </div>
        <div className="pa-rail-cap">
          <div className="l1">{order.formatName || 'Your studio photo'}</div>
          {line2 && <div className="l2">{line2}</div>}
          {order.price ? <div className="p">{PRICE.currency}{order.price}{order.fulfillment === 'print' ? ' set' : ' file'}</div> : null}
        </div>
      </div>
    </aside>
  );
}
