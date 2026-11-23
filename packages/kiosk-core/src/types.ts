import type { Lang, LText } from '@tib/shared';

export type Allergen = 'gluten' | 'dairy' | 'nuts' | 'egg' | 'fish' | 'soy' | 'sesame';
export type DietTag = 'vegan' | 'vegetarian' | 'spicy' | 'halal';

/** Программа лояльности ресторана. У части ресторанов её нет. */
export type LoyaltyProgram =
  | { kind: 'points'; name: LText; earnRate: number; maxSpendShare: number }
  | { kind: 'stamps'; name: LText; needed: number; rewardItemIds: string[] }
  | { kind: 'discount'; name: LText; percent: number };

/** Схема номеров выдачи. Номера разных ресторанов могут совпадать — это допустимо. */
export interface TicketScheme {
  start: number;
  max: number; // после max — снова start
}

export interface Restaurant {
  id: string;
  name: string; // бренд не переводится
  cuisine: LText;
  brandColor: string;
  monogram: string; // 1–2 символа для логотипа-заглушки
  loyalty?: LoyaltyProgram;
  tickets: TicketScheme;
  categories: { id: string; name: LText }[];
}

export interface Option {
  id: string;
  name: LText;
  priceDelta: number;
  allergens?: Allergen[];
}

/** Группа выбора: размер (min=max=1), добавки (min=0, max=N), шаг комбо. */
export interface OptionGroup {
  id: string;
  name: LText;
  min: number;
  max: number;
  options: Option[];
  defaultIds?: string[];
}

export interface ComboDef {
  name: LText;
  priceDelta: number;
  groups: OptionGroup[]; // шаги комбо: гарнир → напиток
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: LText;
  description: LText;
  price: number;
  image: string; // путь в assets, заполняется на этапе 2
  allergens: Allergen[];
  tags: DietTag[];
  available: boolean; // false — стоп-лист
  groups: OptionGroup[];
  combo?: ComboDef;
}

export type Selections = Record<string, string[]>; // groupId -> optionIds

export interface CartLine {
  id: string;
  itemId: string;
  restaurantId: string;
  qty: number;
  selections: Selections;
  combo: boolean;
  comboSelections: Selections;
}

export interface LoyaltyCard {
  restaurantId: string;
  balance: number; // баллы или штампы; для discount — 0
}

export interface GuestProfile {
  id: string;
  phone: string;
  name: string;
  cards: LoyaltyCard[];
}

/** Что гость решил применить. Для points — сколько баллов списать. */
export interface AppliedLoyalty {
  restaurantId: string;
  pointsToSpend?: number;
}

export type DineMode = 'here' | 'takeaway';
export type PaymentMethod = 'card' | 'sbp';

export interface A11ySettings {
  lowMode: boolean; // нижний режим для колясок и детей
  largeText: boolean;
  highContrast: boolean;
}

export interface Ticket {
  restaurantId: string;
  number: number;
}

export interface Order {
  code: string; // общий код фудкорта
  createdAt: number;
  dineMode: DineMode;
  lang: Lang;
  tickets: Ticket[];
  total: number;
  lines: CartLine[];
}
