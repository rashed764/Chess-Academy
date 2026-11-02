import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { QuickMatchPage } from '../features/quick-match/QuickMatchPage';
import { TrainingAcademyPage } from '../features/training/TrainingAcademyPage';
import { TestArenaPage } from '../features/test-arena/TestArenaPage';
import { AnalysisPage } from '../features/analysis/AnalysisPage';
import { OpeningsPage } from '../features/openings/OpeningsPage';
import { ProgressPage } from '../features/progress/ProgressPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';

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
