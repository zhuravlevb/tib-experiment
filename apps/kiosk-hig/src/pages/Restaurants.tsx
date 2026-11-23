import { useState } from 'react';
import { IonBadge, IonContent, IonItem, IonLabel, IonList, IonNote, IonPage, IonSearchbar, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { filterItems, getRestaurant, matchingCount, menu, restaurants } from '@tib/kiosk-core';
import { go, openItem, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { DishThumb, LogoThumb } from '../media';
import { CartFooter, Header, LargeTitle, openFilters } from './parts';

export default function Restaurants() {
  const t = useT();
  const filter = useKiosk((s) => s.filter);
  const [query, setQuery] = useState('');
  useIonViewWillEnter(() => setTint(null));
  const results = query ? filterItems(menu, { ...filter, query }) : [];
  const nFilters = (filter.requireTags?.length ?? 0) + (filter.excludeAllergens?.length ?? 0);

  return (
    <IonPage>
      <Header title={t('restaurants')} />
      <IonContent fullscreen color="light">
        <LargeTitle title={t('restaurants')} />
        <IonToolbar color="light">
          <IonSearchbar placeholder={t('searchAll')} debounce={150} onIonInput={(e) => setQuery(e.detail.value ?? '')} />
        </IonToolbar>
        <IonList inset>
          <IonItem button detail onClick={openFilters}>
            <IonLabel>{t('filters')}</IonLabel>
            {nFilters > 0 && <IonBadge slot="end">{nFilters}</IonBadge>}
          </IonItem>
        </IonList>
        {query ? (
          <IonList inset>
            {results.length === 0 && (
              <IonItem>
                <IonLabel>{t('nothingMatches')}</IonLabel>
              </IonItem>
            )}
            {results.map((i) => (
              <IonItem key={i.id} button detail disabled={!i.available} onClick={() => openItem(i.id)}>
                <DishThumb item={i} size={64} />
                <IonLabel>
                  <h2>{t(i.name)}</h2>
                  <p>{getRestaurant(i.restaurantId).name}</p>
                </IonLabel>
                <IonNote slot="end">{rub(i.price)}</IonNote>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <IonList inset>
            {restaurants.map((r) => {
              const n = matchingCount(r.id, filter);
              return (
                <IonItem key={r.id} button detail onClick={() => go('menu', r.id)} style={{ opacity: nFilters && n === 0 ? 0.45 : 1 }}>
                  <LogoThumb id={r.id} size={64} />
                  <IonLabel>
                    <h2 style={{ fontSize: 21, fontWeight: 600 }}>{r.name}</h2>
                    <p>{t(r.cuisine)}</p>
                    {r.loyalty && <p>★ {t('loyaltyBadge')}</p>}
                  </IonLabel>
                  {nFilters > 0 && <IonNote slot="end">{n} {t('matching')}</IonNote>}
                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
      <CartFooter />
    </IonPage>
  );
}
