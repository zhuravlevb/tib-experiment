import { describe, expect, it } from 'vitest';
import { createYachtStore } from './store';

describe('yacht store scenarios', () => {
  it('owner throttle is clamped and notified', () => {
    const y = createYachtStore();
    const r = y.getState().setThrottle('full');
    expect(r).toEqual({ ok: true, clampedBy: 'coastal' });
    expect(y.getState().helm.targetSpeed).toBe(14);
    expect(y.getState().notices).toHaveLength(1);
  });

  it('storm: helm locked, toys stowed, jacuzzi safe, comfort still works', () => {
    const y = createYachtStore();
    y.getState().stop();
    for (let i = 0; i < 5; i++) y.getState().tick(1);
    expect(y.getState().toy('platform', 'deploy')).toEqual({ ok: true });
    y.getState().demo.storm();
    const s = y.getState();
    expect(s.control.state).toBe('emergency');
    expect(s.setThrottle('cruise')).toEqual({ ok: false, reason: 'notInControl' });
    expect(s.toys.platform.status).toBe('stowing');
    expect(s.jacuzzi).toMatchObject({ safeMode: true, bubbles: false });
    s.setBubbles(true);
    expect(y.getState().jacuzzi.bubbles).toBe(false);
    s.setLight('salon', { brightness: 10 });
    expect(y.getState().lights.salon.brightness).toBe(10);
    expect(s.applyScene('privacy')).toEqual({ ok: true });
  });

  it('weather offer times out to captain via tick', () => {
    const y = createYachtStore();
    y.getState().demo.weatherWarning();
    for (let i = 0; i < 30; i++) y.getState().tick(1);
    expect(y.getState().control).toMatchObject({ state: 'captain', reason: 'timeout' });
    // капитан продолжает вести яхту — ход не обнуляется из-за смены управляющего
    expect(y.getState().helm.speed).toBeGreaterThan(0);
  });

  it('scene speed applies only when owner steers', () => {
    const y = createYachtStore();
    y.getState().handover();
    y.getState().applyScene('sunset');
    expect(y.getState().scene).toBe('sunset');
    expect(y.getState().helm.targetSpeed).toBe(6); // не изменилась сценой
  });

  it('autopilot to anchorage ends at anchor', () => {
    const y = createYachtStore();
    y.getState().goToAnchorage();
    for (let i = 0; i < 60; i++) y.getState().tick(1);
    expect(y.getState().helm.mode).toBe('anchored');
    expect(y.getState().autopilot).toBeNull();
  });
});
