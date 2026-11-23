import { App, View } from 'framework7-react';
import { ScreenFrame } from '@tib/react';
import { isBoardScreen, registerUi, useKioskShell, useT } from '@tib/kiosk-app';
import { f7Adapter } from '@tib/kiosk-app/f7';

registerUi(f7Adapter);
import { A11yPanel } from './pages/A11yPanel';
import { ItemPopup } from './pages/ItemPopup';
import { routes } from './routes';
import BoardApp from './pages/Board';

/** Seed-цвет фудкорта: M3 строит из него всю тональную палитру. */
export const BASE_TINT = '#006A6A';

function Kiosk() {
  const { density, lowMode } = useKioskShell(BASE_TINT);
  const t = useT();
  return (
    <ScreenFrame
      width={1080}
      height={1920}
      density={density}
      lowMode={lowMode}
      background="#dfe5e4"
      lowBanner={<div style={{ color: '#16302f', font: '600 56px/1.2 "Roboto Flex", Roboto, sans-serif', textAlign: 'center', padding: 48 }}>{t('appName')}<br /><span style={{ fontSize: 36, opacity: 0.7 }}>{t('lowBanner')} ↓</span></div>}
    >
      <App theme="md" name="Фудкорт" darkMode={false} colors={{ primary: BASE_TINT }} routes={routes}>
        <A11yPanel />
        <ItemPopup />
        <View main url="/" />
      </App>
    </ScreenFrame>
  );
}

export default function Root() {
  return isBoardScreen() ? <BoardApp /> : <Kiosk />;
}
