import React, { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const QuickMatchPage = lazy(() =>
  import('../features/quick-match/QuickMatchPage').then((m) => ({ default: m.QuickMatchPage }))
);
const TrainingAcademyPage = lazy(() =>
  import('../features/training/TrainingAcademyPage').then((m) => ({ default: m.TrainingAcademyPage }))
);
const TestArenaPage = lazy(() =>
  import('../features/test-arena/TestArenaPage').then((m) => ({ default: m.TestArenaPage }))
);
const AnalysisPage = lazy(() =>
  import('../features/analysis/AnalysisPage').then((m) => ({ default: m.AnalysisPage }))
);
const OpeningsPage = lazy(() =>
  import('../features/openings/OpeningsPage').then((m) => ({ default: m.OpeningsPage }))
);
const ProgressPage = lazy(() =>
  import('../features/progress/ProgressPage').then((m) => ({ default: m.ProgressPage }))
);
const ProfilePage = lazy(() =>
  import('../features/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('../features/not-found/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

export const appRoutesConfig: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'quick-match', element: <QuickMatchPage /> },
      { path: 'training', element: <TrainingAcademyPage /> },
      { path: 'test-arena', element: <TestArenaPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'openings', element: <OpeningsPage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
