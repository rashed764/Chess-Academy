import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { appRoutesConfig } from './routes.config';

const router = createBrowserRouter(appRoutesConfig);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
