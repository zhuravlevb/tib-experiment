import { Block, Button, Icon, Page, Popup } from 'framework7-react';
import { t } from '@tib/yacht-app';

/** M3 Fullscreen dialog: критическое событие, управление уже у капитана. */
export function StormPopup({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  return (
    <Popup tabletFullscreen opened={opened} onPopupClosed={onClose} closeByBackdropClick={false} swipeToClose={false}>
      <Page>
        <Block style={{ textAlign: 'center', marginTop: 64 }}>
          <Icon material="thunderstorm" size={96} color="red" />
          <h1 role="alert" style={{ fontSize: 30, lineHeight: 1.2 }}>{t('stormTitle')}</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5 }}>{t('stormText')}</p>
        </Block>
        <Block>
          <Button large fill onClick={onClose}>
            {t('ok')}
          </Button>
        </Block>
      </Page>
    </Popup>
  );
}
