import NetInfo from '@react-native-community/netinfo';
import { store } from '../store';
import { apiService } from './api';

class NetworkService {
  private isOnline: boolean = true;
  private listeners: Array<(isOnline: boolean) => void> = [];
  private isInitialized: boolean = false;

  constructor() {
    // Don't initialize immediately to avoid circular dependencies
  }

  public async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.initializeNetworkMonitoring();
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error initializing network service:', error);
    }
  }

  private async initializeNetworkMonitoring() {
    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? true;
    console.log(`🌐 Initial network state: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);

    // Listen for network state changes
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      console.log(`🌐 Network state changed: ${wasOnline ? 'ONLINE' : 'OFFLINE'} → ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
      
      if (wasOnline !== this.isOnline) {
        this.handleNetworkStateChange(this.isOnline);
      }
      
      // Notify listeners
      this.listeners.forEach(listener => listener(this.isOnline));
    });
  }

  private async handleNetworkStateChange(isOnline: boolean) {
    if (isOnline) {
      console.log('🔄 Network restored, attempting to switch to online mode...');
      await this.switchToOnlineMode();
    } else {
      console.log('📱 Network lost, switching to offline mode...');
      await this.switchToOfflineMode();
    }
  }

  private async switchToOnlineMode() {
    try {
      // Only attempt authentication if the service is initialized
      if (!this.isInitialized) return;
      
      // Check if we can authenticate online
      const authResult = await apiService.checkAuthStatusWithOfflineFallback();
      
      if (authResult.isAuthenticated && authResult.mode === 'online') {
        console.log('✅ Successfully switched to online mode');
        // The auth state will be updated by the checkAuthStatus action
      } else {
        console.log('⚠️ Could not switch to online mode, staying in offline mode');
      }
    } catch (error) {
      console.error('❌ Error switching to online mode:', error);
    }
  }

  private async switchToOfflineMode() {
    try {
      // Only attempt authentication if the service is initialized
      if (!this.isInitialized) return;
      
      // Check if we can authenticate offline
      const authResult = await apiService.checkAuthStatusWithOfflineFallback();
      
      if (authResult.isAuthenticated && authResult.mode === 'offline') {
        console.log('✅ Successfully switched to offline mode');
        // The auth state will be updated by the checkAuthStatus action
      } else {
        console.log('⚠️ Could not switch to offline mode');
      }
    } catch (error) {
      console.error('❌ Error switching to offline mode:', error);
    }
  }

  // Public methods
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  public addNetworkListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async checkConnectivity(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  public async forceReconnect(): Promise<void> {
    console.log('🔄 Force reconnecting...');
    await this.switchToOnlineMode();
  }
}

export const networkService = new NetworkService();
