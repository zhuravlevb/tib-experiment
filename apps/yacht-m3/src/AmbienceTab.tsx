import { AccordionContent, Block, BlockTitle, Button, Card, CardContent, Chip, Icon, Link, List, ListItem, Range, Toggle } from 'framework7-react';
import { LIGHT_ZONE, MUSIC_ZONE, scenes, tracks, type LightZone, type MusicZone, type SceneId } from '@tib/yacht-core';
import { t, useYacht, yacht } from '@tib/yacht-app';

const SCENE_ICON: Record<SceneId, string> = { sunset: 'wb_twilight', party: 'celebration', privacy: 'visibility_off', sleep: 'bedtime' };
const COLORS = ['#FFE2B8', '#FFB36B', '#FF6BB5', '#B36BFF', '#3EC5FF', '#FFFFFF'];

export function AmbienceTab() {
  const scene = useYacht((s) => s.scene);
  const music = useYacht((s) => s.music);
  const lights = useYacht((s) => s.lights);
  const y = yacht.getState();
  const track = tracks.find((x) => x.id === music.trackId)!;

  return (
    <>
      <BlockTitle>{t('scenes')}</BlockTitle>
      <div className="grid grid-cols-2 grid-gap" style={{ padding: '0 16px' }}>
        {Object.values(scenes).map((s) => {
          const active = scene === s.id;
          return (
            <Link key={s.id} noLinkClass onClick={() => y.applyScene(s.id)} style={{ display: 'block' }} aria-pressed={active}>
              <Card raised={!active} style={{ margin: 0, background: active ? 'var(--f7-md-primary-container)' : undefined }}>
                <CardContent style={{ padding: '20px 16px' }}>
                  <Icon material={SCENE_ICON[s.id]} size={32} />
                  <div style={{ fontSize: 18, fontWeight: 600, marginTop: 8 }}>{s.name.ru}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <BlockTitle>{t('music')}</BlockTitle>
      <Card raised>
        <CardContent>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{track.title}</div>
          <div style={{ opacity: 0.7, marginBottom: 12 }}>{track.artist}</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <Button round tonal onClick={() => y.skip(-1)} aria-label={t('prev')}>
              <Icon material="skip_previous" />
            </Button>
            <Button round fill large onClick={() => y.togglePlay()} aria-label={music.playing ? t('pause') : t('play')} style={{ width: 72 }}>
              <Icon material={music.playing ? 'pause' : 'play_arrow'} />
            </Button>
            <Button round tonal onClick={() => y.skip(1)} aria-label={t('next')}>
              <Icon material="skip_next" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <List strong inset>
        {(Object.keys(music.volume) as MusicZone[]).map((z) => (
          <ListItem key={z} title={`${t('volume')}: ${MUSIC_ZONE[z].ru}`}>
            <div slot="footer" style={{ paddingTop: 8 }}>
              <Range min={0} max={100} value={music.volume[z]} onRangeChanged={(v: number) => y.setVolume(z, v)} />
            </div>
          </ListItem>
        ))}
      </List>

      <BlockTitle>{t('lights')}</BlockTitle>
      <List strong inset accordionList>
        {(Object.keys(lights) as LightZone[]).map((z) => {
          const l = lights[z];
          return (
            <ListItem key={z} accordionItem title={LIGHT_ZONE[z].ru} after={l.on ? `${l.brightness}%` : t('lightOff')}>
              <span slot="media" style={{ width: 20, height: 20, borderRadius: 10, background: l.on ? l.color : 'transparent', border: '2px solid currentColor', display: 'block' }} />
              <AccordionContent>
                <Block>
                  <List>
                    <ListItem title={t('lightOn')}>
                      <Toggle slot="after" defaultChecked={l.on} key={String(l.on)} onChange={(e: { target: EventTarget | null }) => y.setLight(z, { on: (e.target as HTMLInputElement).checked })} />
                    </ListItem>
                  </List>
                  <div style={{ fontSize: 13, opacity: 0.7, margin: '8px 0' }}>{t('brightness')}</div>
                  <Range min={0} max={100} value={l.brightness} disabled={!l.on} onRangeChanged={(v: number) => y.setLight(z, { brightness: v })} />
                  <div style={{ fontSize: 13, opacity: 0.7, margin: '12px 0 8px' }}>{t('color')}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {COLORS.map((c) => (
                      <Chip key={c} outline={l.color !== c} text={l.color === c ? '✓' : ' '} onClick={() => y.setLight(z, { color: c, on: true })} style={{ background: c, color: '#000', minWidth: 40, justifyContent: 'center' }} />
                    ))}
                  </div>
                </Block>
              </AccordionContent>
            </ListItem>
          );
        })}
      </List>
    </>
  );
}
