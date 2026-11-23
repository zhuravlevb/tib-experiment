import { clamp } from '@tib/shared';
import type {
  Control,
  ControlEvent,
  FoodOrder,
  FoodStatus,
  Helm,
  Limits,
  ToyBlock,
  ToyStatus,
  Weather,
  Zone,
} from './types';

// ——— безопасный коридор ———

export const ABS_MAX_SPEED = 28; // узлы, полный ход яхты
export const OFFER_SECONDS = 30;

const ZONE_LIMIT: Record<Zone, number> = { open: ABS_MAX_SPEED, coastal: 14, harbor: 6 };

/**
 * Итоговые ограничения = самое строгое из зоны, погоды и режима.
 * Владелец всегда управляет «внутри коридора», команда за его пределами зажимается.
 */
export function computeLimits(p: { zone: Zone; weather: Weather; control: Control; mode: Helm['mode'] }): Limits {
  const candidates: { maxSpeed: number; reason: Limits['reason'] }[] = [{ maxSpeed: ABS_MAX_SPEED, reason: null }];
  if (p.zone !== 'open') candidates.push({ maxSpeed: ZONE_LIMIT[p.zone], reason: p.zone });
  if (p.weather.warning || p.control.weatherKept) candidates.push({ maxSpeed: 12, reason: 'weather' });
  if (p.mode === 'anchored') candidates.push({ maxSpeed: 0, reason: 'anchored' });
  if (!canSteer(p.control)) candidates.push({ maxSpeed: 0, reason: 'notInControl' });
  const strictest = candidates.reduce((a, b) => (b.maxSpeed < a.maxSpeed ? b : a));
  // на высокой скорости и в непогоду поворачиваем плавнее
  const maxTurnRate = p.weather.warning ? 2 : p.zone === 'harbor' ? 4 : 3;
  return { maxSpeed: strictest.maxSpeed, maxTurnRate, reason: strictest.reason };
}

export const THROTTLE_PRESETS = { stop: 0, slow: 6, cruise: 14, full: ABS_MAX_SPEED } as const;
export type ThrottlePreset = keyof typeof THROTTLE_PRESETS;

/** Команда газа. clampedBy != null — показать неблокирующее уведомление. */
export function requestSpeed(target: number, limits: Limits): { targetSpeed: number; clampedBy: Limits['reason'] } {
  const t = clamp(target, 0, ABS_MAX_SPEED);
  if (t > limits.maxSpeed) return { targetSpeed: limits.maxSpeed, clampedBy: limits.reason };
  return { targetSpeed: t, clampedBy: null };
}

export const normalizeHeading = (h: number) => ((Math.round(h) % 360) + 360) % 360;

/** Кратчайшая разница курсов, −180…180 */
export const headingDelta = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;

/** Поворот на delta градусов от текущей цели (кнопки ±10°, ползунок). */
export const requestTurn = (helm: Helm, delta: number): Helm => ({
  ...helm,
  targetHeading: normalizeHeading(helm.targetHeading + delta),
  holdCourse: false,
});

const ACCEL = 1.5; // узлов/с
const DECEL = 3;

/** Один шаг симуляции: плавный разгон/торможение и поворот с ограничением скорости. */
export function stepHelm(helm: Helm, limits: Limits, dt: number): Helm {
  // если коридор сузился на ходу (вошли в гавань, пришла непогода) — цель снижается сама
  const targetSpeed = Math.min(helm.targetSpeed, limits.maxSpeed);
  const dv = targetSpeed - helm.speed;
  const speed = dv > 0 ? Math.min(targetSpeed, helm.speed + ACCEL * dt) : Math.max(targetSpeed, helm.speed - DECEL * dt);

  let heading = helm.heading;
  if (speed > 0.5) {
    const d = headingDelta(helm.heading, helm.targetHeading);
    const maxStep = limits.maxTurnRate * dt;
    heading = normalizeHeading(helm.heading + clamp(d, -maxStep, maxStep));
  }
  return { ...helm, targetSpeed, speed: Math.round(speed * 10) / 10, heading };
}

// ——— машина передачи контроля ———

export const initialControl: Control = { state: 'owner', reason: null, countdown: 0, weatherKept: false };

/** Во время погодного предложения штурвал ещё у владельца, пока он не передал его или не истёк отсчёт. */
export const canSteer = (c: Control) => c.state === 'owner' || c.state === 'offered';

/**
 * Три сценария:
 * 1) владелец сам отдаёт управление (с подтверждением в UI);
 * 2) предупреждение о погоде → предложение с отсчётом, по таймауту передаётся;
 * 3) шторм → мгновенно капитану, из любого состояния.
 * Вернуть управление владельцу может только капитан.
 */
export function controlReducer(c: Control, e: ControlEvent): Control {
  if (e.type === 'STORM') return { ...c, state: 'emergency', reason: 'storm', countdown: 0 };

  switch (c.state) {
    case 'owner':
      if (e.type === 'OWNER_HANDOVER') return { ...c, state: 'captain', reason: 'manual' };
      if (e.type === 'WEATHER_WARNING') return { ...c, state: 'offered', reason: 'weather', countdown: OFFER_SECONDS };
      return c;
    case 'offered':
      if (e.type === 'OFFER_ACCEPT' || e.type === 'OWNER_HANDOVER') return { ...c, state: 'captain', reason: 'weather', countdown: 0 };
      if (e.type === 'OFFER_DECLINE') return { ...c, state: 'owner', reason: null, countdown: 0, weatherKept: true };
      if (e.type === 'TICK') {
        const countdown = Math.max(0, c.countdown - e.dt);
        return countdown === 0 ? { ...c, state: 'captain', reason: 'timeout', countdown } : { ...c, countdown };
      }
      return c;
    case 'captain':
    case 'emergency':
      if (e.type === 'OWNER_REQUEST_RETURN') return { ...c, state: 'returnRequested' };
      return c;
    case 'returnRequested':
      if (e.type === 'CAPTAIN_APPROVE') return { ...initialControl, weatherKept: c.weatherKept };
      if (e.type === 'CAPTAIN_DENY') return { ...c, state: c.reason === 'storm' ? 'emergency' : 'captain' };
      return c;
  }
}

// ——— игрушки и платформа ———

/** Спускать платформу и технику можно только на стоянке / малом ходу и без непогоды. */
export function toyBlock(p: { speed: number; weather: Weather; control: Control }): ToyBlock {
  if (p.control.state === 'emergency' || p.weather.storm) return 'emergency';
  if (p.weather.warning) return 'weather';
  if (p.speed > 3) return 'underway';
  return null;
}

export const TOY_PREP_SECONDS = { platform: 8, tender: 20, jetski: 12 } as const;

export function nextToyStatus(status: ToyStatus, want: 'deploy' | 'stow'): ToyStatus {
  if (want === 'deploy') return status === 'stowed' || status === 'stowing' ? 'preparing' : status;
  return status === 'ready' || status === 'preparing' ? 'stowing' : status;
}

// ——— доставка еды ———

export const FOOD_FLOW: FoodStatus[] = ['accepted', 'preparing', 'onTheWay', 'delivered'];
const FOOD_STAGE_SECONDS: Record<FoodStatus, number> = { accepted: 5, preparing: 25, onTheWay: 10, delivered: Infinity };

export function stepFood(o: FoodOrder, dt: number): FoodOrder {
  const elapsed = o.elapsed + dt;
  if (elapsed < FOOD_STAGE_SECONDS[o.status]) return { ...o, elapsed };
  const next = FOOD_FLOW[FOOD_FLOW.indexOf(o.status) + 1];
  return next ? { ...o, status: next, elapsed: 0 } : { ...o, elapsed };
}
