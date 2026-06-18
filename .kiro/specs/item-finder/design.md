# Design Document: Item Finder

## Overview

Item Finder is a mobile application that helps elderly users remember where they placed household items by photographing items in their locations and retrieving them via search. This design document covers the high-level architecture, data models, component design, and technical decisions needed to implement the requirements.

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile Framework | React Native (Expo) | Cross-platform (iOS + Android), large ecosystem, accessibility support |
| Language | TypeScript | Type safety, better IDE support, fewer runtime errors |
| Local Database | SQLite (via expo-sqlite) | Lightweight, reliable, fully local storage |
| Image Storage | Device file system (expo-file-system) | Photos stored locally on device, no cloud needed |
| Search | Client-side fuzzy matching (Fuse.js) | Fast for small datasets (<500 items), fully offline |
| State Management | Zustand | Lightweight, simple, no boilerplate |

**No backend. No cloud. No internet required.** The entire app runs on the device.

> **Note:** The following features are deferred to a future phase and are not part of the current scope: Voice Input, Family Member Access, Family Notifications, Guided First-Use Walkthrough, Data Safety and Backup, and Reminders.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native / Expo)      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Home    │  │  Camera  │  │  Search  │  │ Browse │ │
│  │  Screen  │  │  Screen  │  │  Results │  │  List  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │              │             │      │
│  ┌────┴──────────────┴──────────────┴─────────────┴──┐  │
│  │              State Management (Zustand)            │  │
│  └────┬──────────────┬──────────────────────────────┘  │
│       │              │                                  │
│  ┌────┴────┐   ┌─────┴─────┐                           │
│  │ Item    │   │  Search   │                           │
│  │ Service │   │  Engine   │                           │
│  └────┬────┘   └───────────┘                           │
│       │                                                 │
│  ┌────┴─────────────────────────────────┐              │
│  │         Local Database (SQLite)       │              │
│  └──────────────────────────────────────┘              │
│                                                         │
│  ┌──────────────────────────────────────┐              │
│  │      Device File System (Photos)      │              │
│  └──────────────────────────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘

No external servers. No internet connection needed.
Everything runs on the device.
```

## Data Models

### Item Record

```typescript
interface ItemRecord {
  id: string;                  // UUID, auto-generated
  name: string;                // Item name (1-50 chars)
  description?: string;        // Optional location description (0-150 chars)
  photoUri: string;            // Local file path to photo
  thumbnailUri: string;        // Local path to compressed thumbnail
  createdAt: string;           // ISO 8601 timestamp
  updatedAt: string;           // ISO 8601 timestamp
}
```

### User Settings

```typescript
interface UserSettings {
  fontSize: 'default' | 'large' | 'extra-large';  // 18sp, 24sp, 30sp
}
```

## Component Design

### 1. Home Screen

**Requirements addressed:** R1, R2, R4, R6

The home screen serves as the single entry point with three primary actions:

```
┌─────────────────────────────┐
│     "What are you           │
│      looking for?"          │
│  ┌───────────────────────┐  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  ┌─────────────────────┐   │
│  │    📷 Add Item      │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │    📋 My Items      │   │
│  └─────────────────────┘   │
│                             │
│                             │
│                             │
└─────────────────────────────┘
```

- Search field at top (always visible, no navigation required)
- Two large action buttons below
- Maximum 2 navigation levels from this screen to any function

### 2. Camera Module

**Requirements addressed:** R1, R5

- Uses `expo-camera` for cross-platform camera access
- Full-screen viewfinder with single large "Capture" button
- After capture: shows preview with "Retake" and "Use Photo" options
- Photos stored locally at reduced resolution (1200x1200 max) to save storage
- Thumbnails generated at 200x200 for list views

### 3. Search Engine

**Requirements addressed:** R2, R3

**Algorithm:**
1. Normalize query: lowercase, trim whitespace
2. Exact substring match (highest priority)
3. Fuzzy match using Levenshtein distance (threshold ≤ 2)
4. Results ranked: exact matches first, then fuzzy matches sorted by edit distance

**Implementation:** Fuse.js configured with:
```typescript
const fuseOptions = {
  keys: ['name', 'description'],
  threshold: 0.4,          // Allows ~2 char edit distance
  includeScore: true,
  sortFn: (a, b) => a.score - b.score,
};
```

**Performance:** For datasets under 500 items (typical household), client-side search completes in <50ms. No server round-trip needed.

### 5. Item Detail View

**Requirements addressed:** R2, R5

```
┌─────────────────────────────┐
│  ← Back                     │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [LARGE PHOTO]      │  │
│  │    70%+ screen width  │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  🔑 Keys                    │
│  Kitchen hook by the door   │
│                             │
│  Updated 3 days ago         │
│                             │
│  ┌─────────────────────┐   │
│  │  📷 Update Location  │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │  🗑️ Delete Item      │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

### 6. Browse List View

**Requirements addressed:** R4

- Vertical scrollable list with large thumbnail + name + description per row
- Row height: minimum 80dp for comfortable tapping
- Default sort: alphabetical by name
- Toggle: "A-Z" / "Recent" sort options
- Empty state: friendly message with prompt to add first item

## Database Schema (SQLite — Local Only)

```sql
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 50),
  description TEXT CHECK(length(description) <= 150),
  photo_uri TEXT NOT NULL,
  thumbnail_uri TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_updated ON items(updated_at);

CREATE TABLE user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

All data lives on the device. No cloud database.

## Navigation Structure

```
App
├── Home Screen
│   ├── Search → Search Results → Item Detail
│   ├── Add Item → Camera → Name Input → Confirmation
│   └── My Items → Browse List → Item Detail
├── Item Detail
│   ├── Update Location → Camera → Confirmation
│   └── Delete → Confirmation Dialog
└── Settings
    ├── Font Size
    └── About
```

**Maximum depth from Home: 2 levels** (as per Requirement 6)

## Accessibility — POUR Compliance

The frontend follows WCAG 2.1 AA standards organized by the four POUR principles.

### Perceivable

| Guideline | Implementation |
|-----------|---------------|
| Text alternatives | All photos have `accessibilityLabel` describing item name and location. Icons have content descriptions. |
| Captions/audio | N/A — no audio or video content in current scope |
| Adaptable layout | Content structure uses semantic headings (H1, H2). Screen readers can navigate by structure. Layout is single-column, linear, and logical. |
| Distinguishable | Minimum 4.5:1 contrast ratio for all text. 3:1 for large text and UI components. No information conveyed by color alone (icons + text labels always paired). Font sizes: 18sp body, 24sp headings minimum. Respects system font scaling up to 200%. |

### Operable

| Guideline | Implementation |
|-----------|---------------|
| Keyboard/switch accessible | All interactive elements reachable via switch control and external keyboard navigation. Focus order follows visual layout (top to bottom). |
| Enough time | No time-limited interactions. Confirmation messages persist until dismissed. |
| Seizure safe | No flashing or rapid animations. |
| Navigable | Maximum 2 levels deep from Home Screen. Visible back button on every sub-screen. Clear page titles on every screen. Skip-to-content for screen readers. |
| Touch targets | Minimum 48x48dp for all interactive elements. Minimum 8dp spacing between adjacent targets. Large buttons span full width where possible. |
| Input modalities | Touch and external keyboard supported. No gesture-only actions (no swipe-to-delete without button alternative). |

### Understandable

| Guideline | Implementation |
|-----------|---------------|
| Readable | Plain language throughout. No jargon or technical terms. Sentence-level readability (Grade 5 reading level). |
| Predictable | Consistent navigation placement across all screens. Same button styles and positions. No unexpected context changes (no auto-navigation without user action). |
| Input assistance | Autocomplete suggestions on search. Inline validation with clear error messages. Retain user input on errors (never clear the form). Confirmation dialogs before destructive actions (delete). |
| Error messages | Friendly, specific, and actionable: "I didn't catch that. Try again?" not "Error: speech recognition failed." Always offer a next step. |

### Robust

| Guideline | Implementation |
|-----------|---------------|
| Compatible | Use React Native's built-in accessibility props (`accessibilityRole`, `accessibilityLabel`, `accessibilityState`). Tested with TalkBack (Android) and VoiceOver (iOS). |
| Semantic markup | Correct roles for all components: buttons use `accessibilityRole="button"`, images use `accessibilityRole="image"`, headings use `accessibilityRole="header"`. |
| Status messages | Confirmation and error messages use `accessibilityLiveRegion="polite"` so screen readers announce them without interrupting current focus. |
| Platform compatibility | Supports iOS 15+ and Android 10+. Tested across multiple screen sizes (4.7" to 6.7"). Supports both LTR and RTL layouts. |

### POUR Testing Plan

| Principle | Testing Method |
|-----------|---------------|
| Perceivable | Automated contrast checks (axe-core). Manual screen reader walkthrough. |
| Operable | Test all flows with TalkBack/VoiceOver only. Test with external keyboard. Verify no time traps. |
| Understandable | Readability scoring on all user-facing text. Usability testing with elderly participants. |
| Robust | Test on minimum supported OS versions. Accessibility audit with Accessibility Inspector (iOS) and Accessibility Scanner (Android). |

> **Note:** Full WCAG 2.1 AA validation requires manual testing with assistive technologies and expert accessibility review beyond automated tooling.

## Performance Targets

| Metric | Target |
|--------|--------|
| App launch to Home Screen | < 2 seconds |
| Camera open after tap | < 2 seconds |
| Search results display | < 1 second (client-side) |
| Photo save (local) | < 1 second |
| Browse list render (100 items) | < 2 seconds |

## Storage Estimates

| Data Type | Size per Item | 100 Items |
|-----------|--------------|-----------|
| Photo (compressed JPEG) | ~200KB | 20MB |
| Thumbnail | ~15KB | 1.5MB |
| Metadata (SQLite row) | ~500B | 50KB |
| **Total local storage** | | **~22MB** |

Typical elderly user: 20-50 items → 4-11MB local storage. Well within device capacity.

## Phased Delivery Plan

### Phase 1 (MVP)
- Store an item (photo + name + description)
- Find an item (search with autocomplete)
- Fuzzy search
- Browse all items
- Large text / simple UI
- Local storage (SQLite)

### Phase 2
- Update item location
- Settings (font size)

### Phase 3 (Future)
- Voice input *(explicitly deferred — not in current scope; to be revisited in a future phase)*
- Guided walkthrough
- Reminders (local notifications)
- Data backup/export
- Family sharing (requires backend)

## Error Handling Strategy

| Scenario | User-Facing Behavior |
|----------|---------------------|
| Camera permission denied | Friendly message + link to device settings |
| Photo save fails | Error message + retain entered data for retry |
| No search results | "I don't have that one yet. Want to add it?" |
| Storage full | "Your device is running low on space. Try removing some old photos." |
| Database error | "Something went wrong saving that. Let's try again." + retry button |

## Testing Strategy

| Level | Scope | Tools |
|-------|-------|-------|
| Unit | Services, search engine, data models | Jest |
| Component | UI components, accessibility | React Native Testing Library |
| Integration | Database operations, photo storage | Detox |
| E2E | Full user flows (store, find, update) | Detox |
| Accessibility | Contrast, touch targets, screen reader | axe-core, manual testing |
