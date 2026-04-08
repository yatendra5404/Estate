/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Requests from './components/Requests';
import Expenses from './components/Expenses';
import ShoppingList from './components/ShoppingList';
import Settings from './components/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="requests" element={<Requests />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="shopping-list" element={<ShoppingList />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
