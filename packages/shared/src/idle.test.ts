import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createIdleTimer } from './idle';

describe('idle timer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('warns, then resets', () => {
    const onWarn = vi.fn();
    const onReset = vi.fn();
    const t = createIdleTimer({ warnAfterMs: 60_000, resetAfterMs: 20_000, onWarn, onReset });
    vi.advanceTimersByTime(59_999);
    expect(onWarn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onWarn).toHaveBeenCalledOnce();
    expect(t.warning).toBe(true);
    vi.advanceTimersByTime(20_000);
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('activity during warning cancels reset', () => {
    const onReset = vi.fn();
    const t = createIdleTimer({ warnAfterMs: 1000, resetAfterMs: 1000, onWarn: () => {}, onReset });
    vi.advanceTimersByTime(1500);
    t.activity();
    expect(t.warning).toBe(false);
    vi.advanceTimersByTime(1500);
    expect(onReset).not.toHaveBeenCalled();
  });
});
