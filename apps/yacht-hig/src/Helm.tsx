import { IonButton, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonRange, IonSegment, IonSegmentButton, IonText, IonToggle } from '@ionic/react';
import { arrowRedo, arrowUndo, boat, location, stopCircle } from 'ionicons/icons';
import { ABS_MAX_SPEED, canSteer, compass, LIMIT_REASON, THROTTLE_PRESETS, ZONE_LABEL, type ThrottlePreset } from '@tib/yacht-core';
import { t, useYacht, yacht } from '@tib/yacht-app';
import { Header } from './parts';

const PRESETS: ThrottlePreset[] = ['stop', 'slow', 'cruise', 'full'];

export function Helm() {
  const helm = useYacht((s) => s.helm);
  const weather = useYacht((s) => s.weather);
  const zone = useYacht((s) => s.zone);
  const control = useYacht((s) => s.control);
  const autopilot = useYacht((s) => s.autopilot);
  const maxSpeed = useYacht((s) => s.limits().maxSpeed);
  const limitReason = useYacht((s) => s.limits().reason);
  const y = yacht.getState();
  const owner = canSteer(control);
  const steerable = owner && helm.mode === 'underway';
  const preset = PRESETS.find((p) => THROTTLE_PRESETS[p] === helm.targetSpeed) ?? '';

  return (
    <>
      <Header title={t('helm')} />
      <IonContent fullscreen color="light">
        {/* Приборы: inset-группа, как в системных приложениях iOS */}
        <IonList inset>
          <IonItem lines="none">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', padding: '12px 0' }}>
            <div>
              <IonText color="medium"><div style={{ fontSize: 13 }}>{t('speed')}</div></IonText>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.05, color: 'var(--ion-text-color)' }}>
                {helm.speed.toFixed(0)}
                <span style={{ fontSize: 18, fontWeight: 500 }}> {t('knots')}</span>
              </div>
            </div>
            <div>
              <IonText color="medium"><div style={{ fontSize: 13 }}>{t('heading')}</div></IonText>
              <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.05, color: 'var(--ion-text-color)' }}>
                {helm.heading}°<span style={{ fontSize: 18, fontWeight: 500 }}> {compass(helm.heading, 'ru')}</span>
              </div>
            </div>
            <IonText color="medium" style={{ gridColumn: '1 / -1', fontSize: 14 }}>
              {t('wind')} {weather.windKn} {t('knots')} · {t('waves')} {weather.waveM.toLocaleString('ru')} {t('m')} · {ZONE_LABEL[zone].ru}
            </IonText>
          </div>
          </IonItem>
        </IonList>

        {!owner && (
          <IonText color="medium">
            <p className="ion-padding-horizontal" style={{ fontSize: 14 }}>{t('readOnly')}</p>
          </IonText>
        )}

        <div className="ion-padding-horizontal">
          <IonSegment value={helm.mode} disabled={!owner} onIonChange={(e) => y.setMode(e.detail.value as 'anchored' | 'underway')}>
            <IonSegmentButton value="anchored" layout="icon-start">
              <IonIcon icon={location} />
              <IonLabel>{t('anchored')}</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="underway" layout="icon-start">
              <IonIcon icon={boat} />
              <IonLabel>{t('underway')}</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <IonList inset>
          <IonListHeader>
            <IonLabel>
              {t('throttle')}: {helm.targetSpeed} {t('knots')}
            </IonLabel>
          </IonListHeader>
          <IonItem>
            <IonRange
              aria-label={t('throttle')}
              min={0}
              max={ABS_MAX_SPEED}
              step={1}
              ticks
              snaps={false}
              pin
              value={helm.targetSpeed}
              disabled={!steerable}
              onIonChange={(e) => y.setThrottle(e.detail.value as number)}
            >
              <IonNote slot="start">0</IonNote>
              <IonNote slot="end">{ABS_MAX_SPEED}</IonNote>
            </IonRange>
          </IonItem>
          <IonItem lines="none">
            <IonSegment value={preset} disabled={!steerable} onIonChange={(e) => e.detail.value && y.setThrottle(e.detail.value as ThrottlePreset)}>
              {PRESETS.map((p) => (
                <IonSegmentButton key={p} value={p}>
                  <IonLabel>{t(p)}</IonLabel>
                </IonSegmentButton>
              ))}
            </IonSegment>
          </IonItem>
        </IonList>
        {owner && (
          <IonText color="medium">
            <p className="ion-padding-horizontal" style={{ fontSize: 13, marginTop: -8 }}>
              {t('limit')} {maxSpeed} {t('knots')}
              {limitReason ? `: ${LIMIT_REASON[limitReason].ru}` : ''}
            </p>
          </IonText>
        )}

        <IonList inset>
          <IonListHeader>
            <IonLabel>{t('steer')}</IonLabel>
          </IonListHeader>
          <IonItem lines="none">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', padding: '6px 0' }}>
              <IonButton fill="outline" disabled={!steerable} onClick={() => y.turn(-10)}>
                <IonIcon slot="start" icon={arrowUndo} />
                10°
              </IonButton>
              <IonButton fill="outline" disabled={!steerable} onClick={() => y.turn(10)}>
                10°
                <IonIcon slot="end" icon={arrowRedo} />
              </IonButton>
            </div>
          </IonItem>
          <IonItem>
            <IonToggle checked={helm.holdCourse} disabled={!steerable} onIonChange={(e) => y.setHoldCourse(e.detail.checked)}>
              <IonLabel>
                {t('holdCourse')}
                <p>
                  {t('heading')} {helm.targetHeading}°
                </p>
              </IonLabel>
            </IonToggle>
          </IonItem>
        </IonList>

        <div className="ion-padding-horizontal" style={{ display: 'grid', gap: 8, paddingBottom: 24 }}>
          <IonButton expand="block" shape="round" color="danger" disabled={!owner} onClick={() => y.stop()}>
            <IonIcon slot="start" icon={stopCircle} />
            {t('stop')}
          </IonButton>
          <IonButton expand="block" shape="round" fill="outline" disabled={!owner} onClick={() => y.goToAnchorage()}>
            <IonIcon slot="start" icon={location} />
            {t('toAnchorage')}
          </IonButton>
          {autopilot && (
            <IonText color="medium">
              <p style={{ textAlign: 'center', fontSize: 14, margin: 0 }}>
                {t('anchorageEta')} {Math.ceil(autopilot.eta)} {t('sec')}
              </p>
            </IonText>
          )}
        </div>
      </IonContent>
    </>
  );
}
