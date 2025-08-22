import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { setDisplayCurrency } from '../../store/slices/userSlice';
import { completeCurrencySelection } from '../../store/slices/authSlice';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { currencyService, Currency } from '../../services/currencyService';

interface CurrencySelectionScreenProps {
  navigation: any;
  route: any;
}

const CurrencySelectionScreen: React.FC<CurrencySelectionScreenProps> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setIsLoadingCurrencies(true);
        const supportedCurrencies = await currencyService.getSupportedCurrencies();
        setCurrencies(supportedCurrencies);
      } catch (error) {
        Alert.alert('Error', 'Could not load currencies. Please check your connection.');
      } finally {
        setIsLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) {
      return currencies;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return currencies.filter(
      (currency) =>
        currency.name.toLowerCase().includes(lowercasedQuery) ||
        currency.code.toLowerCase().includes(lowercasedQuery) ||
        currency.symbol.toLowerCase().includes(lowercasedQuery)
    );
  }, [currencies, searchQuery]);

  const handleContinue = async () => {
    if (!selectedCurrency) {
      Alert.alert('Selection Required', 'Please select a currency to continue.');
      return;
    }

    setIsLoading(true);

    try {
      // Store as display currency (used as default for new accounts)
      // This is NOT saved to backend - it's just a UI preference
      dispatch(setDisplayCurrency(selectedCurrency));
      
      // Mark currency selection as complete
      dispatch(completeCurrencySelection());
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save currency preference. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrencyOption = ({ item: currency }: { item: Currency }) => (
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
        <Text style={styles.title}>Select Your Currency</Text>
      </View>
      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search currency (e.g., Dollar, EUR, $)"
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {isLoadingCurrencies ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={filteredCurrencies}
            renderItem={renderCurrencyOption}
            keyExtractor={(item) => item.code}
            style={styles.currencyList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>No currencies found.</Text>
            )}
          />
        )}

        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>Selected Currency:</Text>
          <View style={styles.selectedCurrency}>
            <Text style={styles.selectedSymbol}>
              {currencies.find(c => c.code === selectedCurrency)?.symbol}
            </Text>
            <Text style={styles.selectedCode}>{selectedCurrency}</Text>
            <Text style={styles.selectedName}>
              {currencies.find(c => c.code === selectedCurrency)?.name}
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
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  currencyList: {
    flex: 1,
  },
  emptyListText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  currencyOption: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyOptionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  currencySymbol: {
    fontSize: 24,
    width: 40,
    textAlign: 'center',
    marginRight: spacing.md,
    color: colors.text,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  currencyCodeSelected: {
    color: colors.primary,
  },
  currencyName: {
    ...typography.caption,
    color: colors.textSecondary,
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