import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NameInputScreen } from '../NameInputScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { photoUri: 'file:///test-photo.jpg' },
  }),
}));

// Mock the store
const mockAddItem = jest.fn();

jest.mock('../../store/itemStore', () => ({
  useItemStore: (selector: any) =>
    selector({ addItem: mockAddItem }),
}));

describe('NameInputScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders the screen with photo preview, inputs, and save button', () => {
      const { getByTestId, getByText } = render(<NameInputScreen />);

      expect(getByTestId('name-input-screen')).toBeTruthy();
      expect(getByTestId('name-input-field')).toBeTruthy();
      expect(getByTestId('description-input-field')).toBeTruthy();
      expect(getByTestId('save-button')).toBeTruthy();
      expect(getByText('Name this item')).toBeTruthy();
    });

    it('displays captured photo as preview', () => {
      const { getByLabelText } = render(<NameInputScreen />);

      const image = getByLabelText('Captured item photo preview');
      expect(image).toBeTruthy();
      expect(image.props.source).toEqual({ uri: 'file:///test-photo.jpg' });
    });

    it('shows correct labels and placeholders', () => {
      const { getByText } = render(<NameInputScreen />);

      expect(getByText('Item name')).toBeTruthy();
      expect(getByText('Where is it? (optional)')).toBeTruthy();
    });
  });

  describe('Validation', () => {
    it('save button is disabled when name is empty', () => {
      const { getByTestId } = render(<NameInputScreen />);

      const saveButton = getByTestId('save-button');
      expect(saveButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('save button becomes enabled when name is entered', () => {
      const { getByTestId } = render(<NameInputScreen />);

      fireEvent.changeText(getByTestId('name-input-field'), 'Keys');

      const saveButton = getByTestId('save-button');
      expect(saveButton.props.accessibilityState?.disabled).toBe(false);
    });

    it('keeps save button disabled when name is only whitespace', () => {
      const { getByTestId } = render(<NameInputScreen />);

      // Enter whitespace-only name
      fireEvent.changeText(getByTestId('name-input-field'), '   ');

      const saveButton = getByTestId('save-button');
      expect(saveButton.props.accessibilityState?.disabled).toBe(true);
      expect(mockAddItem).not.toHaveBeenCalled();
    });
  });

  describe('Save flow', () => {
    it('calls addItem with correct params on save', async () => {
      mockAddItem.mockResolvedValue({
        id: 'test-item-id',
        name: 'Keys',
        description: 'Kitchen hook',
        photoUri: 'file:///saved-photo.jpg',
        thumbnailUri: 'file:///saved-thumb.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const { getByTestId } = render(<NameInputScreen />);

      fireEvent.changeText(getByTestId('name-input-field'), 'Keys');
      fireEvent.changeText(getByTestId('description-input-field'), 'Kitchen hook');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith({
          name: 'Keys',
          description: 'Kitchen hook',
          photoUri: 'file:///test-photo.jpg',
        });
      });
    });

    it('shows confirmation message after successful save', async () => {
      mockAddItem.mockResolvedValue({
        id: 'test-item-id',
        name: 'Keys',
        photoUri: 'file:///saved-photo.jpg',
        thumbnailUri: 'file:///saved-thumb.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const { getByTestId, getByText } = render(<NameInputScreen />);

      fireEvent.changeText(getByTestId('name-input-field'), 'Keys');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('name-input-confirmation')).toBeTruthy();
        expect(getByText('Got it! Your Keys is saved.')).toBeTruthy();
      });
    });

    it('navigates to Confirmation screen after save', async () => {
      mockAddItem.mockResolvedValue({
        id: 'test-item-id',
        name: 'Keys',
        photoUri: 'file:///saved-photo.jpg',
        thumbnailUri: 'file:///saved-thumb.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const { getByTestId } = render(<NameInputScreen />);

      fireEvent.changeText(getByTestId('name-input-field'), 'Keys');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByTestId('name-input-confirmation')).toBeTruthy();
      });

      // Advance timer past the 1500ms delay
      jest.advanceTimersByTime(1500);

      expect(mockNavigate).toHaveBeenCalledWith('Confirmation', {
        itemId: 'test-item-id',
        action: 'created',
      });
    });

    it('saves without description when not provided', async () => {
      mockAddItem.mockResolvedValue({
        id: 'test-item-id',
        name: 'Glasses',
        photoUri: 'file:///saved-photo.jpg',
        thumbnailUri: 'file:///saved-thumb.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const { getByTestId } = render(<NameInputScreen />);

      fireEvent.changeText(getByTestId('name-input-field'), 'Glasses');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith({
          name: 'Glasses',
          description: undefined,
          photoUri: 'file:///test-photo.jpg',
        });
      });
    });

    it('shows error message when addItem fails', async () => {
      mockAddItem.mockRejectedValue(new Error('Database error'));

      const { getByTestId, getByText } = render(<NameInputScreen />);

      fireEvent.changeText(getByTestId('name-input-field'), 'Keys');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(
          getByText("Something went wrong saving that. Let's try again."),
        ).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible heading', () => {
      const { getByRole } = render(<NameInputScreen />);
      expect(getByRole('header')).toBeTruthy();
    });

    it('confirmation message uses alert role for screen readers', async () => {
      mockAddItem.mockResolvedValue({
        id: 'test-item-id',
        name: 'Keys',
        photoUri: 'file:///saved-photo.jpg',
        thumbnailUri: 'file:///saved-thumb.jpg',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });

      const { getByTestId, getByRole } = render(<NameInputScreen />);

      fireEvent.changeText(getByTestId('name-input-field'), 'Keys');
      fireEvent.press(getByTestId('save-button'));

      await waitFor(() => {
        expect(getByRole('alert')).toBeTruthy();
      });
    });
  });
});
