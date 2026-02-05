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

const getAdUnitId = (type: 'rewarded' | 'interstitial') => {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  return AD_UNIT_IDS[platform][type];
};

// Rewarded Ad instance
let rewardedAd: RewardedAd | null = null;
let isRewardedAdLoaded = false;

// Interstitial Ad instance
let interstitialAd: InterstitialAd | null = null;
let isInterstitialAdLoaded = false;

// Track levels for interstitial frequency
let levelsSinceLastAd = 0;
const LEVELS_BETWEEN_ADS = 3; // Show interstitial every 3 levels

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

    const closeListener = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        rewardListener();
        closeListener();
        resolve(rewarded);
      },
    );

    rewardedAd.show();
  });
};

/**
 * Check if rewarded ad is ready
 */
export const isRewardedAdReady = () => isRewardedAdLoaded;

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
 * Show interstitial ad between levels
 * Call this when a level is completed
 */
export const showInterstitialIfReady = (): Promise<boolean> => {
  return new Promise(resolve => {
    levelsSinceLastAd++;

    if (levelsSinceLastAd < LEVELS_BETWEEN_ADS) {
      console.log(
        `[AdManager] Skipping interstitial (${levelsSinceLastAd}/${LEVELS_BETWEEN_ADS})`,
      );
      resolve(false);
      return;
    }

    if (!interstitialAd || !isInterstitialAdLoaded) {
      console.log('[AdManager] Interstitial ad not ready');
      resolve(false);
      return;
    }

    levelsSinceLastAd = 0;

    const closeListener = interstitialAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        closeListener();
        resolve(true);
      },
    );

    interstitialAd.show();
  });
};

/**
 * Check if interstitial ad is ready
 */
export const isInterstitialAdReady = () => isInterstitialAdLoaded;

export default {
  initAds,
  loadRewardedAd,
  showRewardedAd,
  isRewardedAdReady,
  loadInterstitialAd,
  showInterstitialIfReady,
  isInterstitialAdReady,
};
