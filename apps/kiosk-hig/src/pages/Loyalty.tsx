import { useState } from 'react';
import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonPage, IonText, IonToggle, useIonViewWillEnter } from '@ionic/react';
import { backspaceOutline, qrCodeOutline } from 'ionicons/icons';
import { computeTotals, type LoyaltyQuote, type RestaurantGroup } from '@tib/kiosk-core';
import { findByPhone, formatPhone, go, kiosk, rub, scanQrDemo, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { BrandHeader, Header, LargeTitle, Qty } from './parts';

/** Экранная цифровая клавиатура из системных кнопок (системная клавиатура на киоске недоступна). */
function Keypad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {keys.map((k, i) =>
        k ? (
          <IonButton
            key={i}
            color="light"
            size="large"
            style={{ height: 68, fontSize: 28, margin: 0 }}
            aria-label={k === '⌫' ? 'Стереть' : k}
            onClick={() => onChange(k === '⌫' ? value.slice(0, -1) : (value + k).slice(0, 10))}
          >
            {k === '⌫' ? <IonIcon icon={backspaceOutline} /> : k}
          </IonButton>
        ) : (
          <span key={i} />
        ),
      )}
    </div>
  );
}

export default function Loyalty() {
  const t = useT();
  const [digits, setDigits] = useState('');
  const cart = useKiosk((s) => s.cart);
  const guest = useKiosk((s) => s.guest);
  const applied = useKiosk((s) => s.applied);
  const k = kiosk.getState();
  useIonViewWillEnter(() => setTint(null));
  const totals = computeTotals(cart, guest, applied);

  const rows = (g: RestaurantGroup & { loyalty: LoyaltyQuote }) => {
    const p = g.restaurant.loyalty;
    const q = g.loyalty;
    const on = applied.some((a) => a.restaurantId === g.restaurant.id);
    const current = applied.find((a) => a.restaurantId === g.restaurant.id);
    if (!p)
      return (
        <IonItem>
          <IonLabel color="medium">{t('noProgram')}</IonLabel>
        </IonItem>
      );
    if (!q.member)
      return (
        <IonItem>
          <IonLabel>
            {t(p.name)}
            <p>{t('notMember')}</p>
          </IonLabel>
        </IonItem>
      );
    const balance = p.kind === 'points' ? `${q.balance} ${t('points')}` : p.kind === 'stamps' ? `${q.balance}/${p.needed} ${t('stamps')}` : `−${p.percent}%`;
    const earn = q.earn > 0 ? `${t('willEarn')}: +${q.earn} ${p.kind === 'stamps' ? t('stamps') : t('points')}` : '';
    return (
      <>
        <IonItem>
          <IonToggle checked={on} disabled={!q.applicable} onIonChange={(e) => k.setApplied(g.restaurant.id, e.detail.checked)}>
            <IonLabel>
              {t(p.name)} <IonText color="medium">· {balance}</IonText>
              <p>{q.applicable ? earn : t(q.reason ?? 'noBalance')}</p>
            </IonLabel>
          </IonToggle>
        </IonItem>
        {on && p.kind === 'points' && (
          <IonItem>
            <IonLabel>
              {t('spendPoints')}
              <p>{t('upToPoints')} {q.maxPoints}</p>
            </IonLabel>
            <div slot="end">
              <Qty
                value={current?.pointsToSpend ?? q.maxPoints ?? 0}
                min={0}
                max={q.maxPoints ?? 0}
                onChange={(v) => k.setApplied(g.restaurant.id, true, v)}
                label={t('spendPoints')}
              />
            </div>
          </IonItem>
        )}
        {on && q.discount > 0 && (
          <IonItem>
            <IonLabel>{t('discount')}</IonLabel>
            <IonNote slot="end">−{rub(q.discount)}</IonNote>
          </IonItem>
        )}
      </>
    );
  };

  return (
    <IonPage>
      <Header title={t('loyalty')} />
      <IonContent fullscreen color="light">
        <LargeTitle title={t('loyalty')} />
        {!guest ? (
          <div className="ion-padding">
            <IonText color="medium">
              <p style={{ fontSize: 19, marginTop: 0 }}>{t('loyaltyLead')}</p>
            </IonText>
            <IonList inset style={{ margin: '0 0 16px' }}>
              <IonItem>
                <IonLabel>
                  <p>{t('phone')}</p>
                  <h1 style={{ fontSize: 34, fontWeight: 600, letterSpacing: 0.5 }} aria-live="polite">{formatPhone(digits)}</h1>
                </IonLabel>
              </IonItem>
            </IonList>
            <Keypad value={digits} onChange={setDigits} />
            <IonButton expand="block" shape="round" size="large" style={{ marginTop: 16 }} disabled={digits.length < 10} onClick={() => findByPhone(digits)}>
              {t('find')}
            </IonButton>
            <IonText color="medium">
              <p style={{ textAlign: 'center', fontSize: 14 }}>{t('demoHint')}</p>
            </IonText>
            <IonButton expand="block" fill="outline" shape="round" onClick={scanQrDemo}>
              <IonIcon slot="start" icon={qrCodeOutline} />
              {t('scanQr')}
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={() => go('payment')}>{t('skip')}</IonButton>
          </div>
        ) : (
          <>
            <IonList inset>
              <IonItem>
                <IonLabel>
                  <h2 style={{ fontSize: 22, fontWeight: 600 }}>{t('hello')}, {guest.name}!</h2>
                </IonLabel>
                <IonButton slot="end" fill="clear" onClick={() => k.forgetGuest()}>{t('signOut')}</IonButton>
              </IonItem>
            </IonList>
            {totals.groups.map((g) => (
              <IonList inset key={g.restaurant.id}>
                <IonListHeader>
                  <BrandHeader id={g.restaurant.id} />
                </IonListHeader>
                {rows(g)}
              </IonList>
            ))}
            <IonList inset>
              <IonItem>
                <IonLabel>{t('subtotal')}</IonLabel>
                <IonNote slot="end">{rub(totals.subtotal)}</IonNote>
              </IonItem>
              {totals.discount > 0 && (
                <IonItem>
                  <IonLabel>{t('discount')}</IonLabel>
                  <IonNote slot="end">−{rub(totals.discount)}</IonNote>
                </IonItem>
              )}
              <IonItem>
                <IonLabel>{t('total')}</IonLabel>
                <IonNote slot="end" color="dark" style={{ fontSize: 20, fontWeight: 600 }}>{rub(totals.total)}</IonNote>
              </IonItem>
            </IonList>
            <div className="ion-padding">
              <IonButton expand="block" shape="round" size="large" onClick={() => go('payment')}>
                {t('toPayment')} · {rub(totals.total)}
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
