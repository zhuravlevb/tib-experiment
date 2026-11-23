import { BlockTitle, List, ListButton, ListItem, Navbar, Page, Panel, View } from 'framework7-react';
import { ZONE_LABEL, type Zone } from '@tib/yacht-core';
import { t, useYacht, yacht } from '@tib/yacht-app';

/** Демо-панель: события, которые в жизни приходят от погоды и капитана. */
export function DemoPanel() {
  const zone = useYacht((s) => s.zone);
  const d = yacht.getState().demo;
  return (
    <Panel left cover>
      <View>
        <Page>
          <Navbar title={t('demo')} />
          <List strong inset>
            <ListButton title={t('demoWeather')} onClick={d.weatherWarning} />
            <ListButton title={t('demoStorm')} color="red" onClick={d.storm} />
            <ListButton title={t('demoClear')} onClick={d.clearWeather} />
          </List>
          <List strong inset>
            <ListButton title={t('demoApprove')} onClick={d.captainApprove} />
            <ListButton title={t('demoDeny')} onClick={d.captainDeny} />
            <ListButton title={t('demoDeliver')} onClick={d.deliverFood} />
          </List>
          <BlockTitle>{t('demoZone')}</BlockTitle>
            <List strong inset>
              {(['open', 'coastal', 'harbor'] as Zone[]).map((z) => (
                <ListItem key={z} radio name="demo-zone" title={ZONE_LABEL[z].ru} checked={zone === z} onChange={() => d.setZone(z)} />
              ))}
            </List>
          <List strong inset>
            <ListButton title={t('demoReset')} color="red" onClick={d.reset} panelClose />
          </List>
        </Page>
      </View>
    </Panel>
  );
}
