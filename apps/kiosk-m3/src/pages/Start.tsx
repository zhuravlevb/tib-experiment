import { Block, BlockTitle, Button, Card, CardContent, Icon, Link, List, ListItem, Navbar, Page, Segmented, Toggle } from 'framework7-react';
import { kiosk, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { onToggle } from '@tib/kiosk-app';
import type { DineMode } from '@tib/kiosk-core';
import { go } from '@tib/kiosk-app';
import { NavActions } from './parts';

export default function Start() {
  const t = useT();
  const lang = useKiosk((s) => s.lang);
  const a11y = useKiosk((s) => s.a11y);
  const k = kiosk.getState();
  const choose = (m: DineMode) => {
    k.setDineMode(m);
    go('restaurants');
  };
  const modes: { mode: DineMode; icon: string; title: string; hint: string }[] = [
    { mode: 'here', icon: 'restaurant', title: t('here'), hint: t('hereHint') },
    { mode: 'takeaway', icon: 'takeout_dining', title: t('takeaway'), hint: t('takeawayHint') },
  ];
  return (
    <Page onPageBeforeIn={() => setTint(null)}>
      <Navbar large title={t('whereEat')} backLink>
        <NavActions />
      </Navbar>
      <div className="grid grid-cols-2 grid-gap" style={{ padding: 16 }}>
        {modes.map((m) => (
          <Link key={m.mode} noLinkClass onClick={() => choose(m.mode)} style={{ display: 'block' }}>
            <Card raised style={{ margin: 0 }}>
              <CardContent style={{ textAlign: 'center', padding: '40px 16px' }}>
                <Icon material={m.icon} size={72} />
                <div style={{ fontSize: 30, fontWeight: 700, marginTop: 12 }}>{m.title}</div>
                <div style={{ fontSize: 18, opacity: 0.7, marginTop: 4 }}>{m.hint}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <BlockTitle>{t('language')}</BlockTitle>
      <Block>
        <Segmented strong round>
          <Button active={lang === 'ru'} onClick={() => k.setLang('ru')}>Русский</Button>
          <Button active={lang === 'en'} onClick={() => k.setLang('en')}>English</Button>
        </Segmented>
      </Block>
      <BlockTitle>{t('accessibility')}</BlockTitle>
      <List strong inset>
        <ListItem title={t('lowMode')} footer={t('lowModeHint')}>
          <Toggle slot="after" defaultChecked={a11y.lowMode} key={String(a11y.lowMode)} onChange={onToggle((v) => k.setA11y({ lowMode: v }))} />
        </ListItem>
        <ListItem title={t('largeText')}>
          <Toggle slot="after" defaultChecked={a11y.largeText} key={String(a11y.largeText)} onChange={onToggle((v) => k.setA11y({ largeText: v }))} />
        </ListItem>
        <ListItem title={t('highContrast')}>
          <Toggle slot="after" defaultChecked={a11y.highContrast} key={String(a11y.highContrast)} onChange={onToggle((v) => k.setA11y({ highContrast: v }))} />
        </ListItem>
      </List>
    </Page>
  );
}
