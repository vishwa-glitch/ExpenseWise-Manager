import { renderHook, act } from '@testing-library/react-hooks';
import { useExportLimits } from '../useExportLimits';
import { adMobService } from '../../services/adMobService';

// Mock the AdMob service
jest.mock('../../services/adMobService', () => ({
  adMobService: {
    showRewardedAd: jest.fn(),
    isAdReady: jest.fn(() => true),
    isLoadingAd: jest.fn(() => false),
    preloadAd: jest.fn(),
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock the Redux store
const mockStore = {
  getState: () => ({
    user: {
      profile: {
        subscription_tier: 'free',
      },
    },
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn(),
};

jest.mock('react-redux', () => ({
  useSelector: jest.fn((selector) => selector(mockStore.getState())),
}));

describe('useExportLimits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useExportLimits());

    expect(result.current.canExport).toBe(true);
    expect(typeof result.current.getRemainingExports).toBe('function');
    expect(typeof result.current.recordExport).toBe('function');
    expect(typeof result.current.showRewardedAd).toBe('function');
    expect(typeof result.current.getExportLimitInfo).toBe('function');
    expect(typeof result.current.getLimitStatus).toBe('function');
  });

  it('should return correct limit status for free users', () => {
    const { result } = renderHook(() => useExportLimits());

    const limitStatus = result.current.getLimitStatus();
    expect(limitStatus.canExport).toBe(true);
    expect(limitStatus.needsAd).toBe(false);
    expect(limitStatus.remaining).toBe(1);
  });

  it('should return correct export limit info', () => {
    const { result } = renderHook(() => useExportLimits());

    const limitInfo = result.current.getExportLimitInfo();
    expect(limitInfo).toContain('1 monthly export');
  });

  it('should have proper method signatures', () => {
    const { result } = renderHook(() => useExportLimits());

    expect(result.current.getRemainingExports()).toBe(1);
    expect(result.current.isAdReady).toBe(true);
    expect(result.current.isLoadingAd).toBe(false);
  });
});
