import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0B0D14] text-[#F4F4F5] antialiased">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#D6B36A] focus:text-[#0B0D14] focus:font-semibold focus:rounded-lg focus:shadow-lg"
      >
        Skip to main academy content
      </a>

      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex flex-col flex-1 min-w-0">
        <TopNavbar />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Suspense
            fallback={
              <div className="min-h-[50vh] flex items-center justify-center">
                <LoadingSpinner size="lg" label="Entering Academy Hall..." />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
