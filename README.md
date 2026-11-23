# Фудкорт и яхта: 4 прототипа на M3 Expressive и Apple HIG

Два продукта, каждый в двух дизайн-системах:

| | M3 Expressive | Apple HIG |
|---|---|---|
| Единая касса фудкорта (киоск 1080×1920) + табло выдачи | `apps/kiosk-m3` | `apps/kiosk-hig` |
| Пульт яхты для владельца (телефон) | `apps/yacht-m3` | `apps/yacht-hig` |

Живые прототипы: https://zhuravlevb.github.io/tib-experiment/ (собираются из `main` автоматически).

Логика и флоу описаны в [docs/flows.md](docs/flows.md).

Как смотреть демо:
- киоск: табло выдачи открывается по `?screen=board` (или кнопкой на экране кода заказа), заказ появляется на нём сразу; демо-гость для лояльности: `+7 900 000-00-00` или кнопка QR;
- пульт: долгое нажатие на название яхты «Aurora» открывает демо-панель (погода, шторм, ответ капитана, доставка еды, зона).

Фото блюд взяты из открытых коллекций (Wikimedia Commons, Flickr через Openverse) под CC0 / CC BY / CC BY-SA. Авторы перечислены в [assets/ATTRIBUTION.md](assets/ATTRIBUTION.md) и подписаны под фото в карточке блюда. Логотипы ресторанов нарисованы для проекта (`packages/kiosk-core/src/logos.ts`).

## Устройство

- `packages/kiosk-core`, `packages/yacht-core` — вся логика: данные, сторы (zustand), машины состояний, расчёты. От UI не зависят и покрыты тестами.
- `packages/shared` — шина между вкладками (BroadcastChannel), таймер простоя, i18n, форматирование.
- `packages/kiosk-app`, `packages/yacht-app` — общее поведение экранов без разметки (навигация, простой, черновик блюда, реакция на смену контроля).
- `packages/react` — рамки устройств (киоск 1080×1920, табло, телефон), токены M3 Expressive и iOS-темы.
- `apps/*` — только экраны из компонентов Framework7. Флоу у пары M3/HIG общий, разница только в системных паттернах.

## Про дизайн-системы

Официальной веб-библиотеки ни для M3 Expressive, ни для Apple HIG нет. Поэтому:
- M3-версии собраны на [Framework7](https://framework7.io) в теме `md` (Material 3). Expressive-часть (шкала скруглений, emphasized-типографика, пружинная анимация) подключена официальными токенами через CSS-переменные, своих компонентов нет. Иконки: Material Icons;
- HIG-версии собраны на [Ionic React](https://ionicframework.com) в iOS mode: так выглядит ближе к iOS, чем тема `ios` у Framework7. Это классический iOS-вид без Liquid Glass (iOS 26 Ionic пока не поддерживает). Иконки: Ionicons. Тема светлая, вторичный серый затемнён токенами до контраста 4.5:1;
- системные вещи (переходы, алерты, тосты, цвет темы) общая логика вызывает через адаптер: `@tib/kiosk-app/f7` и `@tib/kiosk-app/ionic`.

## Запуск

```bash
npm install
npm test
npm run dev:kiosk-m3    # :5171, табло — ?screen=board
npm run dev:kiosk-hig   # :5172
npm run dev:yacht-m3    # :5173
npm run dev:yacht-hig   # :5174
npm run build:all       # всё в site/ для GitHub Pages
```
