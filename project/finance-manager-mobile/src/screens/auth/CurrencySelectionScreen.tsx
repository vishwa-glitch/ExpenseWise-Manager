import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useTypedSelector } from '../../hooks/useTypedSelector';
import { CustomTextInput } from '../../components/common/CustomTextInput';
import { CustomButton } from '../../components/common/CustomButton';
import { colors, typography, spacing } from '../../constants/colors';
import { currencyService, Currency } from '../../services/currencyService';
import { apiService } from '../../services/api';
import { completeCurrencySelection, clearRegistrationCredentials } from '../../store/slices/authSlice';
import { setDisplayCurrency } from '../../store/slices/userSlice';

interface CurrencySelectionScreenProps {
  navigation: any;
}

const CurrencySelectionScreen: React.FC<CurrencySelectionScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, registrationCredentials } = useTypedSelector((state) => state.auth);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        console.log('🔄 Loading supported currencies...');
        setIsLoadingCurrencies(true);
        const supportedCurrencies = await currencyService.getSupportedCurrencies();
        console.log(`✅ Loaded ${supportedCurrencies.length} currencies`);
        setCurrencies(supportedCurrencies);
        
        // Set a default selection if none is selected
        if (!selectedCurrency && supportedCurrencies.length > 0) {
          // Try to find USD first, otherwise use the first currency
          const usdCurrency = supportedCurrencies.find(c => c.code === 'USD');
          const defaultCurrency = usdCurrency || supportedCurrencies[0];
          setSelectedCurrency(defaultCurrency.code);
          console.log(`🎯 Set default currency to: ${defaultCurrency.code}`);
        }
      } catch (error) {
        console.error('❌ Failed to load currencies:', error);
      } finally {
        setIsLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) {
      return currencies;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return currencies.filter(
      (currency) =>
        currency.name.toLowerCase().startsWith(query) ||
        currency.code.toLowerCase().startsWith(query) ||
        currency.symbol.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery]);

  const handleContinue = async () => {
    try {
      console.log('🎯 Setting user currency to:', selectedCurrency);
      console.log('🔐 User authentication status:', isAuthenticated);
      
      if (!isAuthenticated) {
        throw new Error('User is not authenticated');
      }
      
      // Check token status before proceeding
      console.log('🔍 Checking token status before currency change...');
      await apiService.checkTokenStatus();
      
      // Try multiple approaches to set the currency with retry logic
      let currencySet = false;
      const maxRetries = 3; // Reduced retries for better UX
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Attempt ${attempt}/${maxRetries} to set currency...`);
          
          // Method 1: Try the dedicated currency change endpoint
          try {
            console.log('📡 Trying /user/change-currency endpoint...');
            await apiService.changeUserCurrency(selectedCurrency, false);
            console.log('✅ Currency change successful via dedicated endpoint');
            
            // The changeUserCurrency method already stores locally, but let's ensure it
            try {
              await SecureStore.setItemAsync('user_currency', selectedCurrency);
              console.log('✅ User currency preference confirmed locally:', selectedCurrency);
            } catch (storageError) {
              console.error('❌ Failed to store currency preference locally:', storageError);
            }
            
            currencySet = true;
            break;
          } catch (currencyError: any) {
            console.error(`❌ Currency change endpoint failed (attempt ${attempt}):`, currencyError);
            
            // If it's a 401 error, try token refresh
            if (currencyError.response?.status === 401) {
              console.log('🔄 Token expired, attempting refresh...');
              try {
                await apiService.testTokenRefresh();
                console.log('✅ Token refreshed, retrying currency change...');
                await apiService.changeUserCurrency(selectedCurrency, false);
                console.log('✅ Currency change successful after token refresh');
                currencySet = true;
                break;
              } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
              }
            }
          }
          
          // Method 2: Try updating user profile with preferred_currency
          if (!currencySet) {
            try {
              console.log('📡 Trying profile update with preferred_currency...');
              await apiService.updateUserProfile({ preferred_currency: selectedCurrency });
              console.log('✅ Currency set via profile update');
              
              // Store the currency locally after successful profile update
              try {
                await SecureStore.setItemAsync('user_currency', selectedCurrency);
                console.log('✅ User currency preference stored locally after profile update:', selectedCurrency);
              } catch (storageError) {
                console.error('❌ Failed to store currency preference locally:', storageError);
              }
              
              currencySet = true;
              break;
            } catch (profileError: any) {
              console.error(`❌ Profile update failed (attempt ${attempt}):`, profileError);
              
              // If it's a 401 error, try token refresh
              if (profileError.response?.status === 401) {
                console.log('🔄 Token expired, attempting refresh...');
                try {
                  await apiService.testTokenRefresh();
                  console.log('✅ Token refreshed, retrying profile update...');
                  await apiService.updateUserProfile({ preferred_currency: selectedCurrency });
                  console.log('✅ Currency set via profile update after token refresh');
                  currencySet = true;
                  break;
                } catch (refreshError) {
                  console.error('❌ Token refresh failed:', refreshError);
                }
              }
            }
          }
          
          // Method 3: Try direct API call with fresh token
          if (!currencySet && attempt >= 2) {
            try {
              console.log('📡 Trying direct API call with current token...');
              const token = await SecureStore.getItemAsync('access_token');
              if (token) {
                await apiService.directApiCall('/user/change-currency', 'POST', {
                  new_currency: selectedCurrency,
                  convert_existing_data: false,
                }, token);
                console.log('✅ Currency change successful via direct API call');
                
                // Store the currency locally after successful direct API call
                try {
                  await SecureStore.setItemAsync('user_currency', selectedCurrency);
                  console.log('✅ User currency preference stored locally after direct API call:', selectedCurrency);
                } catch (storageError) {
                  console.error('❌ Failed to store currency preference locally:', storageError);
                }
                
                currencySet = true;
                break;
              }
            } catch (directApiError) {
              console.error('❌ Direct API call failed:', directApiError);
            }
          }
          
          // Method 3: Try re-registering the user if tokens are completely invalid
          if (!currencySet && attempt >= 3 && registrationCredentials) {
            try {
              console.log('🔄 Tokens seem invalid, attempting to re-register user...');
              console.log('📋 Using stored registration credentials');
              
              // Re-register with stored credentials
              const registerResponse = await apiService.register(registrationCredentials);
              
              console.log('✅ Re-registration successful, retrying currency change...');
              await apiService.changeUserCurrency(selectedCurrency, false);
              console.log('✅ Currency change successful after re-registration');
              
              // Store the currency locally after successful re-registration
              try {
                await SecureStore.setItemAsync('user_currency', selectedCurrency);
                console.log('✅ User currency preference stored locally after re-registration:', selectedCurrency);
              } catch (storageError) {
                console.error('❌ Failed to store currency preference locally:', storageError);
              }
              
              currencySet = true;
              break;
            } catch (reRegisterError) {
              console.error('❌ Re-registration failed:', reRegisterError);
            }
          }
          
          // Method 4: Try direct API call with fresh token after re-registration
          if (!currencySet && attempt >= 4 && registrationCredentials) {
            try {
              console.log('🔄 Attempting direct API call with fresh registration...');
              
              // Re-register to get fresh tokens
              const registerResponse = await apiService.register(registrationCredentials);
              const freshToken = registerResponse.tokens.access_token;
              
              // Use direct API call to avoid interceptor issues
              await apiService.directApiCall('/user/change-currency', 'POST', {
                new_currency: selectedCurrency,
                convert_existing_data: false,
              }, freshToken);
              
              console.log('✅ Currency change successful via direct API call');
              
              // Store the currency locally after successful direct API call with fresh token
              try {
                await SecureStore.setItemAsync('user_currency', selectedCurrency);
                console.log('✅ User currency preference stored locally after direct API call with fresh token:', selectedCurrency);
              } catch (storageError) {
                console.error('❌ Failed to store currency preference locally:', storageError);
              }
              
              currencySet = true;
              break;
            } catch (directApiError) {
              console.error('❌ Direct API call failed:', directApiError);
            }
          }
          
          // If all methods failed, wait before retry
          if (!currencySet && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s, 16s, 32s
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (attemptError) {
          console.error(`❌ Attempt ${attempt} failed:`, attemptError);
          if (attempt === maxRetries) {
            throw attemptError;
          }
        }
      }
      
      if (currencySet) {
        console.log('✅ Currency successfully set, proceeding to main app');
        proceedToMainApp();
      } else {
        // If all attempts failed, we'll still proceed but log a warning
        console.warn('⚠️ Failed to set currency on backend, but proceeding to main app');
        console.log('💡 User selected currency:', selectedCurrency, '- will be set on next successful API call');
        
        // Store the selected currency locally for future use
        try {
          await SecureStore.setItemAsync('selected_currency', selectedCurrency);
        } catch (error) {
          console.error('❌ Failed to store selected currency locally:', error);
        }
        
        proceedToMainApp();
      }
      
    } catch (error: any) {
      console.error('❌ Failed to set currency:', error);
      
      // Show a warning but allow the user to proceed
      Alert.alert(
        'Currency Setting Issue',
        'We had trouble setting your currency preference, but you can continue using the app. Your currency will be set automatically on your next successful connection.',
        [
          {
            text: 'Continue Anyway',
            onPress: () => {
              console.log('✅ User chose to continue despite currency setting issue');
              proceedToMainApp();
            },
          },
          {
            text: 'Try Again',
            onPress: () => handleContinue(),
          },
        ]
      );
    }
  };

  const proceedToMainApp = () => {
    // Mark currency selection as complete
    dispatch(completeCurrencySelection());
    
    // Update the user's display currency in Redux store
    dispatch(setDisplayCurrency(selectedCurrency));
    
    // Clear registration credentials for security
    dispatch(clearRegistrationCredentials());
    
    console.log('✅ Proceeding to main app with currency:', selectedCurrency);
    
    // No need to navigate - the AppNavigator will automatically show the Main screen
    // when needsCurrencySelection becomes false
  };

  const renderCurrencyItem = ({ item: currency }: { item: Currency }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        selectedCurrency === currency.code && styles.currencyItemSelected,
      ]}
      onPress={() => setSelectedCurrency(currency.code)}
    >
      <View style={styles.currencyLeft}>
        <Text style={styles.currencySymbol}>{currency.symbol}</Text>
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyCode}>{currency.code}</Text>
          <Text style={styles.currencyName}>{currency.name}</Text>
        </View>
      </View>
      {selectedCurrency === currency.code && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>💰</Text>
      <Text style={styles.title}>Choose Your Currency</Text>
      <Text style={styles.subtitle}>
        Select your preferred currency for all transactions and amounts
      </Text>
    </View>
  );

  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <CustomTextInput
        placeholder="Search currencies (e.g., Dollar, EUR, $)"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
        leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
      />
      {searchQuery.length > 0 && (
        <Text style={styles.searchResults}>
          {filteredCurrencies.length} currency{filteredCurrencies.length !== 1 ? 'ies' : ''} found
        </Text>
      )}
    </View>
  );

  const renderCurrencyList = () => {
    if (isLoadingCurrencies) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading currencies...</Text>
        </View>
      );
    }

    if (filteredCurrencies.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No currencies found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching with different terms
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredCurrencies}
        keyExtractor={(item) => item.code}
        renderItem={renderCurrencyItem}
        style={styles.currencyList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.currencyListContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {renderHeader()}
            {renderSearchSection()}
          </View>
        }
      />
    );
  };

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.selectedCurrencyInfo}>
        <Text style={styles.selectedCurrencyLabel}>Selected:</Text>
        <Text style={styles.selectedCurrencyValue}>
          {selectedCurrency ? `${currencies.find(c => c.code === selectedCurrency)?.symbol || '$'} ${selectedCurrency}` : 'No currency selected'}
        </Text>
      </View>
      <CustomButton
        title="Continue"
        onPress={handleContinue}
        disabled={!selectedCurrency}
        style={styles.continueButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          {renderCurrencyList()}
        </View>
        {renderFooter()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  listHeader: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchSection: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchResults: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  currencyList: {
    flex: 1,
  },
  currencyListContent: {
    paddingBottom: spacing.lg,
  },
  currencyItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencyItemSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 28,
    width: 50,
    textAlign: 'center',
    marginRight: spacing.md,
    color: colors.text,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  currencyName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selectedCurrencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  selectedCurrencyLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  selectedCurrencyValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
  },
  continueButton: {
    marginTop: spacing.sm,
  },
});

export default CurrencySelectionScreen;