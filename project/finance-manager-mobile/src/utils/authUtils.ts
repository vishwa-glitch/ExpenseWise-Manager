import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store, persistor } from '../store';
import { clearAuthState } from '../store/slices/authSlice';

/**
 * Clears all app data including tokens, persisted state, and Redux store
 * This is used when a user deletes their account or logs out
 */
export const clearAllAppData = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing all app data...');
    
    // Clear all tokens from SecureStore with retry logic
    const tokensToClear = [
      'access_token',
      'refresh_token', 
      'offline_token',
      'user_currency',
      'selected_currency'
    ];
    
    for (const token of tokensToClear) {
      // Try multiple times to ensure token is cleared
      for (let i = 0; i < 3; i++) {
        await SecureStore.deleteItemAsync(token).catch(() => {
          console.log(`⚠️ Failed to clear token: ${token} (attempt ${i + 1})`);
        });
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Clear all persisted Redux data from AsyncStorage
    const persistedKeys = [
      'persist:auth',
      'persist:transactions', 
      'persist:budgets',
      'persist:accounts',
      'persist:categories',
      'persist:user',
      'persist:onboarding'
    ];
    
    for (const key of persistedKeys) {
      await AsyncStorage.removeItem(key).catch(() => {
        console.log(`⚠️ Failed to clear persisted data: ${key}`);
      });
    }
    
    // Clear Redux state immediately
    store.dispatch(clearAuthState());
    
    // Purge all persisted data using Redux Persist
    await persistor.purge();
    
    // Verify tokens are cleared
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const offlineToken = await SecureStore.getItemAsync('offline_token');
    
    console.log('🔍 Verification after clearing:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasOfflineToken: !!offlineToken
    });
    
    // Set a flag to indicate account deletion has occurred
    await SecureStore.setItemAsync('account_deleted', 'true').catch(() => {});
    
    console.log('✅ All app data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing app data:', error);
    throw error;
  }
};

/**
 * Clears only authentication-related data
 * This is used for regular logout
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    console.log('🔐 Clearing authentication data...');
    
    // Clear tokens
    await SecureStore.deleteItemAsync('access_token').catch(() => {});
    await SecureStore.deleteItemAsync('refresh_token').catch(() => {});
    await SecureStore.deleteItemAsync('offline_token').catch(() => {});
    
    // Clear Redux auth state
    store.dispatch(clearAuthState());
    
    // Purge persisted auth data
    await persistor.purge();
    
    console.log('✅ Authentication data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    throw error;
  }
};

/**
 * Debug function to check the current authentication state
 * This helps troubleshoot logout issues
 */
export const debugAuthState = async (): Promise<void> => {
  try {
    console.log('🔍 Debugging authentication state...');
    
    // Check tokens
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    const offlineToken = await SecureStore.getItemAsync('offline_token');
    
    console.log('🔑 Token status:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasOfflineToken: !!offlineToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
      offlineTokenLength: offlineToken?.length || 0
    });
    
    // Check persisted data
    const authData = await AsyncStorage.getItem('persist:auth').catch(() => null);
    const userData = await AsyncStorage.getItem('persist:user').catch(() => null);
    
    console.log('💾 Persisted data status:', {
      hasAuthData: !!authData,
      hasUserData: !!userData,
      authDataLength: authData?.length || 0,
      userDataLength: userData?.length || 0
    });
    
    // Check Redux state
    const state = store.getState();
    console.log('📊 Redux auth state:', {
      isAuthenticated: state.auth.isAuthenticated,
      hasUser: !!state.auth.user,
      isLoading: state.auth.isLoading,
      authMode: state.auth.authMode
    });
    
  } catch (error) {
    console.error('❌ Error debugging auth state:', error);
  }
};
