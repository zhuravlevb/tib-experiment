import { l, type LText } from '@tib/shared';
import type { Allergen, DietTag, LoyaltyProgram } from './types';

/** Весь текст киоска в одном месте: одинаковый для M3 и HIG, всегда RU+EN. */
export const S = {
  appName: l('Фудкорт «Причал»', 'Prichal Food Court'),
  tapToStart: l('Коснитесь экрана, чтобы начать', 'Touch the screen to start'),
  startOrder: l('Начать заказ', 'Start order'),
  attractLead: l('Закажите в шести ресторанах сразу и оплатите одним чеком', 'Order from six restaurants and pay once'),
  language: l('Язык', 'Language'),
  accessibility: l('Доступность', 'Accessibility'),
  lowMode: l('Нижний режим', 'Low reach mode'),
  lowModeHint: l('Кнопки переедут в нижнюю половину экрана', 'Moves all buttons to the lower half of the screen'),
  largeText: l('Крупный текст', 'Large text'),
  highContrast: l('Высокий контраст', 'High contrast'),
  lowBanner: l('Нижний режим включён', 'Low reach mode is on'),
  whereEat: l('Где будете есть?', 'Eating here or taking away?'),
  here: l('Здесь', 'Eat in'),
  hereHint: l('Подадим на подносе', 'Served on a tray'),
  takeaway: l('С собой', 'Take away'),
  takeawayHint: l('Упакуем в пакет', 'Packed in a bag'),
  restaurants: l('Рестораны', 'Restaurants'),
  searchAll: l('Найти блюдо во всех ресторанах', 'Search dishes in all restaurants'),
  filters: l('Фильтры', 'Filters'),
  diet: l('Питание', 'Diet'),
  withoutAllergens: l('Без аллергенов', 'Allergen-free'),
  resetFilters: l('Сбросить', 'Reset'),
  matching: l('подходит', 'match'),
  nothingMatches: l('Ничего не подходит под фильтры', 'Nothing matches the filters'),
  loyaltyBadge: l('Бонусы', 'Rewards'),
  soldOut: l('Закончилось', 'Sold out'),
  cart: l('Корзина', 'Cart'),
  cartEmpty: l('Корзина пуста', 'Cart is empty'),
  add: l('Добавить', 'Add'),
  save: l('Сохранить', 'Save'),
  added: l('Добавлено в корзину', 'Added to cart'),
  required: l('Обязательно', 'Required'),
  upTo: l('до', 'up to'),
  makeCombo: l('Сделать комбо', 'Make it a combo'),
  step: l('Шаг', 'Step'),
  allergens: l('Аллергены', 'Allergens'),
  qty: l('Количество', 'Quantity'),
  addMore: l('Добавить из другого ресторана', 'Add from another restaurant'),
  checkout: l('Оформить', 'Checkout'),
  subtotal: l('Сумма', 'Subtotal'),
  discount: l('Скидка', 'Discount'),
  total: l('Итого', 'Total'),
  edit: l('Изменить', 'Edit'),
  remove: l('Удалить', 'Remove'),
  cancelOrder: l('Отменить заказ', 'Cancel order'),
  cancelConfirm: l('Корзина будет очищена', 'Your cart will be cleared'),
  yesCancel: l('Отменить', 'Cancel order'),
  keep: l('Продолжить заказ', 'Keep ordering'),
  back: l('Назад', 'Back'),
  next: l('Далее', 'Next'),
  loyalty: l('Бонусы и скидки', 'Rewards'),
  loyaltyLead: l('Войдите, чтобы списать баллы и получить скидки ресторанов', 'Sign in to use points and restaurant discounts'),
  phone: l('Номер телефона', 'Phone number'),
  scanQr: l('Отсканировать QR из приложения', 'Scan QR from the app'),
  scanDemo: l('Поднесите телефон к сканеру', 'Hold your phone to the scanner'),
  find: l('Найти', 'Find'),
  notFound: l('Профиль не найден', 'Profile not found'),
  demoHint: l('Демо: +7 900 000-00-00', 'Demo: +7 900 000-00-00'),
  skip: l('Пропустить', 'Skip'),
  signOut: l('Выйти', 'Sign out'),
  hello: l('Здравствуйте', 'Hello'),
  noProgram: l('Без программы лояльности', 'No rewards program'),
  notMember: l('Нет карты этого ресторана', 'No card for this restaurant'),
  notEnoughStamps: l('Пока недостаточно штампов', 'Not enough stamps yet'),
  noRewardItem: l('Добавьте кофе, чтобы получить подарок', 'Add a coffee to get your gift'),
  noBalance: l('Нет баллов', 'No points'),
  spendPoints: l('Списать баллов', 'Points to use'),
  willEarn: l('Начислим', 'You will earn'),
  upToPoints: l('Можно списать до', 'You can use up to'),
  points: l('баллов', 'points'),
  stamps: l('штампов', 'stamps'),
  apply: l('Применить', 'Apply'),
  toPayment: l('К оплате', 'To payment'),
  payment: l('Оплата', 'Payment'),
  card: l('Карта или телефон', 'Card or phone'),
  cardHint: l('Приложите к терминалу снизу', 'Tap on the terminal below'),
  sbp: l('СБП по QR-коду', 'Fast Payment QR'),
  sbpHint: l('Отсканируйте камерой банковского приложения', 'Scan with your banking app'),
  tapCardDemo: l('Приложить карту (демо)', 'Tap card (demo)'),
  paidSbpDemo: l('Оплатил в приложении (демо)', 'Paid in app (demo)'),
  declineDemo: l('Отказ банка (демо)', 'Bank decline (demo)'),
  processing: l('Проводим оплату…', 'Processing payment…'),
  declined: l('Оплата не прошла', 'Payment declined'),
  declinedHint: l('Деньги не списаны. Попробуйте ещё раз или другой способ', 'You were not charged. Try again or use another method'),
  retry: l('Повторить', 'Try again'),
  otherMethod: l('Другой способ', 'Other method'),
  thanks: l('Спасибо! Заказ оплачен', 'Thank you! Order paid'),
  orderCode: l('Код заказа', 'Order code'),
  pickupNumbers: l('Номера выдачи', 'Pickup numbers'),
  pickupHint: l('Следите за табло. Каждую часть заказа забирайте у стойки своего ресторана: на табло номер стоит рядом с его названием', 'Watch the board. Collect each part of your order at that restaurant\'s counter. The board shows every number next to the restaurant name'),
  sms: l('Чек в SMS', 'Receipt by SMS'),
  print: l('Распечатать чек', 'Print receipt'),
  printed: l('Чек печатается', 'Printing receipt'),
  smsSent: l('Чек отправлен', 'Receipt sent'),
  done: l('Готово', 'Done'),
  returnIn: l('Вернёмся на главный экран через', 'Returning to start in'),
  sec: l('с', 's'),
  stillHere: l('Вы ещё здесь?', 'Are you still there?'),
  stillHereText: l('Заказ сбросится через', 'Your order will reset in'),
  continue: l('Продолжить', 'Continue'),
  openBoard: l('Открыть табло выдачи', 'Open pickup board'),
  board: l('Выдача заказов', 'Order pickup'),
  cooking: l('Готовится', 'Preparing'),
  ready: l('Готово', 'Ready'),
  boardHint: l('Номер стоит рядом с названием ресторана', 'Each number is shown next to its restaurant'),
  boardEmpty: l('Пока пусто', 'Nothing yet'),
} satisfies Record<string, LText>;

export type StringKey = keyof typeof S;

export const ALLERGEN_LABEL: Record<Allergen, LText> = {
  gluten: l('Глютен', 'Gluten'),
  dairy: l('Молоко', 'Dairy'),
  nuts: l('Орехи', 'Nuts'),
  egg: l('Яйца', 'Eggs'),
  fish: l('Рыба', 'Fish'),
  soy: l('Соя', 'Soy'),
  sesame: l('Кунжут', 'Sesame'),
};

export const DIET_LABEL: Record<DietTag, LText> = {
  vegan: l('Веган', 'Vegan'),
  vegetarian: l('Вегетарианское', 'Vegetarian'),
  spicy: l('Острое', 'Spicy'),
  halal: l('Халяль', 'Halal'),
};

/** Пиктограммы — всегда показываются вместе с подписью. */
export const ALLERGEN_EMOJI: Record<Allergen, string> = {
  gluten: '🌾',
  dairy: '🥛',
  nuts: '🥜',
  egg: '🥚',
  fish: '🐟',
  soy: '🫘',
  sesame: '⚪️',
};
export const DIET_EMOJI: Record<DietTag, string> = { vegan: '🌱', vegetarian: '🥕', spicy: '🌶️', halal: '☪️' };

/** Запасная картинка блюда, пока нет фото. */
export const CATEGORY_EMOJI: Record<string, string> = {
  burgers: '🍔', sides: '🍟', drinks: '🥤', ramen: '🍜', wok: '🥡', pizza: '🍕',
  shawarma: '🌯', coffee: '☕️', desserts: '🍰', bowls: '🥗',
};
export const RESTAURANT_EMOJI: Record<string, string> = {
  dym: '🍔', sanse: '🍜', korka: '🍕', lavash: '🌯', zerno: '☕️', listva: '🥗',
};

/** Короткое описание программы лояльности для шапки меню. */
export const loyaltyText = (p: LoyaltyProgram): LText =>
  p.kind === 'points'
    ? l(
        `${p.name.ru}: возвращаем ${p.earnRate * 100}% баллами, баллами можно оплатить до ${p.maxSpendShare * 100}% заказа`,
        `${p.name.en}: ${p.earnRate * 100}% back in points, and points cover up to ${p.maxSpendShare * 100}% of the order`,
      )
    : p.kind === 'discount'
      ? l(`${p.name.ru}: участникам скидка ${p.percent}%`, `${p.name.en}: members get ${p.percent}% off`)
      : l(`${p.name.ru}: за ${p.needed} штампов кофе бесплатно`, `${p.name.en}: a free coffee for ${p.needed} stamps`);
