import { Block, BlockFooter, BlockTitle, Button, Card, CardContent, Chip, Gauge, Icon, List, ListItem, Range, Segmented, Toggle } from 'framework7-react';
import { ABS_MAX_SPEED, canSteer, compass, LIMIT_REASON, THROTTLE_PRESETS, ZONE_LABEL, type ThrottlePreset } from '@tib/yacht-core';
import { t, useYacht, yacht } from '@tib/yacht-app';

const PRESETS: { id: ThrottlePreset; key: 'stop' | 'slow' | 'cruise' | 'full' }[] = [
  { id: 'stop', key: 'stop' },
  { id: 'slow', key: 'slow' },
  { id: 'cruise', key: 'cruise' },
  { id: 'full', key: 'full' },
];

export function HelmTab() {
  const helm = useYacht((s) => s.helm);
  const weather = useYacht((s) => s.weather);
  const zone = useYacht((s) => s.zone);
  const control = useYacht((s) => s.control);
  const autopilot = useYacht((s) => s.autopilot);
  // примитивы, а не объект: селектор zustand должен возвращать стабильное значение
  const maxSpeed = useYacht((s) => s.limits().maxSpeed);
  const limitReason = useYacht((s) => s.limits().reason);
  const y = yacht.getState();
  const owner = canSteer(control);
  const steerable = owner && helm.mode === 'underway';

  return (
    <>
      <Card raised>
        <CardContent style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Gauge
            type="semicircle"
            value={helm.speed / ABS_MAX_SPEED}
            size={180}
            borderWidth={14}
            borderColor="var(--f7-theme-color)"
            borderBgColor="var(--f7-md-surface-variant, #e0e3e8)"
            valueText={`${helm.speed.toFixed(0)}`}
            valueFontSize={44}
            valueFontWeight={700}
            labelText={`${t('knots')} · ${t('speed').toLowerCase()}`}
            labelFontSize={14}
          />
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{t('heading')}</div>
            <div style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>
              {helm.heading}° <span style={{ fontSize: 18, opacity: 0.7 }}>{compass(helm.heading, 'ru')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <Chip outline text={`${t('wind')} ${weather.windKn} ${t('knots')}`} />
              <Chip outline text={`${t('waves')} ${weather.waveM.toLocaleString('ru')} ${t('m')}`} />
              <Chip outline text={ZONE_LABEL[zone].ru} />
            </div>
          </div>
        </CardContent>
      </Card>

      {!owner && <BlockFooter>{t('readOnly')}</BlockFooter>}

      <Block>
        <Segmented strong round>
          <Button active={helm.mode === 'anchored'} disabled={!owner} onClick={() => y.setMode('anchored')}>
            <Icon material="anchor" size={18} style={{ marginRight: 6 }} />
            {t('anchored')}
          </Button>
          <Button active={helm.mode === 'underway'} disabled={!owner} onClick={() => y.setMode('underway')}>
            <Icon material="sailing" size={18} style={{ marginRight: 6 }} />
            {t('underway')}
          </Button>
        </Segmented>
      </Block>

      <BlockTitle>
        {t('throttle')}: {helm.targetSpeed} {t('knots')}
      </BlockTitle>
      <Block>
        <Range
          min={0}
          max={ABS_MAX_SPEED}
          step={1}
          value={helm.targetSpeed}
          label
          scale
          scaleSteps={4}
          disabled={!steerable}
          onRangeChanged={(v: number) => y.setThrottle(v)}
        />
        <div style={{ height: 32 }} />
        <Segmented raised round>
          {PRESETS.map((p) => (
            <Button key={p.id} active={helm.targetSpeed === THROTTLE_PRESETS[p.id]} disabled={!steerable} onClick={() => y.setThrottle(p.id)}>
              {t(p.key)}
            </Button>
          ))}
        </Segmented>
      </Block>
      <BlockFooter style={{ display: owner ? undefined : 'none' }}>
        {t('limit')} {maxSpeed} {t('knots')}
        {limitReason ? `: ${LIMIT_REASON[limitReason].ru}` : ''}
      </BlockFooter>

      <BlockTitle>{t('steer')}</BlockTitle>
      <Block>
        <div className="grid grid-cols-2 grid-gap">
          <Button large tonal disabled={!steerable} onClick={() => y.turn(-10)}>
            <Icon material="rotate_left" style={{ marginRight: 8 }} />
            10°
          </Button>
          <Button large tonal disabled={!steerable} onClick={() => y.turn(10)}>
            10°
            <Icon material="rotate_right" style={{ marginLeft: 8 }} />
          </Button>
        </div>
      </Block>
      <List strong inset>
        <ListItem title={t('holdCourse')} footer={`${t('heading')} ${helm.targetHeading}°`}>
          <Toggle slot="after" disabled={!steerable} defaultChecked={helm.holdCourse} key={String(helm.holdCourse)} onChange={(e: { target: EventTarget | null }) => y.setHoldCourse((e.target as HTMLInputElement).checked)} />
        </ListItem>
      </List>

      <Block>
        <div className="grid grid-cols-2 grid-gap">
          <Button large fill color="red" disabled={!owner} onClick={() => y.stop()}>
            <Icon material="stop_circle" style={{ marginRight: 8 }} />
            {t('stop')}
          </Button>
          <Button large tonal disabled={!owner} onClick={() => y.goToAnchorage()}>
            <Icon material="anchor" style={{ marginRight: 8 }} />
            {t('toAnchorage')}
          </Button>
        </div>
        {autopilot && (
          <BlockFooter>
            {t('anchorageEta')} {Math.ceil(autopilot.eta)} {t('sec')}
          </BlockFooter>
        )}
      </Block>
    </>
  );
}
