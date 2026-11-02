/**
 * Application route paths and navigation structure for Chess Academy.
 */

export const APP_ROUTES = {
  HOME: '/',
  QUICK_MATCH: '/quick-match',
  TRAINING: '/training',
  TEST_ARENA: '/test-arena',
  OPENINGS: '/openings',
  ANALYSIS: '/analysis',
  PROGRESS: '/progress',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export type AppRouteKey = keyof typeof APP_ROUTES;
export type AppRoutePath = (typeof APP_ROUTES)[AppRouteKey];

export interface NavigationItem {
  id: string;
  name: string;
  path: AppRoutePath;
  description: string;
  isPrimaryMode?: boolean;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'home',
    name: 'Home',
    path: APP_ROUTES.HOME,
    description: 'Chess Club Salon & Grandmaster Overview',
  },
  {
    id: 'quick-match',
    name: 'Quick Match',
    path: APP_ROUTES.QUICK_MATCH,
    description: 'Challenge the engine in pure duel',
    isPrimaryMode: true,
  },
  {
    id: 'training',
    name: 'Training Academy',
    path: APP_ROUTES.TRAINING,
    description: 'Mastery curricula & tactical training',
    isPrimaryMode: true,
  },
  {
    id: 'test-arena',
    name: 'Test Arena',
    path: APP_ROUTES.TEST_ARENA,
    description: 'Test your actual chess strength',
    isPrimaryMode: true,
  },
  {
    id: 'openings',
    name: 'Opening Library',
    path: APP_ROUTES.OPENINGS,
    description: 'Classical repertoires & theory explorer',
  },
  {
    id: 'analysis',
    name: 'Game Analysis',
    path: APP_ROUTES.ANALYSIS,
    description: 'Deep game review & move precision',
  },
  {
    id: 'progress',
    name: 'Progress',
    path: APP_ROUTES.PROGRESS,
    description: 'Personal rating trajectory & academy record',
  },
];

export const SECONDARY_NAVIGATION: NavigationItem[] = [
  {
    id: 'profile',
    name: 'Profile',
    path: APP_ROUTES.PROFILE,
    description: 'Academy credentials & mastery rank',
  },
  {
    id: 'settings',
    name: 'Settings',
    path: APP_ROUTES.SETTINGS,
    description: 'Board styling & academy preferences',
  },
];
