/** Адаптер Ionic (iOS mode) для HIG-версии киоска. */
import { useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import { alertController, loadingController, toastController } from '@ionic/core/components';
import { defineCustomElement as defineAlert } from '@ionic/core/components/ion-alert.js';
import { defineCustomElement as defineLoading } from '@ionic/core/components/ion-loading.js';
import { defineCustomElement as defineToast } from '@ionic/core/components/ion-toast.js';
import { registerUi, type UiAdapter } from './index';

defineAlert();
defineLoading();
defineToast();

/** Тон цвета: смешивание с чёрным (shade) или белым (tint), как в генераторе цветов Ionic. */
function mix(hex: string, to: number, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.round(c + (to - c) * amount));
  return { hex: '#' + ch.map((c) => c.toString(16).padStart(2, '0')).join(''), rgb: ch.join(', ') };
}

function setPrimary(color: string) {
  const s = document.documentElement.style;
  const base = mix(color, 0, 0);
  s.setProperty('--ion-color-primary', base.hex);
  s.setProperty('--ion-color-primary-rgb', base.rgb);
  s.setProperty('--ion-color-primary-contrast', '#ffffff');
  s.setProperty('--ion-color-primary-contrast-rgb', '255, 255, 255');
  s.setProperty('--ion-color-primary-shade', mix(color, 0, 0.12).hex);
  s.setProperty('--ion-color-primary-tint', mix(color, 255, 0.1).hex);
}

/**
 * Регистрирует адаптер. Вызывается в компоненте внутри IonReactRouter,
 * потому что навигации нужен роутер Ionic.
 */
export function useIonicAdapter() {
  const router = useIonRouter();
  useEffect(() => {
    const adapter: UiAdapter = {
      navigate(path, mode) {
        if (mode === 'root') router.push(path, path === '/' ? 'none' : 'root', 'replace');
        else router.push(path, 'forward', 'push');
      },
      back(path) {
        router.push(path, 'back', 'pop');
        return true;
      },
      currentPath: () => router.routeInfo.pathname,
      closeOverlays() {
        document.querySelectorAll<HTMLElement & { dismiss?: () => Promise<boolean> }>('ion-alert, ion-modal, ion-action-sheet, ion-popover, ion-loading').forEach((el) => el.dismiss?.());
      },
      alert({ title, text, buttons, onDismiss }) {
        let el: HTMLIonAlertElement | null = null;
        alertController
          .create({
            header: title,
            message: text,
            buttons: buttons.map((b) => ({
              text: b.text,
              role: b.role === 'cancel' ? 'cancel' : b.role === 'destructive' ? 'destructive' : undefined,
              cssClass: b.role === 'primary' ? 'alert-button-confirm' : undefined,
              handler: b.onClick,
            })),
          })
          .then((a) => {
            el = a;
            a.onDidDismiss().then(() => onDismiss?.());
            return a.present();
          });
        return {
          setText: (t) => {
            if (el) el.message = t;
          },
          close: () => void el?.dismiss(),
        };
      },
      prompt({ title, label, value, ok, cancel, onOk }) {
        alertController
          .create({
            header: title,
            inputs: [{ name: 'v', type: 'tel', value, placeholder: label }],
            buttons: [
              { text: cancel, role: 'cancel' },
              { text: ok, handler: (d: { v: string }) => onOk(d.v) },
            ],
          })
          .then((a) => a.present());
      },
      toast(text) {
        toastController.create({ message: text, duration: 1800, position: 'top' }).then((t) => t.present());
      },
      loading(text) {
        const p = loadingController.create({ message: text }).then((l) => (l.present(), l));
        return () => void p.then((l) => l.dismiss());
      },
      applyTheme(tint, highContrast) {
        setPrimary(tint);
        document.documentElement.classList.toggle('ion-palette-high-contrast', highContrast);
      },
    };
    registerUi(adapter);
  }, [router]);
}
