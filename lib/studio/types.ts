/* papicture — studio AI types. The selfie -> studio portrait seam. */

export type Tier = 'preview' | 'final';

export interface StudioRequest {
  image: Buffer;
  mime: string;
  lookId: string;          // 'original' | 'smartcasual' | 'formal' | 'studio' | 'linkedin' | 'docsafe'
  sub?: string | null;     // attire sub-option text
  bgName?: string;         // target background description
  tier: Tier;
}

export interface StudioOutput {
  image: Buffer;
  mime: string;
  meta: Record<string, unknown>;
}

export interface StudioProvider {
  name: string;
  convert(req: StudioRequest): Promise<StudioOutput>;
}
