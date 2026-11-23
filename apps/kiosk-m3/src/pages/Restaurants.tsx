import { useState } from 'react';
import { Block, BlockTitle, Card, CardContent, Chip, Link, List, ListItem, Navbar, Page, Searchbar, Subnavbar } from 'framework7-react';
import {
  ALLERGEN_EMOJI,
  ALLERGEN_LABEL,
  DIET_EMOJI,
  DIET_LABEL,
  filterItems,
  getRestaurant,
  matchingCount,
  menu,
  restaurants,
  type Allergen,
  type DietTag,
} from '@tib/kiosk-core';
import { go, kiosk, openItem, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { DishMedia, RestaurantMedia } from '../media';
import { CartFab, NavActions } from './parts';

const DIETS: DietTag[] = ['vegan', 'vegetarian', 'halal', 'spicy'];
const ALLERGENS: Allergen[] = ['gluten', 'dairy', 'nuts', 'egg', 'fish', 'soy', 'sesame'];

const toggleIn = <T,>(list: T[] | undefined, v: T) => (list?.includes(v) ? list.filter((x) => x !== v) : [...(list ?? []), v]);

export default function Restaurants() {
  const t = useT();
  const filter = useKiosk((s) => s.filter);
  const [query, setQuery] = useState('');
  const { setFilter } = kiosk.getState();
  const results = query ? filterItems(menu, { ...filter, query }) : [];
  const hasFilter = !!(filter.requireTags?.length || filter.excludeAllergens?.length);

  return (
    <Page onPageBeforeIn={() => setTint(null)}>
      <Navbar title={t('restaurants')} backLink>
        <NavActions />
        <Subnavbar inner={false}>
          <Searchbar
            customSearch
            disableButton={false}
            placeholder={t('searchAll')}
            onSearchbarSearch={(_sb: unknown, q: string) => setQuery(q)}
            onSearchbarClear={() => setQuery('')}
          />
        </Subnavbar>
      </Navbar>

      {/* M3 filter chips: выбранный чип — заливка и галочка */}
      <BlockTitle>{t('diet')}</BlockTitle>
      <Block style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DIETS.map((d) => {
          const on = filter.requireTags?.includes(d);
          return <Chip key={d} outline={!on} text={`${on ? '✓ ' : ''}${DIET_EMOJI[d]} ${t(DIET_LABEL[d])}`} onClick={() => setFilter({ requireTags: toggleIn(filter.requireTags, d) })} />;
        })}
      </Block>
      <BlockTitle>{t('withoutAllergens')}</BlockTitle>
      <Block style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {ALLERGENS.map((a) => {
          const on = filter.excludeAllergens?.includes(a);
          return <Chip key={a} outline={!on} text={`${on ? '✓ ' : ''}${ALLERGEN_EMOJI[a]} ${t(ALLERGEN_LABEL[a])}`} onClick={() => setFilter({ excludeAllergens: toggleIn(filter.excludeAllergens, a) })} />;
        })}
        {hasFilter && <Chip text={t('resetFilters')} deleteable onDelete={() => setFilter({ requireTags: [], excludeAllergens: [] })} onClick={() => setFilter({ requireTags: [], excludeAllergens: [] })} />}
      </Block>

      {query ? (
        <List mediaList strong inset>
          {results.length === 0 && <ListItem title={t('nothingMatches')} />}
          {results.map((i) => (
            <ListItem key={i.id} link title={t(i.name)} subtitle={getRestaurant(i.restaurantId).name} text={t(i.description)} after={rub(i.price)} disabled={!i.available} onClick={() => openItem(i.id)}>
              <div slot="media" style={{ width: 72, borderRadius: 16, overflow: 'hidden' }}>
                <DishMedia item={i} height={72} />
              </div>
            </ListItem>
          ))}
        </List>
      ) : (
        <div className="grid grid-cols-2 grid-gap" style={{ padding: '0 16px 120px' }}>
          {restaurants.map((r) => {
            const n = matchingCount(r.id, filter);
            return (
              <Link key={r.id} noLinkClass onClick={() => go('menu', r.id)} style={{ display: 'block', opacity: hasFilter && n === 0 ? 0.45 : 1 }} aria-label={r.name}>
                <Card raised style={{ margin: 0, overflow: 'hidden' }}>
                  <CardContent padding={false}>
                    <RestaurantMedia id={r.id} height={190} />
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{r.name}</div>
                      <div style={{ fontSize: 16, opacity: 0.75, marginBottom: 10 }}>{t(r.cuisine)}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {r.loyalty && <Chip text={`★ ${t('loyaltyBadge')}`} />}
                        {hasFilter && <Chip outline text={`${n} ${t('matching')}`} />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      <CartFab />
    </Page>
  );
}
