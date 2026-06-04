import type { Order } from '@/lib/types';

export interface ScreenProps {
  go: (next: string, patch?: Partial<Order>) => void;
  set: (patch: Partial<Order>) => void;
  state: Order;
  reset?: () => void;
}
