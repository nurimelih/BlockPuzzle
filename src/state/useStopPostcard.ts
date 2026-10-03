import { useTranslation } from 'react-i18next';
import { useAppStore } from './useAppStore.ts';
import { getPostcardIndex } from '../core/journey.ts';
import { localize } from './postcards.ts';
import type { Postcard } from '../types/types.ts';

export type StopPostcard = {
  postcard: Postcard;
  title: string;
  caption?: string;
};

export const useStopPostcard = (stopIndex: number): StopPostcard => {
  const { t, i18n } = useTranslation();
  const postcards = useAppStore(state => state.postcards);
  const postcard = postcards[getPostcardIndex(stopIndex, postcards.length)];

  return {
    postcard,
    title: localize(postcard.title, i18n.language) ?? t('journey.stop', { number: stopIndex + 1 }),
    caption: localize(postcard.caption, i18n.language),
  };
};
