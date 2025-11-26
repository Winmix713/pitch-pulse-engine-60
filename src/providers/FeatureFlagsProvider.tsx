import React, { createContext, useContext, ReactNode } from 'react';
import { phaseFlags } from '@/config/env';

interface FeatureFlag {
  phase5: boolean;    // Advanced pattern detection
  phase6: boolean;    // Model evaluation & feedback loop  
  phase7: boolean;    // Cross-league intelligence
  phase8: boolean;    // Monitoring & visualization
  phase9: boolean;    // Collaborative market intelligence
}

interface FeatureFlagsContextType {
  flags: FeatureFlag;
  isEnabled: (flag: keyof FeatureFlag) => boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const defaultFlags: FeatureFlag = {
  phase5: false,
  phase6: false,
  phase7: false,
  phase8: false,
  phase9: false,
};

const loadFlagsFromEnv = (): FeatureFlag => {
  return {
    phase5: phaseFlags.phase5,
    phase6: phaseFlags.phase6,
    phase7: phaseFlags.phase7,
    phase8: phaseFlags.phase8,
    phase9: phaseFlags.phase9,
  };
};

interface FeatureFlagsProviderProps {
  children: ReactNode;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ children }) => {
  const flags = { ...defaultFlags, ...loadFlagsFromEnv() };

  const isEnabled = (flag: keyof FeatureFlag): boolean => {
    return flags[flag];
  };

  return (
    <FeatureFlagsContext.Provider value={{ flags, isEnabled }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagsContextType => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

export type { FeatureFlag };