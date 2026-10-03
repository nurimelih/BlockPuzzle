import { LocalizedText, Postcard } from '../types/types.ts';

// Uzak kartpostallar gelmese de yolculuk bu ikisiyle başlar
export const FALLBACK_POSTCARDS: Postcard[] = [
  {
    source: require('../../assets/background.jpg'),
    title: { en: 'House on the Hill', tr: 'Tepedeki Ev' },
    caption: {
      en: 'The journey begins at the little house on the hill.',
      tr: 'Yolculuk, tepedeki küçük evin kapısında başlıyor.',
    },
  },
  {
    source: require('../../assets/background2.jpg'),
    title: { en: 'City Park', tr: 'Şehir Parkı' },
    caption: {
      en: 'The path winds down into the city, where everyone is out in the sun.',
      tr: 'Yol şehre iniyor; parkta herkes güneşin tadını çıkarıyor.',
    },
  },
];

const FALLBACK_LANGUAGE = 'en';

export const localize = (text: LocalizedText | undefined, language: string): string | undefined => {
  if (text === undefined || typeof text === 'string') return text;
  return text[language] ?? text[FALLBACK_LANGUAGE] ?? Object.values(text)[0];
};
