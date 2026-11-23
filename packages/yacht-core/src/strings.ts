import { l, type LText } from '@tib/shared';
import type { ClimateZone, DeliveryZone, FoodStatus, LightZone, Limits, MusicZone, ToyBlock, ToyId, ToyStatus, Zone } from './types';

/** Тексты пульта: одинаковые для M3 и HIG. Интерфейс на русском, английский — для гостей на борту. */
export const Y = {
  helm: l('Штурвал', 'Helm'),
  ambience: l('Атмосфера', 'Ambience'),
  service: l('Сервис', 'Service'),

  youControl: l('Управляете вы', 'You are in control'),
  captainControls: l('Управляет капитан', 'The captain is in control'),
  returnPending: l('Ждём ответа капитана', 'Waiting for the captain'),
  handover: l('Передать капитану', 'Hand over to captain'),
  handoverConfirmTitle: l('Передать управление капитану?', 'Hand control to the captain?'),
  handoverConfirmText: l('Капитан поведёт яхту сам. Музыка, свет и сервис останутся у вас', 'The captain will take the helm. Music, lights and service stay with you'),
  handoverYes: l('Передать', 'Hand over'),
  cancel: l('Отмена', 'Cancel'),
  requestReturn: l('Попросить управление', 'Ask for the helm'),
  ok: l('Понятно', 'Got it'),

  weatherTitle: l('Капитан советует передать управление', 'The captain suggests handing over'),
  weatherText: l('Ветер усиливается до 24 узлов, волна 1,8 м. Если ничего не выбрать, управление перейдёт капитану через', 'Wind is rising to 24 knots with 1.8 m waves. If you do nothing, the captain takes the helm in'),
  handNow: l('Передать сейчас', 'Hand over now'),
  keepHelm: l('Оставить себе', 'Keep the helm'),
  keptNote: l('Хорошо. Пока погода не наладится, скорость ограничена 12 узлами', 'OK. Speed is limited to 12 knots until the weather clears'),

  stormTitle: l('Шторм. Яхту ведёт капитан', 'Storm. The captain has the helm'),
  stormText: l('Капитан развернул яхту носом к волне и держит 8 узлов. Платформу и технику убрали, джакузи закрыли. Свет, музыка, климат и заказ еды работают как обычно', 'The captain has turned the bow into the waves at 8 knots. The platform and toys are stowed and the jacuzzi is closed. Lights, music, climate and food orders work as usual'),

  speed: l('Скорость', 'Speed'),
  knots: l('уз', 'kn'),
  heading: l('Курс', 'Heading'),
  wind: l('Ветер', 'Wind'),
  waves: l('Волна', 'Waves'),
  m: l('м', 'm'),
  anchored: l('На якоре', 'At anchor'),
  underway: l('На ходу', 'Underway'),
  throttle: l('Ход', 'Throttle'),
  limit: l('Предел', 'Limit'),
  stop: l('Стоп', 'Stop'),
  slow: l('Малый', 'Slow'),
  cruise: l('Средний', 'Cruise'),
  full: l('Полный', 'Full'),
  steer: l('Поворот', 'Steering'),
  holdCourse: l('Держать курс', 'Hold course'),
  toAnchorage: l('К якорной стоянке', 'Go to anchorage'),
  anchorageEta: l('Идём к бухте, осталось', 'Heading to the bay,'),
  sec: l('с', 's'),
  readOnly: l('Сейчас штурвал у капитана, здесь видно, как идёт яхта', 'The captain has the helm. You can watch the yacht here'),

  scenes: l('Сцены', 'Scenes'),
  music: l('Музыка', 'Music'),
  volume: l('Громкость', 'Volume'),
  lights: l('Свет', 'Lights'),
  brightness: l('Яркость', 'Brightness'),
  color: l('Цвет', 'Color'),
  lightOn: l('Включён', 'On'),
  lightOff: l('выкл.', 'off'),
  prev: l('Предыдущий трек', 'Previous track'),
  next: l('Следующий трек', 'Next track'),
  play: l('Играть', 'Play'),
  pause: l('Пауза', 'Pause'),

  food: l('Еда и напитки', 'Food and drinks'),
  orderFood: l('Заказать', 'Order'),
  deliverTo: l('Куда принести', 'Deliver to'),
  note: l('Комментарий', 'Note'),
  notePlaceholder: l('Например, без льда', 'For example, no ice'),
  send: l('Отправить', 'Send'),
  nothingOrdered: l('Пока ничего не заказано', 'No orders yet'),
  jacuzzi: l('Джакузи', 'Jacuzzi'),
  water: l('Вода', 'Water'),
  target: l('Нужно', 'Target'),
  bubbles: l('Пузыри', 'Bubbles'),
  jacuzziClosed: l('Закрыто на время шторма', 'Closed during the storm'),
  climate: l('Климат', 'Climate'),
  toys: l('Платформа и техника', 'Platform and toys'),
  deploy: l('Подготовить', 'Prepare'),
  stow: l('Убрать', 'Stow'),

  demo: l('Демо', 'Demo'),
  demoHint: l('Долгое нажатие на название яхты открывает демо-панель', 'Long-press the yacht name to open the demo panel'),
  demoWeather: l('Погодное предупреждение', 'Weather warning'),
  demoStorm: l('Шторм', 'Storm'),
  demoClear: l('Погода наладилась', 'Weather cleared'),
  demoApprove: l('Капитан вернул управление', 'Captain returns the helm'),
  demoDeny: l('Капитан отказал', 'Captain declines'),
  demoDeliver: l('Еду принесли', 'Food delivered'),
  demoZone: l('Зона', 'Zone'),
  demoReset: l('Сбросить всё', 'Reset everything'),
} satisfies Record<string, LText>;

export type YKey = keyof typeof Y;

export const ZONE_LABEL: Record<Zone, LText> = {
  open: l('Открытое море', 'Open sea'),
  coastal: l('У берега', 'Coastal'),
  harbor: l('Гавань', 'Harbour'),
};

export const LIMIT_REASON: Record<NonNullable<Limits['reason']>, LText> = {
  harbor: l('рядом гавань', 'harbour nearby'),
  coastal: l('у берега', 'coastal waters'),
  weather: l('из-за погоды', 'due to weather'),
  anchored: l('яхта на якоре', 'at anchor'),
  notInControl: l('управляет капитан', 'captain in control'),
};

export const MUSIC_ZONE: Record<MusicZone, LText> = { deck: l('Палуба', 'Deck'), salon: l('Салон', 'Salon'), cabins: l('Каюты', 'Cabins') };
export const LIGHT_ZONE: Record<LightZone, LText> = {
  deck: l('Палуба', 'Deck'),
  salon: l('Салон', 'Salon'),
  cabins: l('Каюты', 'Cabins'),
  underwater: l('Подводная подсветка', 'Underwater'),
};
export const CLIMATE_ZONE: Record<ClimateZone, LText> = { salon: l('Салон', 'Salon'), master: l('Мастер-каюта', 'Master cabin'), guests: l('Гостевые каюты', 'Guest cabins') };
export const DELIVERY_ZONE: Record<DeliveryZone, LText> = {
  sundeck: l('Солнечная палуба', 'Sun deck'),
  jacuzzi: l('К джакузи', 'Jacuzzi'),
  salon: l('Салон', 'Salon'),
  bow: l('Нос', 'Bow'),
  master: l('Мастер-каюта', 'Master cabin'),
};
export const FOOD_STATUS: Record<FoodStatus, LText> = {
  accepted: l('Шеф принял заказ', 'Order received'),
  preparing: l('Готовится', 'Being prepared'),
  onTheWay: l('Уже несут', 'On the way'),
  delivered: l('Принесли', 'Delivered'),
};
export const TOY_LABEL: Record<ToyId, LText> = { platform: l('Кормовая платформа', 'Swim platform'), tender: l('Тендер', 'Tender'), jetski: l('Гидроцикл', 'Jet ski') };
export const TOY_STATUS: Record<ToyStatus, LText> = {
  stowed: l('Убрано', 'Stowed'),
  preparing: l('Готовим', 'Preparing'),
  ready: l('Готово', 'Ready'),
  stowing: l('Убираем', 'Stowing'),
};
export const TOY_BLOCK: Record<NonNullable<ToyBlock>, LText> = {
  underway: l('Сначала остановите яхту или встаньте на якорь', 'Stop the yacht or anchor first'),
  weather: l('Пока погода плохая, нельзя', 'Not available in bad weather'),
  emergency: l('Недоступно во время шторма', 'Not available during the storm'),
};

/** Румб для курса: 120 → «ЮВ» */
export function compass(h: number, lang: 'ru' | 'en'): string {
  const ru = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  const en = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const i = Math.round(h / 45) % 8;
  return (lang === 'ru' ? ru : en)[i]!;
}
