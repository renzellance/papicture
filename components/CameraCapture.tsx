'use client';
/* papicture — real device camera capture via getUserMedia.
   Live webcam/front-camera stream into a <video>, shutter draws the current
   frame to a canvas. Falls back to the native file/camera input if permission
   is denied or no camera is available, so the button never dead-ends.
   Requires a secure context (HTTPS or localhost). */

import React, { useRef, useEffect, useState } from 'react';
import { Notice, Btn } from './ui';

type Status = 'init' | 'live' | 'denied';

export function CameraCapture({ onCapture, onClose, onFallback }:
  { onCapture: (dataUrl: string) => void; onClose: () => void; onFallback: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>('init');

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = async () => {
    setStatus('init');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStatus('live');
    } catch {
      setStatus('denied');
    }
  };

  useEffect(() => {
    start();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shoot = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth || !v.videoHeight) return;
    const max = 1280;
    const scale = Math.min(1, max / Math.max(v.videoWidth, v.videoHeight));
    const w = Math.round(v.videoWidth * scale);
    const h = Math.round(v.videoHeight * scale);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;
    // mirror so the capture matches the selfie preview the user sees
    ctx.translate(w, 0); ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0, w, h);
    const data = c.toDataURL('image/jpeg', 0.9);
    stop();
    onCapture(data);
  };

  const close = () => { stop(); onClose(); };
  const fallback = () => { stop(); onFallback(); };

  return (
    <div className="pa-fade" style={{ position: 'absolute', inset: 0, zIndex: 90, background: '#0c0d10', display: 'flex', flexDirection: 'column' }}>
      {status === 'denied' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
          <Notice kind="warn" icon="warn">
            Camera access was blocked or no camera was found. Upload a photo instead, or allow camera access and try again.
          </Notice>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn variant="primary" icon="upload" onClick={fallback}>Upload a photo</Btn>
            <button className="pa-btn pa-btn-quiet" onClick={start}>Try camera again</button>
            <button className="pa-btn pa-btn-quiet" style={{ color: '#fff' }} onClick={close}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            <video ref={videoRef} playsInline muted autoPlay
                   style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', background: '#0c0d10' }} />
            <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '62%', aspectRatio: '0.8', border: '2px dashed rgba(255,255,255,.6)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center' }}>
              <span className="pa-ref-pill" style={{ color: '#fff', background: 'rgba(0,0,0,.4)', borderColor: 'rgba(255,255,255,.3)' }}>● ALIGN YOUR FACE</span>
            </div>
            {status === 'init' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <span className="pa-spin" />
                <span className="pa-mono" style={{ color: 'rgba(255,255,255,.7)' }}>Starting camera…</span>
              </div>
            )}
          </div>
          <div style={{ background: '#0c0d10', padding: '20px 0 calc(26px + env(safe-area-inset-bottom))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <button className="pa-btn pa-btn-quiet" style={{ color: '#fff', width: 'auto', position: 'absolute', left: 18 }} onClick={close}>Cancel</button>
            <button onClick={shoot} aria-label="Capture" disabled={status !== 'live'}
                    style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '5px solid rgba(255,255,255,.35)', cursor: 'pointer', opacity: status === 'live' ? 1 : 0.5 }} />
          </div>
        </>
      )}
    </div>
  );
}
