
import { IonButton, IonButtons, IonChip, IonHeader, IonIcon, IonLabel, IonTitle, IonToolbar, useIonActionSheet } from '@ionic/react';
import { menuController } from '@ionic/core/components';
import { personCircle, shieldCheckmark } from 'ionicons/icons';
import { useLongPress } from '@tib/react';
import { YACHT_NAME, canSteer } from '@tib/yacht-core';
import { controlLabel, t, useYacht, yacht } from '@tib/yacht-app';

/** Шапка вкладки: название яхты (долгое нажатие — демо-панель) и строка контроля. */
export function Header({ title }: { title: string }) {
  const control = useYacht((s) => s.control);
  const owner = canSteer(control);
  const press = useLongPress(() => menuController.open('demo'));
  const [present] = useIonActionSheet();
  // HIG: необратимое действие подтверждается action sheet
  const confirm = () =>
    present({
      header: t('handoverConfirmTitle'),
      subHeader: t('handoverConfirmText'),
      buttons: [
        { text: t('handoverYes'), handler: () => yacht.getState().handover() },
        { text: t('cancel'), role: 'cancel' },
      ],
    });
  return (
    <IonHeader translucent>
      <IonToolbar>
        <IonTitle>
          <h1>
            <span {...press}>{YACHT_NAME}</span> <span style={{ fontWeight: 400, opacity: 0.6 }}>· {title}</span>
          </h1>
        </IonTitle>
      </IonToolbar>
      <IonToolbar style={{ '--padding-end': '16px', '--padding-start': '12px' } as React.CSSProperties}>
        <IonChip slot="start" color={owner ? 'primary' : 'warning'} outline={!owner}>
          <IonIcon icon={owner ? personCircle : shieldCheckmark} />
          <IonLabel>{controlLabel(control.state)}</IonLabel>
        </IonChip>
        <IonButtons slot="end">
          {owner ? (
            <IonButton fill="solid" shape="round" size="small" onClick={confirm}>
              {t('handover')}
            </IonButton>
          ) : control.state !== 'returnRequested' ? (
            <IonButton fill="outline" shape="round" size="small" onClick={() => yacht.getState().requestReturn()}>
              {t('requestReturn')}
            </IonButton>
          ) : null}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}

/** Количество: в Ionic нет UIStepper, поэтому пара системных кнопок −/+ как в iOS. */
export function Qty({ value, min, max, onChange, label, format = String, disabled }: { value: number; min: number; max: number; onChange: (v: number) => void; label: string; format?: (v: number) => string; disabled?: boolean }) {
  return (
    <div role="group" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <IonButton fill="outline" size="small" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} aria-label="−">
        −
      </IonButton>
      <span aria-live="polite" style={{ minWidth: 44, textAlign: 'center', fontSize: 17, fontWeight: 600 }}>
        {format(value)}
      </span>
      <IonButton fill="outline" size="small" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} aria-label="+">
        +
      </IonButton>
    </div>
  );
}

