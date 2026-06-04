'use client';
/* papicture — Screens B: choose look, choose format */

import React, { useState } from 'react';
import { Icon, Portrait, Watermark, FrameMarks, Btn, Swatches, Seg, Notice, StepBar } from '@/components/ui';
import { LOOKS, FORMATS, BG, GROUPS, PRICE } from '@/lib/data';
import type { Format } from '@/lib/types';
import type { ScreenProps } from './types';

export function FunnelHeader({ back, stepIndex, title }:
  { back: () => void; stepIndex: number; title: string }) {
  return (
    <div className="pa-topbar">
      <div className="pa-topbar-row">
        <button className="pa-iconbtn" onClick={back}><Icon name="arrowL" size={18} /></button>
        <span className="ttl">{title}</span>
        <span className="cnt">{stepIndex + 1}/4</span>
      </div>
      <StepBar total={4} current={stepIndex} />
    </div>
  );
}

/* ============================== CHOOSE LOOK ============================== */
export function LookScreen({ go, state, set }: ScreenProps) {
  const fmt = FORMATS.find((f) => f.id === state.format);
  const allowed = fmt ? fmt.looks : LOOKS.map((l) => l.id);
  const looks = LOOKS.filter((l) => allowed.includes(l.id));
  const docOnly = looks.length === 1 && looks[0].id === 'docsafe';
  const [sel, setSel] = useState<string | null>(state.look && allowed.includes(state.look) ? state.look : (docOnly ? 'docsafe' : null));
  const [sub, setSub] = useState<Record<string, string>>(state.look && state.lookSub ? { [state.look]: state.lookSub } : {});

  const choose = (id: string) => {
    setSel(id);
    const look = LOOKS.find((l) => l.id === id)!;
    if (look.sub && !sub[id]) setSub((s) => ({ ...s, [id]: look.sub!.options[0] }));
  };
  const cont = () => {
    set({ look: sel!, lookSub: sub[sel!] || null });
    go('checkout');
  };

  return (
    <>
      <FunnelHeader back={() => go('format')} stepIndex={2} title="Choose your look" />
      <div className="pa-scroll pa-fade">
        <div className="pa-pad" style={{ paddingTop: 14 }}>
          <h1 className="pa-h2">{docOnly ? 'Your attire stays as is.' : 'Pick a look or attire.'}</h1>
          <p className="pa-body" style={{ marginTop: 6 }}>{docOnly
            ? 'This format is sized to an official spec, so we only crop, resize and clean the background. Your face is not changed.'
            : 'We use AI to add the attire, background and lighting. Previews use your own photo.'}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {looks.map((lk) => {
              const on = sel === lk.id;
              return (
                <div key={lk.id} className="pa-tile" data-sel={on} onClick={() => choose(lk.id)} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 14, padding: 14 }}>
                    <div style={{ width: 76, flexShrink: 0, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                      <Portrait variant={lk.id === 'original' ? 'raw' : 'studio'}
                                bg={lk.id === 'docsafe' ? '#fff' : 'var(--paper-2)'}
                                ratio={1.18} darkTop={lk.id === 'formal'}
                                photo={lk.id === 'original' ? state.original : state.studio}
                                style={{ borderRadius: 0 }} />
                      <Watermark text="papicture" />
                      {lk.id !== 'original' && <FrameMarks />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="pa-h3">{lk.name}</div>
                      <p className="pa-small" style={{ marginTop: 6, color: 'var(--ink-2)' }}>{lk.tagline}</p>
                      <p className="pa-small" style={{ marginTop: 6, display: 'flex', gap: 5, alignItems: 'center' }}>
                        <Icon name="check" size={12} sw={2.4} style={{ color: 'var(--accent)' }} />{lk.best}
                      </p>
                    </div>
                    <div className="pa-tile-check"><Icon name="check" size={14} sw={2.6} /></div>
                  </div>

                  {on && (
                    <div style={{ padding: '0 14px 14px' }}>
                      <p className="pa-body" style={{ color: 'var(--ink-2)' }}>{lk.desc}</p>
                      {lk.sub && (
                        <div style={{ marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                          <div className="pa-small" style={{ fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8 }}>{lk.sub.label}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {lk.sub.options.map((opt) => (
                              <button key={opt} onClick={() => setSub((s) => ({ ...s, [lk.id]: opt }))}
                                      className="pa-chip" style={{
                                        cursor: 'pointer', textTransform: 'none', letterSpacing: 0, fontSize: 12, fontWeight: 600,
                                        fontFamily: 'var(--font-body)', padding: '8px 12px',
                                        background: sub[lk.id] === opt ? 'var(--accent)' : '#fff',
                                        color: sub[lk.id] === opt ? '#fff' : 'var(--ink-2)',
                                        border: '1px solid ' + (sub[lk.id] === opt ? 'var(--accent)' : 'var(--line)') }}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {lk.id === 'docsafe' && !docOnly && (
                        <div style={{ marginTop: 12 }}>
                          <Notice kind="info" icon="shield">We size to the document spec and clean the background. We don&rsquo;t change your face, so it stays true to your real photo.</Notice>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pa-dock pa-dock-solid">
        <Btn variant="primary" iconR="arrowR" disabled={!sel} onClick={cont}>
          {sel ? 'Continue to checkout' : 'Select a look'}
        </Btn>
      </div>
    </>
  );
}

/* ============================== CHOOSE FORMAT ============================== */
export function FormatScreen({ go, state, set }: ScreenProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openFmt = FORMATS.find((f) => f.id === openId);
  const isPrint = state.fulfillment === 'print';

  return (
    <>
      <FunnelHeader back={() => go('fulfillment')} stepIndex={1} title="Choose a format" />
      <div className="pa-scroll pa-fade">
        <div className="pa-pad" style={{ paddingTop: 14, paddingBottom: 20 }}>
          <h1 className="pa-h2">What&rsquo;s it for?</h1>
          <p className="pa-body" style={{ marginTop: 6 }}>{isPrint
            ? 'Printed sets are sold by the piece, like your local shop, and the softcopy is included. Tap any for sizes and details.'
            : 'Each one is a single file, sized to spec and ready to upload. Tap any for sizes and details.'}</p>

          {GROUPS.map((g) => {
            const items = FORMATS.filter((f) => f.groupCode === g.code && (isPrint ? f.print : f.digital));
            if (items.length === 0) return null;
            return (
              <div key={g.code} style={{ marginTop: 24 }}>
                <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 10 }}>
                  <div className="pa-h3">{g.name}</div>
                  <div className="pa-small">{(!isPrint && g.noteDigital) ? g.noteDigital : g.note}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                  {items.map((f) => {
                    const bg = BG[f.defaultBg];
                    const spec = isPrint ? (f.printSet || f.size) : (f.digitalSpec || f.size);
                    const price = isPrint ? PRICE.currency + f.printPrice : PRICE.currency + PRICE.digital;
                    const title = isPrint ? f.name : (f.short || f.name);
                    return (
                      <button key={f.id} className="pa-tile" data-sel={state.format === f.id}
                              onClick={() => setOpenId(f.id)} style={{ padding: 10, textAlign: 'left', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: f.sheet ? 8 : 0 }}>
                          {f.sheet ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, width: '100%' }}>
                              {Array.from({ length: 6 }).map((_, i) => (
                                <Portrait key={i} variant="studio" bg={bg.hex} ratio={1} photo={state.studio} style={{ borderRadius: 2 }} />
                              ))}
                            </div>
                          ) : (
                            <Portrait variant="studio" bg={bg.hex} ratio={f.ratio} darkTop={f.darkTop} photo={state.studio}
                                      style={{ borderRadius: 0, width: f.ratio < 1 ? 'auto' : '100%', height: f.ratio < 1 ? 132 : 'auto' }} />
                          )}
                          <div style={{ position: 'absolute', inset: 0 }}><Watermark text="papicture" /></div>
                          <FrameMarks />
                        </div>
                        {f.combo && <div style={{ marginTop: 10 }}><span className="pa-chip pa-chip-accent" style={{ padding: '3px 7px' }}>Save ₱149</span></div>}
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, marginTop: f.combo ? 6 : 10, lineHeight: 1.15 }}>{title}</div>
                        <div className="pa-small" style={{ marginTop: 3 }}>{spec}</div>
                        <div className="pa-ref" style={{ color: 'var(--accent-ink)', marginTop: 9 }}>{price} {isPrint ? 'set' : 'file'}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="pa-small" style={{ marginTop: 26, lineHeight: 1.5 }}>
            Each office sets its own rules. We size to the current spec; final acceptance is theirs.
          </p>
        </div>
      </div>

      {openFmt && (
        <FormatSheet fmt={openFmt} state={state} set={set} go={go} onClose={() => setOpenId(null)} />
      )}
    </>
  );
}

/* ---- format detail bottom sheet ---- */
function FormatSheet({ fmt, state, set, go, onClose }:
  { fmt: Format } & ScreenProps & { onClose: () => void }) {
  const isPrint = state.fulfillment === 'print';
  const [bgId, setBgId] = useState(fmt.defaultBg);
  const [circle, setCircle] = useState(false);
  const bg = BG[bgId];
  const swatchOpts = fmt.backgrounds.map((id) => BG[id]);
  const includes = isPrint ? (fmt.printSet || fmt.size) : (fmt.digitalSpec || fmt.size);
  const priceVal = isPrint ? fmt.printPrice! : PRICE.digital;
  const heading = isPrint ? fmt.name : (fmt.short || fmt.name);

  const confirm = () => {
    set({
      format: fmt.id, formatName: heading, formatSize: fmt.size,
      bg: bgId, bgName: bg.name, circle, strict: fmt.strict,
      printAvailable: fmt.print, price: priceVal,
    });
    go('look');
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(16,18,24,.42)' }} />
      <div className="pa-block" style={{ position: 'relative', background: 'var(--paper)', borderRadius: '26px 26px 0 0', maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 5, borderRadius: 99, background: 'var(--line)' }} />
        </div>
        <div style={{ overflowY: 'auto', padding: '14px 18px 0' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ width: 116, flexShrink: 0, borderRadius: 'var(--r)', overflow: 'hidden', position: 'relative', background: 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Portrait variant="studio" bg={bg.hex} ratio={fmt.ratio} darkTop={fmt.darkTop} circle={circle} photo={state.studio}
                        style={{ borderRadius: circle ? '50%' : 0, width: '100%' }} />
              <Watermark text="preview" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="pa-h2" style={{ fontSize: 21 }}>{heading}</h2>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
                <span className="pa-chip"><Icon name={isPrint ? 'print' : 'mail'} size={11} />{isPrint ? 'Printed set' : 'Digital file'}</span>
                {isPrint && fmt.combo && <span className="pa-chip pa-chip-accent">Save ₱149</span>}
              </div>
              <div className="pa-sumrow" style={{ paddingTop: 12 }}><span className="k">{isPrint ? 'Includes' : 'You get'}</span><span className="v">{includes}</span></div>
              <div className="pa-sumrow"><span className="k">Best for</span><span className="v" style={{ maxWidth: 150 }}>{fmt.best}</span></div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="pa-small" style={{ fontWeight: 700, color: 'var(--ink-2)', marginBottom: 9 }}>Background</div>
            <Swatches options={swatchOpts} value={bgId} onChange={setBgId} />
          </div>

          {fmt.circleOption && (
            <div style={{ marginTop: 16 }}>
              <div className="pa-small" style={{ fontWeight: 700, color: 'var(--ink-2)', marginBottom: 9 }}>Crop</div>
              <Seg options={[{ value: false, label: 'Square / 4:5' }, { value: true, label: 'Circular' }]} value={circle} onChange={setCircle} />
            </div>
          )}

          {fmt.rules && (
            <div style={{ marginTop: 16 }}>
              <div className="pa-small" style={{ fontWeight: 700, color: 'var(--ink-2)', marginBottom: 9 }}>Requirements</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {fmt.rules.map((r) => (
                  <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', background: '#fff', border: '1px solid var(--line)', padding: '7px 10px', borderRadius: 99 }}>
                    <Icon name="check" size={12} sw={2.4} style={{ color: 'var(--ok)' }} />{r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {fmt.warn && (
            <div style={{ marginTop: 16 }}>
              <Notice kind="info" icon="info">{fmt.warn}</Notice>
            </div>
          )}

          <div style={{ height: 12 }} />
        </div>
        <div className="pa-dock pa-dock-solid" style={{ position: 'relative' }}>
          <div className="pa-dock-row">
            <div className="pa-dock-price"><span className="amt">{PRICE.currency}{priceVal}</span><span className="lbl">{isPrint ? 'set, delivered' : 'file'}</span></div>
            <div style={{ flex: 1 }}>
              <Btn variant="primary" iconR="arrowR" onClick={confirm}>Use this format</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
