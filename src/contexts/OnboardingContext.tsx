import React, { createContext, useContext, ReactNode } from 'react';

interface OnboardingContextType {
  currentScreen: number;
  totalScreens: number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
  currentScreen: number;
  totalScreens: number;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  currentScreen,
  totalScreens,
}) => {
  return (
    <OnboardingContext.Provider value={{ currentScreen, totalScreens }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboardingContext = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an OnboardingProvider');
  }
  return context;
};
