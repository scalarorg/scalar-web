import { useEffect, useState } from 'react';

interface UseProgressiveLoadingOptions {
  primaryDataLoaded: boolean;
  secondaryDelay?: number;
  tertiaryDelay?: number;
}

interface UseProgressiveLoadingReturn {
  loadSecondaryData: boolean;
  loadTertiaryData: boolean;
  loadingProgress: number;
}

/**
 * Custom hook for managing progressive data loading
 * Implements a waterfall loading pattern where data loads in priority order
 */
export const useProgressiveLoading = ({
  primaryDataLoaded,
  secondaryDelay = 100,
  tertiaryDelay = 300
}: UseProgressiveLoadingOptions): UseProgressiveLoadingReturn => {
  const [loadSecondaryData, setLoadSecondaryData] = useState(false);
  const [loadTertiaryData, setLoadTertiaryData] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load secondary data after primary data is loaded
  useEffect(() => {
    if (primaryDataLoaded && !loadSecondaryData) {
      setLoadingProgress(33);
      const timer = setTimeout(() => {
        setLoadSecondaryData(true);
        setLoadingProgress(66);
      }, secondaryDelay);
      return () => clearTimeout(timer);
    }
  }, [primaryDataLoaded, loadSecondaryData, secondaryDelay]);

  // Load tertiary data after secondary data starts loading
  useEffect(() => {
    if (loadSecondaryData && !loadTertiaryData) {
      const timer = setTimeout(() => {
        setLoadTertiaryData(true);
        setLoadingProgress(100);
      }, tertiaryDelay);
      return () => clearTimeout(timer);
    }
  }, [loadSecondaryData, loadTertiaryData, tertiaryDelay]);

  // Reset progress when primary data is not loaded
  useEffect(() => {
    if (!primaryDataLoaded) {
      setLoadingProgress(0);
      setLoadSecondaryData(false);
      setLoadTertiaryData(false);
    }
  }, [primaryDataLoaded]);

  return {
    loadSecondaryData,
    loadTertiaryData,
    loadingProgress
  };
};
