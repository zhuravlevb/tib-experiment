/**
 * Таймер простоя для общественного терминала.
 * После warnAfterMs без активности — onWarn (диалог «Вы ещё здесь?»),
 * ещё через resetAfterMs — onReset (сброс сессии). Любая активность сбрасывает отсчёт.
 */
export interface IdleOptions {
  warnAfterMs: number;
  resetAfterMs: number;
  onWarn: () => void;
  onReset: () => void;
}

export interface IdleTimer {
  activity(): void;
  stop(): void;
  readonly warning: boolean;
}

export function createIdleTimer(o: IdleOptions): IdleTimer {
  let warnT: ReturnType<typeof setTimeout> | undefined;
  let resetT: ReturnType<typeof setTimeout> | undefined;
  let warning = false;

  const clear = () => {
    clearTimeout(warnT);
    clearTimeout(resetT);
  };
  const arm = () => {
    clear();
    warning = false;
    warnT = setTimeout(() => {
      warning = true;
      o.onWarn();
      resetT = setTimeout(() => {
        warning = false;
        o.onReset();
      }, o.resetAfterMs);
    }, o.warnAfterMs);
  };
  arm();

  return {
    activity: arm,
    stop: clear,
    get warning() {
      return warning;
    },
  };
}
