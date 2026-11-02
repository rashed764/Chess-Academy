/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProviders } from './app/providers';
import { AppRouter } from './routes';

export default function App(): React.JSX.Element {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
