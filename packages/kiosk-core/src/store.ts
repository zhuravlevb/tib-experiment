import { createStore } from 'zustand/vanilla';
import { createBus, type Lang } from '@tib/shared';
import { persistOrder } from './persist';
import { DEMO_QR, demoGuests } from './data/restaurants';
import {
  computeTotals,
  guardStep,
  issueTickets,
  orderCode,
  type MenuFilter,
  type Step,
  type TicketCounters,
} from './logic';
import type {
  A11ySettings,
  AppliedLoyalty,
  CartLine,
  DineMode,
  GuestProfile,
  Order,
  PaymentMethod,
} from './types';

export type PaymentStatus = 'idle' | 'waiting' | 'processing' | 'success' | 'declined';

export type KioskMessage = { type: 'order'; order: Order };
export const kioskBus = () => createBus<KioskMessage>('kiosk');

export interface KioskSession {
  step: Step;
  lang: Lang;
  a11y: A11ySettings;
  dineMode: DineMode | null;
  restaurantId: string | null;
  filter: MenuFilter;
  cart: CartLine[];
  guest: GuestProfile | null;
  applied: AppliedLoyalty[];
  payment: { method: PaymentMethod | null; status: PaymentStatus };
  order: Order | null;
}

export interface KioskState extends KioskSession {
  /** Уровень киоска — не сбрасывается между гостями */
  counters: TicketCounters;
  seq: number;

  begin(): void;
  goto(step: Step): string | null;
  setLang(lang: Lang): void;
  setA11y(patch: Partial<A11ySettings>): void;
  setDineMode(mode: DineMode): void;
  openRestaurant(id: string): void;
  setFilter(patch: Partial<MenuFilter>): void;

  addLine(draft: Omit<CartLine, 'id'>): void;
  setQty(lineId: string, qty: number): void;
  replaceLine(lineId: string, draft: Omit<CartLine, 'id'>): void;

  identifyGuest(input: { phone?: string; qr?: string }): GuestProfile | null;
  forgetGuest(): void;
  setApplied(restaurantId: string, on: boolean, pointsToSpend?: number): void;

  choosePayment(method: PaymentMethod): void;
  /** Симуляция терминала. outcome — для демо-сценария отказа. */
  pay(outcome?: 'success' | 'declined', delayMs?: number): Promise<PaymentStatus>;

  /** Отмена заказа / сброс по простою / «Готово» на экране кода */
  reset(): void;
}

const freshSession = (lang: Lang = 'ru', a11y?: A11ySettings): KioskSession => ({
  step: 'attract',
  lang,
  // настройки доступности сбрасываются вместе с сессией: следующий гость может быть другим
  a11y: a11y ?? { lowMode: false, largeText: false, highContrast: false },
  dineMode: null,
  restaurantId: null,
  filter: {},
  cart: [],
  guest: null,
  applied: [],
  payment: { method: null, status: 'idle' },
  order: null,
});

let lineSeq = 0;
const sameConfig = (a: Omit<CartLine, 'id'>, b: Omit<CartLine, 'id'>) =>
  a.itemId === b.itemId &&
  a.combo === b.combo &&
  JSON.stringify(a.selections) === JSON.stringify(b.selections) &&
  JSON.stringify(a.comboSelections) === JSON.stringify(b.comboSelections);

const normalizePhone = (p: string) => p.replace(/\D/g, '').replace(/^8/, '7');

export function createKioskStore(opts: { bus?: ReturnType<typeof kioskBus> } = {}) {
  return createStore<KioskState>()((set, get) => ({
    ...freshSession(),
    counters: {},
    seq: 1,

    begin: () => set({ step: 'start' }),

    goto(step) {
      const s = get();
      const err = guardStep(step, { cart: s.cart, restaurantId: s.restaurantId, paid: s.payment.status === 'success' });
      if (!err) set({ step });
      return err;
    },

    setLang: (lang) => set({ lang }),
    setA11y: (patch) => set((s) => ({ a11y: { ...s.a11y, ...patch } })),
    setDineMode: (dineMode) => set({ dineMode, step: 'restaurants' }),
    openRestaurant: (restaurantId) => set({ restaurantId, step: 'menu' }),
    setFilter: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),

    addLine(draft) {
      set((s) => {
        const same = s.cart.find((l) => sameConfig(l, draft));
        if (same) return { cart: s.cart.map((l) => (l === same ? { ...l, qty: l.qty + draft.qty } : l)) };
        return { cart: [...s.cart, { ...draft, id: `line-${++lineSeq}` }] };
      });
    },

    setQty(lineId, qty) {
      set((s) => {
        const cart = qty <= 0 ? s.cart.filter((l) => l.id !== lineId) : s.cart.map((l) => (l.id === lineId ? { ...l, qty } : l));
        // ресторан ушёл из корзины — его лояльность больше не применяется
        const applied = s.applied.filter((a) => cart.some((l) => l.restaurantId === a.restaurantId));
        // пустая корзина на шагах оформления — назад к ресторанам
        const step = cart.length === 0 && ['cart', 'loyalty', 'payment'].includes(s.step) ? 'restaurants' : s.step;
        return { cart, applied, step };
      });
    },

    replaceLine: (lineId, draft) => set((s) => ({ cart: s.cart.map((l) => (l.id === lineId ? { ...draft, id: lineId } : l)) })),

    identifyGuest({ phone, qr }) {
      const guest =
        (phone && demoGuests.find((g) => g.phone === normalizePhone(phone))) ||
        (qr === DEMO_QR ? demoGuests[0] : undefined) ||
        null;
      set({ guest, applied: [] });
      return guest;
    },
    forgetGuest: () => set({ guest: null, applied: [] }),

    setApplied(restaurantId, on, pointsToSpend) {
      set((s) => {
        const rest = s.applied.filter((a) => a.restaurantId !== restaurantId);
        return { applied: on ? [...rest, { restaurantId, pointsToSpend }] : rest };
      });
    },

    choosePayment: (method) => set({ payment: { method, status: 'waiting' }, step: 'payment' }),

    async pay(outcome = 'success', delayMs = 1500) {
      set((s) => ({ payment: { ...s.payment, status: 'processing' } }));
      await new Promise((r) => setTimeout(r, delayMs));
      if (outcome === 'declined') {
        set((s) => ({ payment: { ...s.payment, status: 'declined' } }));
        return 'declined';
      }
      const s = get();
      const totals = computeTotals(s.cart, s.guest, s.applied);
      const { tickets, counters } = issueTickets(s.counters, totals.groups.map((g) => g.restaurant.id));
      const order: Order = {
        code: orderCode(s.seq),
        createdAt: Date.now(),
        dineMode: s.dineMode ?? 'here',
        lang: s.lang,
        tickets,
        total: totals.total,
        lines: s.cart,
      };
      set({ counters, seq: s.seq + 1, order, payment: { ...s.payment, status: 'success' }, step: 'done' });
      if (opts.bus) {
        persistOrder(order);
        opts.bus.post({ type: 'order', order });
      }
      return 'success';
    },

    reset: () => set((s) => ({ ...freshSession() , counters: s.counters, seq: s.seq })),
  }));
}

export type KioskStore = ReturnType<typeof createKioskStore>;
