import { useState } from 'react';
import { Block, BlockFooter, BlockTitle, Button, Card, CardContent, Icon, Link, List, ListItem, Navbar, Page, Stepper, Toggle } from 'framework7-react';
import { computeTotals, type LoyaltyQuote, type RestaurantGroup } from '@tib/kiosk-core';
import { findByPhone, formatPhone, go, kiosk, rub, scanQrDemo, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { onToggle } from '@tib/kiosk-app';
import { BrandChip, NavActions } from './parts';

/** Экранная цифровая клавиатура из кнопок системы (системная клавиатура на киоске недоступна). */
function Keypad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
  return (
    <div className="grid grid-cols-3 grid-gap">
      {keys.map((k, i) =>
        k ? (
          <Button
            key={i}
            large
            tonal
            style={{ height: 72, fontSize: 28 }}
            aria-label={k === '⌫' ? 'Стереть' : k}
            onClick={() => onChange(k === '⌫' ? value.slice(0, -1) : (value + k).slice(0, 10))}
          >
            {k}
          </Button>
        ) : (
          <span key={i} />
        ),
      )}
    </div>
  );
}

export default function Loyalty() {
  const t = useT();
  const [digits, setDigits] = useState('');
  const cart = useKiosk((s) => s.cart);
  const guest = useKiosk((s) => s.guest);
  const applied = useKiosk((s) => s.applied);
  const k = kiosk.getState();
  const totals = computeTotals(cart, guest, applied);

  const row = (g: RestaurantGroup & { loyalty: LoyaltyQuote }) => {
    const p = g.restaurant.loyalty;
    const q = g.loyalty;
    const on = applied.some((a) => a.restaurantId === g.restaurant.id);
    const current = applied.find((a) => a.restaurantId === g.restaurant.id);
    if (!p) return <ListItem title={t('noProgram')} />;
    if (!q.member) return <ListItem title={t(p.name)} footer={t('notMember')} />;
    const balance = p.kind === 'points' ? `${q.balance} ${t('points')}` : p.kind === 'stamps' ? `${q.balance}/${p.needed} ${t('stamps')}` : `−${p.percent}%`;
    const earn = q.earn > 0 ? `${t('willEarn')}: +${q.earn} ${p.kind === 'stamps' ? t('stamps') : t('points')}` : undefined;
    // F7 List оборачивает в <ul> только прямых детей-ListItem, поэтому массив, а не фрагмент
    return [
        <ListItem key="main" title={t(p.name)} after={balance} footer={q.applicable ? earn : t(q.reason ?? 'noBalance')}>
          <Toggle slot="after" disabled={!q.applicable} defaultChecked={on} key={String(on)} onChange={onToggle((v) => k.setApplied(g.restaurant.id, v))} />
        </ListItem>,
        on && p.kind === 'points' && (
          <ListItem key="points" title={t('spendPoints')} footer={`${t('upToPoints')} ${q.maxPoints}`}>
            <Stepper
              slot="after"
              round
              fill
              value={current?.pointsToSpend ?? q.maxPoints ?? 0}
              min={0}
              max={q.maxPoints ?? 0}
              step={10}
              onStepperChange={(v: number) => k.setApplied(g.restaurant.id, true, v)}
            />
          </ListItem>
        ),
        on && q.discount > 0 && <ListItem key="discount" title={t('discount')} after={`−${rub(q.discount)}`} />,
    ];
  };

  return (
    <Page onPageBeforeIn={() => setTint(null)}>
      <Navbar title={t('loyalty')} backLink>
        <NavActions />
      </Navbar>
      {!guest ? (
        <>
          <Block>
            <p style={{ fontSize: 20 }}>{t('loyaltyLead')}</p>
            <Card outline style={{ margin: '0 0 16px' }}>
              <CardContent>
                <div style={{ fontSize: 15, opacity: 0.7 }}>{t('phone')}</div>
                <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1 }} aria-live="polite">{formatPhone(digits)}</div>
              </CardContent>
            </Card>
            <Keypad value={digits} onChange={setDigits} />
            <Button large fill style={{ marginTop: 16 }} disabled={digits.length < 10} onClick={() => findByPhone(digits)}>
              {t('find')}
            </Button>
            <BlockFooter>{t('demoHint')}</BlockFooter>
            <Button large tonal onClick={scanQrDemo}>
              <Icon material="qr_code_scanner" style={{ marginRight: 8 }} />
              {t('scanQr')}
            </Button>
            <Button large style={{ marginTop: 12 }} onClick={() => go('payment')}>{t('skip')}</Button>
          </Block>
        </>
      ) : (
        <>
          <Block style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{t('hello')}, {guest.name}!</div>
            <Link onClick={() => k.forgetGuest()}>{t('signOut')}</Link>
          </Block>
          {totals.groups.map((g) => (
            <div key={g.restaurant.id}>
              <BlockTitle>
                <BrandChip id={g.restaurant.id} />
              </BlockTitle>
              <List strong inset>{row(g)}</List>
            </div>
          ))}
          <List strong inset>
            <ListItem title={t('subtotal')} after={rub(totals.subtotal)} />
            {totals.discount > 0 && <ListItem title={t('discount')} after={`−${rub(totals.discount)}`} />}
            <ListItem title={t('total')} after={rub(totals.total)} />
          </List>
          <Block>
            <Button large fill onClick={() => go('payment')}>{t('toPayment')} · {rub(totals.total)}</Button>
          </Block>
        </>
      )}
    </Page>
  );
}
