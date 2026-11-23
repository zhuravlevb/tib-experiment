import { IonAccordion, IonAccordionGroup, IonButton, IonCard, IonCardContent, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonRange, IonSegment, IonSegmentButton, IonText, IonToggle } from '@ionic/react';
import { bed, eyeOff, musicalNotes, pause, play, playSkipBack, playSkipForward, sparkles, sunny, volumeLow, volumeHigh } from 'ionicons/icons';
import { LIGHT_ZONE, MUSIC_ZONE, scenes, tracks, type LightZone, type MusicZone, type SceneId } from '@tib/yacht-core';
import { t, useYacht, yacht } from '@tib/yacht-app';
import { Header } from './parts';

const SCENE_ICON: Record<SceneId, string> = { sunset: sunny, party: sparkles, privacy: eyeOff, sleep: bed };
const COLORS: { value: string; name: string }[] = [
  { value: '#FFE2B8', name: 'Тёплый' },
  { value: '#FFB36B', name: 'Янтарь' },
  { value: '#FF6BB5', name: 'Розовый' },
  { value: '#B36BFF', name: 'Сирень' },
  { value: '#3EC5FF', name: 'Бирюза' },
];

export function Ambience() {
  const scene = useYacht((s) => s.scene);
  const music = useYacht((s) => s.music);
  const lights = useYacht((s) => s.lights);
  const y = yacht.getState();
  const track = tracks.find((x) => x.id === music.trackId)!;

  return (
    <>
      <Header title={t('ambience')} />
      <IonContent fullscreen color="light">
        <IonListHeader>
          <IonLabel>{t('scenes')}</IonLabel>
        </IonListHeader>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
          {Object.values(scenes).map((s) => {
            const active = scene === s.id;
            return (
              <IonCard key={s.id} button color={active ? 'primary' : undefined} onClick={() => y.applyScene(s.id)} style={{ margin: 0 }} aria-pressed={active}>
                <IonCardContent>
                  <IonIcon icon={SCENE_ICON[s.id]} style={{ fontSize: 28 }} />
                  <div style={{ fontSize: 17, fontWeight: 600, marginTop: 6 }}>{s.name.ru}</div>
                </IonCardContent>
              </IonCard>
            );
          })}
        </div>

        <IonList inset>
          <IonListHeader>
            <IonLabel>{t('music')}</IonLabel>
          </IonListHeader>
          <IonItem lines="full">
            <IonIcon slot="start" icon={musicalNotes} color="primary" />
            <IonLabel>
              <h2 style={{ fontWeight: 600 }}>{track.title}</h2>
              <p>{track.artist}</p>
            </IonLabel>
            <IonButton slot="end" fill="clear" onClick={() => y.skip(-1)} aria-label={t('prev')}>
              <IonIcon slot="icon-only" icon={playSkipBack} />
            </IonButton>
            <IonButton slot="end" fill="clear" onClick={() => y.togglePlay()} aria-label={music.playing ? t('pause') : t('play')}>
              <IonIcon slot="icon-only" icon={music.playing ? pause : play} />
            </IonButton>
            <IonButton slot="end" fill="clear" onClick={() => y.skip(1)} aria-label={t('next')}>
              <IonIcon slot="icon-only" icon={playSkipForward} />
            </IonButton>
          </IonItem>
          {(Object.keys(music.volume) as MusicZone[]).map((z) => (
            <IonItem key={z}>
              <IonRange labelPlacement="stacked" label={MUSIC_ZONE[z].ru} min={0} max={100} value={music.volume[z]} onIonChange={(e) => y.setVolume(z, e.detail.value as number)}>
                <IonIcon slot="start" icon={volumeLow} />
                <IonIcon slot="end" icon={volumeHigh} />
              </IonRange>
            </IonItem>
          ))}
        </IonList>

        <IonList inset>
          <IonListHeader>
            <IonLabel>{t('lights')}</IonLabel>
          </IonListHeader>
          <IonAccordionGroup>
            {(Object.keys(lights) as LightZone[]).map((z) => {
              const l = lights[z];
              return (
                <IonAccordion key={z} value={z}>
                  <IonItem slot="header">
                    <span slot="start" style={{ width: 18, height: 18, borderRadius: 9, background: l.on ? l.color : 'transparent', border: '1.5px solid var(--ion-color-medium)' }} />
                    <IonLabel>{LIGHT_ZONE[z].ru}</IonLabel>
                    <IonNote slot="end">{l.on ? `${l.brightness}%` : t('lightOff')}</IonNote>
                  </IonItem>
                  <div slot="content">
                    <IonItem>
                      <IonToggle checked={l.on} onIonChange={(e) => y.setLight(z, { on: e.detail.checked })}>{t('lightOn')}</IonToggle>
                    </IonItem>
                    <IonItem>
                      <IonRange labelPlacement="stacked" label={t('brightness')} min={0} max={100} value={l.brightness} disabled={!l.on} onIonChange={(e) => y.setLight(z, { brightness: e.detail.value as number })} />
                    </IonItem>
                    <IonItem lines="none">
                      <IonSegment value={l.color} onIonChange={(e) => y.setLight(z, { color: String(e.detail.value), on: true })} aria-label={t('color')}>
                        {COLORS.map((c) => (
                          <IonSegmentButton key={c.value} value={c.value} aria-label={c.name}>
                            <span style={{ width: 22, height: 22, borderRadius: 11, background: c.value, border: '1px solid rgba(0,0,0,.15)', display: 'block', margin: '6px auto' }} />
                          </IonSegmentButton>
                        ))}
                      </IonSegment>
                    </IonItem>
                  </div>
                </IonAccordion>
              );
            })}
          </IonAccordionGroup>
        </IonList>
        <IonText>
          <div style={{ height: 16 }} />
        </IonText>
      </IonContent>
    </>
  );
}
