import type { ReactNode } from 'react';
import { IonBackButton, IonButton, IonButtons, IonFooter, IonHeader, IonIcon, IonLabel, IonTitle, IonToolbar } from '@ionic/react';
import { bagHandle, closeCircle, textOutline } from 'ionicons/icons';
import {
  ALLERGEN_EMOJI,
  ALLERGEN_LABEL,
  cartCount,
  computeTotals,
  DIET_EMOJI,
  DIET_LABEL,
  getRestaurant,
  type Allergen,
  type DietTag,
} from '@tib/kiosk-core';
import { confirmCancel, go, rub, useKiosk, useT } from '@tib/kiosk-app';
import { Logo } from '../media';

export const openA11y = () => document.querySelector<HTMLIonModalElement>('#a11y-modal')?.present();
export const openFilters = () => document.querySelector<HTMLIonModalElement>('#filters-modal')?.present();

/** Панель навигации iOS: «назад», заголовок, справа доступность и отмена. */
export function Header({ title, back = true, cancel = true, children }: { title: string; back?: boolean; cancel?: boolean; children?: ReactNode }) {
  const t = useT();
  return (
    <IonHeader translucent>
      <IonToolbar>
        {back && (
          <IonButtons slot="start">
            <IonBackButton text={t('back')} defaultHref="/" />
          </IonButtons>
        )}
        <IonTitle>
          <h1>{title}</h1>
        </IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={openA11y} aria-label={t('accessibility')}>
            <IonIcon slot="icon-only" icon={textOutline} />
          </IonButton>
          {cancel && (
            <IonButton color="danger" onClick={confirmCancel} aria-label={t('cancelOrder')}>
              <IonIcon slot="icon-only" icon={closeCircle} />
            </IonButton>
          )}
        </IonButtons>
      </IonToolbar>
      {children}
    </IonHeader>
  );
}

/** Большой заголовок iOS, который сворачивается в панель при прокрутке. */
export function LargeTitle({ title }: { title: string }) {
  return (
    <IonHeader collapse="condense">
      <IonToolbar>
        <IonTitle size="large">{title}</IonTitle>
      </IonToolbar>
    </IonHeader>
  );
}

/** Нижняя панель с корзиной на всех экранах выбора. */
export function CartFooter() {
  const t = useT();
  const cart = useKiosk((s) => s.cart);
  if (!cart.length) return null;
  const total = computeTotals(cart, null, []).total;
  return (
    <IonFooter translucent>
      <IonToolbar style={{ '--min-height': '76px', '--padding-start': '16px', '--padding-end': '16px' } as React.CSSProperties}>
        <IonLabel slot="start" style={{ fontSize: 18, fontWeight: 600 }}>
          {t('cart')} · {cartCount(cart)}
        </IonLabel>
        <IonButton slot="end" shape="round" size="large" onClick={() => go('cart')}>
          <IonIcon slot="start" icon={bagHandle} />
          {rub(total)}
        </IonButton>
      </IonToolbar>
    </IonFooter>
  );
}

/** Количество: в Ionic нет UIStepper, поэтому пара системных кнопок −/+ как в iOS. */
export function Qty({ value, min = 1, max = 20, onChange, label }: { value: number; min?: number; max?: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="group" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <IonButton fill="outline" size="small" disabled={value <= min} onClick={() => onChange(value - 1)} aria-label="−">
        −
      </IonButton>
      <span aria-live="polite" style={{ minWidth: 32, textAlign: 'center', fontSize: 18, fontWeight: 600 }}>
        {value}
      </span>
      <IonButton fill="outline" size="small" disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="+">
        +
      </IonButton>
    </div>
  );
}

/** Диеты и аллергены одной строкой: пиктограмма всегда с подписью. */
export function useDietLine() {
  const t = useT();
  return (tags: DietTag[], allergens: Allergen[]) =>
    [...tags.map((d) => `${DIET_EMOJI[d]} ${t(DIET_LABEL[d])}`), ...allergens.map((a) => `${ALLERGEN_EMOJI[a]} ${t(ALLERGEN_LABEL[a])}`)].join('   ');
}

/** Заголовок группы списка: логотип и название ресторана. */
export function BrandHeader({ id, after }: { id: string; after?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
      <Logo id={id} size={28} />
      <span style={{ flex: 1 }}>{getRestaurant(id).name}</span>
      {after && <span>{after}</span>}
    </div>
  );
}
