// Web preview only: AdMob has no web SDK. Ads never load, so the game behaves
// as if no ad is ready (hint/retry-with-ad buttons stay hidden).
const noopAd = {
  addAdEventListener: () => () => {},
  removeAllListeners: () => {},
  load: () => {},
  show: () => Promise.resolve(),
};

module.exports = {
  RewardedAd: { createForAdRequest: () => ({ ...noopAd }) },
  InterstitialAd: { createForAdRequest: () => ({ ...noopAd }) },
  RewardedAdEventType: { LOADED: 'loaded', EARNED_REWARD: 'earned_reward' },
  AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed' },
  TestIds: { REWARDED: 'test', INTERSTITIAL: 'test' },
};
