import { l } from '@tib/shared';
import type { ChefItem, Scene, SceneId, Track } from './types';

export const YACHT_NAME = 'Aurora';

/** Выдуманные треки — без реальных исполнителей. */
export const tracks: Track[] = [
  { id: 't1', title: 'Salt & Linen', artist: 'Harbor Lights', mood: 'lounge' },
  { id: 't2', title: 'Golden Hour', artist: 'Mareva', mood: 'chill' },
  { id: 't3', title: 'Open Water', artist: 'Nine Knots', mood: 'chill' },
  { id: 't4', title: 'Afterdeck', artist: 'Tidal Club', mood: 'party' },
  { id: 't5', title: 'Spinnaker', artist: 'Tidal Club', mood: 'party' },
  { id: 't6', title: 'Low Tide', artist: 'Mareva', mood: 'sleep' },
  { id: 't7', title: 'Moon Wake', artist: 'Harbor Lights', mood: 'sleep' },
];

export const chefMenu: ChefItem[] = [
  { id: 'oysters', name: l('Устрицы, 6 шт.', 'Oysters, 6 pcs'), kind: 'food', prepSec: 10 },
  { id: 'tuna-tartare', name: l('Тартар из тунца', 'Tuna tartare'), kind: 'food', prepSec: 15 },
  { id: 'lobster-roll', name: l('Лобстер-ролл', 'Lobster roll'), kind: 'food', prepSec: 20 },
  { id: 'fruit-platter', name: l('Фруктовое плато', 'Fruit platter'), kind: 'food', prepSec: 8 },
  { id: 'champagne', name: l('Шампанское', 'Champagne'), kind: 'drink', prepSec: 3 },
  { id: 'spritz', name: l('Спритц', 'Spritz'), kind: 'drink', prepSec: 4 },
  { id: 'lemonade', name: l('Домашний лимонад', 'House lemonade'), kind: 'drink', prepSec: 3 },
  { id: 'espresso', name: l('Эспрессо', 'Espresso'), kind: 'drink', prepSec: 2 },
];

const warm = '#FFB36B';
const off = { on: false, brightness: 0, color: '#FFFFFF' };

export const scenes: Record<SceneId, Scene> = {
  sunset: {
    id: 'sunset',
    name: l('Закат', 'Sunset'),
    lights: { deck: { on: true, brightness: 40, color: warm }, salon: { on: true, brightness: 50, color: warm }, underwater: off },
    music: { playing: true, mood: 'chill', volume: { deck: 40, salon: 25 } },
    jacuzzi: { targetTemp: 37, bubbles: true },
    targetSpeed: 6,
  },
  party: {
    id: 'party',
    name: l('Вечеринка', 'Party'),
    lights: { deck: { on: true, brightness: 90, color: '#B36BFF' }, salon: { on: true, brightness: 80, color: '#FF6BB5' }, underwater: { on: true, brightness: 100, color: '#3EC5FF' } },
    music: { playing: true, mood: 'party', volume: { deck: 80, salon: 70 } },
    jacuzzi: { targetTemp: 36, bubbles: true },
    targetSpeed: 0,
  },
  privacy: {
    id: 'privacy',
    name: l('Уединение', 'Privacy'),
    lights: { deck: { on: true, brightness: 15, color: warm }, salon: { on: true, brightness: 20, color: warm }, underwater: off },
    music: { playing: true, mood: 'lounge', volume: { deck: 20, salon: 20, cabins: 15 } },
    jacuzzi: { targetTemp: 38, bubbles: false },
    targetSpeed: null,
  },
  sleep: {
    id: 'sleep',
    name: l('Сон', 'Sleep'),
    lights: { deck: { on: true, brightness: 5, color: warm }, salon: off, cabins: { on: true, brightness: 5, color: warm }, underwater: off },
    music: { playing: true, mood: 'sleep', volume: { deck: 0, salon: 0, cabins: 10 } },
    jacuzzi: { bubbles: false },
    targetSpeed: 0,
  },
};
