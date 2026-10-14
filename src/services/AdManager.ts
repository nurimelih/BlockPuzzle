import {
  RewardedAd,
  RewardedAdEventType,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Production Ad Unit IDs (iOS)
const AD_UNIT_IDS = {
  ios: {
    rewarded: __DEV__
      ? TestIds.REWARDED
      : 'ca-app-pub-8246871597477592/4293957749',
    interstitial: __DEV__
      ? TestIds.INTERSTITIAL
      : 'ca-app-pub-8246871597477592/1156766311',
  },
  android: {
    rewarded: __DEV__
      ? TestIds.REWARDED
      : 'ca-app-pub-8246871597477592/1065159176',
    interstitial: __DEV__
      ? TestIds.INTERSTITIAL
      : 'ca-app-pub-8246871597477592/1236657367',
  },
};

import {Platform} from 'react-native';
import {Analytics} from './Analytics.ts';
import {GameStorage} from './GameStorage.ts';
import {useAppStore} from '../state/useAppStore.ts';
import {
  DEFAULT_AD_PACING_CONFIG,
  shouldShowInterstitial,
} from '../core/progression.ts';

const getAdUnitId = (type: 'rewarded' | 'interstitial') => {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  return AD_UNIT_IDS[platform][type];
};

// When true in DEV mode, ads behave as if ready (skip actual ad, grant reward)
let adsAreActiveInTest = false;

// Rewarded Ad instance
let rewardedAd: RewardedAd | null = null;
let isRewardedAdLoaded = false;

// Interstitial Ad instance
let interstitialAd: InterstitialAd | null = null;
let isInterstitialAdLoaded = false;

// Any full-screen ad pushes the next interstitial back by the minimum gap
const markAdShown = async (resetLevelCount: boolean) => {
  const pacing = await GameStorage.getAdPacing();
  await GameStorage.saveAdPacing({
    levelsSinceAd: resetLevelCount ? 0 : pacing.levelsSinceAd,
    lastAdAt: Date.now(),
  });
};

/**
 * Initialize and preload ads
 */
export const initAds = () => {
  loadRewardedAd();
  loadInterstitialAd();
};

/**
 * Load a rewarded ad (for hints)
 */
export const loadRewardedAd = () => {
  if (rewardedAd) {
    rewardedAd.removeAllListeners();
  }

  rewardedAd = RewardedAd.createForAdRequest(getAdUnitId('rewarded'), {
    keywords: ['puzzle', 'game', 'casual'],
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    isRewardedAdLoaded = true;
    console.log('[AdManager] Rewarded ad loaded');
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
    console.log('[AdManager] User earned reward:', reward);
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, error => {
    console.log('[AdManager] Rewarded ad error:', error);
    isRewardedAdLoaded = false;
    // Retry loading after error
    setTimeout(loadRewardedAd, 30000);
  });

  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('[AdManager] Rewarded ad closed');
    isRewardedAdLoaded = false;
    // Preload next ad
    loadRewardedAd();
  });

  rewardedAd.load();
};

/**
 * Show rewarded ad for hint
 * @returns Promise that resolves to true if user earned reward
 */
export const showRewardedAd = (): Promise<boolean> => {
  return new Promise(resolve => {
    if (!rewardedAd || !isRewardedAdLoaded) {
      console.log('[AdManager] Rewarded ad not ready');
      if (__DEV__ && adsAreActiveInTest) {
        console.log('[AdManager] DEV mode - granting reward without ad');
        resolve(true);
        return;
      }
      resolve(false);
      return;
    }

    let rewarded = false;

    const rewardListener = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewarded = true;
      },
    );

    const finish = () => {
      rewardListener();
      closeListener();
      errorListener();
      markAdShown(false);
      if (rewarded) {
        Analytics.logAdRewarded(useAppStore.getState().currentLevel);
      }
      resolve(rewarded);
    };

    const closeListener = rewardedAd.addAdEventListener(AdEventType.CLOSED, finish);
    const errorListener = rewardedAd.addAdEventListener(AdEventType.ERROR, finish);

    rewardedAd.show().catch(finish);
  });
};

/**
 * Check if rewarded ad is ready
 */
export const isRewardedAdReady = () =>
  (__DEV__ && adsAreActiveInTest) || isRewardedAdLoaded;

/**
 * Load an interstitial ad
 */
export const loadInterstitialAd = () => {
  if (interstitialAd) {
    interstitialAd.removeAllListeners();
  }

  interstitialAd = InterstitialAd.createForAdRequest(
    getAdUnitId('interstitial'),
    {
      keywords: ['puzzle', 'game', 'casual'],
    },
  );

  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    isInterstitialAdLoaded = true;
    console.log('[AdManager] Interstitial ad loaded');
  });

  interstitialAd.addAdEventListener(AdEventType.ERROR, error => {
    console.log('[AdManager] Interstitial ad error:', error);
    isInterstitialAdLoaded = false;
    setTimeout(loadInterstitialAd, 30000);
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('[AdManager] Interstitial ad closed');
    isInterstitialAdLoaded = false;
    loadInterstitialAd();
  });

  interstitialAd.load();
};

/**
 * Count a completed level towards interstitial pacing.
 * Call when a level is won; the ad itself is shown later, on the next transition.
 */
export const registerLevelComplete = async () => {
  const pacing = await GameStorage.getAdPacing();
  await GameStorage.saveAdPacing({
    ...pacing,
    levelsSinceAd: pacing.levelsSinceAd + 1,
  });
};

/**
 * Show an interstitial if pacing allows. Resolves once the ad is closed (or
 * immediately when skipped), so callers can await it before navigating.
 */
export const showInterstitialIfReady = async (): Promise<boolean> => {
  const {appSettings} = useAppStore.getState();
  if (!appSettings.interstitialAdsActive) return false;

  const [pacing, completed] = await Promise.all([
    GameStorage.getAdPacing(),
    GameStorage.getCompletedLevels(),
  ]);
  const config = {
    ...DEFAULT_AD_PACING_CONFIG,
    ...(appSettings.levelsBetweenAds !== undefined && {
      levelsBetweenAds: appSettings.levelsBetweenAds,
    }),
    ...(appSettings.minSecondsBetweenAds !== undefined && {
      minSecondsBetweenAds: appSettings.minSecondsBetweenAds,
    }),
  };

  if (!shouldShowInterstitial(pacing, Date.now(), completed.length, config)) {
    console.log('[AdManager] Skipping interstitial', pacing);
    return false;
  }

  if (!interstitialAd || !isInterstitialAdLoaded) {
    console.log('[AdManager] Interstitial ad not ready');
    return false;
  }

  const ad = interstitialAd;
  await markAdShown(true);
  Analytics.logAdInterstitial(useAppStore.getState().currentLevel);

  return new Promise(resolve => {
    const finish = () => {
      closeListener();
      errorListener();
      resolve(true);
    };
    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, finish);
    const errorListener = ad.addAdEventListener(AdEventType.ERROR, finish);
    ad.show().catch(finish);
  });
};

/**
 * Check if interstitial ad is ready
 */
export const isInterstitialAdReady = () => isInterstitialAdLoaded;

export const setAdsActiveInTest = (active: boolean) => {
  adsAreActiveInTest = active;
  console.log(`[AdManager] DEV ads active: ${active}`);
};

export const getAdsActiveInTest = () => adsAreActiveInTest;

export default {
  initAds,
  loadRewardedAd,
  showRewardedAd,
  isRewardedAdReady,
  loadInterstitialAd,
  registerLevelComplete,
  showInterstitialIfReady,
  isInterstitialAdReady,
  setAdsActiveInTest,
  getAdsActiveInTest,
};
