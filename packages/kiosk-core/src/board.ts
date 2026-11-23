import { createStore } from 'zustand/vanilla';
import type { Order } from './types';

export type BoardStatus = 'cooking' | 'ready' | 'collected';

export interface BoardEntry {
  key: string; // код заказа + ресторан: уникален, в отличие от номера
  code: string;
  restaurantId: string;
  number: number;
  status: BoardStatus;
  createdAt: number;
  readyAt: number; // когда станет «Готово» (демо)
  collectAt: number; // когда пропадёт с табло (демо)
}

export const READY_HIGHLIGHT_MS = 10_000;

/** Детерминированное «время готовки» 20–40 с, чтобы демо было воспроизводимым. */
const cookMs = (key: string) => {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 20_000 + (h % 20_000);
};

export interface BoardState {
  entries: BoardEntry[];
  addOrder(order: Order, now?: number): void;
  tick(now?: number): void;
  /** Ручные действия демо-панели */
  markReady(key: string, now?: number): void;
  collect(key: string): void;
}

export function createBoardStore() {
  return createStore<BoardState>()((set) => ({
    entries: [],
    addOrder(order, now = Date.now()) {
      set((s) => ({
        entries: [
          ...s.entries,
          ...order.tickets.map((t) => {
            const key = `${order.code}:${t.restaurantId}`;
            const readyAt = now + cookMs(key);
            return { key, code: order.code, restaurantId: t.restaurantId, number: t.number, status: 'cooking' as const, createdAt: now, readyAt, collectAt: readyAt + 60_000 };
          }),
        ],
      }));
    },
    tick(now = Date.now()) {
      set((s) => ({
        entries: s.entries
          .map((e) => (e.status === 'cooking' && now >= e.readyAt ? { ...e, status: 'ready' as const } : e))
          .map((e) => (e.status === 'ready' && now >= e.collectAt ? { ...e, status: 'collected' as const } : e))
          .filter((e) => e.status !== 'collected'),
      }));
    },
    markReady: (key, now = Date.now()) =>
      set((s) => ({ entries: s.entries.map((e) => (e.key === key ? { ...e, status: 'ready', readyAt: now, collectAt: now + 60_000 } : e)) })),
    collect: (key) => set((s) => ({ entries: s.entries.filter((e) => e.key !== key) })),
  }));
}

/** «Только что готов» — подсветка на табло. */
export const isFresh = (e: BoardEntry, now = Date.now()) => e.status === 'ready' && now - e.readyAt < READY_HIGHLIGHT_MS;
