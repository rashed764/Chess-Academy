/**
 * Time control presets and validation for Quick Match.
 */

import type { QuickMatchTimeControl, TimeControlPresetId } from '../types';

export const QUICK_MATCH_TIME_CONTROLS: Record<TimeControlPresetId, QuickMatchTimeControl> = {
  BULLET_1_0: {
    id: 'BULLET_1_0',
    name: '1+0',
    category: 'bullet',
    initialMinutes: 1,
    incrementSeconds: 0,
    label: '1 min Bullet',
  },
  BULLET_2_1: {
    id: 'BULLET_2_1',
    name: '2+1',
    category: 'bullet',
    initialMinutes: 2,
    incrementSeconds: 1,
    label: '2 min + 1s Bullet',
  },
  BLITZ_3_0: {
    id: 'BLITZ_3_0',
    name: '3+0',
    category: 'blitz',
    initialMinutes: 3,
    incrementSeconds: 0,
    label: '3 min Blitz',
  },
  BLITZ_3_2: {
    id: 'BLITZ_3_2',
    name: '3+2',
    category: 'blitz',
    initialMinutes: 3,
    incrementSeconds: 2,
    label: '3 min + 2s Blitz',
  },
  BLITZ_5_0: {
    id: 'BLITZ_5_0',
    name: '5+0',
    category: 'blitz',
    initialMinutes: 5,
    incrementSeconds: 0,
    label: '5 min Blitz',
  },
  BLITZ_5_3: {
    id: 'BLITZ_5_3',
    name: '5+3',
    category: 'blitz',
    initialMinutes: 5,
    incrementSeconds: 3,
    label: '5 min + 3s Blitz',
  },
  RAPID_10_0: {
    id: 'RAPID_10_0',
    name: '10+0',
    category: 'rapid',
    initialMinutes: 10,
    incrementSeconds: 0,
    label: '10 min Rapid',
  },
  RAPID_15_10: {
    id: 'RAPID_15_10',
    name: '15+10',
    category: 'rapid',
    initialMinutes: 15,
    incrementSeconds: 10,
    label: '15 min + 10s Rapid',
  },
  CLASSICAL_30_0: {
    id: 'CLASSICAL_30_0',
    name: '30+0',
    category: 'classical',
    initialMinutes: 30,
    incrementSeconds: 0,
    label: '30 min Classical',
  },
  CUSTOM: {
    id: 'CUSTOM',
    name: 'Custom',
    category: 'custom',
    initialMinutes: 10,
    incrementSeconds: 5,
    label: 'Custom Time',
  },
};

export function validateCustomTimeControl(
  initialMinutes: number,
  incrementSeconds: number
): { isValid: boolean; error?: string } {
  if (typeof initialMinutes !== 'number' || Number.isNaN(initialMinutes) || initialMinutes <= 0) {
    return { isValid: false, error: 'Initial minutes must be greater than 0.' };
  }
  if (initialMinutes > 180) {
    return { isValid: false, error: 'Initial minutes cannot exceed 180 minutes.' };
  }
  if (typeof incrementSeconds !== 'number' || Number.isNaN(incrementSeconds) || incrementSeconds < 0) {
    return { isValid: false, error: 'Increment seconds cannot be negative.' };
  }
  if (incrementSeconds > 60) {
    return { isValid: false, error: 'Increment seconds cannot exceed 60 seconds.' };
  }
  return { isValid: true };
}
