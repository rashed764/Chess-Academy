/**
 * React hook for consuming and refreshing the personalized learning profile and recommendations.
 */

import { useState, useEffect, useCallback } from 'react';
import type { LearnerPerformanceProfile } from '../types';
import { LearningEngineService } from '../learningEngineService';

export function usePersonalizedLearning() {
  const [profile, setProfile] = useState<LearnerPerformanceProfile>(() => {
    return LearningEngineService.getOrComputeProfile();
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshProfile = useCallback(() => {
    setIsRefreshing(true);
    try {
      const fresh = LearningEngineService.computeProfile();
      setProfile(fresh);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Listen for storage changes across tabs or other features
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'chess_academy_training_progress_v1' ||
        e.key === 'chess_academy_test_reports_v1' ||
        e.key === 'chess_academy_learner_profile_v1'
      ) {
        refreshProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshProfile]);

  return {
    profile,
    activePlan: profile.activePlan,
    recommendations: profile.recommendations,
    strengths: profile.strengths,
    weaknesses: profile.weaknesses,
    topicMetrics: profile.topicMetrics,
    insufficientEvidenceAreas: profile.insufficientEvidenceAreas,
    hasSufficientData: profile.hasSufficientData,
    isRefreshing,
    refreshProfile,
  };
}
