import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonSegment, IonSegmentButton, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import type { Lang } from '@tib/shared';
import { kiosk, useKiosk, useT } from '@tib/kiosk-app';

/** Sheet настроек доступности: открывается с любого экрана. */
export function A11yModal() {
  const t = useT();
  const a11y = useKiosk((s) => s.a11y);
  const lang = useKiosk((s) => s.lang);
  const { setA11y, setLang } = kiosk.getState();
  const close = () => document.querySelector<HTMLIonModalElement>('#a11y-modal')?.dismiss();
  return (
    <IonModal id="a11y-modal" breakpoints={[0, 0.6]} initialBreakpoint={0.6}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('accessibility')}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={close}>{t('done')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList inset>
          <IonListHeader>{t('language')}</IonListHeader>
          <IonItem>
            <IonSegment value={lang} onIonChange={(e) => setLang(e.detail.value as Lang)}>
              <IonSegmentButton value="ru"><IonLabel>Русский</IonLabel></IonSegmentButton>
              <IonSegmentButton value="en"><IonLabel>English</IonLabel></IonSegmentButton>
            </IonSegment>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonItem>
            <IonToggle checked={a11y.lowMode} onIonChange={(e) => setA11y({ lowMode: e.detail.checked })}>
              <IonLabel>
                {t('lowMode')}
                <p>{t('lowModeHint')}</p>
              </IonLabel>
            </IonToggle>
          </IonItem>
          <IonItem>
            <IonToggle checked={a11y.largeText} onIonChange={(e) => setA11y({ largeText: e.detail.checked })}>{t('largeText')}</IonToggle>
          </IonItem>
          <IonItem>
            <IonToggle checked={a11y.highContrast} onIonChange={(e) => setA11y({ highContrast: e.detail.checked })}>{t('highContrast')}</IonToggle>
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}
