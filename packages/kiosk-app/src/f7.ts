/** Адаптер Framework7 для M3-версии киоска. */
import { f7, f7ready } from 'framework7-react';
import type { UiAdapter } from './index';

const router = () => f7.views.main?.router;

export const f7Adapter: UiAdapter = {
  navigate(path, mode) {
    router()?.navigate(path, mode === 'root' ? { clearPreviousHistory: true, animate: path !== '/' } : {});
  },
  back(path) {
    const r = router();
    if (!r || !r.history.some((h: string) => h.endsWith(path))) return false;
    r.back(path, { force: true });
    return true;
  },
  currentPath: () => router()?.currentRoute.path ?? '/',
  closeOverlays() {
    f7.dialog.close();
    f7.popup.close();
    f7.sheet.close();
    f7.panel.close();
  },
  alert({ title, text, buttons, onDismiss }) {
    const d = f7.dialog.create({
      title,
      text,
      buttons: buttons.map((b) => ({
        text: b.text,
        strong: b.role === 'primary',
        color: b.role === 'destructive' ? 'red' : undefined,
        onClick: b.onClick,
      })),
      on: { closed: () => onDismiss?.() },
    });
    d.open();
    return {
      setText: (t) => d.$el.find('.dialog-text').text(t),
      close: () => d.close(),
    };
  },
  prompt({ title, label, value, onOk }) {
    f7.dialog.prompt(label, title, onOk, undefined, value);
  },
  toast(text) {
    f7.toast.create({ text, closeTimeout: 1800, position: 'top' }).open();
  },
  loading(text) {
    const d = f7.dialog.preloader(text);
    return () => d.close();
  },
  applyTheme(tint) {
    f7ready((app) => {
      app.setDarkMode(false);
      app.setColorTheme(tint);
    });
  },
};
