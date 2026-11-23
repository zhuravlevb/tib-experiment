import { useState } from 'react';
import { IonApp, IonCard, IonCardContent, IonContent, IonHeader, IonLabel, IonList, IonListHeader, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { ScreenFrame, useBound, useInterval } from '@tib/react';
import { getRestaurant, isFresh, S, type BoardEntry } from '@tib/kiosk-core';
import { createBoard } from '@tib/kiosk-app';
import { Logo } from '../media';

const board = createBoard();
const both = (k: keyof typeof S) => `${S[k].ru} · ${S[k].en}`;

/** Номер всегда рядом с логотипом и названием ресторана. */
function Ticket({ e, now }: { e: BoardEntry; now: number }) {
  const r = getRestaurant(e.restaurantId);
  const fresh = isFresh(e, now);
  const act = () => (e.status === 'cooking' ? board.getState().markReady(e.key) : board.getState().collect(e.key));
  return (
    <IonCard button onClick={act} color={fresh ? 'success' : undefined} style={{ margin: 0 }}>
      <IonCardContent style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Logo id={r.id} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.2 }}>{r.name}</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>{e.code}</div>
        </div>
        <div style={{ fontSize: 44, fontWeight: 700 }}>{e.number}</div>
      </IonCardContent>
    </IonCard>
  );
}

function Column({ title, list, now }: { title: string; list: BoardEntry[]; now: number }) {
  return (
    <div>
      <IonList style={{ background: 'transparent' }}>
        <IonListHeader>
          <IonLabel style={{ fontSize: 28 }}>
            {title} <IonText color="medium">({list.length})</IonText>
          </IonLabel>
        </IonListHeader>
      </IonList>
      {list.length === 0 && (
        <IonText color="medium">
          <p className="ion-padding-horizontal">{both('boardEmpty')}</p>
        </IonText>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px' }}>
        {list.map((e) => <Ticket key={e.key} e={e} now={now} />)}
      </div>
    </div>
  );
}

export default function BoardApp() {
  const entries = useBound(board, (s) => s.entries);
  const [now, setNow] = useState(Date.now());
  useInterval(() => {
    board.getState().tick();
    setNow(Date.now());
  }, 1000);
  const ready = entries.filter((e) => e.status === 'ready').sort((a, b) => b.readyAt - a.readyAt);
  const cooking = entries.filter((e) => e.status === 'cooking');
  return (
    <ScreenFrame width={1920} height={1080} density={1.5} background="#e5e5ea">
      <IonApp>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{both('board')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent color="light">
          <IonText color="medium">
            <p className="ion-padding-horizontal">{both('boardHint')}</p>
          </IonText>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <Column title={both('cooking')} list={cooking} now={now} />
            <Column title={both('ready')} list={ready} now={now} />
          </div>
        </IonContent>
      </IonApp>
    </ScreenFrame>
  );
}
