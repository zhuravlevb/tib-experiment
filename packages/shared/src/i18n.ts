export type Lang = 'ru' | 'en';

/** Локализованная строка: всегда есть обе версии. */
export type LText = Record<Lang, string>;

export const tr = (text: LText, lang: Lang): string => text[lang];

export const l = (ru: string, en: string): LText => ({ ru, en });
