import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BrowseListScreen } from '../BrowseListScreen';
import { useItemStore } from '../../store/itemStore';
import type { ItemRecord } from '../../types';

// Mock the store
jest.mock('../../store/itemStore');
const mockUseItemStore = useItemStore as unknown as jest.Mock;

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
} as any;

const mockRoute = {
  key: 'BrowseList',
  name: 'BrowseList' as const,
  params: undefined,
} as any;

const sampleItems: ItemRecord[] = [
  {
    id: '1',
    name: 'Keys',
    description: 'Kitchen hook by the door',
    photoUri: 'file:///photos/keys.jpg',
    thumbnailUri: 'file:///thumbnails/keys.jpg',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-05T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Wallet',
    description: 'Bedroom nightstand',
    photoUri: 'file:///photos/wallet.jpg',
    thumbnailUri: 'file:///thumbnails/wallet.jpg',
    createdAt: '2024-01-02T10:00:00.000Z',
    updatedAt: '2024-01-02T10:00:00.000Z',
  },
  {
    id: '3',
    name: 'Glasses',
    description: 'Living room coffee table',
    photoUri: 'file:///photos/glasses.jpg',
    thumbnailUri: 'file:///thumbnails/glasses.jpg',
    createdAt: '2024-01-03T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
];

const mockLoadItems = jest.fn();

function setupStoreMock({
  items = [] as ItemRecord[],
  isLoading = false,
} = {}) {
  mockUseItemStore.mockImplementation((selector: (state: any) => any) => {
    const state = {
      items,
      isLoading,
      loadItems: mockLoadItems,
    };
    return selector(state);
  });
}

describe('BrowseListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadItems.mockResolvedValue(undefined);
  });

  it('renders the screen with sort toggle', () => {
    setupStoreMock({ items: sampleItems });

    const { getByTestId } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByTestId('browse-list-screen')).toBeTruthy();
    expect(getByTestId('sort-toggle')).toBeTruthy();
    expect(getByTestId('sort-button-az')).toBeTruthy();
    expect(getByTestId('sort-button-recent')).toBeTruthy();
  });

  it('displays all items in FlatList', () => {
    setupStoreMock({ items: sampleItems });

    const { getByTestId } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByTestId('item-card-1')).toBeTruthy();
    expect(getByTestId('item-card-2')).toBeTruthy();
    expect(getByTestId('item-card-3')).toBeTruthy();
  });

  it('shows empty state message when no items exist', () => {
    setupStoreMock({ items: [] });

    const { getByTestId, getByText } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByTestId('browse-empty-state')).toBeTruthy();
    expect(
      getByText('No items yet! Tap Add Item to get started.'),
    ).toBeTruthy();
  });

  it('does not show empty state when loading', () => {
    setupStoreMock({ items: [], isLoading: true });

    const { queryByTestId } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(queryByTestId('browse-empty-state')).toBeNull();
  });

  it('calls loadItems on mount with default sort (name)', () => {
    setupStoreMock({ items: sampleItems });

    render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(mockLoadItems).toHaveBeenCalledWith('name');
  });

  it('navigates to ItemDetail when an item is pressed', () => {
    setupStoreMock({ items: sampleItems });

    const { getByTestId } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    fireEvent.press(getByTestId('item-card-1'));
    expect(mockNavigate).toHaveBeenCalledWith('ItemDetail', { itemId: '1' });
  });

  it('switches to Recent sort when toggle is pressed', () => {
    setupStoreMock({ items: sampleItems });

    const { getByTestId } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    fireEvent.press(getByTestId('sort-button-recent'));

    expect(mockLoadItems).toHaveBeenCalledWith('updatedAt');
  });

  it('switches back to A-Z sort when toggle is pressed', () => {
    setupStoreMock({ items: sampleItems });

    const { getByTestId } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    // Switch to recent first
    fireEvent.press(getByTestId('sort-button-recent'));
    mockLoadItems.mockClear();

    // Switch back to A-Z
    fireEvent.press(getByTestId('sort-button-az'));
    expect(mockLoadItems).toHaveBeenCalledWith('name');
  });

  it('has accessible sort buttons with correct labels', () => {
    setupStoreMock({ items: sampleItems });

    const { getByLabelText } = render(
      <BrowseListScreen navigation={mockNavigation} route={mockRoute} />,
    );

    expect(getByLabelText('Sort alphabetically')).toBeTruthy();
    expect(getByLabelText('Sort by most recent')).toBeTruthy();
  });
});
