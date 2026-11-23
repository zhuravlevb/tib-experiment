import { Block, BlockTitle, Button, List, ListItem, Navbar, Page, Panel, Segmented, Toggle, View } from 'framework7-react';
import { kiosk, useKiosk, useT } from '@tib/kiosk-app';
import { onToggle } from '@tib/kiosk-app';

/** M3 side sheet с настройками доступности. Доступен с любого экрана. */
export function A11yPanel() {
  const t = useT();
  const a11y = useKiosk((s) => s.a11y);
  const lang = useKiosk((s) => s.lang);
  const { setA11y, setLang } = kiosk.getState();
  return (
    <Panel right cover>
      <View>
        <Page>
          <Navbar title={t('accessibility')} />
          <BlockTitle>{t('language')}</BlockTitle>
          <Block>
            <Segmented strong round>
              <Button active={lang === 'ru'} onClick={() => setLang('ru')}>Русский</Button>
              <Button active={lang === 'en'} onClick={() => setLang('en')}>English</Button>
            </Segmented>
          </Block>
          <List strong inset>
            <ListItem title={t('lowMode')} footer={t('lowModeHint')}>
              <Toggle slot="after" defaultChecked={a11y.lowMode} key={String(a11y.lowMode)} onChange={onToggle((v) => setA11y({ lowMode: v }))} />
            </ListItem>
            <ListItem title={t('largeText')}>
              <Toggle slot="after" defaultChecked={a11y.largeText} key={String(a11y.largeText)} onChange={onToggle((v) => setA11y({ largeText: v }))} />
            </ListItem>
            <ListItem title={t('highContrast')}>
              <Toggle slot="after" defaultChecked={a11y.highContrast} key={String(a11y.highContrast)} onChange={onToggle((v) => setA11y({ highContrast: v }))} />
            </ListItem>
          </List>
          <Block>
            <Button large fill panelClose>{t('done')}</Button>
          </Block>
        </Page>
      </View>
    </Panel>
  );
}
