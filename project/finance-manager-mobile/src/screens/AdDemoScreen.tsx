import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing } from '../constants/colors';
// BannerAd and AdaptiveBannerAd imports removed for now - files kept for future use
// See BANNER_ADS_IMPLEMENTATION.md for re-enabling instructions
// import { BannerAd, AdaptiveBannerAd } from '../components/common';

const AdDemoScreen: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  const [showAdaptiveBanner, setShowAdaptiveBanner] = useState(true);

  const handleAdLoaded = (adType: string) => {
    console.log(`✅ ${adType} loaded successfully`);
    Alert.alert('Ad Loaded', `${adType} has been loaded successfully!`);
  };

  const handleAdFailed = (adType: string, error: any) => {
    console.log(`❌ ${adType} failed to load:`, error);
    Alert.alert('Ad Failed', `${adType} failed to load. Check console for details.`);
  };

  const handleAdOpened = (adType: string) => {
    console.log(`📱 ${adType} opened`);
    Alert.alert('Ad Opened', `${adType} has been opened!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>📱 AdMob Banner Ads Demo</Text>
          <Text style={styles.subtitle}>
            Test different banner ad formats with Google's test ad units
          </Text>
          <Text style={styles.subtitle}>
            (Currently disabled - see BANNER_ADS_IMPLEMENTATION.md for re-enabling)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Fixed Size Banner</Text>
          <Text style={styles.sectionDescription}>
            Standard banner ad with fixed dimensions (320x50)
          </Text>
          
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, showBanner && styles.buttonActive]}
              onPress={() => setShowBanner(!showBanner)}
            >
              <Text style={styles.buttonText}>
                {showBanner ? 'Hide Banner' : 'Show Banner'}
              </Text>
            </TouchableOpacity>
          </View>

          {showBanner && (
            <View style={styles.adContainer}>
              <Text style={styles.disabledText}>
                Banner Ad Component Disabled
              </Text>
              {/* BannerAd component removed for now - files kept for future use */}
              {/* See BANNER_ADS_IMPLEMENTATION.md for re-enabling instructions */}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📐 Adaptive Banner</Text>
          <Text style={styles.sectionDescription}>
            Responsive banner that adapts to screen width
          </Text>
          
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, showAdaptiveBanner && styles.buttonActive]}
              onPress={() => setShowAdaptiveBanner(!showAdaptiveBanner)}
            >
              <Text style={styles.buttonText}>
                {showAdaptiveBanner ? 'Hide Adaptive Banner' : 'Show Adaptive Banner'}
              </Text>
            </TouchableOpacity>
          </View>

          {showAdaptiveBanner && (
            <View style={styles.adContainer}>
              <Text style={styles.disabledText}>
                Adaptive Banner Ad Component Disabled
              </Text>
              {/* AdaptiveBannerAd component removed for now - files kept for future use */}
              {/* See BANNER_ADS_IMPLEMENTATION.md for re-enabling instructions */}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Test Information</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • These are Google's official test ad units
            </Text>
            <Text style={styles.infoText}>
              • Safe to click during development
            </Text>
            <Text style={styles.infoText}>
              • Will show "Test Ad" label in real AdMob
            </Text>
            <Text style={styles.infoText}>
              • Replace with your ad unit IDs for production
            </Text>
            <Text style={styles.infoText}>
              • Currently disabled - see BANNER_ADS_IMPLEMENTATION.md
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Different Banner Sizes</Text>
          <View style={styles.sizeContainer}>
            <Text style={styles.sizeText}>• BANNER: 320x50</Text>
            <Text style={styles.sizeText}>• FULL_BANNER: 468x60</Text>
            <Text style={styles.sizeText}>• LARGE_BANNER: 320x100</Text>
            <Text style={styles.sizeText}>• MEDIUM_RECTANGLE: 300x250</Text>
            <Text style={styles.sizeText}>• LEADERBOARD: 728x90</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  buttonActive: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    ...typography.button,
    color: 'white',
  },
  adContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  disabledText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sizeContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sizeText: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default AdDemoScreen;
