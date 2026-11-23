import { describe, expect, it, vi } from 'vitest';
import { createBoardStore } from './board';
import { defaultSelections, getItem } from './logic';
import { createKioskStore } from './store';

const draft = (itemId: string, qty = 1) => {
  const item = getItem(itemId);
  return { itemId, restaurantId: item.restaurantId, qty, selections: defaultSelections(item.groups), combo: false, comboSelections: {} };
};

describe('kiosk store flow', () => {
  it('full order from two restaurants', async () => {
    const posted = vi.fn();
    const store = createKioskStore({ bus: { post: posted, subscribe: () => () => {}, close: () => {} } });
    const s = () => store.getState();

    s().begin();
    expect(s().goto('cart')).toBe('emptyCart');
    s().setDineMode('here');
    s().openRestaurant('dym');
    s().addLine(draft('dym-classic'));
    s().addLine(draft('dym-classic')); // та же конфигурация — сливается
    s().openRestaurant('zerno');
    s().addLine(draft('zerno-latte'));
    expect(s().cart).toHaveLength(2);
    expect(s().cart[0]!.qty).toBe(2);

    expect(s().goto('loyalty')).toBeNull();
    expect(s().identifyGuest({ phone: '+7 (900) 000-00-00' })?.name).toBe('Анна');
    s().setApplied('zerno', true);
    s().choosePayment('card');
    await s().pay('success', 0);

    expect(s().step).toBe('done');
    expect(s().order?.tickets.map((t) => t.restaurantId)).toEqual(['dym', 'zerno']);
    expect(s().order?.total).toBe(390 * 2); // латте за штампы
    expect(posted).toHaveBeenCalledOnce();

    s().reset();
    expect(s().cart).toHaveLength(0);
    expect(s().seq).toBe(2); // счётчики киоска переживают сброс сессии
  });

  it('declined payment keeps cart', async () => {
    const store = createKioskStore();
    store.getState().addLine(draft('korka-margherita'));
    store.getState().choosePayment('sbp');
    await store.getState().pay('declined', 0);
    expect(store.getState().payment.status).toBe('declined');
    expect(store.getState().cart).toHaveLength(1);
  });

  it('removing last item from checkout returns to restaurants', () => {
    const store = createKioskStore();
    store.getState().addLine(draft('korka-margherita'));
    store.getState().goto('cart');
    store.getState().setQty(store.getState().cart[0]!.id, 0);
    expect(store.getState().step).toBe('restaurants');
  });
});

describe('pickup board', () => {
  it('cooking → ready → gone', () => {
    const board = createBoardStore();
    board.getState().addOrder({ code: 'А-01', createdAt: 0, dineMode: 'here', lang: 'ru', total: 0, lines: [], tickets: [{ restaurantId: 'dym', number: 100 }, { restaurantId: 'sanse', number: 100 }] }, 0);
    const e = () => board.getState().entries;
    expect(e().map((x) => x.status)).toEqual(['cooking', 'cooking']);
    board.getState().tick(40_000);
    expect(e().every((x) => x.status === 'ready')).toBe(true);
    board.getState().tick(200_000);
    expect(e()).toHaveLength(0);
  });
});
