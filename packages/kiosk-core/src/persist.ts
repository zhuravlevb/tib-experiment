import type { Order } from './types';

const KEY = 'tib:kiosk:orders';
const TTL = 3 * 60_000;

/**
 * Последние заказы в localStorage: табло, открытое позже кассы,
 * подхватит недавние заказы. Хранилище может быть недоступно — тогда просто без истории.
 */
export function persistOrder(order: Order) {
  try {
    const list = recentOrders(order.createdAt);
    localStorage.setItem(KEY, JSON.stringify([...list, order].slice(-30)));
  } catch {
    /* приватный режим и т.п. */
  }
}

export function recentOrders(now = Date.now()): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list: Order[] = raw ? JSON.parse(raw) : [];
    return list.filter((o) => now - o.createdAt < TTL);
  } catch {
    return [];
  }
}
