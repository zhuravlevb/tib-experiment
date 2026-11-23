import { useRef, useState } from 'react';
import { App, Button, Chip, Icon, Link, Navbar, NavTitle, Page, Subnavbar, Tab, Tabs, Toolbar, View, f7 } from 'framework7-react';
import { PhoneFrame, useLongPress } from '@tib/react';
import { YACHT_NAME, canSteer } from '@tib/yacht-core';
import { controlLabel, t, useTicker, useTransitions, useYacht, yacht } from '@tib/yacht-app';
import { HelmTab } from './HelmTab';
import { AmbienceTab } from './AmbienceTab';
import { ServiceTab } from './ServiceTab';
import { DemoPanel } from './DemoPanel';
import { StormPopup } from './StormPopup';

/** Seed-цвет пульта: глубокий морской. */
const SEED = '#00658F';

function ControlStrip() {
  const control = useYacht((s) => s.control);
  const owner = canSteer(control);
  const confirm = () =>
    f7.dialog
      .create({
        title: t('handoverConfirmTitle'),
        text: t('handoverConfirmText'),
        buttons: [{ text: t('cancel') }, { text: t('handoverYes'), strong: true, onClick: () => yacht.getState().handover() }],
      })
      .open();
  return (
    <Subnavbar>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <Chip text={controlLabel(control.state)} outline={!owner} style={{ flex: 'none' }} />
        <span style={{ flex: 1 }} />
        {owner ? (
          <Button tonal round small onClick={confirm}>
            {t('handover')}
          </Button>
        ) : control.state === 'returnRequested' ? null : (
          <Button tonal round small onClick={() => yacht.getState().requestReturn()}>
            {t('requestReturn')}
          </Button>
        )}
      </div>
    </Subnavbar>
  );
}

function Remote() {
  useTicker();
  const [storm, setStorm] = useState(false);
  const offer = useRef<ReturnType<typeof f7.dialog.create> | null>(null);
  const press = useLongPress(() => f7.panel.open('left'));

  useTransitions({
    onOfferOpen() {
      const text = () => `${t('weatherText')} ${Math.ceil(yacht.getState().control.countdown)} ${t('sec')}`;
      const d = f7.dialog.create({
        title: t('weatherTitle'),
        text: text(),
        buttons: [
          { text: t('keepHelm'), onClick: () => yacht.getState().declineOffer() },
          { text: t('handNow'), strong: true, onClick: () => yacht.getState().acceptOffer() },
        ],
      });
      d.open();
      offer.current = d;
      const id = setInterval(() => {
        if (offer.current !== d) return clearInterval(id);
        d.$el.find('.dialog-text').text(text());
      }, 500);
    },
    onOfferClose(to) {
      offer.current?.close();
      offer.current = null;
      if (to === 'owner') f7.toast.create({ text: t('keptNote'), closeTimeout: 3000 }).open();
    },
    onStorm: () => setStorm(true),
    onNotice(n) {
      if (n.level !== 'critical') f7.toast.create({ text: n.text.ru, closeTimeout: 2200, position: 'top' }).open();
    },
  });

  return (
    <>
      <DemoPanel />
      <StormPopup opened={storm} onClose={() => setStorm(false)} />
      <View main>
        <Page pageContent={false}>
          <Navbar>
            <NavTitle>
              <h1 {...press} style={{ font: 'inherit', margin: 0, cursor: 'default' }}>
                {YACHT_NAME}
              </h1>
            </NavTitle>
            <ControlStrip />
          </Navbar>
          <Toolbar tabbar icons bottom>
            <Link tabLink="#tab-helm" tabLinkActive iconMaterial="sailing" text={t('helm')} />
            <Link tabLink="#tab-ambience" iconMaterial="nightlife" text={t('ambience')} />
            <Link tabLink="#tab-service" iconMaterial="room_service" text={t('service')} />
          </Toolbar>
          <Tabs>
            <Tab id="tab-helm" className="page-content" tabActive>
              <HelmTab />
            </Tab>
            <Tab id="tab-ambience" className="page-content">
              <AmbienceTab />
            </Tab>
            <Tab id="tab-service" className="page-content">
              <ServiceTab />
            </Tab>
          </Tabs>
        </Page>
      </View>
    </>
  );
}

export default function Root() {
  return (
    <PhoneFrame hint={t('demoHint')}>
      <App theme="md" name={YACHT_NAME} darkMode={false} colors={{ primary: SEED }}>
        <Remote />
      </App>
    </PhoneFrame>
  );
}
