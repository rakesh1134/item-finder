import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/database';

/**
 * App — root component for the Item Finder application.
 *
 * Responsibilities:
 * - Wraps the app with NavigationContainer for React Navigation
 * - Initializes the SQLite database on mount
 * - Renders the AppNavigator stack
 */
export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
