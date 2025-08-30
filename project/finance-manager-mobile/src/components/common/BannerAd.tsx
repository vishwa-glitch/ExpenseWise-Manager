import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';

interface BannerAdProps {
  adType?: 'banner' | 'adaptive_banner';
  size?: 'BANNER' | 'FULL_BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE' | 'LEADERBOARD';
  position?: 'top' | 'bottom';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  style?: any;
}

const BannerAd: React.FC<BannerAdProps> = ({
  adType = 'banner',
  size = 'BANNER',
  position = 'bottom',
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed,
  style,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [adComponent, setAdComponent] = useState<React.ReactNode>(null);

  useEffect(() => {
    initializeAd();
  }, [adType, size]);

  const initializeAd = async () => {
    try {
      setIsLoading(true);
      setHasError(false);

      // Check if we're in Expo managed workflow
      const isExpoManaged = Platform.select({
        native: false,
        default: true,
      });

      if (isExpoManaged) {
        // Use mock banner for Expo managed workflow
        setMockBanner();
        return;
      }

      // Try to load real AdMob banner
      // Temporarily disabled due to build issues
// const { BannerAd, TestIds } = require('react-native-google-mobile-ads');
             // const { getAdUnitId } = require('../../config/adMobConfig');

       // const adUnitId = getAdUnitId(adType);
      
             // const bannerComponent = (
       //   <BannerAd
       //     unitId={adUnitId}
       //     size={size}
       //     requestOptions={{
       //       requestNonPersonalizedAdsOnly: true,
       //       keywords: ['finance', 'budget', 'money', 'expense', 'banking'],
       //     }}
       //     onAdLoaded={() => {
       //       console.log('📱 Banner ad loaded successfully');
       //       setIsLoading(false);
       //       onAdLoaded?.();
       //     }}
       //     onAdFailedToLoad={(error: any) => {
       //       console.error('❌ Banner ad failed to load:', error);
       //       setIsLoading(false);
       //       setHasError(true);
       //       onAdFailedToLoad?.(error);
       //     }}
       //     onAdOpened={() => {
       //       console.log('📱 Banner ad opened');
       //       onAdOpened?.();
       //     }}
       //     onAdClosed={() => {
       //       console.log('📱 Banner ad closed');
       //       onAdClosed?.();
       //     }}
       //   />
       // );

              // setAdComponent(bannerComponent);
    } catch (error) {
      console.log('📱 AdMob not available, using mock banner');
      setMockBanner();
    }
  };

  const setMockBanner = () => {
    // Create a mock banner for development
    const mockBanner = (
      <TouchableOpacity
        style={[styles.mockBanner, { backgroundColor: colors.primary }]}
        onPress={() => {
          Alert.alert(
            'Mock Ad Clicked! 🎯',
            'This is a mock banner ad for development. In production, this would open a real ad.',
            [
              { text: 'OK', onPress: () => onAdClosed?.() }
            ]
          );
          onAdOpened?.();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.mockBannerContent}>
          <Text style={styles.mockBannerText}>
            📱 TEST BANNER AD
          </Text>
          <Text style={styles.mockBannerSubtext}>
            {adType === 'adaptive_banner' ? 'Adaptive Banner' : 'Fixed Banner'} - {size}
          </Text>
          <Text style={styles.mockBannerSubtext}>
            Tap to simulate ad interaction
          </Text>
        </View>
      </TouchableOpacity>
    );

    setAdComponent(mockBanner);
    setIsLoading(false);
    
    // Simulate ad loaded callback
    setTimeout(() => {
      onAdLoaded?.();
    }, 500);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading ad...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>Ad not available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {adComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
  },
  mockBanner: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mockBannerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  mockBannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  mockBannerSubtext: {
    color: 'white',
    fontSize: 11,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default BannerAd;
