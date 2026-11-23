import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { IonContent, IonItem, IonLabel, IonList, IonNote, IonPage, IonSegment, IonSegmentButton, IonText, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { filterItems, getRestaurant, loyaltyText, menuOf } from '@tib/kiosk-core';
import { openItem, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { DishThumb } from '../media';
import { CartFooter, Header, useDietLine } from './parts';

export default function Menu() {
  const { id } = useParams<{ id: string }>();
  const t = useT();
  const r = getRestaurant(id!);
  const filter = useKiosk((s) => s.filter);
  const diet = useDietLine();
  const [cat, setCat] = useState(r.categories[0]!.id);
  // HIG: цвет бренда становится tint-цветом экрана ресторана
  useIonViewWillEnter(() => setTint(r.brandColor));
  const items = filterItems(menuOf(r.id), filter).filter((i) => i.categoryId === cat);

  return (
    <IonPage>
      <Header title={r.name}>
        {r.categories.length > 1 && (
          <IonToolbar>
            <IonSegment value={cat} onIonChange={(e) => setCat(String(e.detail.value))}>
              {r.categories.map((c) => (
                <IonSegmentButton key={c.id} value={c.id}>
                  <IonLabel>{t(c.name)}</IonLabel>
                </IonSegmentButton>
              ))}
            </IonSegment>
          </IonToolbar>
        )}
      </Header>
      <IonContent color="light">
        {r.loyalty && (
          <IonText color="medium">
            <p className="ion-padding-horizontal" style={{ marginTop: 20 }}>★ {t(loyaltyText(r.loyalty))}</p>
          </IonText>
        )}
        <IonList inset>
          {items.length === 0 && (
            <IonItem>
              <IonLabel>{t('nothingMatches')}</IonLabel>
            </IonItem>
          )}
          {items.map((item) => (
            <IonItem key={item.id} button={item.available} detail={item.available} disabled={!item.available} onClick={() => item.available && openItem(item.id)}>
              <DishThumb item={item} size={104} />
              <IonLabel className="ion-text-wrap">
                <h2 style={{ fontSize: 20, fontWeight: 600 }}>{t(item.name)}</h2>
                <p>{t(item.description)}</p>
                <p style={{ fontSize: 13 }}>{diet(item.tags, item.allergens)}</p>
              </IonLabel>
              <IonNote slot="end" style={{ fontSize: 18 }}>{item.available ? rub(item.price) : t('soldOut')}</IonNote>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
      <CartFooter />
    </IonPage>
  );
}
