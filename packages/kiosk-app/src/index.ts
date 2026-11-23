/**
 * Поведение киоска, общее для M3 и HIG: стор, навигация по шагам, таймер простоя,
 * доступность, цвет бренда, черновик блюда, оплата. Разметки здесь нет.
 * Системные вещи (переход по экранам, алерты, тосты, цвет темы) идут через адаптер:
 * у M3-версии это Framework7 (./f7), у HIG-версии — Ionic (./ionic).
 */
import { useEffect, useRef, useState } from 'react';
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { createIdleTimer, formatRub, tr, type LText } from '@tib/shared';
import {
  createBoardStore,
  createKioskStore,
  DEMO_QR,
  defaultSelections,
  getItem,
  kioskBus,
  lineAllergens,
  recentOrders,
  S,
  toggleOption,
  unitPrice,
  validateLine,
  type KioskState,
  type Selections,
  type Step,
  type StringKey,
} from '@tib/kiosk-core';

export const bus = kioskBus();
export const kiosk = createKioskStore({ bus });
export const useKiosk = <T,>(sel: (s: KioskState) => T): T => useStore(kiosk, sel);

/** Переводчик: t('cart') или t(someLText) */
export function useT() {
  const lang = useKiosk((s) => s.lang);
  return Object.assign((k: StringKey | LText) => tr(typeof k === 'string' ? S[k] : k, lang), { lang });
}
export const rub = formatRub;
const say = (k: StringKey) => tr(S[k], kiosk.getState().lang);

// ——— адаптер системы ———

export interface AlertButton {
  text: string;
  /** destructive — красная кнопка, cancel — кнопка отмены, primary — основное действие */
  role?: 'destructive' | 'cancel' | 'primary';
  onClick?: () => void;
}
export interface AlertHandle {
  setText(text: string): void;
  close(): void;
}
export interface UiAdapter {
  navigate(path: string, mode: 'forward' | 'root'): void;
  /** Вернуться к экрану в истории; false — его там нет */
  back(path: string): boolean;
  currentPath(): string;
  closeOverlays(): void;
  alert(o: { title: string; text?: string; buttons: AlertButton[]; onDismiss?: () => void }): AlertHandle;
  prompt(o: { title: string; label: string; value: string; ok: string; cancel: string; onOk: (v: string) => void }): void;
  toast(text: string): void;
  loading(text: string): () => void;
  /** Акцентный цвет системы и режим высокого контраста */
  applyTheme(tint: string, highContrast: boolean): void;
}

let ui: UiAdapter | null = null;
export const registerUi = (a: UiAdapter) => {
  ui = a;
};
const sys = () => {
  if (!ui) throw new Error('UI adapter is not registered');
  return ui;
};

// ——— навигация ———

export const PATH: Record<Step, (id?: string) => string> = {
  attract: () => '/',
  start: () => '/start/',
  restaurants: () => '/restaurants/',
  menu: (id) => `/menu/${id}/`,
  cart: () => '/cart/',
  loyalty: () => '/loyalty/',
  payment: () => '/payment/',
  done: () => '/done/',
};

/** Переход на шаг с проверкой охранных условий ядра. */
export function go(step: Step, restaurantId?: string): string | null {
  const s = kiosk.getState();
  if (step === 'menu' && restaurantId) s.openRestaurant(restaurantId);
  else if (step === 'start') s.begin();
  else {
    const err = s.goto(step);
    if (err) return err;
  }
  sys().navigate(PATH[step](restaurantId), step === 'done' ? 'root' : 'forward');
  return null;
}

/** Вернуться к уже открытому шагу (например, из корзины к ресторанам), не плодя историю. */
export function backTo(step: Step, restaurantId?: string) {
  if (!sys().back(PATH[step](restaurantId))) go(step, restaurantId);
}

/** Полный сброс к заставке: отмена, простой, «Готово». */
export function resetToAttract() {
  closeItem();
  sys().closeOverlays();
  kiosk.getState().reset();
  sys().navigate('/', 'root');
}

/** Отмена заказа с подтверждением (системный алерт в теме приложения). */
export function confirmCancel() {
  sys().alert({
    title: say('cancelOrder') + '?',
    text: say('cancelConfirm'),
    buttons: [
      { text: say('keep'), role: 'cancel' },
      { text: say('yesCancel'), role: 'destructive', onClick: resetToAttract },
    ],
  });
}

export const toast = (text: string) => sys().toast(text);

// ——— цвет бренда и доступность ———

const tintStore = createStore<{ tint: string | null }>(() => ({ tint: null }));
/** Вызывается при входе на экран: меню красит интерфейс в цвет бренда, остальные — в базовый. */
export const setTint = (color: string | null) => tintStore.setState({ tint: color });

/** Тема всегда светлая. Высокий контраст = почти чёрный акцент на белом + усиленные контуры. */
export const CONTRAST_TINT = '#111111';

/** Плотность (логический масштаб) кадра киоска. Крупный текст = крупнее всё, включая цели касания. */
export const KIOSK = { width: 1080, height: 1920, density: 1.5, largeDensity: 1.875 } as const;

/** Подключается в корне приложения после registerUi. */
export function useKioskShell(baseTint: string) {
  const a11y = useKiosk((s) => s.a11y);
  const lang = useKiosk((s) => s.lang);
  const tint = useStore(tintStore, (s) => s.tint);

  useEffect(() => {
    ui?.applyTheme(a11y.highContrast ? CONTRAST_TINT : (tint ?? baseTint), a11y.highContrast);
    document.documentElement.classList.toggle('kiosk-contrast', a11y.highContrast);
  }, [a11y.highContrast, tint, baseTint]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useIdle();
  return { density: a11y.largeText ? KIOSK.largeDensity : KIOSK.density, lowMode: a11y.lowMode };
}

// ——— простой ———

const IDLE_FREE = ['/', '/payment/', '/done/'];

function useIdle() {
  useEffect(() => {
    let handle: AlertHandle | null = null;
    let countdown: ReturnType<typeof setInterval> | undefined;
    const stopWarn = () => {
      clearInterval(countdown);
      const h = handle;
      handle = null;
      h?.close();
    };
    const timer = createIdleTimer({
      warnAfterMs: 60_000,
      resetAfterMs: 20_000,
      onWarn() {
        if (!ui || IDLE_FREE.includes(ui.currentPath())) return timer.activity();
        let left = 20;
        const text = () => `${say('stillHereText')} ${left} ${say('sec')}`;
        handle = ui.alert({
          title: say('stillHere'),
          text: text(),
          buttons: [{ text: say('continue'), role: 'primary' }],
          // любое закрытие предупреждения = гость здесь
          onDismiss: () => {
            if (handle) {
              clearInterval(countdown);
              handle = null;
              timer.activity();
            }
          },
        });
        countdown = setInterval(() => {
          left = Math.max(0, left - 1);
          handle?.setText(text());
        }, 1000);
      },
      onReset() {
        stopWarn();
        resetToAttract();
      },
    });
    const onActivity = () => {
      if (!timer.warning) timer.activity();
    };
    document.addEventListener('pointerdown', onActivity, true);
    return () => {
      timer.stop();
      stopWarn();
      document.removeEventListener('pointerdown', onActivity, true);
    };
  }, []);
}

// ——— табло ———

export function createBoard() {
  const board = createBoardStore();
  recentOrders().forEach((o) => board.getState().addOrder(o, o.createdAt));
  bus.subscribe((m) => {
    if (m.type === 'order') board.getState().addOrder(m.order, m.order.createdAt);
  });
  return board;
}

export const isBoardScreen = () => new URLSearchParams(location.search).get('screen') === 'board';
export const boardUrl = () => `${location.pathname}?screen=board`;

/** Обратный отсчёт в секундах; onDone вызывается один раз по нулю. */
export function useCountdown(seconds: number, onDone: () => void, active = true): number {
  const done = useRef(onDone);
  done.current = onDone;
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    setLeft(seconds);
    const id = setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(id);
  }, [active, seconds]);
  useEffect(() => {
    if (active && left === 0) done.current();
  }, [left, active]);
  return Math.max(0, left);
}

/** Фото блюд/ресторанов, если они есть в assets; иначе — null и UI показывает запасной вариант. */
export function photoResolver(files: Record<string, string>) {
  return (path: string): string | null => {
    // расширение не важно: фото бывают .jpg и .webp
    const stem = '/' + path.replace(/\.[a-z]+$/i, '.');
    const key = Object.keys(files).find((k) => k.includes(stem));
    return key ? files[key]! : null;
  };
}

// ——— карточка блюда ———

const editor = createStore<{ itemId: string | null; lineId: string | null }>(() => ({ itemId: null, lineId: null }));
export const openItem = (itemId: string, lineId: string | null = null) => editor.setState({ itemId, lineId });
export const closeItem = () => editor.setState({ itemId: null, lineId: null });
export const useItemEditor = () => useStore(editor);

/**
 * Черновик позиции: выбор опций, комбо, количество, живая цена, ошибки, аллергены.
 * При редактировании строки корзины стартует с её значений.
 */
export function useItemDraft(itemId: string | null, lineId: string | null) {
  const line = useKiosk((s) => (lineId ? s.cart.find((l) => l.id === lineId) : undefined));
  const item = itemId ? getItem(itemId) : null;
  const [sel, setSel] = useState<Selections>({});
  const [combo, setCombo] = useState(false);
  const [comboSel, setComboSel] = useState<Selections>({});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!item) return;
    setSel(line?.selections ?? defaultSelections(item.groups));
    setCombo(line?.combo ?? false);
    setComboSel(line?.comboSelections ?? (item.combo ? defaultSelections(item.combo.groups) : {}));
    setQty(line?.qty ?? 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, lineId]);

  if (!item) return null;
  const draft = { itemId: item.id, restaurantId: item.restaurantId, qty, selections: sel, combo, comboSelections: comboSel };
  const errors = validateLine(draft);
  return {
    item,
    editing: !!line,
    sel,
    combo,
    comboSel,
    qty,
    setQty,
    setCombo,
    toggle: (groupId: string, optionId: string) => setSel((s) => toggleOption(item.groups, s, groupId, optionId)),
    toggleCombo: (groupId: string, optionId: string) =>
      setComboSel((s) => (item.combo ? toggleOption(item.combo.groups, s, groupId, optionId) : s)),
    isChecked: (s: Selections, groupId: string, optionId: string) => (s[groupId] ?? []).includes(optionId),
    /** Опция заблокирована лимитом группы */
    isLocked: (s: Selections, groupId: string, optionId: string, max: number) =>
      max > 1 && (s[groupId] ?? []).length >= max && !(s[groupId] ?? []).includes(optionId),
    price: unitPrice(draft) * qty,
    errors,
    allergens: lineAllergens(draft),
    commit() {
      if (errors.length) return false;
      const k = kiosk.getState();
      if (lineId) k.replaceLine(lineId, draft);
      else k.addLine(draft);
      closeItem();
      toast(say('added'));
      return true;
    },
  };
}

// ——— лояльность ———

export function scanQrDemo() {
  const done = sys().loading(say('scanDemo'));
  setTimeout(() => {
    done();
    kiosk.getState().identifyGuest({ qr: DEMO_QR });
  }, 1500);
}

export function findByPhone(digits: string) {
  const g = kiosk.getState().identifyGuest({ phone: '7' + digits });
  if (!g) toast(say('notFound'));
  return g;
}

/** Телефон из 10 цифр после +7 в виде +7 900 000-00-00 */
export function formatPhone(d: string) {
  const p = d.padEnd(10, '_');
  return `+7 ${p.slice(0, 3)} ${p.slice(3, 6)}-${p.slice(6, 8)}-${p.slice(8, 10)}`;
}

// ——— оплата ———

export async function payDemo(outcome: 'success' | 'declined') {
  const r = await kiosk.getState().pay(outcome);
  if (r === 'success') go('done');
  else
    sys().alert({
      title: say('declined'),
      text: say('declinedHint'),
      buttons: [
        { text: say('otherMethod'), onClick: () => kiosk.setState({ payment: { method: null, status: 'idle' } }) },
        { text: say('retry'), role: 'primary', onClick: () => kiosk.setState((s) => ({ payment: { ...s.payment, status: 'waiting' } })) },
      ],
    });
}

export function smsReceipt() {
  sys().prompt({
    title: say('sms'),
    label: say('phone'),
    value: '+7 ',
    ok: say('done'),
    cancel: say('back'),
    onOk: () => toast(say('smsSent')),
  });
}

/** Обработчик нативного change для Toggle/Checkbox: onChange={onToggle((v) => ...)} */
export const onToggle = (fn: (v: boolean) => void) => (e: { target: EventTarget | null }) =>
  fn((e.target as HTMLInputElement).checked);
