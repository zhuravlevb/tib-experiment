import type { LText } from '@tib/shared';

// ——— контроль ———

/**
 * owner            — управляет владелец (в безопасном коридоре)
 * offered          — погодное предупреждение: предложено передать, идёт отсчёт
 * captain          — управляет капитан (передано вручную или после предложения)
 * returnRequested  — владелец попросил управление обратно, ждём капитана
 * emergency        — шторм/авария: капитан забрал управление мгновенно
 */
export type ControlState = 'owner' | 'offered' | 'captain' | 'returnRequested' | 'emergency';
export type HandoverReason = 'manual' | 'weather' | 'timeout' | 'storm';

export interface Control {
  state: ControlState;
  reason: HandoverReason | null;
  /** Секунды до автоматической передачи в состоянии offered */
  countdown: number;
  /** Владелец отказался передавать при предупреждении — коридор ужесточён */
  weatherKept: boolean;
}

export type ControlEvent =
  | { type: 'OWNER_HANDOVER' }
  | { type: 'WEATHER_WARNING' }
  | { type: 'OFFER_ACCEPT' }
  | { type: 'OFFER_DECLINE' }
  | { type: 'TICK'; dt: number }
  | { type: 'STORM' }
  | { type: 'OWNER_REQUEST_RETURN' }
  | { type: 'CAPTAIN_APPROVE' }
  | { type: 'CAPTAIN_DENY' };

// ——— ход ———

export type HelmMode = 'anchored' | 'underway';
export type Zone = 'open' | 'coastal' | 'harbor';

export interface Helm {
  mode: HelmMode;
  speed: number; // узлы
  targetSpeed: number;
  heading: number; // градусы 0–359
  targetHeading: number;
  holdCourse: boolean;
}

export type LimitReason = 'harbor' | 'coastal' | 'weather' | 'anchored' | 'notInControl';

export interface Limits {
  maxSpeed: number;
  maxTurnRate: number; // град/с
  /** Самое строгое ограничение — его показываем гостю */
  reason: LimitReason | null;
}

export interface Weather {
  windKn: number;
  waveM: number;
  warning: boolean;
  storm: boolean;
}

// ——— комфорт ———

export type MusicZone = 'deck' | 'salon' | 'cabins';
export interface Track {
  id: string;
  title: string;
  artist: string;
  mood: 'chill' | 'party' | 'lounge' | 'sleep';
}
export interface Music {
  playing: boolean;
  trackId: string;
  volume: Record<MusicZone, number>; // 0–100
}

export type LightZone = 'deck' | 'salon' | 'cabins' | 'underwater';
export interface LightState {
  on: boolean;
  brightness: number; // 0–100
  color: string; // hex
}

export type ClimateZone = 'salon' | 'master' | 'guests';
export interface Jacuzzi {
  temp: number; // °C, 30–40
  targetTemp: number;
  bubbles: boolean;
  /** Безопасный режим при шторме: без пузырей, крышка закрыта */
  safeMode: boolean;
}

export type SceneId = 'sunset' | 'party' | 'privacy' | 'sleep';
export interface Scene {
  id: SceneId;
  name: LText;
  lights: Partial<Record<LightZone, LightState>>;
  music: { playing: boolean; mood: Track['mood']; volume: Partial<Record<MusicZone, number>> };
  jacuzzi?: Partial<Pick<Jacuzzi, 'targetTemp' | 'bubbles'>>;
  /** null — сцена не трогает ход */
  targetSpeed: number | null;
}

// ——— сервис ———

export type DeliveryZone = 'sundeck' | 'jacuzzi' | 'salon' | 'bow' | 'master';
export type FoodStatus = 'accepted' | 'preparing' | 'onTheWay' | 'delivered';
export interface ChefItem {
  id: string;
  name: LText;
  kind: 'food' | 'drink';
  prepSec: number;
}
export interface FoodOrder {
  id: string;
  items: { itemId: string; qty: number }[];
  zone: DeliveryZone;
  note: string;
  status: FoodStatus;
  /** Секунды в текущем статусе (демо-тик) */
  elapsed: number;
}

export type ToyId = 'platform' | 'tender' | 'jetski';
/** platform: stowed → deploying → ready; tender/jetski: stowed → preparing → ready */
export type ToyStatus = 'stowed' | 'preparing' | 'ready' | 'stowing';
export type ToyBlock = 'underway' | 'weather' | 'emergency' | null;

export interface Notice {
  id: string;
  level: 'info' | 'warning' | 'critical';
  text: LText;
}
