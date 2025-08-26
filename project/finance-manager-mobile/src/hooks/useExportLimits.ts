import { useState, useEffect } from 'react';
import { useTypedSelector } from './useTypedSelector';
import { adMobService } from '../services/adMobService';
import { apiService } from '../services/api';

interface ExportEligibility {
  can_export: boolean;
  reason?: string;
  options?: Array<{
    type: 'watch_ad' | 'upgrade';
    title: string;
    description: string;
    reward?: string;
    price?: string;
  }>;
}

interface UsageStats {
  subscription_tier: string;
  daily_usage: {
    export: {
      free_used: number;
      ad_used: number;
      total_used: number;
      ad_limit: number;
      ad_remaining: number;
    };
  };
}

interface RewardAdResult {
  success: boolean;
  unlock_token?: string;
  expires_in?: number;
  feature_unlocked?: string;
  ad_transaction_id?: string;
}

export const useExportLimits = () => {
  const { profile } = useTypedSelector((state) => state.user);
  const [eligibility, setEligibility] = useState<ExportEligibility | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [currentUnlockToken, setCurrentUnlockToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // TEMPORARY: All users are considered premium for app launch
  const isPremium = true;

  useEffect(() => {
    // Load initial eligibility and usage stats
    loadEligibility();
    loadUsageStats();
  }, []);

  const loadEligibility = async () => {
    try {
      console.log('🔍 Loading export eligibility from backend...');
      const data = await apiService.checkExportEligibility();
      console.log('✅ Backend eligibility response:', data);
      setEligibility(data);
    } catch (error) {
      console.error('❌ Error loading export eligibility:', error);
      // TEMPORARY: All users have unlimited exports for app launch
      setEligibility({
        can_export: true,
        reason: undefined,
        options: []
      });
    }
  };

  const loadUsageStats = async () => {
    try {
      const data = await apiService.getUserUsage();
      setUsageStats(data);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };

  const canExport = (): boolean => {
    // TEMPORARY: All users can export for app launch
    return true;
  };

  const getRemainingExports = (): number => {
    // TEMPORARY: All users have unlimited exports for app launch
    return -1;
  };

  const getExportLimitInfo = (): string => {
    // TEMPORARY: All users have unlimited exports for app launch
    return 'Unlimited exports available';
  };

  const getLimitStatus = () => {
    // TEMPORARY: All users have unlimited exports for app launch
    return { canExport: true, needsAd: false, remaining: -1 };
  };

  const getExportOptions = () => {
    // TEMPORARY: No export options needed for app launch
    return [];
  };

  const getCurrentUnlockToken = (): string | null => {
    return currentUnlockToken;
  };

  const showRewardedAd = async (): Promise<boolean> => {
    // No-op function - no ads during app launch
    return false;
  };

  const recordExport = async () => {
    // Reset unlock token after export
    setCurrentUnlockToken(null);
    
    // Refresh eligibility and usage stats
    await loadEligibility();
    await loadUsageStats();
  };

  return {
    canExport: canExport(),
    getRemainingExports,
    recordExport,
    showRewardedAd,
    getExportLimitInfo,
    getLimitStatus,
    getCurrentUnlockToken,
    getExportOptions,
    isAdReady: adMobService.isAdReady(),
    isLoadingAd: adMobService.isLoadingAd() || isLoading,
    eligibility,
    usageStats,
  };
};
