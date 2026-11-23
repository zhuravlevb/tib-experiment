import { IonButton, IonButtons, IonCheckbox, IonContent, IonFooter, IonHeader, IonItem, IonLabel, IonList, IonListHeader, IonModal, IonNote, IonRadio, IonRadioGroup, IonText, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import type { OptionGroup, Selections } from '@tib/kiosk-core';
import { closeItem, rub, useItemDraft, useItemEditor, useT } from '@tib/kiosk-app';
import { DishMedia, photoCredit } from '../media';
import { Qty, useDietLine } from './parts';

/** iOS sheet: «Отмена» слева, выбор — inset-списками с галочками, действие в нижней панели. */
export function ItemModal() {
  const { itemId, lineId } = useItemEditor();
  const d = useItemDraft(itemId, lineId);
  const t = useT();
  const diet = useDietLine();

  const priceNote = (delta: number) => (delta ? `${delta > 0 ? '+' : '−'}${rub(Math.abs(delta))}` : '');
  const header = (g: OptionGroup, label?: string) => (
    <IonListHeader>
      <IonLabel>
        {label ? `${label}: ` : ''}
        {t(g.name)}
        <IonText color="medium" style={{ fontWeight: 400 }}> · {g.min > 0 ? t('required') : `${t('upTo')} ${g.max}`}</IonText>
      </IonLabel>
    </IonListHeader>
  );

  const group = (g: OptionGroup, sel: Selections, flip: (gid: string, oid: string) => void, label?: string) =>
    g.max === 1 ? (
      <IonList inset key={g.id}>
        {header(g, label)}
        <IonRadioGroup value={sel[g.id]?.[0]} onIonChange={(e) => flip(g.id, e.detail.value)}>
          {g.options.map((o) => (
            <IonItem key={o.id}>
              <IonRadio value={o.id} justify="space-between">
                {t(o.name)} <IonNote>{priceNote(o.priceDelta)}</IonNote>
              </IonRadio>
            </IonItem>
          ))}
        </IonRadioGroup>
      </IonList>
    ) : (
      <IonList inset key={g.id}>
        {header(g, label)}
        {g.options.map((o) => (
          <IonItem key={o.id}>
            <IonCheckbox
              justify="space-between"
              checked={d!.isChecked(sel, g.id, o.id)}
              disabled={d!.isLocked(sel, g.id, o.id, g.max)}
              onIonChange={() => flip(g.id, o.id)}
            >
              {t(o.name)} <IonNote>{priceNote(o.priceDelta)}</IonNote>
            </IonCheckbox>
          </IonItem>
        ))}
      </IonList>
    );

  return (
    <IonModal isOpen={!!itemId} onDidDismiss={closeItem} breakpoints={[0, 0.92]} initialBreakpoint={0.92} expandToScroll={false}>
      {d && (
        <>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={closeItem}>{t('back')}</IonButton>
              </IonButtons>
              <IonTitle>{t(d.item.name)}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent color="light">
            <div style={{ margin: 16, borderRadius: 12, overflow: 'hidden' }}>
              <DishMedia item={d.item} height={240} />
            </div>
            {photoCredit(d.item) && (
              <IonText color="medium">
                <p className="ion-padding-horizontal" style={{ fontSize: 12, margin: '-8px 0 8px' }}>{photoCredit(d.item)}</p>
              </IonText>
            )}
            <div className="ion-padding-horizontal">
              <p style={{ fontSize: 19, margin: '0 0 6px' }}>{t(d.item.description)}</p>
              <IonText color="medium">
                <p style={{ margin: 0 }}>{diet(d.item.tags, d.allergens)}</p>
              </IonText>
            </div>
            {d.item.groups.map((g) => group(g, d.sel, d.toggle))}
            {d.item.combo && (
              <>
                <IonList inset>
                  <IonItem>
                    <IonToggle checked={d.combo} onIonChange={(e) => d.setCombo(e.detail.checked)}>
                      <IonLabel>
                        {t('makeCombo')}
                        <p>
                          {t(d.item.combo.name)}, +{rub(d.item.combo.priceDelta)}
                        </p>
                      </IonLabel>
                    </IonToggle>
                  </IonItem>
                </IonList>
                {d.combo && d.item.combo.groups.map((g, i) => group(g, d.comboSel, d.toggleCombo, `${t('step')} ${i + 1}`))}
              </>
            )}
          </IonContent>
          <IonFooter translucent>
            <IonToolbar style={{ '--min-height': '84px', '--padding-start': '16px', '--padding-end': '16px' } as React.CSSProperties}>
              <div slot="start">
                <Qty value={d.qty} onChange={d.setQty} label={t('qty')} />
              </div>
              <IonButton slot="end" shape="round" size="large" disabled={d.errors.length > 0} onClick={() => d.commit()} style={{ minWidth: 300 }}>
                {d.editing ? t('save') : t('add')} · {rub(d.price)}
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </>
      )}
    </IonModal>
  );
}
