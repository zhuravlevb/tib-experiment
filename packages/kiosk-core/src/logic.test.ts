import { describe, expect, it } from 'vitest';
import { demoGuests } from './data/restaurants';
import {
  computeTotals,
  defaultSelections,
  filterItems,
  getItem,
  groupCart,
  issueTickets,
  lineAllergens,
  menuOf,
  orderCode,
  toggleOption,
  unitPrice,
  validateLine,
} from './logic';
import type { CartLine } from './types';

const line = (itemId: string, extra: Partial<CartLine> = {}): CartLine => {
  const item = getItem(itemId);
  return {
    id: itemId,
    itemId,
    restaurantId: item.restaurantId,
    qty: 1,
    selections: defaultSelections(item.groups),
    combo: false,
    comboSelections: item.combo ? defaultSelections(item.combo.groups) : {},
    ...extra,
  };
};
const guest = demoGuests[0]!;

describe('modifiers', () => {
  it('radio group replaces, multi group respects max', () => {
    const latte = getItem('zerno-latte');
    let sel = defaultSelections(latte.groups);
    sel = toggleOption(latte.groups, sel, 'size', 'cup-l');
    expect(sel.size).toEqual(['cup-l']);
    sel = toggleOption(latte.groups, sel, 'extras', 'syrup-caramel');
    sel = toggleOption(latte.groups, sel, 'extras', 'syrup-vanilla');
    const capped = toggleOption(latte.groups, sel, 'extras', 'extra-shot');
    expect(capped.extras).toHaveLength(2);
  });

  it('required group must be filled', () => {
    expect(validateLine(line('korka-margherita', { selections: { size: [] } }))).toEqual([{ groupId: 'size', kind: 'tooFew' }]);
    expect(validateLine(line('korka-margherita'))).toEqual([]);
  });

  it('option allergens are added', () => {
    const l = line('zerno-latte', { selections: { size: ['cup-m'], milk: ['milk-almond'], extras: [] } });
    expect(lineAllergens(l)).toContain('nuts');
  });
});

describe('pricing', () => {
  it('combo adds base delta and step deltas', () => {
    const l = line('dym-classic', { combo: true, comboSelections: { 'combo-side': ['side-rings'], 'combo-drink': ['drink-water'] } });
    expect(unitPrice(l)).toBe(390 + 220 + 40 - 20);
  });

  it('groups cart by restaurant in insertion order', () => {
    const g = groupCart([line('zerno-latte'), line('dym-classic'), line('zerno-cookie')]);
    expect(g.map((x) => x.restaurant.id)).toEqual(['zerno', 'dym']);
    expect(g[0]!.subtotal).toBe(240 + 130);
  });
});

describe('loyalty', () => {
  it('points: capped by balance and 50% of subtotal', () => {
    const cart = [line('dym-classic')]; // 390 → max 195
    const t = computeTotals(cart, guest, [{ restaurantId: 'dym' }]);
    expect(t.groups[0]!.loyalty.maxPoints).toBe(195);
    expect(t.discount).toBe(195);
  });

  it('discount program applies percent to its restaurant only', () => {
    const cart = [line('sanse-miso'), line('korka-margherita')];
    const t = computeTotals(cart, guest, [{ restaurantId: 'sanse' }]);
    expect(t.discount).toBe(46);
    expect(t.groups.find((g) => g.restaurant.id === 'korka')!.loyalty.reason).toBe('noProgram');
  });

  it('stamps: cheapest reward coffee is free, gift earns no stamp', () => {
    const cart = [line('zerno-latte'), line('zerno-americano', { qty: 2 })];
    const t = computeTotals(cart, guest, [{ restaurantId: 'zerno' }]);
    expect(t.discount).toBe(170);
    expect(t.groups[0]!.loyalty.earn).toBe(2);
  });

  it('stamps: not applicable without a coffee in cart', () => {
    const t = computeTotals([line('zerno-cookie')], guest, []);
    expect(t.groups[0]!.loyalty).toMatchObject({ applicable: false, reason: 'noRewardItem' });
  });

  it('no guest → nothing applied', () => {
    const t = computeTotals([line('dym-classic')], null, [{ restaurantId: 'dym' }]);
    expect(t.discount).toBe(0);
  });
});

describe('tickets', () => {
  it('different restaurants can get the same number', () => {
    const { tickets } = issueTickets({}, ['dym', 'sanse', 'korka', 'listva']);
    expect(tickets.map((t) => t.number)).toEqual([100, 100, 1, 1]);
  });

  it('wraps after max', () => {
    const { tickets } = issueTickets({ korka: 99 }, ['korka']);
    expect(tickets[0]!.number).toBe(1);
  });

  it('order code uses letters shared by Cyrillic and Latin', () => {
    expect(orderCode(47)).toBe('А-47');
    expect(orderCode(105)).toBe('В-05');
  });
});

describe('filters', () => {
  it('excludes allergens and requires diet tags', () => {
    const vegan = filterItems(menuOf('dym'), { requireTags: ['vegan'] }).map((i) => i.id);
    expect(vegan).toEqual(['dym-veggie', 'dym-fries', 'dym-cola']);
    const noGluten = filterItems(menuOf('korka'), { excludeAllergens: ['gluten'] });
    expect(noGluten).toHaveLength(0);
  });

  it('search works in both languages', () => {
    expect(filterItems(menuOf('zerno'), { query: 'cheese' }).map((i) => i.id)).toEqual(['zerno-cheesecake']);
    expect(filterItems(menuOf('zerno'), { query: 'чизк' }).map((i) => i.id)).toEqual(['zerno-cheesecake']);
  });
});
