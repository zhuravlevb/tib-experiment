import { useState } from 'react';
import { Block, BlockFooter, BlockTitle, Button, Card, CardContent, Icon, List, ListInput, ListItem, Navbar, NavRight, Link, Page, Popup, Progressbar, Stepper, Toggle } from 'framework7-react';
import { chefMenu, CLIMATE_ZONE, DELIVERY_ZONE, FOOD_FLOW, FOOD_STATUS, TOY_BLOCK, TOY_LABEL, TOY_STATUS, toyBlock, type ClimateZone, type DeliveryZone, type ToyId } from '@tib/yacht-core';
import { t, useYacht, yacht } from '@tib/yacht-app';

function FoodPopup({ opened, onClose }: { opened: boolean; onClose: () => void }) {
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
    <Popup tabletFullscreen opened={opened} onPopupClosed={onClose}>
      <Page>
        <Navbar title={t('food')}>
          <NavRight>
            <Link iconOnly popupClose aria-label={t('cancel')}>
              <Icon material="close" />
            </Link>
          </NavRight>
        </Navbar>
        <List strong inset>
          {chefMenu.map((c) => (
            <ListItem key={c.id} title={c.name.ru}>
              <Icon slot="media" material={c.kind === 'food' ? 'restaurant' : 'local_bar'} />
              <Stepper slot="after" small round fill value={qty[c.id] ?? 0} min={0} max={9} onStepperChange={(v: number) => setQty((q) => ({ ...q, [c.id]: v }))} />
            </ListItem>
          ))}
        </List>
        <BlockTitle>{t('deliverTo')}</BlockTitle>
        <List strong inset>
          {(Object.keys(DELIVERY_ZONE) as DeliveryZone[]).map((z) => (
            <ListItem key={z} radio name="zone" title={DELIVERY_ZONE[z].ru} checked={zone === z} onChange={() => setZone(z)} />
          ))}
        </List>
        <List strong inset>
          <ListInput label={t('note')} type="text" placeholder={t('notePlaceholder')} value={note} onInput={(e: { target: { value: string } }) => setNote(e.target.value)} />
        </List>
        <Block>
          <Button large fill disabled={!items.length} onClick={send}>
            {t('send')}
          </Button>
        </Block>
      </Page>
    </Popup>
  );
}

export function ServiceTab() {
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
      <BlockTitle>{t('food')}</BlockTitle>
      <List strong inset mediaList>
        {orders.length === 0 && <ListItem title={t('nothingOrdered')} />}
        {orders.map((o) => (
          <ListItem
            key={o.id}
            title={o.items.map((i) => `${chefMenu.find((c) => c.id === i.itemId)!.name.ru} × ${i.qty}`).join(', ')}
            subtitle={FOOD_STATUS[o.status].ru}
            text={DELIVERY_ZONE[o.zone].ru + (o.note ? ` · ${o.note}` : '')}
          >
            <div slot="footer" style={{ marginTop: 8 }}>
              <Progressbar progress={((FOOD_FLOW.indexOf(o.status) + 1) / FOOD_FLOW.length) * 100} />
            </div>
          </ListItem>
        ))}
      </List>
      <Block>
        <Button large fill onClick={() => setFoodOpen(true)}>
          <Icon material="room_service" style={{ marginRight: 8 }} />
          {t('orderFood')}
        </Button>
      </Block>
      <FoodPopup opened={foodOpen} onClose={() => setFoodOpen(false)} />

      <BlockTitle>{t('jacuzzi')}</BlockTitle>
      <Card raised>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 40, fontWeight: 700 }}>{jacuzzi.temp.toLocaleString('ru', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°</span>
            <span style={{ opacity: 0.7 }}>
              {t('water')} · {t('target').toLowerCase()} {jacuzzi.targetTemp}°
            </span>
          </div>
        </CardContent>
      </Card>
      <List strong inset>
        <ListItem title={t('target')}>
          <Stepper slot="after" round fill value={jacuzzi.targetTemp} min={30} max={40} disabled={jacuzzi.safeMode} formatValue={(v: number) => `${v}°`} onStepperChange={(v: number) => y.setJacuzziTemp(v)} />
        </ListItem>
        <ListItem title={t('bubbles')} footer={jacuzzi.safeMode ? t('jacuzziClosed') : undefined}>
          <Toggle slot="after" disabled={jacuzzi.safeMode} defaultChecked={jacuzzi.bubbles} key={String(jacuzzi.bubbles)} onChange={(e: { target: EventTarget | null }) => y.setBubbles((e.target as HTMLInputElement).checked)} />
        </ListItem>
      </List>

      <BlockTitle>{t('climate')}</BlockTitle>
      <List strong inset>
        {(Object.keys(climate) as ClimateZone[]).map((z) => (
          <ListItem key={z} title={CLIMATE_ZONE[z].ru}>
            <Stepper slot="after" round fill small value={climate[z]} min={16} max={28} formatValue={(v: number) => `${v}°`} onStepperChange={(v: number) => y.setClimate(z, v)} />
          </ListItem>
        ))}
      </List>

      <BlockTitle>{t('toys')}</BlockTitle>
      <List strong inset>
        {(Object.keys(toys) as ToyId[]).map((id) => {
          const st = toys[id].status;
          const out = st === 'ready' || st === 'preparing';
          return (
            <ListItem key={id} title={TOY_LABEL[id].ru} footer={TOY_STATUS[st].ru}>
              <Button slot="after" small tonal={!out} fill={false} disabled={!out && !!block} onClick={() => y.toy(id, out ? 'stow' : 'deploy')}>
                {out ? t('stow') : t('deploy')}
              </Button>
            </ListItem>
          );
        })}
      </List>
      {block && <BlockFooter>{TOY_BLOCK[block].ru}</BlockFooter>}
      <div style={{ height: 24 }} />
    </>
  );
}
