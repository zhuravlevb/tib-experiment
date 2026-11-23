import { useState } from 'react';
import { App, Block, BlockTitle, Card, CardContent, Navbar, Page, View } from 'framework7-react';
import { ScreenFrame, useBound, useInterval } from '@tib/react';
import { getRestaurant, isFresh, S, type BoardEntry } from '@tib/kiosk-core';
import { createBoard } from '@tib/kiosk-app';
import { Logo } from '../media';

const board = createBoard();
const both = (k: keyof typeof S) => `${S[k].ru} · ${S[k].en}`;

/** Карточка номера: монограмма и цвет бренда + номер. Номер без бренда не показывается. */
function Ticket({ e, now }: { e: BoardEntry; now: number }) {
  const r = getRestaurant(e.restaurantId);
  const fresh = isFresh(e, now);
  const act = () => (e.status === 'cooking' ? board.getState().markReady(e.key) : board.getState().collect(e.key));
  return (
    <div onClick={act} role="button" aria-label={`${r.name} ${e.number}`}>
      <Card raised={fresh} outline={!fresh} style={{ margin: 0, transform: fresh ? 'scale(1.04)' : undefined, background: fresh ? 'var(--f7-md-primary-container, var(--f7-theme-color))' : undefined }}>
        <CardContent style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Logo id={r.id} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>{r.name}</div>
            <div style={{ fontSize: 14, opacity: 0.7 }}>{e.code}</div>
          </div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{e.number}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function Column({ title, list, now }: { title: string; list: BoardEntry[]; now: number }) {
  return (
    <div>
      <BlockTitle large>{title} <span style={{ opacity: 0.6 }}>({list.length})</span></BlockTitle>
      <Block>
        {list.length === 0 && <p style={{ opacity: 0.6, fontSize: 20 }}>{both('boardEmpty')}</p>}
        <div className="grid grid-cols-2 grid-gap">
          {list.map((e) => <Ticket key={e.key} e={e} now={now} />)}
        </div>
      </Block>
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
    <ScreenFrame width={1920} height={1080} density={1.5} background="#dfe5e4">
      <App theme="md" name="Табло" darkMode={false} colors={{ primary: '#006A6A' }}>
        <View main>
          <Page>
            <Navbar title={both('board')} subtitle={both('boardHint')} />
            <div className="grid grid-cols-2 grid-gap">
              <Column title={both('cooking')} list={cooking} now={now} />
              <Column title={both('ready')} list={ready} now={now} />
            </div>
          </Page>
        </View>
      </App>
    </ScreenFrame>
  );
}
