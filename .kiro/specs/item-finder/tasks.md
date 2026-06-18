# Implementation Plan: Item Finder

## Overview

This plan implements the Item Finder mobile app using React Native (Expo) with TypeScript. The app stores items locally using SQLite and device file system, and provides fuzzy search via Fuse.js. Implementation follows a phased approach starting with core data layer and building up through UI screens and features.

## Tasks

- [x] 1. Set up project structure and core configuration
  - [x] 1.1 Initialize Expo project with TypeScript and install dependencies
    - Run `npx create-expo-app` with TypeScript template
    - Install dependencies: expo-sqlite, expo-file-system, expo-camera, zustand, fuse.js, uuid
    - Configure tsconfig.json with strict mode
    - Set up directory structure: `src/screens/`, `src/components/`, `src/services/`, `src/store/`, `src/types/`, `src/utils/`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.2 Define TypeScript interfaces and types
    - Create `src/types/index.ts` with `ItemRecord` interface (id, name, description, photoUri, thumbnailUri, createdAt, updatedAt)
    - Create `UserSettings` interface (fontSize)
    - Define navigation types for React Navigation
    - _Requirements: 1.5, 4.3, 5.4_

  - [x] 1.3 Set up testing framework
    - Install and configure Jest with React Native Testing Library
    - Install @testing-library/react-native
    - Create jest.config.js with appropriate transforms and module name mappers
    - Add test script to package.json
    - _Requirements: All (testing infrastructure)_

- [x] 2. Implement data layer (SQLite database and file storage)
  - [x] 2.1 Create database service with schema initialization
    - Create `src/services/database.ts`
    - Implement `initDatabase()` to create `items` table with columns: id (TEXT PK), name (TEXT NOT NULL), description (TEXT), photo_uri (TEXT NOT NULL), thumbnail_uri (TEXT NOT NULL), created_at (TEXT NOT NULL), updated_at (TEXT NOT NULL)
    - Create indexes on name and updated_at columns
    - Create `user_settings` table (key TEXT PK, value TEXT NOT NULL)
    - _Requirements: 1.5_

  - [x] 2.2 Implement Item CRUD operations in database service
    - Implement `createItem(item: ItemRecord): Promise<void>` — inserts a new item record
    - Implement `getItemById(id: string): Promise<ItemRecord | null>` — retrieves single item
    - Implement `getAllItems(sortBy: 'name' | 'updatedAt'): Promise<ItemRecord[]>` — retrieves all items with sort option
    - Implement `updateItem(id: string, updates: Partial<ItemRecord>): Promise<void>` — updates item fields and updatedAt timestamp
    - Implement `deleteItem(id: string): Promise<void>` — removes item from database
    - _Requirements: 1.5, 4.2, 4.5, 5.3, 5.4_

  - [ ]* 2.3 Write unit tests for database service
    - Test createItem stores and retrieves correctly
    - Test getAllItems returns items sorted alphabetically and by updatedAt
    - Test updateItem modifies fields and updates timestamp
    - Test deleteItem removes the record
    - Test schema constraints (name length 1-50, description length ≤150)
    - _Requirements: 1.5, 4.5, 5.4_

  - [x] 2.4 Implement photo storage service
    - Create `src/services/photoStorage.ts`
    - Implement `savePhoto(uri: string): Promise<{ photoUri: string; thumbnailUri: string }>` — copies photo to app directory at max 1200x1200 resolution, generates 200x200 thumbnail
    - Implement `deletePhoto(photoUri: string, thumbnailUri: string): Promise<void>` — removes photo files from device
    - Use expo-file-system for file operations and expo-image-manipulator for resizing
    - _Requirements: 1.2, 1.5, 5.2, 5.3_

  - [ ]* 2.5 Write unit tests for photo storage service
    - Test savePhoto creates both full-size and thumbnail files
    - Test deletePhoto removes files from device
    - Test photo dimensions are constrained correctly
    - _Requirements: 1.2, 5.2_

- [x] 3. Implement search engine
  - [x] 3.1 Create search service with Fuse.js
    - Create `src/services/searchEngine.ts`
    - Configure Fuse.js with options: keys ['name', 'description'], threshold 0.4, includeScore true
    - Implement `search(query: string, items: ItemRecord[]): ItemRecord[]` — normalizes query (lowercase, trim), performs fuzzy match, ranks exact matches above fuzzy matches
    - Implement substring matching as highest priority before fuzzy matching
    - Return empty array for queries with fewer than 2 characters
    - _Requirements: 2.2, 3.1, 3.2, 3.3_

  - [ ]* 3.2 Write unit tests for search engine
    - Test exact name match returns item first
    - Test substring match (partial name) finds items
    - Test fuzzy match with ≤2 edit distance finds items
    - Test ranking: exact > substring > fuzzy
    - Test queries under 2 characters return empty results
    - Test case-insensitive matching
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Implement state management (Zustand store)
  - [x] 4.1 Create Zustand store for items and settings
    - Create `src/store/itemStore.ts`
    - Define store with state: items (ItemRecord[]), settings (UserSettings), isLoading (boolean)
    - Implement actions: loadItems, addItem, updateItem, deleteItem, searchItems, updateSettings
    - Integrate database service calls within store actions
    - _Requirements: 1.5, 4.2, 5.3, 5.4_

  - [ ]* 4.2 Write unit tests for Zustand store
    - Test addItem adds to items array and persists to database
    - Test updateItem modifies correct item and updates timestamp
    - Test deleteItem removes from array and database
    - Test loadItems hydrates store from database
    - Test searchItems delegates to search engine with correct results
    - _Requirements: 1.5, 4.2, 5.3_

- [x] 5. Checkpoint - Core data layer verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement UI components and theme
  - [x] 6.1 Create accessible theme and shared UI components
    - Create `src/theme/index.ts` with font sizes (18sp body, 24sp headings), colors with 4.5:1 contrast ratio, spacing constants
    - Create `src/components/LargeButton.tsx` — button component with minimum 48x48dp touch target, full-width styling, text + icon support
    - Create `src/components/LargeTextInput.tsx` — text input with large font, clear label
    - Create `src/components/ItemCard.tsx` — list item with thumbnail (200x200), name in large text, description preview
    - Add accessibility props (accessibilityRole, accessibilityLabel) to all components
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 6.2 Write component tests for shared UI components
    - Test LargeButton renders with correct accessibility role and label
    - Test LargeTextInput displays placeholder and handles text change
    - Test ItemCard displays thumbnail, name, and description
    - Test all components meet minimum touch target requirements
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 7. Implement Home Screen
  - [x] 7.1 Create Home Screen with search, Add Item, and My Items
    - Create `src/screens/HomeScreen.tsx`
    - Add search field at top with large placeholder text ("What are you looking for?")
    - Add "Add Item" button with camera icon, minimum 48x48dp touch target
    - Add "My Items" button with list icon, minimum 48x48dp touch target
    - Implement autocomplete dropdown: display matching ItemRecords after 2+ characters entered
    - Navigate to search results on item selection
    - All buttons have descriptive text labels (no icon-only buttons)
    - _Requirements: 1.1, 2.1, 2.2, 4.1, 6.3, 6.5_

  - [ ]* 7.2 Write component tests for Home Screen
    - Test search field renders with correct placeholder
    - Test autocomplete appears after 2 characters
    - Test Add Item and My Items buttons navigate correctly
    - Test accessibility labels are set on all interactive elements
    - _Requirements: 1.1, 2.1, 2.2, 4.1_

- [x] 8. Implement Store Item flow (Camera + Name Input)
  - [x] 8.1 Create Camera Screen for photo capture
    - Create `src/screens/CameraScreen.tsx`
    - Use expo-camera for full-screen viewfinder
    - Add single large "Capture" button (48x48dp minimum)
    - After capture: show preview with "Retake" and "Use Photo" options
    - Handle camera permission denied with friendly message and settings link
    - _Requirements: 1.2, 5.2, 6.3_

  - [x] 8.2 Create Name Input Screen for item naming and confirmation
    - Create `src/screens/NameInputScreen.tsx`
    - Display captured photo as preview
    - Add large text input for item name (1-50 characters)
    - Add optional text input for location description (0-150 characters)
    - Add "Save" confirmation button
    - On save: call store.addItem(), show confirmation message ("Got it! Your [item name] is saved.")
    - Ensure full flow completes in ≤3 taps after "Add Item" (capture, enter name, confirm)
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ]* 8.3 Write integration tests for Store Item flow
    - Test full flow: camera capture → name input → save → confirmation shown
    - Test item saved to database with correct fields and timestamp
    - Test validation prevents empty name
    - Test optional description is stored when provided
    - _Requirements: 1.2, 1.3, 1.5, 1.6, 1.7_

- [x] 9. Implement Search Results and Item Detail screens
  - [x] 9.1 Create Search Results Screen
    - Create `src/screens/SearchResultsScreen.tsx`
    - Display matching items as list with thumbnail, name, and "Last updated" timestamp
    - Tap item navigates to Item Detail
    - Show friendly "no results" message ("Hmm, I don't have that one yet. Want to add it?") with link to Add Item flow
    - _Requirements: 2.3, 2.4, 2.5, 3.3_

  - [x] 9.2 Create Item Detail Screen
    - Create `src/screens/ItemDetailScreen.tsx`
    - Display item photo at large size (minimum 70% screen width)
    - Show item name and location description in large text
    - Show "Last updated" timestamp
    - Add "Update Location" button (48x48dp)
    - Add "Delete Item" button with confirmation dialog before deletion
    - _Requirements: 2.3, 5.1_

  - [ ]* 9.3 Write component tests for Search Results and Item Detail
    - Test Search Results displays items with correct info
    - Test "no results" message appears for empty results
    - Test Item Detail shows photo at correct size
    - Test delete confirmation dialog appears before deletion
    - _Requirements: 2.3, 2.5, 5.1_

- [x] 10. Implement Browse List screen
  - [x] 10.1 Create Browse List Screen with sorting
    - Create `src/screens/BrowseListScreen.tsx`
    - Display all items in vertically scrollable FlatList
    - Each row: thumbnail photo, item name in large text, location description (minimum 80dp row height)
    - Default sort: alphabetical by name
    - Add toggle for "A-Z" / "Recent" sort options
    - Tap item navigates to Item Detail Screen
    - Show empty state message when no items exist ("No items yet! Tap Add Item to get started.")
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 10.2 Write component tests for Browse List Screen
    - Test items render in alphabetical order by default
    - Test sort toggle switches between alphabetical and recent
    - Test tap navigates to Item Detail
    - Test empty state renders when no items exist
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 11. Implement Update Item Location flow
  - [x] 11.1 Create Update Location flow from Item Detail
    - When user taps "Update Location" on Item Detail, navigate to Camera Screen
    - After photo capture, replace previous photo with new photo in ItemRecord
    - Delete old photo file from device storage
    - Update the `updatedAt` timestamp
    - Show confirmation message ("Updated! Your [item name] is now saved in its new spot.")
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 11.2 Write integration tests for Update Location flow
    - Test new photo replaces old photo in database
    - Test old photo file is deleted from device
    - Test updatedAt timestamp is refreshed
    - Test confirmation message displays with item name
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

- [x] 12. Checkpoint - Core UI flows verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Implement Navigation and App Entry Point
  - [x] 17.1 Set up React Navigation and wire all screens together
    - Install and configure @react-navigation/native and @react-navigation/native-stack
    - Create `src/navigation/AppNavigator.tsx` with all screen routes
    - Wire navigation: Home → all sub-screens
    - Ensure maximum navigation depth of 2 from Home Screen
    - Add visible back button on all sub-screens
    - Update `App.tsx` to wrap with NavigationContainer and initialize database on mount
    - _Requirements: 6.4_

  - [ ]* 17.2 Write integration tests for navigation flows
    - Test app launch goes directly to Home
    - Test all primary flows accessible within 2 navigation levels
    - Test back button navigation works on all sub-screens
    - _Requirements: 6.4_

- [x] 18. Implement deletion with confirmation
  - [x] 18.1 Add delete functionality with confirmation dialog
    - On Item Detail Screen, "Delete Item" button shows confirmation dialog
    - Confirmation dialog uses clear language: "Are you sure you want to delete [item name]? This cannot be undone."
    - On confirm: delete item from database, delete photo files, navigate back to previous screen
    - Retain item in list until confirmed (no accidental deletion)
    - _Requirements: 5.1_

  - [ ]* 18.2 Write unit tests for deletion flow
    - Test confirmation dialog appears before delete
    - Test cancel returns to Item Detail without deleting
    - Test confirm removes item from database and files

- [x] 19. Final checkpoint - Full app verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The design has no Correctness Properties section, so property-based tests are not included
- Unit tests and integration tests validate specific examples and edge cases
- Voice Input (R7), Family Member Access (R8), Family Notifications (R9), Guided First-Use Walkthrough (R10), Data Safety and Backup (R11), and Reminders (R12) are deferred to a future release and excluded from this task list

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "6.1"] },
    { "id": 3, "tasks": ["2.2", "2.4", "6.2"] },
    { "id": 4, "tasks": ["2.3", "2.5", "3.1", "4.1"] },
    { "id": 5, "tasks": ["3.2", "4.2"] },
    { "id": 6, "tasks": ["7.1", "8.1", "10.1"] },
    { "id": 7, "tasks": ["7.2", "8.2", "9.1", "9.2", "10.2"] },
    { "id": 8, "tasks": ["8.3", "9.3", "11.1"] },
    { "id": 9, "tasks": ["11.2", "18.1"] },
    { "id": 10, "tasks": ["17.1", "18.2"] },
    { "id": 11, "tasks": ["17.2"] }
  ]
}
```
