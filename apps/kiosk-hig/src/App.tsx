import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';
import { ScreenFrame } from '@tib/react';
import { isBoardScreen, useKioskShell, useT } from '@tib/kiosk-app';
import { useIonicAdapter } from '@tib/kiosk-app/ionic';
import { A11yModal } from './pages/A11yModal';
import { FiltersModal } from './pages/FiltersModal';
import { ItemModal } from './pages/ItemModal';
import Attract from './pages/Attract';
import Start from './pages/Start';
import Restaurants from './pages/Restaurants';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Loyalty from './pages/Loyalty';
import Payment from './pages/Payment';
import Done from './pages/Done';
import BoardApp from './pages/Board';

/** Tint-цвет приложения (HIG: один акцентный цвет для интерактивных элементов). */
export const BASE_TINT = '#007C80';

function Routes() {
  useIonicAdapter();
  return (
    <>
      <IonRouterOutlet>
        <Route path="/" element={<Attract />} />
        <Route path="/start/" element={<Start />} />
        <Route path="/restaurants/" element={<Restaurants />} />
        <Route path="/menu/:id/" element={<Menu />} />
        <Route path="/cart/" element={<Cart />} />
        <Route path="/loyalty/" element={<Loyalty />} />
        <Route path="/payment/" element={<Payment />} />
        <Route path="/done/" element={<Done />} />
      </IonRouterOutlet>
      <A11yModal />
      <FiltersModal />
      <ItemModal />
    </>
  );
}

function Kiosk() {
  const { density, lowMode } = useKioskShell(BASE_TINT);
  const t = useT();
  return (
    <ScreenFrame
      width={1080}
      height={1920}
      density={density}
      lowMode={lowMode}
      background="#e5e5ea"
      lowBanner={<div style={{ color: '#1c1c1e', font: '700 56px/1.2 -apple-system, system-ui, sans-serif', textAlign: 'center', padding: 48 }}>{t('appName')}<br /><span style={{ fontSize: 36, fontWeight: 400, color: '#636366' }}>{t('lowBanner')} ↓</span></div>}
    >
      <IonApp>
        <IonReactHashRouter>
          <Routes />
        </IonReactHashRouter>
      </IonApp>
    </ScreenFrame>
  );
}

export default function Root() {
  return isBoardScreen() ? <BoardApp /> : <Kiosk />;
}
