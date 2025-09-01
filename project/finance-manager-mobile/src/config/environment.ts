// Environment configuration for the app
import { getDevApiUrl } from './dev-config';

export interface EnvironmentConfig {
  API_BASE_URL: string;
  API_PREFIX: string;
  API_TIMEOUT: number;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ENABLE_LOGGING: boolean;
  ENABLE_ANALYTICS: boolean;
}

// Environment configurations
const environments: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: getDevApiUrl(),
    API_PREFIX: "/api",
    API_TIMEOUT: 10000,
    ENVIRONMENT: 'development',
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: false,
  },
  staging: {
    API_BASE_URL: "https://your-staging-app.region.elasticbeanstalk.com", // Replace with staging URL
    API_PREFIX: "/api",
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'staging',
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: true,
  },
  production: {
    API_BASE_URL: "https://xp45ezql61.execute-api.us-east-1.amazonaws.com/fintech", // Your actual API Gateway URL
    API_PREFIX: "/api",
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'production',
    ENABLE_LOGGING: false,
    ENABLE_ANALYTICS: true,
  },
};

// Get current environment
const getCurrentEnvironment = (): string => {
  // Check if we're in development mode
  if (__DEV__) {
    return 'development';
  }
  
  // You can also check for specific environment variables
  // import Constants from 'expo-constants';
  // const env = Constants.expoConfig?.extra?.environment;
  // if (env && environments[env]) return env;
  
  // Default to production for release builds
  return 'production';
};

// Export the current environment configuration
export const ENV = environments[getCurrentEnvironment()];

// Helper function to get environment-specific configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  return ENV;
};

// Helper function to check if we're in development
export const isDevelopment = (): boolean => {
  return ENV.ENVIRONMENT === 'development';
};

// Helper function to check if we're in production
export const isProduction = (): boolean => {
  return ENV.ENVIRONMENT === 'production';
};

// Helper function to get API URL
export const getApiUrl = (): string => {
  return `${ENV.API_BASE_URL}${ENV.API_PREFIX}`;
};
