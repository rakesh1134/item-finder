import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { NameInputScreen } from '../screens/NameInputScreen';
import { ConfirmationScreen } from '../screens/ConfirmationScreen';
import { SearchResultsScreen } from '../screens/SearchResultsScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { BrowseListScreen } from '../screens/BrowseListScreen';
import { colors, fonts } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator — the root stack navigator for the Item Finder app.
 *
 * Navigation structure (max depth of 2 from Home for primary functions):
 * - Home → Camera → NameInput → Confirmation (store item flow)
 * - Home → SearchResults → ItemDetail (find item flow)
 * - Home → BrowseList → ItemDetail (browse items flow)
 * - ItemDetail → Camera → Confirmation (update location flow)
 *
 * All sub-screens have a visible back button provided by the native stack header.
 *
 * Requirement: 6.4
 */
export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerBackVisible: true,
        headerTitleStyle: {
          fontSize: fonts.heading,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.primary,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Item Finder', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'Take Photo' }}
      />
      <Stack.Screen
        name="NameInput"
        component={NameInputScreen}
        options={{ title: 'Name Item' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Saved', headerBackVisible: false }}
      />
      <Stack.Screen
        name="SearchResults"
        component={SearchResultsScreen}
        options={{ title: 'Search Results' }}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetailScreen}
        options={{ title: 'Item Details' }}
      />
      <Stack.Screen
        name="BrowseList"
        component={BrowseListScreen}
        options={{ title: 'My Items' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
