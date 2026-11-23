import { l } from '@tib/shared';
import type { ComboDef, GuestProfile, MenuItem, OptionGroup, Restaurant } from '../types';

/*
 * Шесть выдуманных ресторанов. Специально:
 * - три с лояльностью разных видов (баллы, скидка участника, штампы), три без;
 * - у «Дым и Булка» и «Сансё» одинаковая схема номеров (100…199),
 *   у «Корка» и «Листва» тоже (1…99) — номера выдачи будут совпадать.
 */
export const restaurants: Restaurant[] = [
  {
    id: 'dym',
    name: 'Дым и Булка',
    cuisine: l('Бургеры', 'Burgers'),
    brandColor: '#C2410C',
    monogram: 'ДБ',
    loyalty: { kind: 'points', name: l('Баллы «Дым»', 'Dym Points'), earnRate: 0.05, maxSpendShare: 0.5 },
    tickets: { start: 100, max: 199 },
    categories: [
      { id: 'burgers', name: l('Бургеры', 'Burgers') },
      { id: 'sides', name: l('Закуски', 'Sides') },
      { id: 'drinks', name: l('Напитки', 'Drinks') },
    ],
  },
  {
    id: 'sanse',
    name: 'Сансё',
    cuisine: l('Вок и рамен', 'Wok & ramen'),
    brandColor: '#B91C1C',
    monogram: 'С',
    loyalty: { kind: 'discount', name: l('Клуб Сансё', 'Sanshō Club'), percent: 10 },
    tickets: { start: 100, max: 199 },
    categories: [
      { id: 'ramen', name: l('Рамен', 'Ramen') },
      { id: 'wok', name: l('Вок', 'Wok') },
    ],
  },
  {
    id: 'korka',
    name: 'Корка',
    cuisine: l('Пицца', 'Pizza'),
    brandColor: '#A16207',
    monogram: 'К',
    tickets: { start: 1, max: 99 },
    categories: [{ id: 'pizza', name: l('Пицца', 'Pizza') }],
  },
  {
    id: 'lavash',
    name: 'Лаваш Лаб',
    cuisine: l('Шаурма', 'Shawarma'),
    brandColor: '#15803D',
    monogram: 'ЛЛ',
    tickets: { start: 200, max: 299 },
    categories: [
      { id: 'shawarma', name: l('Шаурма', 'Shawarma') },
      { id: 'drinks', name: l('Напитки', 'Drinks') },
    ],
  },
  {
    id: 'zerno',
    name: 'Зерно',
    cuisine: l('Кофе и десерты', 'Coffee & desserts'),
    brandColor: '#6D4C41',
    monogram: 'З',
    loyalty: {
      kind: 'stamps',
      name: l('Шестой кофе в подарок', '6th coffee free'),
      needed: 6,
      rewardItemIds: ['zerno-cappuccino', 'zerno-latte', 'zerno-americano'],
    },
    tickets: { start: 300, max: 399 },
    categories: [
      { id: 'coffee', name: l('Кофе', 'Coffee') },
      { id: 'desserts', name: l('Десерты', 'Desserts') },
    ],
  },
  {
    id: 'listva',
    name: 'Листва',
    cuisine: l('Салаты и боулы', 'Salads & bowls'),
    brandColor: '#4D7C0F',
    monogram: 'Л',
    tickets: { start: 1, max: 99 },
    categories: [{ id: 'bowls', name: l('Боулы', 'Bowls') }],
  },
];

// ——— переиспользуемые группы ———

const size = (id: string, base: [string, string], deltas: [number, number, number]): OptionGroup => ({
  id: 'size',
  name: l('Размер', 'Size'),
  min: 1,
  max: 1,
  defaultIds: [`${id}-m`],
  options: [
    { id: `${id}-s`, name: l(`${base[0]} S`, `${base[1]} S`), priceDelta: deltas[0] },
    { id: `${id}-m`, name: l(`${base[0]} M`, `${base[1]} M`), priceDelta: deltas[1] },
    { id: `${id}-l`, name: l(`${base[0]} L`, `${base[1]} L`), priceDelta: deltas[2] },
  ],
});

const coffeeMilk: OptionGroup = {
  id: 'milk',
  name: l('Молоко', 'Milk'),
  min: 1,
  max: 1,
  defaultIds: ['milk-cow'],
  options: [
    { id: 'milk-cow', name: l('Коровье', 'Dairy'), priceDelta: 0, allergens: ['dairy'] },
    { id: 'milk-oat', name: l('Овсяное', 'Oat'), priceDelta: 60, allergens: ['gluten'] },
    { id: 'milk-almond', name: l('Миндальное', 'Almond'), priceDelta: 60, allergens: ['nuts'] },
  ],
};

const coffeeExtras: OptionGroup = {
  id: 'extras',
  name: l('Добавки', 'Extras'),
  min: 0,
  max: 2,
  options: [
    { id: 'syrup-caramel', name: l('Сироп карамель', 'Caramel syrup'), priceDelta: 40 },
    { id: 'syrup-vanilla', name: l('Сироп ваниль', 'Vanilla syrup'), priceDelta: 40 },
    { id: 'extra-shot', name: l('Доп. эспрессо', 'Extra shot'), priceDelta: 70 },
  ],
};

const burgerExtras: OptionGroup = {
  id: 'extras',
  name: l('Добавки', 'Extras'),
  min: 0,
  max: 3,
  options: [
    { id: 'cheese', name: l('Чеддер', 'Cheddar'), priceDelta: 50, allergens: ['dairy'] },
    { id: 'bacon', name: l('Бекон', 'Bacon'), priceDelta: 80 },
    { id: 'jalapeno', name: l('Халапеньо', 'Jalapeño'), priceDelta: 40 },
    { id: 'egg', name: l('Яйцо', 'Egg'), priceDelta: 50, allergens: ['egg'] },
  ],
};

const burgerRemove: OptionGroup = {
  id: 'remove',
  name: l('Убрать', 'Remove'),
  min: 0,
  max: 3,
  options: [
    { id: 'no-onion', name: l('Без лука', 'No onion'), priceDelta: 0 },
    { id: 'no-pickles', name: l('Без огурцов', 'No pickles'), priceDelta: 0 },
    { id: 'no-sauce', name: l('Без соуса', 'No sauce'), priceDelta: 0 },
  ],
};

const burgerCombo: ComboDef = {
  name: l('Комбо: картофель + напиток', 'Combo: fries + drink'),
  priceDelta: 220,
  groups: [
    {
      id: 'combo-side',
      name: l('Гарнир', 'Side'),
      min: 1,
      max: 1,
      defaultIds: ['side-fries'],
      options: [
        { id: 'side-fries', name: l('Картофель фри', 'Fries'), priceDelta: 0 },
        { id: 'side-wedges', name: l('Картофель по-деревенски', 'Wedges'), priceDelta: 30 },
        { id: 'side-rings', name: l('Луковые кольца', 'Onion rings'), priceDelta: 40, allergens: ['gluten'] },
      ],
    },
    {
      id: 'combo-drink',
      name: l('Напиток', 'Drink'),
      min: 1,
      max: 1,
      defaultIds: ['drink-cola'],
      options: [
        { id: 'drink-cola', name: l('Кола', 'Cola'), priceDelta: 0 },
        { id: 'drink-lemonade', name: l('Лимонад', 'Lemonade'), priceDelta: 0 },
        { id: 'drink-water', name: l('Вода', 'Water'), priceDelta: -20 },
      ],
    },
  ],
};

const spice: OptionGroup = {
  id: 'spice',
  name: l('Острота', 'Spice level'),
  min: 1,
  max: 1,
  defaultIds: ['spice-1'],
  options: [
    { id: 'spice-0', name: l('Не острое', 'Mild'), priceDelta: 0 },
    { id: 'spice-1', name: l('Средне', 'Medium'), priceDelta: 0 },
    { id: 'spice-2', name: l('Очень остро', 'Hot'), priceDelta: 0 },
  ],
};

const item = (
  p: Omit<MenuItem, 'image' | 'available' | 'groups' | 'tags' | 'allergens'> &
    Partial<Pick<MenuItem, 'available' | 'groups' | 'tags' | 'allergens'>>,
): MenuItem => ({
  available: true,
  groups: [],
  tags: [],
  allergens: [],
  image: `food/${p.id}.jpg`,
  ...p,
});

export const menu: MenuItem[] = [
  // Дым и Булка
  item({ id: 'dym-classic', restaurantId: 'dym', categoryId: 'burgers', name: l('Классический', 'Classic'), description: l('Говядина, чеддер, огурцы, лук, фирменный соус', 'Beef, cheddar, pickles, onion, house sauce'), price: 390, allergens: ['gluten', 'dairy', 'sesame'], groups: [burgerExtras, burgerRemove], combo: burgerCombo }),
  item({ id: 'dym-smoky', restaurantId: 'dym', categoryId: 'burgers', name: l('Дымный BBQ', 'Smoky BBQ'), description: l('Говядина, бекон, BBQ, луковые кольца', 'Beef, bacon, BBQ, onion rings'), price: 470, allergens: ['gluten', 'sesame'], groups: [burgerExtras, burgerRemove], combo: burgerCombo }),
  item({ id: 'dym-veggie', restaurantId: 'dym', categoryId: 'burgers', name: l('Нут-бургер', 'Chickpea burger'), description: l('Котлета из нута, томат, салат, веган-майонез', 'Chickpea patty, tomato, lettuce, vegan mayo'), price: 360, allergens: ['gluten', 'sesame'], tags: ['vegan', 'vegetarian'], groups: [burgerRemove], combo: burgerCombo }),
  item({ id: 'dym-fries', restaurantId: 'dym', categoryId: 'sides', name: l('Картофель фри', 'Fries'), description: l('С морской солью', 'With sea salt'), price: 150, tags: ['vegan', 'vegetarian'], groups: [size('fries', ['Порция', 'Portion'], [-30, 0, 50])] }),
  item({ id: 'dym-nuggets', restaurantId: 'dym', categoryId: 'sides', name: l('Наггетсы', 'Nuggets'), description: l('6 шт., соус на выбор', '6 pcs, sauce of choice'), price: 240, allergens: ['gluten', 'egg'], available: false }),
  item({ id: 'dym-cola', restaurantId: 'dym', categoryId: 'drinks', name: l('Кола', 'Cola'), description: l('0,4 л', '0.4 l'), price: 120, tags: ['vegan'] }),

  // Сансё
  item({ id: 'sanse-tonkotsu', restaurantId: 'sanse', categoryId: 'ramen', name: l('Тонкоцу рамен', 'Tonkotsu ramen'), description: l('Свиной бульон, чашу, яйцо, нори', 'Pork broth, chashu, egg, nori'), price: 520, allergens: ['gluten', 'egg', 'soy', 'sesame'], groups: [spice] }),
  item({ id: 'sanse-miso', restaurantId: 'sanse', categoryId: 'ramen', name: l('Мисо рамен с тофу', 'Miso ramen with tofu'), description: l('Мисо-бульон, тофу, кукуруза', 'Miso broth, tofu, corn'), price: 460, allergens: ['gluten', 'soy'], tags: ['vegan', 'vegetarian'], groups: [spice] }),
  item({ id: 'sanse-wok-chicken', restaurantId: 'sanse', categoryId: 'wok', name: l('Удон с курицей', 'Chicken udon'), description: l('Удон, курица, овощи, терияки', 'Udon, chicken, veggies, teriyaki'), price: 430, allergens: ['gluten', 'soy', 'sesame'], tags: ['halal'], groups: [spice, { id: 'base', name: l('Основа', 'Base'), min: 1, max: 1, defaultIds: ['base-udon'], options: [{ id: 'base-udon', name: l('Удон', 'Udon'), priceDelta: 0, allergens: ['gluten'] }, { id: 'base-rice', name: l('Рис', 'Rice'), priceDelta: 0 }, { id: 'base-rice-noodle', name: l('Рисовая лапша', 'Rice noodles'), priceDelta: 20 }] }] }),
  item({ id: 'sanse-wok-shrimp', restaurantId: 'sanse', categoryId: 'wok', name: l('Рис с креветками', 'Shrimp fried rice'), description: l('Рис, креветки, яйцо, зелёный лук', 'Rice, shrimp, egg, scallion'), price: 510, allergens: ['fish', 'egg', 'soy'], groups: [spice] }),

  // Корка
  item({ id: 'korka-margherita', restaurantId: 'korka', categoryId: 'pizza', name: l('Маргарита', 'Margherita'), description: l('Томаты, моцарелла, базилик', 'Tomato, mozzarella, basil'), price: 450, allergens: ['gluten', 'dairy'], tags: ['vegetarian'], groups: [size('pizza', ['Пицца', 'Pizza'], [-100, 0, 180])] }),
  item({ id: 'korka-pepperoni', restaurantId: 'korka', categoryId: 'pizza', name: l('Пепперони', 'Pepperoni'), description: l('Пепперони, моцарелла, томатный соус', 'Pepperoni, mozzarella, tomato sauce'), price: 540, allergens: ['gluten', 'dairy'], tags: ['spicy'], groups: [size('pizza', ['Пицца', 'Pizza'], [-100, 0, 180])] }),
  item({ id: 'korka-four-cheese', restaurantId: 'korka', categoryId: 'pizza', name: l('Четыре сыра', 'Four cheese'), description: l('Моцарелла, горгонзола, пармезан, чеддер', 'Mozzarella, gorgonzola, parmesan, cheddar'), price: 590, allergens: ['gluten', 'dairy'], tags: ['vegetarian'], groups: [size('pizza', ['Пицца', 'Pizza'], [-100, 0, 180])] }),

  // Лаваш Лаб
  item({ id: 'lavash-chicken', restaurantId: 'lavash', categoryId: 'shawarma', name: l('Шаурма с курицей', 'Chicken shawarma'), description: l('Курица, овощи, чесночный соус', 'Chicken, veggies, garlic sauce'), price: 310, allergens: ['gluten', 'egg'], tags: ['halal'], groups: [size('shaw', ['Шаурма', 'Shawarma'], [-40, 0, 70]), spice] }),
  item({ id: 'lavash-falafel', restaurantId: 'lavash', categoryId: 'shawarma', name: l('Фалафель-ролл', 'Falafel wrap'), description: l('Фалафель, хумус, овощи, тахини', 'Falafel, hummus, veggies, tahini'), price: 290, allergens: ['gluten', 'sesame'], tags: ['vegan', 'vegetarian'], groups: [spice] }),
  item({ id: 'lavash-ayran', restaurantId: 'lavash', categoryId: 'drinks', name: l('Айран', 'Ayran'), description: l('0,3 л', '0.3 l'), price: 110, allergens: ['dairy'], tags: ['vegetarian'] }),

  // Зерно
  item({ id: 'zerno-cappuccino', restaurantId: 'zerno', categoryId: 'coffee', name: l('Капучино', 'Cappuccino'), description: l('Двойной эспрессо и молоко', 'Double espresso and milk'), price: 220, groups: [size('cup', ['Стакан', 'Cup'], [-30, 0, 40]), coffeeMilk, coffeeExtras] }),
  item({ id: 'zerno-latte', restaurantId: 'zerno', categoryId: 'coffee', name: l('Латте', 'Latte'), description: l('Эспрессо и много молока', 'Espresso and lots of milk'), price: 240, groups: [size('cup', ['Стакан', 'Cup'], [-30, 0, 40]), coffeeMilk, coffeeExtras] }),
  item({ id: 'zerno-americano', restaurantId: 'zerno', categoryId: 'coffee', name: l('Американо', 'Americano'), description: l('Эспрессо и горячая вода', 'Espresso and hot water'), price: 170, tags: ['vegan'], groups: [size('cup', ['Стакан', 'Cup'], [-30, 0, 40]), coffeeExtras] }),
  item({ id: 'zerno-cheesecake', restaurantId: 'zerno', categoryId: 'desserts', name: l('Чизкейк', 'Cheesecake'), description: l('Нью-Йорк, ягодный соус', 'New York, berry sauce'), price: 290, allergens: ['gluten', 'dairy', 'egg'], tags: ['vegetarian'] }),
  item({ id: 'zerno-cookie', restaurantId: 'zerno', categoryId: 'desserts', name: l('Печенье с орехами', 'Nut cookie'), description: l('Фундук, тёмный шоколад', 'Hazelnut, dark chocolate'), price: 130, allergens: ['gluten', 'nuts', 'dairy', 'egg'], tags: ['vegetarian'] }),

  // Листва
  item({ id: 'listva-caesar', restaurantId: 'listva', categoryId: 'bowls', name: l('Цезарь с курицей', 'Chicken Caesar'), description: l('Романо, курица, пармезан, гренки', 'Romaine, chicken, parmesan, croutons'), price: 420, allergens: ['gluten', 'dairy', 'egg', 'fish'], groups: [{ id: 'extras', name: l('Добавки', 'Extras'), min: 0, max: 2, options: [{ id: 'avocado', name: l('Авокадо', 'Avocado'), priceDelta: 90 }, { id: 'double-chicken', name: l('Двойная курица', 'Double chicken'), priceDelta: 120 }] }] }),
  item({ id: 'listva-poke', restaurantId: 'listva', categoryId: 'bowls', name: l('Поке с лососем', 'Salmon poke'), description: l('Рис, лосось, авокадо, эдамаме', 'Rice, salmon, avocado, edamame'), price: 560, allergens: ['fish', 'soy', 'sesame'] }),
  item({ id: 'listva-buddha', restaurantId: 'listva', categoryId: 'bowls', name: l('Будда-боул', 'Buddha bowl'), description: l('Киноа, нут, батат, тахини', 'Quinoa, chickpeas, sweet potato, tahini'), price: 440, allergens: ['sesame'], tags: ['vegan', 'vegetarian'] }),
];

/** Демо-гость: найдётся по телефону или QR-коду. */
export const demoGuests: GuestProfile[] = [
  {
    id: 'guest-1',
    phone: '79000000000',
    name: 'Анна',
    cards: [
      { restaurantId: 'dym', balance: 340 },
      { restaurantId: 'sanse', balance: 0 },
      { restaurantId: 'zerno', balance: 6 },
    ],
  },
];
export const DEMO_QR = 'TIB-GUEST-1';
