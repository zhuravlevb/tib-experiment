import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useStore, type StoreApi } from 'zustand';

/** Подписка на vanilla-стор из ядра. */
export const useBound = <S, T>(store: StoreApi<S>, selector: (s: S) => T): T => useStore(store, selector);

export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

const useWindowSize = () => {
  const [size, set] = useState({ w: window.innerWidth, h: window.innerHeight });
  useLayoutEffect(() => {
    const on = () => set({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
};

/**
 * Рамка стационарного экрана (киоск 1080×1920, табло 1920×1080).
 * Экран вписывается в окно браузера целиком. Приложение рендерится в логическом
 * разрешении width/density и масштабируется — так компоненты системы получают
 * «киосковые» размеры без переписывания их стилей.
 * lowMode — интерактив только в нижней половине экрана, сверху неинтерактивная шапка.
 */
export function ScreenFrame(p: {
  width: number;
  height: number;
  density: number;
  lowMode?: boolean;
  lowBanner?: ReactNode;
  background?: string;
  children: ReactNode;
}) {
  const { w, h } = useWindowSize();
  const fit = Math.min(w / p.width, h / p.height);
  const appTop = p.lowMode ? p.height / 2 : 0;
  const appH = p.lowMode ? p.height / 2 : p.height;
  return (
    <div style={{ position: 'fixed', inset: 0, background: p.background ?? '#111', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: p.width,
          height: p.height,
          left: (w - p.width * fit) / 2,
          top: (h - p.height * fit) / 2,
          transform: `scale(${fit})`,
          transformOrigin: '0 0',
          overflow: 'hidden',
        }}
      >
        {p.lowMode && (
          <div aria-hidden style={{ position: 'absolute', inset: `0 0 ${appH}px 0`, display: 'grid', placeItems: 'center' }}>
            {p.lowBanner}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: appTop,
            left: 0,
            width: p.width / p.density,
            height: appH / p.density,
            transform: `scale(${p.density})`,
            transformOrigin: '0 0',
            overflow: 'hidden',
          }}
        >
          {p.children}
        </div>
      </div>
    </div>
  );
}

/**
 * Рамка телефона для пульта яхты. На десктопе — 390×844 по центру, без масштабирования
 * (ползунки систем считают координаты без учёта transform). На узком экране — во весь экран.
 */
export function PhoneFrame(p: { children: ReactNode; hint?: ReactNode }) {
  const { w, h } = useWindowSize();
  const full = w < 500 || h < 700;
  if (full) return <div style={{ position: 'fixed', inset: 0 }}>{p.children}</div>;
  const ph = Math.min(844, h - 64);
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0b0d10', display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
        <div
          style={{
            position: 'relative',
            width: 390,
            height: ph,
            borderRadius: 48,
            overflow: 'hidden',
            boxShadow: '0 0 0 10px #1c1f24, 0 30px 80px rgba(0,0,0,.6)',
            transform: 'translateZ(0)', // fixed-элементы систем позиционируются внутри рамки
          }}
        >
          {p.children}
        </div>
        {p.hint && <div style={{ color: '#8a9099', font: '13px system-ui', textAlign: 'center', maxWidth: 390 }}>{p.hint}</div>}
      </div>
    </div>
  );
}

/** Долгое нажатие (для скрытой демо-панели). */
export function useLongPress(onLong: () => void, ms = 700) {
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const start = () => {
    t.current = setTimeout(onLong, ms);
  };
  const cancel = () => clearTimeout(t.current);
  return { onPointerDown: start, onPointerUp: cancel, onPointerLeave: cancel, onContextMenu: (e: { preventDefault(): void }) => e.preventDefault() };
}
