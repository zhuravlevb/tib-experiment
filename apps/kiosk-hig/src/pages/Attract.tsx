import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonSegment, IonSegmentButton, IonText, useIonViewWillEnter } from '@ionic/react';
import { textOutline } from 'ionicons/icons';
import type { Lang } from '@tib/shared';
import { restaurants } from '@tib/kiosk-core';
import { go, kiosk, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { LogoThumb } from '../media';
import { openA11y } from './parts';

/** Заставка: касание в любом месте начинает заказ. */
export default function Attract() {
  const t = useT();
  const lang = useKiosk((s) => s.lang);
  useIonViewWillEnter(() => setTint(null));
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <IonPage>
      <IonContent color="light">
        <div onClick={() => go('start')} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 0 24px' }}>
          <div className="ion-padding-horizontal">
            <h1 style={{ fontSize: 44, fontWeight: 700, letterSpacing: -0.6, margin: '0 0 8px' }}>{t('appName')}</h1>
            <IonText color="medium">
              <p style={{ fontSize: 21, margin: 0 }}>{t('attractLead')}</p>
            </IonText>
          </div>
          <IonList inset>
            {restaurants.map((r) => (
              <IonItem key={r.id} lines="inset">
                <LogoThumb id={r.id} size={52} />
                <IonLabel>
                  <h2 style={{ fontWeight: 600 }}>{r.name}</h2>
                  <p>{t(r.cuisine)}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
          <div className="ion-padding-horizontal">
            <IonButton expand="block" shape="round" size="large" style={{ height: 72, fontSize: 24 }}>
              {t('startOrder')}
            </IonButton>
            <IonText color="medium">
              <p style={{ textAlign: 'center', fontSize: 17 }}>{t('tapToStart')}</p>
            </IonText>
            <div onClick={stop} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <IonSegment value={lang} onIonChange={(e) => kiosk.getState().setLang(e.detail.value as Lang)} style={{ flex: 1 }}>
                <IonSegmentButton value="ru"><IonLabel>Русский</IonLabel></IonSegmentButton>
                <IonSegmentButton value="en"><IonLabel>English</IonLabel></IonSegmentButton>
              </IonSegment>
              <IonButton fill="clear" onClick={openA11y}>
                <IonIcon slot="start" icon={textOutline} />
                {t('accessibility')}
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
