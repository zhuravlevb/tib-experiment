import { useState } from 'react';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonNote, IonProgressBar, IonRadio, IonRadioGroup, IonText, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import { restaurant, wine } from 'ionicons/icons';
import { chefMenu, CLIMATE_ZONE, DELIVERY_ZONE, FOOD_FLOW, FOOD_STATUS, TOY_BLOCK, TOY_LABEL, TOY_STATUS, toyBlock, type ClimateZone, type DeliveryZone, type ToyId } from '@tib/yacht-core';
import { t, useYacht, yacht } from '@tib/yacht-app';
import { Header, Qty } from './parts';

const deg = (v: number) => `${v}°`;

function FoodModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [zone, setZone] = useState<DeliveryZone>('sundeck');
  const [note, setNote] = useState('');
  const items = Object.entries(qty).filter(([, n]) => n > 0).map(([itemId, n]) => ({ itemId, qty: n }));
  const send = () => {
    yacht.getState().orderFood(items, zone, note);
    setQty({});
    setNote('');
    onClose();
  };
  return (
    <IonModal isOpen={open} onDidDismiss={onClose} breakpoints={[0, 0.92]} initialBreakpoint={0.92}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onClose}>{t('cancel')}</IonButton>
          </IonButtons>
          <IonTitle>{t('food')}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong disabled={!items.length} onClick={send}>
              {t('send')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList inset>
          {chefMenu.map((c) => (
            <IonItem key={c.id}>
              <IonIcon slot="start" icon={c.kind === 'food' ? restaurant : wine} color="medium" />
              <IonLabel>{c.name.ru}</IonLabel>
              <div slot="end">
                <Qty value={qty[c.id] ?? 0} min={0} max={9} label={c.name.ru} onChange={(v) => setQty((q) => ({ ...q, [c.id]: v }))} />
              </div>
            </IonItem>
          ))}
        </IonList>
        <IonList inset>
          <IonListHeader>
            <IonLabel>{t('deliverTo')}</IonLabel>
          </IonListHeader>
          <IonRadioGroup value={zone} onIonChange={(e) => setZone(e.detail.value)}>
            {(Object.keys(DELIVERY_ZONE) as DeliveryZone[]).map((z) => (
              <IonItem key={z}>
                <IonRadio value={z} justify="space-between">
                  {DELIVERY_ZONE[z].ru}
                </IonRadio>
              </IonItem>
            ))}
          </IonRadioGroup>
        </IonList>
        <IonList inset>
          <IonItem>
            <IonInput label={t('note')} labelPlacement="stacked" placeholder={t('notePlaceholder')} value={note} onIonInput={(e) => setNote(String(e.detail.value ?? ''))} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  );
}

export function Service() {
  const [foodOpen, setFoodOpen] = useState(false);
  const orders = useYacht((s) => s.orders);
  const jacuzzi = useYacht((s) => s.jacuzzi);
  const climate = useYacht((s) => s.climate);
  const toys = useYacht((s) => s.toys);
  const speed = useYacht((s) => s.helm.speed);
  const weather = useYacht((s) => s.weather);
  const control = useYacht((s) => s.control);
  const y = yacht.getState();
  const block = toyBlock({ speed, weather, control });

  return (
    <>
      <Header title={t('service')} />
      <IonContent fullscreen color="light">
        <IonList inset>
          <IonListHeader>
            <IonLabel>{t('food')}</IonLabel>
            <IonButton onClick={() => setFoodOpen(true)}>{t('orderFood')}</IonButton>
          </IonListHeader>
          {orders.length === 0 && (
            <IonItem>
              <IonLabel color="medium">{t('nothingOrdered')}</IonLabel>
            </IonItem>
          )}
          {orders.map((o) => (
            <IonItem key={o.id}>
              <IonLabel className="ion-text-wrap">
                <h2>{o.items.map((i) => `${chefMenu.find((c) => c.id === i.itemId)!.name.ru} × ${i.qty}`).join(', ')}</h2>
                <p>
                  {FOOD_STATUS[o.status].ru} · {DELIVERY_ZONE[o.zone].ru}
                  {o.note ? ` · ${o.note}` : ''}
                </p>
                <IonProgressBar value={(FOOD_FLOW.indexOf(o.status) + 1) / FOOD_FLOW.length} style={{ marginTop: 8 }} />
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
        <FoodModal open={foodOpen} onClose={() => setFoodOpen(false)} />

        <IonList inset>
          <IonItem lines="full">
          <div style={{ padding: '12px 0' }}>
            <IonText color="medium">
              <div style={{ fontSize: 13 }}>
                {t('jacuzzi')} · {t('water')}
              </div>
            </IonText>
            <div style={{ fontSize: 44, fontWeight: 700, color: 'var(--ion-text-color)' }}>
              {jacuzzi.temp.toLocaleString('ru', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°
            </div>
          </div>
          </IonItem>
          <IonItem>
            <IonLabel>{t('target')}</IonLabel>
            <div slot="end">
              <Qty value={jacuzzi.targetTemp} min={30} max={40} format={deg} disabled={jacuzzi.safeMode} label={t('target')} onChange={(v) => y.setJacuzziTemp(v)} />
            </div>
          </IonItem>
          <IonItem>
            <IonToggle checked={jacuzzi.bubbles} disabled={jacuzzi.safeMode} onIonChange={(e) => y.setBubbles(e.detail.checked)}>
              <IonLabel>
                {t('bubbles')}
                {jacuzzi.safeMode && <p>{t('jacuzziClosed')}</p>}
              </IonLabel>
            </IonToggle>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonListHeader>
            <IonLabel>{t('climate')}</IonLabel>
          </IonListHeader>
          {(Object.keys(climate) as ClimateZone[]).map((z) => (
            <IonItem key={z}>
              <IonLabel>{CLIMATE_ZONE[z].ru}</IonLabel>
              <div slot="end">
                <Qty value={climate[z]} min={16} max={28} format={deg} label={CLIMATE_ZONE[z].ru} onChange={(v) => y.setClimate(z, v)} />
              </div>
            </IonItem>
          ))}
        </IonList>

        <IonList inset>
          <IonListHeader>
            <IonLabel>{t('toys')}</IonLabel>
          </IonListHeader>
          {(Object.keys(toys) as ToyId[]).map((id) => {
            const st = toys[id].status;
            const out = st === 'ready' || st === 'preparing';
            return (
              <IonItem key={id}>
                <IonLabel>
                  {TOY_LABEL[id].ru}
                  <p>{TOY_STATUS[st].ru}</p>
                </IonLabel>
                <IonButton slot="end" size="small" fill={out ? 'clear' : 'solid'} shape="round" disabled={!out && !!block} onClick={() => y.toy(id, out ? 'stow' : 'deploy')}>
                  {out ? t('stow') : t('deploy')}
                </IonButton>
              </IonItem>
            );
          })}
        </IonList>
        {block && (
          <IonText color="medium">
            <p className="ion-padding-horizontal" style={{ fontSize: 13, marginTop: -8 }}>{TOY_BLOCK[block].ru}</p>
          </IonText>
        )}
        <IonNote>
          <div style={{ height: 24 }} />
        </IonNote>
      </IonContent>
    </>
  );
}
