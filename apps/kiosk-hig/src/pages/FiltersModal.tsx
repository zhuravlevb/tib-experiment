import { IonButton, IonButtons, IonContent, IonHeader, IonItem, IonList, IonListHeader, IonModal, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import { ALLERGEN_EMOJI, ALLERGEN_LABEL, DIET_EMOJI, DIET_LABEL, type Allergen, type DietTag } from '@tib/kiosk-core';
import { kiosk, useKiosk, useT } from '@tib/kiosk-app';

const DIETS: DietTag[] = ['vegan', 'vegetarian', 'halal', 'spicy'];
const ALLERGENS: Allergen[] = ['gluten', 'dairy', 'nuts', 'egg', 'fish', 'soy', 'sesame'];
const toggleIn = <T,>(list: T[] | undefined, v: T, on: boolean) => (on ? [...(list ?? []).filter((x) => x !== v), v] : (list ?? []).filter((x) => x !== v));

/** HIG: фильтры — отдельный sheet со списком переключателей. */
export function FiltersModal() {
  const t = useT();
  const filter = useKiosk((s) => s.filter);
  const { setFilter } = kiosk.getState();
  const close = () => document.querySelector<HTMLIonModalElement>('#filters-modal')?.dismiss();
  return (
    <IonModal id="filters-modal" breakpoints={[0, 0.9]} initialBreakpoint={0.9}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setFilter({ requireTags: [], excludeAllergens: [] })}>{t('resetFilters')}</IonButton>
          </IonButtons>
          <IonTitle>{t('filters')}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={close}>{t('done')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent color="light">
        <IonList inset>
          <IonListHeader>{t('diet')}</IonListHeader>
          {DIETS.map((d) => (
            <IonItem key={d}>
              <IonToggle checked={!!filter.requireTags?.includes(d)} onIonChange={(e) => setFilter({ requireTags: toggleIn(filter.requireTags, d, e.detail.checked) })}>
                {DIET_EMOJI[d]} {t(DIET_LABEL[d])}
              </IonToggle>
            </IonItem>
          ))}
        </IonList>
        <IonList inset>
          <IonListHeader>{t('withoutAllergens')}</IonListHeader>
          {ALLERGENS.map((a) => (
            <IonItem key={a}>
              <IonToggle checked={!!filter.excludeAllergens?.includes(a)} onIonChange={(e) => setFilter({ excludeAllergens: toggleIn(filter.excludeAllergens, a, e.detail.checked) })}>
                {ALLERGEN_EMOJI[a]} {t(ALLERGEN_LABEL[a])}
              </IonToggle>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonModal>
  );
}
