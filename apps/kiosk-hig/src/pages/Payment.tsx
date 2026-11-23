import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonRadio, IonRadioGroup, IonSpinner, IonText, useIonViewWillEnter } from '@ionic/react';
import { cardOutline, phonePortraitOutline, qrCodeOutline, wifiOutline } from 'ionicons/icons';
import { computeTotals, type PaymentMethod } from '@tib/kiosk-core';
import { kiosk, payDemo, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { Header } from './parts';

export default function Payment() {
  const t = useT();
  const cart = useKiosk((s) => s.cart);
  const guest = useKiosk((s) => s.guest);
  const applied = useKiosk((s) => s.applied);
  const payment = useKiosk((s) => s.payment);
  useIonViewWillEnter(() => setTint(null));
  const total = computeTotals(cart, guest, applied).total;
  const busy = payment.status === 'processing';

  const methods: { id: PaymentMethod; icon: string; title: string; hint: string }[] = [
    { id: 'card', icon: cardOutline, title: t('card'), hint: t('cardHint') },
    { id: 'sbp', icon: phonePortraitOutline, title: t('sbp'), hint: t('sbpHint') },
  ];

  return (
    <IonPage>
      <Header title={t('payment')} back={!busy} cancel={false} />
      <IonContent color="light">
        <div style={{ textAlign: 'center', padding: '32px 16px 8px' }}>
          <IonText color="medium">
            <div style={{ fontSize: 19 }}>{t('total')}</div>
          </IonText>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>{rub(total)}</div>
        </div>
        <IonList inset>
          <IonRadioGroup value={payment.method} onIonChange={(e) => !busy && kiosk.getState().choosePayment(e.detail.value)}>
            {methods.map((m) => (
              <IonItem key={m.id} disabled={busy}>
                <IonIcon slot="start" icon={m.icon} color="primary" style={{ fontSize: 32 }} />
                <IonRadio value={m.id} justify="space-between">
                  <IonLabel>
                    <h2 style={{ fontSize: 20, fontWeight: 600 }}>{m.title}</h2>
                    <p>{m.hint}</p>
                  </IonLabel>
                </IonRadio>
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonList>
        {payment.method && (
          <div className="ion-padding" style={{ textAlign: 'center' }}>
            {busy ? (
              <>
                <IonSpinner name="lines" style={{ width: 56, height: 56 }} />
                <p style={{ fontSize: 20 }} aria-live="assertive">{t('processing')}</p>
              </>
            ) : (
              <>
                <IonIcon icon={payment.method === 'card' ? wifiOutline : qrCodeOutline} color="medium" style={{ fontSize: payment.method === 'sbp' ? 200 : 110, transform: payment.method === 'card' ? 'rotate(90deg)' : undefined }} />
                <IonButton expand="block" shape="round" size="large" onClick={() => payDemo('success')}>
                  {payment.method === 'card' ? t('tapCardDemo') : t('paidSbpDemo')}
                </IonButton>
                <IonButton expand="block" fill="clear" color="medium" onClick={() => payDemo('declined')}>
                  {t('declineDemo')}
                </IonButton>
              </>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
