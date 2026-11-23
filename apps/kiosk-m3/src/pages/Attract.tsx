import { Block, Button, Card, CardContent, Icon, Page, Segmented, f7 } from 'framework7-react';
import { restaurants } from '@tib/kiosk-core';
import { go, kiosk, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { RestaurantMedia } from '../media';

/** Заставка: касание в любом месте начинает заказ. Язык и доступность — уже здесь. */
export default function Attract() {
  const t = useT();
  const lang = useKiosk((s) => s.lang);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <Page noNavbar onPageBeforeIn={() => setTint(null)}>
      <div onClick={() => go('start')} style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Block>
          <h1 className="block-title-large" style={{ fontSize: 52, lineHeight: 1.05, margin: '24px 0 8px' }}>{t('appName')}</h1>
          <p style={{ fontSize: 22, margin: 0, opacity: 0.8 }}>{t('attractLead')}</p>
        </Block>
        <div className="grid grid-cols-3 grid-gap" style={{ padding: '0 8px' }}>
          {restaurants.map((r) => (
            <Card key={r.id} raised style={{ margin: 8, overflow: 'hidden' }}>
              <CardContent padding={false}>
                <RestaurantMedia id={r.id} height={230} />
                <div style={{ padding: 12, fontWeight: 600, fontSize: 18 }}>{r.name}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Block>
          <Button large fill style={{ height: 88, fontSize: 28 }}>
            <Icon material="touch_app" style={{ marginRight: 12 }} />
            {t('startOrder')}
          </Button>
          <p style={{ textAlign: 'center', fontSize: 18, opacity: 0.7 }}>{t('tapToStart')}</p>
          <div onClick={stop} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Segmented strong round style={{ flex: 1 }}>
              <Button active={lang === 'ru'} onClick={() => kiosk.getState().setLang('ru')}>Русский</Button>
              <Button active={lang === 'en'} onClick={() => kiosk.getState().setLang('en')}>English</Button>
            </Segmented>
            <Button tonal round onClick={() => f7.panel.open('right')} aria-label={t('accessibility')}>
              <Icon material="accessibility_new" style={{ marginRight: 8 }} />
              {t('accessibility')}
            </Button>
          </div>
        </Block>
      </div>
    </Page>
  );
}
