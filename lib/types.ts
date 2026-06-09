/* papicture — shared types */

export type Strictness = 'flexible' | 'standard' | 'strict';
export type Fulfillment = 'digital' | 'print';

export interface Look {
  id: string;
  name: string;
  code: string;
  tagline: string;
  desc: string;
  sub: { label: string; options: string[] } | null;
  best: string;
}

export interface Format {
  group: string;
  groupCode: 'A' | 'B' | 'C';
  id: string;
  name: string;
  short?: string;
  code: string;
  size: string;
  unit: string;
  ratio: number;
  backgrounds: string[];
  defaultBg: string;
  strict: Strictness;
  looks: string[];
  best: string;
  digital: boolean;
  print: boolean;
  sheet?: boolean;
  combo?: boolean;
  circleOption?: boolean;
  darkTop?: boolean;
  printSet?: string;
  printPrice?: number;
  digitalSpec?: string;
  rules?: string[];
  warn?: string;
  /** target pixel dimensions for the rendered file [w, h] */
  px?: [number, number];
}

export interface Swatch { id: string; name: string; hex: string; ring: string }

export interface Group { code: 'A' | 'B' | 'C'; name: string; note: string; noteDigital: string }

/** the order being assembled across the funnel */
export interface Order {
  /** downscaled original selfie (data URL) — the "before" */
  original?: string;
  /** studio-generated result from /api/generate (data URL) — the "after" */
  studio?: string;
  /** which look/attire the current `studio` image reflects (to avoid redundant regen) */
  studioLook?: string;
  studioSub?: string | null;
  /** diagnostics: which path produced `studio` (ai | fallback | cleanup | docsafe …) */
  studioMode?: string;
  studioDetail?: string;
  source?: 'camera' | 'upload';
  fulfillment?: Fulfillment;
  format?: string;
  formatName?: string;
  formatSize?: string;
  bg?: string;
  bgName?: string;
  circle?: boolean;
  strict?: Strictness;
  printAvailable?: boolean;
  price?: number;
  look?: string;
  lookSub?: string | null;
  // checkout fields
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  zip?: string;
  notes?: string;
  orderNo?: string;
}
