import { createStore } from 'zustand/vanilla';
import { clamp, l, type LText } from '@tib/shared';
import { chefMenu, scenes, tracks } from './data';
import {
  canSteer,
  computeLimits,
  controlReducer,
  initialControl,
  nextToyStatus,
  normalizeHeading,
  requestSpeed,
  requestTurn,
  stepFood,
  stepHelm,
  THROTTLE_PRESETS,
  TOY_PREP_SECONDS,
  toyBlock,
  type ThrottlePreset,
} from './logic';
import type {
  ClimateZone,
  Control,
  ControlEvent,
  DeliveryZone,
  FoodOrder,
  Helm,
  Jacuzzi,
  LightState,
  LightZone,
  Limits,
  Music,
  MusicZone,
  Notice,
  SceneId,
  ToyBlock,
  ToyId,
  ToyStatus,
  Weather,
  Zone,
} from './types';

/** Результат команды владельца — UI показывает причину отказа или ограничения. */
export type CommandResult = { ok: true; clampedBy?: Limits['reason'] } | { ok: false; reason: 'notInControl' | 'anchored' | ToyBlock };

const ANCHORAGE_HEADING = 45;
const ANCHORAGE_SECONDS = 40;

export interface YachtData {
  zone: Zone;
  weather: Weather;
  control: Control;
  helm: Helm;
  /** Автопилот «к якорной стоянке»: секунды до прибытия */
  autopilot: { to: 'anchorage'; eta: number } | null;
  music: Music;
  lights: Record<LightZone, LightState>;
  jacuzzi: Jacuzzi;
  climate: Record<ClimateZone, number>;
  scene: SceneId | null;
  orders: FoodOrder[];
  toys: Record<ToyId, { status: ToyStatus; elapsed: number }>;
  notices: Notice[];
}

export interface YachtState extends YachtData {
  /** Ограничения для команд владельца сейчас */
  limits(): Limits;

  // штурвал
  setMode(mode: Helm['mode']): CommandResult;
  setThrottle(target: number | ThrottlePreset): CommandResult;
  turn(delta: number): CommandResult;
  setHoldCourse(on: boolean): CommandResult;
  stop(): CommandResult;
  goToAnchorage(): CommandResult;

  // контроль
  handover(): void;
  acceptOffer(): void;
  declineOffer(): void;
  requestReturn(): void;

  // атмосфера
  togglePlay(): void;
  skip(dir: 1 | -1): void;
  setVolume(zone: MusicZone, v: number): void;
  setLight(zone: LightZone, patch: Partial<LightState>): void;
  applyScene(id: SceneId): CommandResult;

  // сервис
  setJacuzziTemp(t: number): void;
  setBubbles(on: boolean): void;
  setClimate(zone: ClimateZone, t: number): void;
  orderFood(items: FoodOrder['items'], zone: DeliveryZone, note?: string): string;
  toy(id: ToyId, want: 'deploy' | 'stow'): CommandResult;

  dismissNotice(id: string): void;
  tick(dt: number): void;

  /** Демо-панель: события, которые в жизни приходят от погоды и капитана */
  demo: {
    weatherWarning(): void;
    storm(): void;
    clearWeather(): void;
    captainApprove(): void;
    captainDeny(): void;
    deliverFood(): void;
    toyReady(id: ToyId): void;
    setZone(zone: Zone): void;
    reset(): void;
  };
}

const light = (on: boolean, brightness: number, color = '#FFE2B8'): LightState => ({ on, brightness, color });

export const initialYacht = (): YachtData => ({
  zone: 'coastal',
  weather: { windKn: 8, waveM: 0.4, warning: false, storm: false },
  control: initialControl,
  helm: { mode: 'underway', speed: 6, targetSpeed: 6, heading: 120, targetHeading: 120, holdCourse: true },
  autopilot: null,
  music: { playing: false, trackId: tracks[0]!.id, volume: { deck: 40, salon: 30, cabins: 0 } },
  lights: { deck: light(true, 60), salon: light(true, 70), cabins: light(false, 30), underwater: light(false, 80, '#3EC5FF') },
  jacuzzi: { temp: 34, targetTemp: 37, bubbles: false, safeMode: false },
  climate: { salon: 22, master: 21, guests: 22 },
  scene: null,
  orders: [],
  toys: { platform: { status: 'stowed', elapsed: 0 }, tender: { status: 'stowed', elapsed: 0 }, jetski: { status: 'stowed', elapsed: 0 } },
  notices: [],
});

const LIMIT_TEXT: Record<NonNullable<Limits['reason']>, LText> = {
  harbor: l('Скорость ограничена: рядом гавань', 'Speed limited: harbour nearby'),
  coastal: l('Скорость ограничена: прибрежная зона', 'Speed limited: coastal zone'),
  weather: l('Скорость ограничена из-за погоды', 'Speed limited due to weather'),
  anchored: l('Яхта на якоре', 'The yacht is at anchor'),
  notInControl: l('Сейчас управляет капитан', 'The captain is in control'),
};

let noticeSeq = 0;
let orderSeq = 0;

export function createYachtStore() {
  return createStore<YachtState>()((set, get) => {
    const notify = (level: Notice['level'], text: LText) =>
      set((s) => ({ notices: [...s.notices, { id: `n${++noticeSeq}`, level, text }] }));

    const control = (e: ControlEvent) => set((s) => ({ control: controlReducer(s.control, e) }));

    /** Общая проверка для команд хода */
    const guard = (needUnderway = false): CommandResult | null => {
      const s = get();
      if (!canSteer(s.control)) return { ok: false, reason: 'notInControl' };
      if (needUnderway && s.helm.mode === 'anchored') return { ok: false, reason: 'anchored' };
      return null;
    };

    const throttle = (target: number): CommandResult => {
      const { targetSpeed, clampedBy } = requestSpeed(target, get().limits());
      set((s) => ({ helm: { ...s.helm, targetSpeed }, autopilot: null }));
      if (clampedBy) notify('info', LIMIT_TEXT[clampedBy]);
      return { ok: true, clampedBy };
    };

    const stowAllToys = () =>
      set((s) => ({
        toys: Object.fromEntries(
          Object.entries(s.toys).map(([k, v]) => [k, { status: nextToyStatus(v.status, 'stow'), elapsed: 0 }]),
        ) as YachtData['toys'],
      }));

    return {
      ...initialYacht(),

      limits() {
        const s = get();
        return computeLimits({ zone: s.zone, weather: s.weather, control: s.control, mode: s.helm.mode });
      },

      setMode(mode) {
        const g = guard();
        if (g) return g;
        if (mode === 'anchored' && get().helm.speed > 1) {
          // встать на якорь можно только остановившись — сначала тормозим
          set((s) => ({ helm: { ...s.helm, targetSpeed: 0 }, autopilot: null }));
          notify('info', l('Сбрасываем ход, затем отдадим якорь', 'Slowing down before dropping anchor'));
          return { ok: true };
        }
        set((s) => ({ helm: { ...s.helm, mode, targetSpeed: 0 } }));
        return { ok: true };
      },

      setThrottle(target) {
        const g = guard(true);
        if (g) return g;
        return throttle(typeof target === 'number' ? target : THROTTLE_PRESETS[target]);
      },

      turn(delta) {
        const g = guard(true);
        if (g) return g;
        set((s) => ({ helm: requestTurn(s.helm, delta), autopilot: null }));
        return { ok: true };
      },

      setHoldCourse(on) {
        const g = guard(true);
        if (g) return g;
        set((s) => ({ helm: { ...s.helm, holdCourse: on, targetHeading: on ? s.helm.heading : s.helm.targetHeading } }));
        return { ok: true };
      },

      stop() {
        const g = guard();
        if (g) return g;
        set((s) => ({ helm: { ...s.helm, targetSpeed: 0 }, autopilot: null }));
        return { ok: true };
      },

      goToAnchorage() {
        const g = guard();
        if (g) return g;
        const r = throttle(THROTTLE_PRESETS.slow);
        set((s) => ({
          helm: { ...s.helm, mode: 'underway', targetHeading: ANCHORAGE_HEADING, holdCourse: false },
          autopilot: { to: 'anchorage', eta: ANCHORAGE_SECONDS },
        }));
        return r;
      },

      handover: () => control({ type: 'OWNER_HANDOVER' }),
      acceptOffer: () => control({ type: 'OFFER_ACCEPT' }),
      declineOffer: () => control({ type: 'OFFER_DECLINE' }),
      requestReturn: () => control({ type: 'OWNER_REQUEST_RETURN' }),

      togglePlay: () => set((s) => ({ music: { ...s.music, playing: !s.music.playing } })),
      skip(dir) {
        set((s) => {
          const i = tracks.findIndex((t) => t.id === s.music.trackId);
          const next = tracks[(i + dir + tracks.length) % tracks.length]!;
          return { music: { ...s.music, trackId: next.id, playing: true } };
        });
      },
      setVolume: (zone, v) => set((s) => ({ music: { ...s.music, volume: { ...s.music.volume, [zone]: clamp(v, 0, 100) } }, scene: null })),
      setLight: (zone, patch) => set((s) => ({ lights: { ...s.lights, [zone]: { ...s.lights[zone], ...patch } }, scene: null })),

      applyScene(id) {
        const sc = scenes[id];
        set((s) => {
          const track = tracks.find((t) => t.mood === sc.music.mood) ?? tracks[0]!;
          return {
            scene: id,
            lights: { ...s.lights, ...sc.lights },
            music: { playing: sc.music.playing, trackId: track.id, volume: { ...s.music.volume, ...sc.music.volume } },
            jacuzzi: s.jacuzzi.safeMode ? s.jacuzzi : { ...s.jacuzzi, ...sc.jacuzzi },
          };
        });
        // ходовая часть сцены — только если владелец у руля; комфорт применяется всегда
        if (sc.targetSpeed === null) return { ok: true };
        if (!canSteer(get().control) || get().helm.mode === 'anchored') return { ok: true };
        return throttle(sc.targetSpeed);
      },

      setJacuzziTemp: (t) => set((s) => ({ jacuzzi: { ...s.jacuzzi, targetTemp: clamp(t, 30, 40) } })),
      setBubbles: (on) => set((s) => ({ jacuzzi: { ...s.jacuzzi, bubbles: s.jacuzzi.safeMode ? false : on } })),
      setClimate: (zone, t) => set((s) => ({ climate: { ...s.climate, [zone]: clamp(t, 16, 28) } })),

      orderFood(items, zone, note = '') {
        const id = `o${++orderSeq}`;
        set((s) => ({ orders: [...s.orders, { id, items, zone, note, status: 'accepted', elapsed: 0 }] }));
        return id;
      },

      toy(id, want) {
        const s = get();
        if (want === 'deploy') {
          const block = toyBlock({ speed: s.helm.speed, weather: s.weather, control: s.control });
          if (block) return { ok: false, reason: block };
        }
        set((st) => ({ toys: { ...st.toys, [id]: { status: nextToyStatus(st.toys[id].status, want), elapsed: 0 } } }));
        return { ok: true };
      },

      dismissNotice: (id) => set((s) => ({ notices: s.notices.filter((n) => n.id !== id) })),

      tick(dt) {
        control({ type: 'TICK', dt });
        set((s) => {
          // физика не зависит от того, кто у руля: используем коридор без notInControl
          const phys = computeLimits({ zone: s.zone, weather: s.weather, control: { ...initialControl, weatherKept: s.control.weatherKept }, mode: s.helm.mode });
          let helm = stepHelm(s.helm, phys, dt);
          let autopilot = s.autopilot;
          if (autopilot) {
            const eta = autopilot.eta - dt;
            if (eta <= 0) {
              helm = { ...helm, targetSpeed: 0, mode: helm.speed < 0.5 ? 'anchored' : helm.mode };
              autopilot = helm.mode === 'anchored' ? null : { ...autopilot, eta: 0 };
            } else autopilot = { ...autopilot, eta };
          }
          const j = s.jacuzzi;
          const dTemp = clamp(j.targetTemp - j.temp, -0.1 * dt, 0.1 * dt);
          const toys = Object.fromEntries(
            Object.entries(s.toys).map(([k, v]) => {
              const elapsed = v.elapsed + dt;
              const done = elapsed >= TOY_PREP_SECONDS[k as ToyId];
              if (v.status === 'preparing' && done) return [k, { status: 'ready', elapsed: 0 }];
              if (v.status === 'stowing' && done) return [k, { status: 'stowed', elapsed: 0 }];
              return [k, { ...v, elapsed }];
            }),
          ) as YachtData['toys'];
          return {
            helm: { ...helm, heading: normalizeHeading(helm.heading) },
            autopilot,
            jacuzzi: { ...j, temp: Math.round((j.temp + dTemp) * 10) / 10 },
            orders: s.orders.map((o) => stepFood(o, dt)),
            toys,
          };
        });
      },

      demo: {
        weatherWarning() {
          set((s) => ({ weather: { ...s.weather, warning: true, windKn: 24, waveM: 1.8 } }));
          control({ type: 'WEATHER_WARNING' });
        },
        storm() {
          set((s) => ({
            weather: { windKn: 42, waveM: 3.5, warning: true, storm: true },
            // капитан сразу ставит безопасный ход носом к волне
            helm: { ...s.helm, mode: 'underway', targetSpeed: 8, holdCourse: false },
            autopilot: null,
            jacuzzi: { ...s.jacuzzi, bubbles: false, safeMode: true },
          }));
          control({ type: 'STORM' });
          stowAllToys();
          notify('critical', l('Шторм. Управление у капитана', 'Storm. The captain has control'));
        },
        clearWeather() {
          set((s) => ({
            weather: { windKn: 8, waveM: 0.4, warning: false, storm: false },
            jacuzzi: { ...s.jacuzzi, safeMode: false },
            // погода наладилась — ужесточённый коридор снимается; управление капитан возвращает сам
            control: { ...s.control, weatherKept: false },
          }));
        },
        captainApprove: () => control({ type: 'CAPTAIN_APPROVE' }),
        captainDeny() {
          control({ type: 'CAPTAIN_DENY' });
          notify('info', l('Капитан пока оставит управление у себя', 'The captain will keep control for now'));
        },
        deliverFood() {
          set((s) => ({ orders: s.orders.map((o) => ({ ...o, status: 'delivered' as const, elapsed: 0 })) }));
        },
        toyReady: (id) => set((s) => ({ toys: { ...s.toys, [id]: { status: 'ready', elapsed: 0 } } })),
        setZone: (zone) => set({ zone }),
        reset: () => set({ ...initialYacht() }),
      },
    };
  });
}

export type YachtStore = ReturnType<typeof createYachtStore>;
export { chefMenu };
