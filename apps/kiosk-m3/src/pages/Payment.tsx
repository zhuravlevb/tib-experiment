import { Block, Button, Card, CardContent, Icon, Link, Navbar, Page, Preloader } from 'framework7-react';
import { computeTotals, type PaymentMethod } from '@tib/kiosk-core';
import { kiosk, payDemo, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';

export default function Payment() {
  const t = useT();
  const cart = useKiosk((s) => s.cart);
  const guest = useKiosk((s) => s.guest);
  const applied = useKiosk((s) => s.applied);
  const payment = useKiosk((s) => s.payment);
  const total = computeTotals(cart, guest, applied).total;
  const busy = payment.status === 'processing';

  const methods: { id: PaymentMethod; icon: string; title: string; hint: string }[] = [
    { id: 'card', icon: 'contactless', title: t('card'), hint: t('cardHint') },
    { id: 'sbp', icon: 'qr_code_2', title: t('sbp'), hint: t('sbpHint') },
  ];

  return (
    <Page onPageBeforeIn={() => setTint(null)}>
      <Navbar title={t('payment')} backLink={!busy} />
      <Block style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 20, opacity: 0.7 }}>{t('total')}</div>
        <div className="block-title-large" style={{ fontSize: 64, fontWeight: 800 }}>{rub(total)}</div>
      </Block>
      <div className="grid grid-cols-2 grid-gap" style={{ padding: '0 16px' }}>
        {methods.map((m) => {
          const active = payment.method === m.id;
          return (
            <Link key={m.id} noLinkClass onClick={() => !busy && kiosk.getState().choosePayment(m.id)} style={{ display: 'block' }} aria-pressed={active}>
              <Card raised={!active} outline={active} style={{ margin: 0, borderWidth: active ? 3 : undefined, borderColor: active ? 'var(--f7-theme-color)' : undefined }}>
                <CardContent style={{ textAlign: 'center', padding: '32px 12px' }}>
                  <Icon material={m.icon} size={64} />
                  <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{m.title}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {payment.method && (
        <Block style={{ textAlign: 'center' }}>
          {busy ? (
            <>
              <Preloader size={64} />
              <p style={{ fontSize: 22 }} aria-live="assertive">{t('processing')}</p>
            </>
          ) : (
            <>
              <Icon material={payment.method === 'card' ? 'contactless' : 'qr_code_2'} size={payment.method === 'sbp' ? 220 : 120} />
              <p style={{ fontSize: 22 }}>{methods.find((m) => m.id === payment.method)!.hint}</p>
              <Button large fill onClick={() => payDemo('success')}>{payment.method === 'card' ? t('tapCardDemo') : t('paidSbpDemo')}</Button>
              <Button style={{ marginTop: 12 }} onClick={() => payDemo('declined')}>{t('declineDemo')}</Button>
            </>
          )}
        </Block>
      )}
    </Page>
  );
}
