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

interface AdaptiveBannerAdProps {
  position?: 'top' | 'bottom';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  style?: any;
}

const AdaptiveBannerAd: React.FC<AdaptiveBannerAdProps> = ({
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
  const [bannerSize, setBannerSize] = useState('BANNER');

  useEffect(() => {
    calculateBannerSize();
    initializeAd();
  }, []);

  const calculateBannerSize = () => {
    const { width } = Dimensions.get('window');
    
    // Determine banner size based on screen width
    if (width >= 728) {
      setBannerSize('LEADERBOARD');
    } else if (width >= 468) {
      setBannerSize('FULL_BANNER');
    } else {
      setBannerSize('BANNER');
    }
  };

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
        // Use mock adaptive banner for Expo managed workflow
        setMockAdaptiveBanner();
        return;
      }

      // Try to load real AdMob adaptive banner
      // Temporarily disabled due to build issues
// const { BannerAd } = require('react-native-google-mobile-ads');
             // const { getAdUnitId } = require('../../config/adMobConfig');

       // const adUnitId = getAdUnitId('adaptive_banner');
      
             // const bannerComponent = (
       //   <BannerAd
       //     unitId={adUnitId}
       //     size={bannerSize}
       //     requestOptions={{
       //       requestNonPersonalizedAdsOnly: true,
       //       keywords: ['finance', 'budget', 'money', 'expense', 'banking'],
       //     }}
       //     onAdLoaded={() => {
       //       console.log('📱 Adaptive banner ad loaded successfully');
       //       setIsLoading(false);
       //       onAdLoaded?.();
       //     }}
       //     onAdFailedToLoad={(error: any) => {
       //       console.error('❌ Adaptive banner ad failed to load:', error);
       //       setIsLoading(false);
       //       setHasError(true);
       //       onAdFailedToLoad?.(error);
       //     }}
       //     onAdOpened={() => {
       //       console.log('📱 Adaptive banner ad opened');
       //       onAdOpened?.();
       //     }}
       //     onAdClosed={() => {
       //       console.log('📱 Adaptive banner ad closed');
       //       onAdClosed?.();
       //     }}
       //   />
       // );

       // setAdComponent(bannerComponent);
    } catch (error) {
      console.log('📱 AdMob not available, using mock adaptive banner');
      setMockAdaptiveBanner();
    }
  };

  const setMockAdaptiveBanner = () => {
    const { width } = Dimensions.get('window');
    
    // Create a mock adaptive banner for development
    const mockBanner = (
      <TouchableOpacity
        style={[styles.mockAdaptiveBanner, { backgroundColor: colors.secondary }]}
        onPress={() => {
          Alert.alert(
            'Mock Ad Clicked! 🎯',
            'This is a mock adaptive banner ad for development. In production, this would open a real ad.',
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
            📱 ADAPTIVE BANNER AD
          </Text>
          <Text style={styles.mockBannerSubtext}>
            Test Ad - Size: {bannerSize} | Width: {Math.round(width)}px
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
        <ActivityIndicator size="small" color={colors.secondary} />
        <Text style={styles.loadingText}>Loading adaptive ad...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Text style={styles.errorText}>Adaptive ad not available</Text>
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
    width: '100%',
  },
  loadingContainer: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    width: '100%',
  },
  loadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorContainer: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorLight,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
  },
  mockAdaptiveBanner: {
    width: '100%',
    height: 80,
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  mockBannerSubtext: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 2,
  },
});

export default AdaptiveBannerAd;
