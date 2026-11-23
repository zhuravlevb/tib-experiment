import type { Lang } from '@tib/shared';
import { menu, restaurants } from './data/restaurants';
import type {
  Allergen,
  AppliedLoyalty,
  CartLine,
  DietTag,
  GuestProfile,
  MenuItem,
  OptionGroup,
  Restaurant,
  Selections,
  Ticket,
} from './types';

// ——— каталог ———

export const getRestaurant = (id: string): Restaurant => {
  const r = restaurants.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown restaurant ${id}`);
  return r;
};

export const getItem = (id: string): MenuItem => {
  const i = menu.find((x) => x.id === id);
  if (!i) throw new Error(`Unknown item ${id}`);
  return i;
};

export const menuOf = (restaurantId: string): MenuItem[] =>
  menu.filter((i) => i.restaurantId === restaurantId);

export interface MenuFilter {
  excludeAllergens?: Allergen[];
  requireTags?: DietTag[];
  query?: string;
  lang?: Lang;
}

/** Сквозной фильтр: работает и в меню ресторана, и в поиске по всему фудкорту. */
export function filterItems(items: MenuItem[], f: MenuFilter): MenuItem[] {
  const q = f.query?.trim().toLowerCase();
  return items.filter((i) => {
    if (f.excludeAllergens?.some((a) => i.allergens.includes(a))) return false;
    if (f.requireTags?.some((t) => !i.tags.includes(t))) return false;
    if (q) {
      const hay = [i.name.ru, i.name.en, i.description.ru, i.description.en].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** Сколько блюд ресторана подходит под фильтр — для бейджа на карточке ресторана. */
export const matchingCount = (restaurantId: string, f: MenuFilter): number =>
  filterItems(menuOf(restaurantId), f).filter((i) => i.available).length;

// ——— выбор модификаторов ———

export const defaultSelections = (groups: OptionGroup[]): Selections =>
  Object.fromEntries(groups.map((g) => [g.id, [...(g.defaultIds ?? [])]]));

/** Переключение опции с соблюдением min/max группы. Радио при max=1. */
export function toggleOption(groups: OptionGroup[], sel: Selections, groupId: string, optionId: string): Selections {
  const g = groups.find((x) => x.id === groupId);
  if (!g) return sel;
  const cur = sel[groupId] ?? [];
  let next: string[];
  if (g.max === 1) {
    next = cur.includes(optionId) && g.min === 0 ? [] : [optionId];
  } else if (cur.includes(optionId)) {
    next = cur.filter((x) => x !== optionId);
  } else {
    if (cur.length >= g.max) return sel; // лимит: UI блокирует остальные опции
    next = [...cur, optionId];
  }
  return { ...sel, [groupId]: next };
}

export interface GroupError {
  groupId: string;
  kind: 'tooFew' | 'tooMany';
}

export function validateSelections(groups: OptionGroup[], sel: Selections): GroupError[] {
  const errors: GroupError[] = [];
  for (const g of groups) {
    const n = (sel[g.id] ?? []).length;
    if (n < g.min) errors.push({ groupId: g.id, kind: 'tooFew' });
    if (n > g.max) errors.push({ groupId: g.id, kind: 'tooMany' });
  }
  return errors;
}

export function validateLine(line: Pick<CartLine, 'itemId' | 'selections' | 'combo' | 'comboSelections'>): GroupError[] {
  const item = getItem(line.itemId);
  const errs = validateSelections(item.groups, line.selections);
  if (line.combo && item.combo) errs.push(...validateSelections(item.combo.groups, line.comboSelections));
  return errs;
}

/** Аллергены блюда с учётом выбранных опций (овсяное молоко добавляет глютен и т.п.). */
export function lineAllergens(line: Pick<CartLine, 'itemId' | 'selections' | 'combo' | 'comboSelections'>): Allergen[] {
  const item = getItem(line.itemId);
  const set = new Set<Allergen>(item.allergens);
  const add = (groups: OptionGroup[], sel: Selections) =>
    groups.forEach((g) =>
      (sel[g.id] ?? []).forEach((oid) => g.options.find((o) => o.id === oid)?.allergens?.forEach((a) => set.add(a))),
    );
  add(item.groups, line.selections);
  if (line.combo && item.combo) add(item.combo.groups, line.comboSelections);
  return [...set];
}

// ——— цены ———

const deltas = (groups: OptionGroup[], sel: Selections): number =>
  groups.reduce(
    (sum, g) => sum + (sel[g.id] ?? []).reduce((s, oid) => s + (g.options.find((o) => o.id === oid)?.priceDelta ?? 0), 0),
    0,
  );

export function unitPrice(line: Pick<CartLine, 'itemId' | 'selections' | 'combo' | 'comboSelections'>): number {
  const item = getItem(line.itemId);
  let p = item.price + deltas(item.groups, line.selections);
  if (line.combo && item.combo) p += item.combo.priceDelta + deltas(item.combo.groups, line.comboSelections);
  return p;
}

export const linePrice = (line: CartLine): number => unitPrice(line) * line.qty;

export interface RestaurantGroup {
  restaurant: Restaurant;
  lines: CartLine[];
  subtotal: number;
}

/** Корзина, сгруппированная по ресторанам в порядке первого добавления. */
export function groupCart(cart: CartLine[]): RestaurantGroup[] {
  const order: string[] = [];
  for (const l of cart) if (!order.includes(l.restaurantId)) order.push(l.restaurantId);
  return order.map((rid) => {
    const lines = cart.filter((l) => l.restaurantId === rid);
    return { restaurant: getRestaurant(rid), lines, subtotal: lines.reduce((s, l) => s + linePrice(l), 0) };
  });
}

export const cartCount = (cart: CartLine[]): number => cart.reduce((s, l) => s + l.qty, 0);

// ——— лояльность ———

export interface LoyaltyQuote {
  restaurantId: string;
  /** Есть ли карта гостя в этом ресторане */
  member: boolean;
  /** Можно ли применить прямо сейчас */
  applicable: boolean;
  /** Почему нельзя (для подсказки) */
  reason?: 'noProgram' | 'notMember' | 'notEnoughStamps' | 'noRewardItem' | 'noBalance';
  discount: number;
  /** Для баллов: максимум к списанию */
  maxPoints?: number;
  /** Сколько начислится после оплаты (баллы или штампы) */
  earn: number;
  balance: number;
}

/**
 * Расчёт лояльности по одному ресторану.
 * applied — решение гостя применить (для баллов — сколько списать); без него считаем только начисление.
 */
export function quoteLoyalty(group: RestaurantGroup, guest: GuestProfile | null, applied?: AppliedLoyalty): LoyaltyQuote {
  const { restaurant: r, lines, subtotal } = group;
  const p = r.loyalty;
  const card = guest?.cards.find((c) => c.restaurantId === r.id);
  const base: LoyaltyQuote = { restaurantId: r.id, member: !!card, applicable: false, discount: 0, earn: 0, balance: card?.balance ?? 0 };
  if (!p) return { ...base, reason: 'noProgram' };
  if (!card) return { ...base, reason: 'notMember' };

  switch (p.kind) {
    case 'points': {
      const maxPoints = Math.floor(Math.min(card.balance, subtotal * p.maxSpendShare));
      const spend = applied ? Math.min(applied.pointsToSpend ?? maxPoints, maxPoints) : 0;
      return {
        ...base,
        applicable: maxPoints > 0,
        reason: maxPoints > 0 ? undefined : 'noBalance',
        maxPoints,
        discount: Math.max(0, spend),
        earn: Math.floor((subtotal - Math.max(0, spend)) * p.earnRate),
      };
    }
    case 'discount':
      return { ...base, applicable: true, discount: applied ? Math.round((subtotal * p.percent) / 100) : 0 };
    case 'stamps': {
      const rewardLines = lines.filter((l) => p.rewardItemIds.includes(l.itemId));
      const units = rewardLines.reduce((s, l) => s + l.qty, 0);
      const cheapest = rewardLines.length ? Math.min(...rewardLines.map((l) => unitPrice(l))) : 0;
      const enough = card.balance >= p.needed;
      const applicable = enough && units > 0;
      const use = applicable && !!applied;
      return {
        ...base,
        applicable,
        reason: applicable ? undefined : !enough ? 'notEnoughStamps' : 'noRewardItem',
        discount: use ? cheapest : 0,
        // подарочный кофе штамп не приносит
        earn: units - (use ? 1 : 0),
      };
    }
  }
}

export interface Totals {
  subtotal: number;
  discount: number;
  total: number;
  groups: (RestaurantGroup & { loyalty: LoyaltyQuote; total: number })[];
}

export function computeTotals(cart: CartLine[], guest: GuestProfile | null, applied: AppliedLoyalty[]): Totals {
  const groups = groupCart(cart).map((g) => {
    const loyalty = quoteLoyalty(g, guest, applied.find((a) => a.restaurantId === g.restaurant.id));
    return { ...g, loyalty, total: g.subtotal - loyalty.discount };
  });
  const subtotal = groups.reduce((s, g) => s + g.subtotal, 0);
  const discount = groups.reduce((s, g) => s + g.loyalty.discount, 0);
  return { subtotal, discount, total: subtotal - discount, groups };
}

// ——— номера выдачи и код заказа ———

export type TicketCounters = Record<string, number>;

/**
 * Каждый ресторан ведёт свою нумерацию, номера разных ресторанов могут совпадать.
 * Поэтому номер всегда показывается в паре с брендом, а заказ связывает общий код.
 */
export function issueTickets(counters: TicketCounters, restaurantIds: string[]): { tickets: Ticket[]; counters: TicketCounters } {
  const next = { ...counters };
  const tickets = restaurantIds.map((rid) => {
    const { start, max } = getRestaurant(rid).tickets;
    const prev = next[rid];
    const n = prev === undefined || prev >= max ? start : prev + 1;
    next[rid] = n;
    return { restaurantId: rid, number: n };
  });
  return { tickets, counters: next };
}

/**
 * Буквы, которые одинаково выглядят в кириллице и латинице:
 * код читается и русскоязычным гостем, и туристом.
 */
const CODE_LETTERS = ['А', 'В', 'Е', 'К', 'М', 'Н', 'Р', 'С', 'Т'];

export function orderCode(seq: number): string {
  const letter = CODE_LETTERS[Math.floor(seq / 100) % CODE_LETTERS.length]!;
  return `${letter}-${String(seq % 100).padStart(2, '0')}`;
}

// ——— шаги флоу ———

export type Step = 'attract' | 'start' | 'restaurants' | 'menu' | 'cart' | 'loyalty' | 'payment' | 'done';

export const STEP_ORDER: Step[] = ['attract', 'start', 'restaurants', 'menu', 'cart', 'loyalty', 'payment', 'done'];

/** Охранные условия перехода. Возвращает причину запрета или null. */
export function guardStep(to: Step, s: { cart: CartLine[]; restaurantId: string | null; paid: boolean }): string | null {
  if (to === 'menu' && !s.restaurantId) return 'noRestaurant';
  if ((to === 'cart' || to === 'loyalty' || to === 'payment') && s.cart.length === 0) return 'emptyCart';
  if (to === 'done' && !s.paid) return 'notPaid';
  return null;
}

/** Шаги, на которых можно отменить заказ (до оплаты). */
export const CANCELLABLE: Step[] = ['start', 'restaurants', 'menu', 'cart', 'loyalty'];
