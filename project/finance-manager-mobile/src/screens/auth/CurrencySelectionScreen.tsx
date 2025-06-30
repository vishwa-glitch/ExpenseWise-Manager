import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setUserCurrency } from '../../store/slices/userSlice';
import { completeCurrencySelection } from '../../store/slices/authSlice';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { getSupportedCurrencies } from '../../utils/currency';

interface CurrencySelectionScreenProps {
  navigation: any;
  route: any;
}

const CurrencySelectionScreen: React.FC<CurrencySelectionScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);

  const supportedCurrencies = getSupportedCurrencies();

  const handleContinue = async () => {
    if (!selectedCurrency) {
      Alert.alert('Selection Required', 'Please select a currency to continue.');
      return;
    }

    setIsLoading(true);

    try {
      // Update user's preferred currency
      await dispatch(setUserCurrency(selectedCurrency)).unwrap();
      
      // Mark currency selection as complete
      dispatch(completeCurrencySelection());
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save currency preference. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrencyOption = (currency: any) => (
    <TouchableOpacity
      key={currency.code}
      style={[
        styles.currencyOption,
        selectedCurrency === currency.code && styles.currencyOptionSelected,
      ]}
      onPress={() => setSelectedCurrency(currency.code)}
    >
      <Text style={styles.currencySymbol}>{currency.symbol}</Text>
      <Text
        style={[
          styles.currencyCode,
          selectedCurrency === currency.code && styles.currencyCodeSelected,
        ]}
      >
        {currency.code}
      </Text>
      <Text style={styles.currencyName}>{currency.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>Choose Your Currency</Text>
        <Text style={styles.subtitle}>
          Select your preferred currency. This will be used as the default for all your accounts and transactions.
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Available Currencies</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.currencyScrollView}
          contentContainerStyle={styles.currencyScrollContent}
        >
          {supportedCurrencies.map(renderCurrencyOption)}
        </ScrollView>

        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>Selected Currency:</Text>
          <View style={styles.selectedCurrency}>
            <Text style={styles.selectedSymbol}>
              {supportedCurrencies.find(c => c.code === selectedCurrency)?.symbol}
            </Text>
            <Text style={styles.selectedCode}>{selectedCurrency}</Text>
            <Text style={styles.selectedName}>
              {supportedCurrencies.find(c => c.code === selectedCurrency)?.name}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            You can change your currency preference later in the app settings.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          title="Continue"
          onPress={handleContinue}
          loading={isLoading}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  currencyScrollView: {
    flexGrow: 0,
    marginBottom: spacing.xl,
  },
  currencyScrollContent: {
    paddingHorizontal: spacing.sm,
  },
  currencyOption: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    borderWidth: 3,
    borderColor: 'transparent',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  currencySymbol: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  currencyCode: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  currencyCodeSelected: {
    color: colors.primary,
  },
  currencyName: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  selectedLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  selectedCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedSymbol: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  selectedCode: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  selectedName: {
    ...typography.body,
    color: colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.info + '20',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  infoText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  continueButton: {
    width: '100%',
  },
});

export default CurrencySelectionScreen;