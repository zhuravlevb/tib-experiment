import { IonButton, IonContent, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel, IonList, IonListHeader, IonNote, IonPage, useIonViewWillEnter } from '@ionic/react';
import { computeTotals, getItem, linePrice, type CartLine, type OptionGroup } from '@tib/kiosk-core';
import { backTo, go, kiosk, openItem, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { DishThumb } from '../media';
import { BrandHeader, Header, LargeTitle, Qty } from './parts';

export default function Cart() {
  const t = useT();
  const cart = useKiosk((s) => s.cart);
  useIonViewWillEnter(() => setTint(null));
  const totals = computeTotals(cart, null, []);
  const summary = (line: CartLine) => {
    const item = getItem(line.itemId);
    const names = (groups: OptionGroup[], sel: CartLine['selections']) =>
      groups.flatMap((g) => (sel[g.id] ?? []).map((id) => g.options.find((o) => o.id === id)).filter(Boolean).map((o) => t(o!.name)));
    const parts = names(item.groups, line.selections);
    if (line.combo && item.combo) parts.push(`${t('makeCombo')}: ${names(item.combo.groups, line.comboSelections).join(', ')}`);
    return parts.join(', ');
  };

  return (
    <IonPage>
      <Header title={t('cart')} />
      <IonContent fullscreen color="light">
        <LargeTitle title={t('cart')} />
        {cart.length === 0 && <p className="ion-padding">{t('cartEmpty')}</p>}
        {totals.groups.map((g) => (
          <IonList inset key={g.restaurant.id}>
            <IonListHeader>
              <BrandHeader id={g.restaurant.id} after={rub(g.subtotal)} />
            </IonListHeader>
            {g.lines.map((line) => (
              <IonItemSliding key={line.id}>
                <IonItem>
                  <DishThumb item={getItem(line.itemId)} size={64} />
                  <IonLabel className="ion-text-wrap">
                    <h2>{t(getItem(line.itemId).name)}</h2>
                    <p>{summary(line)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
                      <Qty value={line.qty} min={0} onChange={(v) => kiosk.getState().setQty(line.id, v)} label={t('qty')} />
                      <IonButton fill="clear" size="small" onClick={() => openItem(line.itemId, line.id)}>{t('edit')}</IonButton>
                    </div>
                  </IonLabel>
                  <IonNote slot="end">{rub(linePrice(line))}</IonNote>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger" expandable onClick={() => kiosk.getState().setQty(line.id, 0)}>
                    {t('remove')}
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        ))}
        <IonList inset>
          <IonItem>
            <IonLabel>{t('total')}</IonLabel>
            <IonNote slot="end" color="dark" style={{ fontSize: 20, fontWeight: 600 }}>{rub(totals.total)}</IonNote>
          </IonItem>
        </IonList>
        <div className="ion-padding">
          <IonButton expand="block" shape="round" size="large" disabled={!cart.length} onClick={() => go('loyalty')}>
            {t('checkout')} · {rub(totals.total)}
          </IonButton>
          <IonButton expand="block" fill="clear" onClick={() => backTo('restaurants')}>
            {t('addMore')}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
