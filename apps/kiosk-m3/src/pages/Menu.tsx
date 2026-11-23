import { Block, Card, CardContent, Chip, Link, Navbar, Page, Tab, Tabs, Toolbar } from 'framework7-react';
import { filterItems, getRestaurant, loyaltyText, menuOf } from '@tib/kiosk-core';
import { openItem, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { DishMedia } from '../media';
import { CartFab, DietChips, NavActions } from './parts';

export default function Menu({ f7route }: { f7route: { params: { id: string } } }) {
  const t = useT();
  const r = getRestaurant(f7route.params.id);
  const filter = useKiosk((s) => s.filter);
  const items = filterItems(menuOf(r.id), filter);

  return (
    // M3 dynamic color: интерфейс ресторана строится от seed-цвета бренда
    <Page onPageBeforeIn={() => setTint(r.brandColor)}>
      <Navbar title={r.name} subtitle={t(r.cuisine)} backLink>
        <NavActions />
      </Navbar>
      <Toolbar tabbar top scrollable>
        {r.categories.map((c, i) => (
          <Link key={c.id} tabLink={`#cat-${r.id}-${c.id}`} tabLinkActive={i === 0}>
            {t(c.name)}
          </Link>
        ))}
      </Toolbar>
      <Tabs>
        {r.categories.map((c, i) => {
          const list = items.filter((x) => x.categoryId === c.id);
          return (
            <Tab key={c.id} id={`cat-${r.id}-${c.id}`} tabActive={i === 0}>
              {r.loyalty && (
                <Block>
                  <Chip text={`★ ${t(loyaltyText(r.loyalty))}`} />
                </Block>
              )}
              {list.length === 0 && <Block>{t('nothingMatches')}</Block>}
              <div className="grid grid-cols-2 grid-gap" style={{ padding: '0 16px 120px' }}>
                {list.map((i) => (
                  <Link key={i.id} noLinkClass onClick={() => i.available && openItem(i.id)} style={{ display: 'block' }} aria-disabled={!i.available}>
                    <Card raised style={{ margin: 0, overflow: 'hidden', opacity: i.available ? 1 : 0.5 }}>
                      <CardContent padding={false}>
                        <DishMedia item={i} height={170} />
                        <div style={{ padding: 16, display: 'grid', gap: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 21, fontWeight: 700 }}>
                            <span>{t(i.name)}</span>
                            <span>{rub(i.price)}</span>
                          </div>
                          <div style={{ fontSize: 15, opacity: 0.75 }}>{t(i.description)}</div>
                          {!i.available && <Chip text={t('soldOut')} />}
                          <DietChips tags={i.tags} allergens={i.allergens} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </Tab>
          );
        })}
      </Tabs>
      <CartFab />
    </Page>
  );
}
