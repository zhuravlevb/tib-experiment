/**
 * Поведение пульта, общее для M3 и HIG: стор, тик симуляции, тексты и реакция
 * на смену состояния контроля. Разметки нет: что показать (диалог, алерт, тост),
 * решает приложение своей системы.
 */
import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { formatRub, tr, type LText } from '@tib/shared';
import { createYachtStore, Y, type ControlState, type Notice, type YachtState, type YKey } from '@tib/yacht-core';
import { useInterval } from '@tib/react';

export const yacht = createYachtStore();
export const useYacht = <T,>(sel: (s: YachtState) => T): T => useStore(yacht, sel);

/** Интерфейс пульта на русском. */
export const t = (k: YKey | LText): string => tr(typeof k === 'string' ? Y[k] : k, 'ru');
export const rub = formatRub;

const TICK = 0.5;
/** Симуляция хода, джакузи, кухни и техники. */
export const useTicker = () => useInterval(() => yacht.getState().tick(TICK), TICK * 1000);

export interface TransitionHandlers {
  /** Погодное предложение появилось (с текущим отсчётом) */
  onOfferOpen(): void;
  /** Предложение закрылось: передали, отказались или истёк таймер */
  onOfferClose(to: ControlState): void;
  onStorm(): void;
  onNotice(n: Notice): void;
}

/** Вызывает обработчики на переходах состояния контроля и на новые уведомления. */
export function useTransitions(h: TransitionHandlers) {
  const ref = useRef(h);
  ref.current = h;
  useEffect(() => {
    let prev = yacht.getState().control.state;
    const seen = new Set(yacht.getState().notices.map((n) => n.id));
    return yacht.subscribe((s) => {
      const cur = s.control.state;
      if (cur !== prev) {
        if (cur === 'offered') ref.current.onOfferOpen();
        if (prev === 'offered') ref.current.onOfferClose(cur);
        if (cur === 'emergency') ref.current.onStorm();
        prev = cur;
      }
      for (const n of s.notices) {
        if (!seen.has(n.id)) {
          seen.add(n.id);
          ref.current.onNotice(n);
          yacht.getState().dismissNotice(n.id);
        }
      }
    });
  }, []);
}

export const controlLabel = (s: ControlState) =>
  s === 'owner' || s === 'offered' ? t('youControl') : s === 'returnRequested' ? t('returnPending') : t('captainControls');
