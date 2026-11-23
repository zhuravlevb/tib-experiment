import { describe, expect, it } from 'vitest';
import { computeLimits, controlReducer, headingDelta, initialControl, requestSpeed, stepFood, stepHelm, toyBlock } from './logic';
import type { Control, Helm, Weather } from './types';

const calm: Weather = { windKn: 8, waveM: 0.4, warning: false, storm: false };
const helm: Helm = { mode: 'underway', speed: 0, targetSpeed: 0, heading: 350, targetHeading: 350, holdCourse: false };

describe('safe corridor', () => {
  it('takes the strictest limit', () => {
    expect(computeLimits({ zone: 'open', weather: calm, control: initialControl, mode: 'underway' }).maxSpeed).toBe(28);
    const harbor = computeLimits({ zone: 'harbor', weather: { ...calm, warning: true }, control: initialControl, mode: 'underway' });
    expect(harbor).toMatchObject({ maxSpeed: 6, reason: 'harbor' });
    const kept = computeLimits({ zone: 'open', weather: calm, control: { ...initialControl, weatherKept: true }, mode: 'underway' });
    expect(kept).toMatchObject({ maxSpeed: 12, reason: 'weather' });
  });

  it('clamps commands above the limit and reports why', () => {
    const lim = computeLimits({ zone: 'coastal', weather: calm, control: initialControl, mode: 'underway' });
    expect(requestSpeed(28, lim)).toEqual({ targetSpeed: 14, clampedBy: 'coastal' });
    expect(requestSpeed(10, lim)).toEqual({ targetSpeed: 10, clampedBy: null });
  });

  it('accelerates smoothly and turns via shortest path', () => {
    const lim = computeLimits({ zone: 'open', weather: calm, control: initialControl, mode: 'underway' });
    let h: Helm = { ...helm, targetSpeed: 10, targetHeading: 10 };
    h = stepHelm(h, lim, 1);
    expect(h.speed).toBe(1.5);
    for (let i = 0; i < 20; i++) h = stepHelm(h, lim, 1);
    expect(h.speed).toBe(10);
    expect(h.heading).toBe(10); // 350 → 10 через север, а не назад
    expect(headingDelta(350, 10)).toBe(20);
  });

  it('entering a stricter zone lowers the target on its own', () => {
    const harbor = computeLimits({ zone: 'harbor', weather: calm, control: initialControl, mode: 'underway' });
    const h = stepHelm({ ...helm, speed: 14, targetSpeed: 14 }, harbor, 1);
    expect(h.targetSpeed).toBe(6);
    expect(h.speed).toBe(11);
  });
});

describe('control handover', () => {
  const run = (events: Parameters<typeof controlReducer>[1][], from: Control = initialControl) => events.reduce(controlReducer, from);

  it('1) manual handover, return only via captain', () => {
    const c = run([{ type: 'OWNER_HANDOVER' }]);
    expect(c).toMatchObject({ state: 'captain', reason: 'manual' });
    expect(run([{ type: 'OWNER_REQUEST_RETURN' }], c).state).toBe('returnRequested');
    expect(run([{ type: 'OWNER_REQUEST_RETURN' }, { type: 'CAPTAIN_DENY' }], c).state).toBe('captain');
    expect(run([{ type: 'OWNER_REQUEST_RETURN' }, { type: 'CAPTAIN_APPROVE' }], c).state).toBe('owner');
  });

  it('2) weather offer: countdown → captain; decline → stricter corridor', () => {
    const offered = run([{ type: 'WEATHER_WARNING' }]);
    expect(offered).toMatchObject({ state: 'offered', countdown: 30 });
    expect(run([{ type: 'TICK', dt: 29 }], offered).state).toBe('offered');
    expect(run([{ type: 'TICK', dt: 30 }], offered)).toMatchObject({ state: 'captain', reason: 'timeout' });
    expect(run([{ type: 'OFFER_DECLINE' }], offered)).toMatchObject({ state: 'owner', weatherKept: true });
  });

  it('3) storm takes control from any state instantly', () => {
    for (const state of ['owner', 'offered', 'captain', 'returnRequested'] as const) {
      expect(controlReducer({ ...initialControl, state }, { type: 'STORM' }).state).toBe('emergency');
    }
    const denied = run([{ type: 'STORM' }, { type: 'OWNER_REQUEST_RETURN' }, { type: 'CAPTAIN_DENY' }]);
    expect(denied.state).toBe('emergency');
  });

  it('owner cannot grab control back by own events', () => {
    const c = run([{ type: 'OWNER_HANDOVER' }, { type: 'OFFER_DECLINE' }, { type: 'WEATHER_WARNING' }]);
    expect(c.state).toBe('captain');
  });
});

describe('service', () => {
  it('toys blocked underway and in bad weather', () => {
    expect(toyBlock({ speed: 10, weather: calm, control: initialControl })).toBe('underway');
    expect(toyBlock({ speed: 0, weather: { ...calm, warning: true }, control: initialControl })).toBe('weather');
    expect(toyBlock({ speed: 0, weather: calm, control: initialControl })).toBeNull();
  });

  it('food goes through statuses', () => {
    let o = { id: 'o', items: [], zone: 'sundeck' as const, note: '', status: 'accepted' as const, elapsed: 0 };
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
      o = stepFood(o, 1) as typeof o;
      seen.add(o.status);
    }
    expect([...seen]).toEqual(['accepted', 'preparing', 'onTheWay', 'delivered']);
  });
});
