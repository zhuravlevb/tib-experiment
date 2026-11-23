import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSegment, IonSegmentButton, IonToggle, useIonViewWillEnter } from '@ionic/react';
import { bagHandle, restaurant } from 'ionicons/icons';
import type { Lang } from '@tib/shared';
import type { DineMode } from '@tib/kiosk-core';
import { go, kiosk, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { Header, LargeTitle } from './parts';

export default function Start() {
  const t = useT();
  const lang = useKiosk((s) => s.lang);
  const a11y = useKiosk((s) => s.a11y);
  const k = kiosk.getState();
  useIonViewWillEnter(() => setTint(null));
  const choose = (m: DineMode) => {
    k.setDineMode(m);
    go('restaurants');
  };
  return (
    <IonPage>
      <Header title={t('whereEat')} />
      <IonContent fullscreen color="light">
        <LargeTitle title={t('whereEat')} />
        <IonList inset>
          <IonItem button detail onClick={() => choose('here')}>
            <IonIcon slot="start" icon={restaurant} color="primary" style={{ fontSize: 36 }} />
            <IonLabel>
              <h2 style={{ fontSize: 24, fontWeight: 600 }}>{t('here')}</h2>
              <p>{t('hereHint')}</p>
            </IonLabel>
          </IonItem>
          <IonItem button detail onClick={() => choose('takeaway')}>
            <IonIcon slot="start" icon={bagHandle} color="primary" style={{ fontSize: 36 }} />
            <IonLabel>
              <h2 style={{ fontSize: 24, fontWeight: 600 }}>{t('takeaway')}</h2>
              <p>{t('takeawayHint')}</p>
            </IonLabel>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonListHeader>{t('language')}</IonListHeader>
          <IonItem>
            <IonSegment value={lang} onIonChange={(e) => k.setLang(e.detail.value as Lang)}>
              <IonSegmentButton value="ru"><IonLabel>Русский</IonLabel></IonSegmentButton>
              <IonSegmentButton value="en"><IonLabel>English</IonLabel></IonSegmentButton>
            </IonSegment>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonListHeader>{t('accessibility')}</IonListHeader>
          <IonItem>
            <IonToggle checked={a11y.lowMode} onIonChange={(e) => k.setA11y({ lowMode: e.detail.checked })}>
              <IonLabel>
                {t('lowMode')}
                <p>{t('lowModeHint')}</p>
              </IonLabel>
            </IonToggle>
          </IonItem>
          <IonItem>
            <IonToggle checked={a11y.largeText} onIonChange={(e) => k.setA11y({ largeText: e.detail.checked })}>{t('largeText')}</IonToggle>
          </IonItem>
          <IonItem>
            <IonToggle checked={a11y.highContrast} onIonChange={(e) => k.setA11y({ highContrast: e.detail.checked })}>{t('highContrast')}</IonToggle>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
}
