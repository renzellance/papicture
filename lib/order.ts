/* papicture — produce and download the final, full-resolution file for an order.
   Shared by the confirmation screen (mobile) and the desktop preview rail. */

import { FORMATS, BG } from './data';
import { renderFinal, downloadDataURL } from './image';
import type { Order } from './types';

export async function downloadFinalPhoto(order: Order) {
  if (!order.studio) return;
  const fmt = FORMATS.find((f) => f.id === order.format);
  const [w, h] = fmt?.px || [1080, 1080];
  const out = await renderFinal({
    src: order.studio,
    width: w,
    height: h,
    bg: BG[order.bg || 'white']?.hex || '#fff',
    circle: order.circle,
  });
  downloadDataURL(out, `${order.orderNo || 'papicture'}.jpg`);
}
