import { adMobService } from '../adMobService';

// Mock react-native-google-mobile-ads
jest.mock('react-native-google-mobile-ads', () => ({
  RewardedAd: {
    createForAdRequest: jest.fn(() => ({
      addAdEventListener: jest.fn(),
      load: jest.fn(),
      show: jest.fn(),
      loaded: false,
    })),
  },
  RewardedAdEventType: {
    LOADED: 'loaded',
    ERROR: 'error',
    OPENED: 'opened',
    CLOSED: 'closed',
    EARNED_REWARD: 'earned_reward',
  },
  TestIds: {
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  },
}));

describe('AdMobService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct configuration', () => {
    expect(adMobService).toBeDefined();
    expect(typeof adMobService.showRewardedAd).toBe('function');
    expect(typeof adMobService.isAdReady).toBe('function');
    expect(typeof adMobService.isLoadingAd).toBe('function');
  });

  it('should have proper method signatures', () => {
    expect(adMobService.showRewardedAd()).toBeInstanceOf(Promise);
    expect(typeof adMobService.isAdReady()).toBe('boolean');
    expect(typeof adMobService.isLoadingAd()).toBe('boolean');
  });

  it('should have preloadAd method', () => {
    expect(typeof adMobService.preloadAd).toBe('function');
    expect(() => adMobService.preloadAd()).not.toThrow();
  });
});
