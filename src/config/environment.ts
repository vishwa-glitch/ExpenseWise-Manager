// Environment configuration for the app
import Constants from 'expo-constants';
import { getDevApiUrl } from './dev-config';

export interface EnvironmentConfig {
  API_BASE_URL: string;
  API_PREFIX: string;
  API_TIMEOUT: number;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ENABLE_LOGGING: boolean;
  ENABLE_ANALYTICS: boolean;
}

// Get environment variables from expo-constants (loaded from .env via app.config.js)
const getEnvFromConstants = (): Partial<EnvironmentConfig> => {
  const extra = Constants.expoConfig?.extra;
  if (!extra) return {};
  
  return {
    API_BASE_URL: extra.API_BASE_URL,
    API_PREFIX: extra.API_PREFIX,
    API_TIMEOUT: extra.API_TIMEOUT ? parseInt(extra.API_TIMEOUT, 10) : undefined,
    ENVIRONMENT: extra.ENVIRONMENT,
    ENABLE_LOGGING: extra.ENABLE_LOGGING,
    ENABLE_ANALYTICS: extra.ENABLE_ANALYTICS,
  };
};

// Environment configurations (fallback values)
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
    API_BASE_URL: "https://your-staging-app.region.elasticbeanstalk.com",
    API_PREFIX: "/api",
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'staging',
    ENABLE_LOGGING: true,
    ENABLE_ANALYTICS: true,
  },
  production: {
    API_BASE_URL: "https://xp45ezql61.execute-api.us-east-1.amazonaws.com/fintech",
    API_PREFIX: "/api",
    API_TIMEOUT: 15000,
    ENVIRONMENT: 'production',
    ENABLE_LOGGING: false,
    ENABLE_ANALYTICS: true,
  },
};

// Get current environment
const getCurrentEnvironment = (): string => {
  const envFromConstants = getEnvFromConstants();
  
  // Use environment from .env if available
  if (envFromConstants.ENVIRONMENT) {
    return envFromConstants.ENVIRONMENT;
  }
  
  // Fallback: Check if we're in development mode
  if (__DEV__) {
    return 'development';
  }
  
  // Default to production for release builds
  return 'production';
};

// Merge environment config with values from .env (via expo-constants)
const currentEnv = getCurrentEnvironment();
const baseConfig = environments[currentEnv];
const envOverrides = getEnvFromConstants();

// Export the current environment configuration (with .env overrides)
export const ENV: EnvironmentConfig = {
  ...baseConfig,
  ...Object.fromEntries(
    Object.entries(envOverrides).filter(([_, value]) => value !== undefined)
  ),
} as EnvironmentConfig;

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
