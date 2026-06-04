/* papicture — client-side image helpers (browser canvas).
   Downscaling for upload/storage, and full-resolution final render for download.
   The "studio" generation itself happens server-side in /api/generate. */

/** Load a File or data URL into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Read a File to a data URL. */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

/**
 * Downscale a selected photo so it is cheap to store in sessionStorage and to
 * POST to the server. Keeps aspect ratio; longest edge <= max. Returns JPEG.
 */
export async function downscaleImage(file: File, max = 1280, quality = 0.86): Promise<string> {
  const dataURL = await fileToDataURL(file);
  const img = await loadImage(dataURL);
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Render the final, submission-ready file at exact pixel spec: cover-crop the
 * studio photo to the target aspect, flatten onto the chosen background, and
 * optionally apply a circular crop. Returns a JPEG data URL for download.
 */
export async function renderFinal(opts: {
  src: string;
  width: number;
  height: number;
  bg: string;
  circle?: boolean;
}): Promise<string> {
  const { src, width, height, bg, circle } = opts;
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // background fill (matters once subject segmentation exists; harmless now)
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  if (circle) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.clip();
  }

  // object-fit: cover
  const scale = Math.max(width / img.width, height / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);

  if (circle) ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.92);
}

/** Trigger a browser download of a data URL. */
export function downloadDataURL(dataURL: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
