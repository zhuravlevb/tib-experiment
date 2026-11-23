import { Block, BlockFooter, Button, Icon, List, ListItem, Navbar, Page } from 'framework7-react';
import { getRestaurant } from '@tib/kiosk-core';
import { Logo } from '../media';
import { boardUrl, resetToAttract, setTint, smsReceipt, toast, useCountdown, useKiosk, useT } from '@tib/kiosk-app';

export default function Done() {
  const t = useT();
  const order = useKiosk((s) => s.order);
  const left = useCountdown(30, resetToAttract, !!order);
  if (!order) return <Page />;
  return (
    <Page onPageBeforeIn={() => setTint(null)}>
      <Navbar title={t('thanks')} />
      <Block style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, opacity: 0.7 }}>{t('orderCode')}</div>
        <div className="block-title-large" style={{ fontSize: 120, fontWeight: 800, lineHeight: 1.1 }} aria-live="polite">{order.code}</div>
      </Block>
      <List strong inset mediaList>
        {order.tickets.map((tk) => {
          const r = getRestaurant(tk.restaurantId);
          return (
            <ListItem key={tk.restaurantId} title={r.name} subtitle={t(r.cuisine)}>
              <div slot="media">
                <Logo id={r.id} size={64} />
              </div>
              <div slot="after" style={{ fontSize: 44, fontWeight: 800, color: 'var(--f7-text-color)' }}>{tk.number}</div>
            </ListItem>
          );
        })}
      </List>
      <BlockFooter style={{ fontSize: 18 }}>{t('pickupHint')}</BlockFooter>
      <Block>
        <div className="grid grid-cols-2 grid-gap">
          <Button large tonal onClick={smsReceipt}>
            <Icon material="sms" style={{ marginRight: 8 }} />
            {t('sms')}
          </Button>
          <Button large tonal onClick={() => toast(t('printed'))}>
            <Icon material="print" style={{ marginRight: 8 }} />
            {t('print')}
          </Button>
        </div>
        <Button large fill style={{ marginTop: 16 }} onClick={resetToAttract}>{t('done')}</Button>
        <p style={{ textAlign: 'center', opacity: 0.7 }}>{t('returnIn')} {left} {t('sec')}</p>
        <Button external href={boardUrl()} target="_blank">{t('openBoard')} ↗</Button>
      </Block>
    </Page>
  );
}
