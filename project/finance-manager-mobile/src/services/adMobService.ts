import { Platform } from 'react-native';

// Create a no-op service by default
let adMobService: any = {
  showRewardedAd: async () => false,
  isAdReady: () => false,
  isLoadingAd: () => false,
  preloadAd: () => {},
};

// For development builds or bare workflow, try to use real AdMob
try {
  const {
    RewardedAd,
    RewardedAdEventType,
    TestIds,
  } = require('react-native-google-mobile-ads');
  const { getAdUnitId, ADMOB_CONFIG } = require('../config/adMobConfig');

  // Get the appropriate ad unit ID
  const REWARDED_AD_UNIT_ID = getAdUnitId('rewarded');

  class AdMobService {
    private rewardedAd: any = null;
    private isLoading = false;
    private onRewardedCallback: ((success: boolean) => void) | null = null;

    constructor() {
      this.initializeRewardedAd();
    }

    private initializeRewardedAd() {
      this.rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, ADMOB_CONFIG.AD_REQUEST_CONFIG);

      // Set up event listeners
      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('🎬 Rewarded ad loaded');
        this.isLoading = false;
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error: any) => {
        console.error('❌ Rewarded ad error:', error);
        this.isLoading = false;
        if (this.onRewardedCallback) {
          this.onRewardedCallback(false);
          this.onRewardedCallback = null;
        }
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.OPENED, () => {
        console.log('🎬 Rewarded ad opened');
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        console.log('🎬 Rewarded ad closed');
        if (this.onRewardedCallback) {
          this.onRewardedCallback(false);
          this.onRewardedCallback = null;
        }
        // Reload the ad for next use
        this.loadRewardedAd();
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward: any) => {
        console.log('🎁 User earned reward:', reward);
        if (this.onRewardedCallback) {
          this.onRewardedCallback(true);
          this.onRewardedCallback = null;
        }
      });

      // Load the initial ad
      this.loadRewardedAd();
    }

    private async loadRewardedAd() {
      if (this.isLoading || !this.rewardedAd) return;

      try {
        this.isLoading = true;
        await this.rewardedAd.load();
      } catch (error) {
        console.error('❌ Failed to load rewarded ad:', error);
        this.isLoading = false;
      }
    }

    public async showRewardedAd(): Promise<boolean> {
      return new Promise((resolve) => {
        if (!this.rewardedAd) {
          console.log('❌ Rewarded ad not initialized');
          resolve(false);
          return;
        }

        if (this.isLoading) {
          console.log('⏳ Rewarded ad is still loading');
          resolve(false);
          return;
        }

        if (!this.rewardedAd.loaded) {
          console.log('🔄 Rewarded ad not loaded, loading now...');
          this.loadRewardedAd();
          resolve(false);
          return;
        }

        this.onRewardedCallback = resolve;
        this.rewardedAd.show();
      });
    }

    public isAdReady(): boolean {
      return this.rewardedAd?.loaded || false;
    }

    public isLoadingAd(): boolean {
      return this.isLoading;
    }

    public preloadAd() {
      this.loadRewardedAd();
    }
  }

  // If we get here, AdMob is available, so use the real service
  adMobService = new AdMobService();
  console.log('📱 AdMob service initialized successfully');
} catch (error) {
  console.log('📱 AdMob not available, using no-op service');
  // adMobService is already set to no-op service above
}

// Export the service
export { adMobService };
