import { Block, BlockFooter, BlockTitle, Button, Icon, Link, List, ListItem, Navbar, NavLeft, NavTitle, Page, Popup, Stepper, Toggle, Toolbar } from 'framework7-react';
import type { OptionGroup, Selections } from '@tib/kiosk-core';
import { closeItem, rub, useItemDraft, useItemEditor, useT } from '@tib/kiosk-app';
import { onToggle } from '@tib/kiosk-app';
import { DishMedia, photoCredit } from '../media';
import { DietChips } from './parts';

/** M3 Fullscreen dialog: выбор размера, добавок и комбо. */
export function ItemPopup() {
  const { itemId, lineId } = useItemEditor();
  const d = useItemDraft(itemId, lineId);
  const t = useT();

  const group = (g: OptionGroup, sel: Selections, flip: (gid: string, oid: string) => void, label?: string) => {
    const hasError = d?.errors.some((e) => e.groupId === g.id);
    return (
      <div key={g.id}>
        <BlockTitle>
          {label ? `${label} · ` : ''}
          {t(g.name)}
          <span style={{ fontWeight: 400, opacity: 0.7 }}> · {g.min > 0 ? t('required') : `${t('upTo')} ${g.max}`}</span>
        </BlockTitle>
        <List strong inset style={hasError ? { outline: '2px solid var(--f7-color-red)' } : undefined}>
          {g.options.map((o) => (
            <ListItem
              key={o.id}
              radio={g.max === 1}
              checkbox={g.max > 1}
              name={`${itemId}-${g.id}`}
              title={t(o.name)}
              after={o.priceDelta ? `${o.priceDelta > 0 ? '+' : '−'}${rub(Math.abs(o.priceDelta))}` : ''}
              checked={d!.isChecked(sel, g.id, o.id)}
              disabled={d!.isLocked(sel, g.id, o.id, g.max)}
              onChange={() => flip(g.id, o.id)}
            />
          ))}
        </List>
      </div>
    );
  };

  return (
    <Popup tabletFullscreen opened={!!itemId} onPopupClosed={closeItem} swipeToClose={false}>
      {d && (
        <Page>
          <Navbar>
            <NavLeft>
              <Link iconOnly popupClose aria-label={t('back')}>
                <Icon material="close" />
              </Link>
            </NavLeft>
            <NavTitle>{t(d.item.name)}</NavTitle>
          </Navbar>
          <Toolbar bottom style={{ height: 96 }}>
            <Stepper large round fill value={d.qty} min={1} max={20} onStepperChange={(v: number) => d.setQty(v)} aria-label={t('qty')} />
            <Button large fill round style={{ flex: 1, marginLeft: 16 }} disabled={d.errors.length > 0} onClick={() => d.commit()}>
              {d.editing ? t('save') : t('add')} · {rub(d.price)}
            </Button>
          </Toolbar>
          <DishMedia item={d.item} height={300} />
          {photoCredit(d.item) && <BlockFooter style={{ marginTop: 6, fontSize: 12 }}>{photoCredit(d.item)}</BlockFooter>}
          <Block>
            <p style={{ fontSize: 20, marginTop: 0 }}>{t(d.item.description)}</p>
            <BlockTitle style={{ margin: '16px 0 8px' }}>{t('allergens')}</BlockTitle>
            <DietChips tags={d.item.tags} allergens={d.allergens} />
          </Block>
          {d.item.groups.map((g) => group(g, d.sel, d.toggle))}
          {d.item.combo && (
            <>
              <List strong inset>
                <ListItem title={`${t('makeCombo')}`} footer={t(d.item.combo.name)} after={`+${rub(d.item.combo.priceDelta)}`}>
                  <Toggle slot="after" defaultChecked={d.combo} key={String(d.combo)} onChange={onToggle((v) => d.setCombo(v))} />
                </ListItem>
              </List>
              {d.combo && d.item.combo.groups.map((g, i) => group(g, d.comboSel, d.toggleCombo, `${t('step')} ${i + 1}`))}
            </>
          )}
          <div style={{ height: 120 }} />
        </Page>
      )}
    </Popup>
  );
}
