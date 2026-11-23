import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonText, useIonViewWillEnter } from '@ionic/react';
import { chatbubbleOutline, printOutline } from 'ionicons/icons';
import { getRestaurant } from '@tib/kiosk-core';
import { boardUrl, resetToAttract, setTint, smsReceipt, toast, useCountdown, useKiosk, useT } from '@tib/kiosk-app';
import { LogoThumb } from '../media';
import { Header } from './parts';

export default function Done() {
  const t = useT();
  const order = useKiosk((s) => s.order);
  useIonViewWillEnter(() => setTint(null));
  const left = useCountdown(30, resetToAttract, !!order);
  return (
    <IonPage>
      <Header title={t('thanks')} back={false} cancel={false} />
      <IonContent color="light">
        {order && (
          <>
            <div style={{ textAlign: 'center', padding: '28px 16px 4px' }}>
              <IonText color="medium">
                <div style={{ fontSize: 20 }}>{t('orderCode')}</div>
              </IonText>
              <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }} aria-live="polite">{order.code}</div>
            </div>
            <IonList inset>
              {order.tickets.map((tk) => {
                const r = getRestaurant(tk.restaurantId);
                return (
                  <IonItem key={tk.restaurantId}>
                    <LogoThumb id={r.id} size={56} />
                    <IonLabel>
                      <h2 style={{ fontSize: 20, fontWeight: 600 }}>{r.name}</h2>
                      <p>{t(r.cuisine)}</p>
                    </IonLabel>
                    <div slot="end" style={{ fontSize: 44, fontWeight: 700 }}>{tk.number}</div>
                  </IonItem>
                );
              })}
            </IonList>
            <IonText color="medium">
              <p className="ion-padding-horizontal" style={{ fontSize: 17 }}>{t('pickupHint')}</p>
            </IonText>
            <div className="ion-padding">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <IonButton fill="outline" shape="round" onClick={smsReceipt}>
                  <IonIcon slot="start" icon={chatbubbleOutline} />
                  {t('sms')}
                </IonButton>
                <IonButton fill="outline" shape="round" onClick={() => toast(t('printed'))}>
                  <IonIcon slot="start" icon={printOutline} />
                  {t('print')}
                </IonButton>
              </div>
              <IonButton expand="block" shape="round" size="large" style={{ marginTop: 16 }} onClick={resetToAttract}>
                {t('done')}
              </IonButton>
              <IonText color="medium">
                <p style={{ textAlign: 'center' }}>{t('returnIn')} {left} {t('sec')}</p>
              </IonText>
              <IonButton expand="block" fill="clear" href={boardUrl()} target="_blank">
                {t('openBoard')} ↗
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
