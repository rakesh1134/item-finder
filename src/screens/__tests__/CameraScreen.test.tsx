import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CameraScreen } from '../CameraScreen';

// Mock expo-camera
const mockTakePictureAsync = jest.fn();

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CameraView: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        takePictureAsync: mockTakePictureAsync,
      }));
      return <View testID="mock-camera-view" {...props} />;
    }),
    useCameraPermissions: jest.fn(),
  };
});

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { mode: 'new' },
  }),
}));

import { useCameraPermissions } from 'expo-camera';
import { Linking } from 'react-native';

// Mock Linking.openSettings
jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined as any);

const mockUseCameraPermissions = useCameraPermissions as jest.Mock;

describe('CameraScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Permission loading state', () => {
    it('shows loading indicator when permission is not yet determined', () => {
      mockUseCameraPermissions.mockReturnValue([null, jest.fn()]);

      const { getByTestId, getByText } = render(<CameraScreen />);

      expect(getByTestId('camera-loading')).toBeTruthy();
      expect(getByText('Setting up camera...')).toBeTruthy();
    });
  });

  describe('Permission denied state', () => {
    it('shows friendly permission denied message', () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: false },
        jest.fn(),
      ]);

      const { getByTestId, getByText } = render(<CameraScreen />);

      expect(getByTestId('camera-permission-denied')).toBeTruthy();
      expect(getByText('Camera Access Needed')).toBeTruthy();
      expect(
        getByText(/Camera access is needed to take photos of your items/),
      ).toBeTruthy();
    });

    it('shows button to request permission', () => {
      const mockRequestPermission = jest.fn();
      mockUseCameraPermissions.mockReturnValue([
        { granted: false },
        mockRequestPermission,
      ]);

      const { getByTestId } = render(<CameraScreen />);

      fireEvent.press(getByTestId('camera-request-permission-button'));
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('shows button to open device settings', () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: false },
        jest.fn(),
      ]);

      const { getByTestId } = render(<CameraScreen />);

      fireEvent.press(getByTestId('camera-open-settings-button'));
      expect(Linking.openSettings).toHaveBeenCalled();
    });

    it('shows go back button', () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: false },
        jest.fn(),
      ]);

      const { getByTestId } = render(<CameraScreen />);

      fireEvent.press(getByTestId('camera-go-back-button'));
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe('Camera viewfinder state', () => {
    it('shows camera viewfinder and capture button when permission granted', () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);

      const { getByTestId } = render(<CameraScreen />);

      expect(getByTestId('camera-viewfinder')).toBeTruthy();
      expect(getByTestId('camera-capture-button')).toBeTruthy();
    });

    it('capture button calls takePictureAsync', async () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);
      mockTakePictureAsync.mockResolvedValue({
        uri: 'file:///captured-photo.jpg',
      });

      const { getByTestId } = render(<CameraScreen />);

      fireEvent.press(getByTestId('camera-capture-button'));

      await waitFor(() => {
        expect(mockTakePictureAsync).toHaveBeenCalledWith({ quality: 0.8 });
      });
    });
  });

  describe('Preview state', () => {
    it('shows preview with Retake and Use Photo buttons after capture', async () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);
      mockTakePictureAsync.mockResolvedValue({
        uri: 'file:///captured-photo.jpg',
      });

      const { getByTestId } = render(<CameraScreen />);

      fireEvent.press(getByTestId('camera-capture-button'));

      await waitFor(() => {
        expect(getByTestId('camera-preview')).toBeTruthy();
      });

      expect(getByTestId('camera-retake-button')).toBeTruthy();
      expect(getByTestId('camera-use-photo-button')).toBeTruthy();
    });

    it('retake button goes back to viewfinder', async () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);
      mockTakePictureAsync.mockResolvedValue({
        uri: 'file:///captured-photo.jpg',
      });

      const { getByTestId } = render(<CameraScreen />);

      // Capture photo
      fireEvent.press(getByTestId('camera-capture-button'));

      await waitFor(() => {
        expect(getByTestId('camera-preview')).toBeTruthy();
      });

      // Press retake
      fireEvent.press(getByTestId('camera-retake-button'));

      await waitFor(() => {
        expect(getByTestId('camera-viewfinder')).toBeTruthy();
      });
    });

    it('use photo button navigates to NameInput in new mode', async () => {
      mockUseCameraPermissions.mockReturnValue([
        { granted: true },
        jest.fn(),
      ]);
      mockTakePictureAsync.mockResolvedValue({
        uri: 'file:///captured-photo.jpg',
      });

      const { getByTestId } = render(<CameraScreen />);

      // Capture photo
      fireEvent.press(getByTestId('camera-capture-button'));

      await waitFor(() => {
        expect(getByTestId('camera-preview')).toBeTruthy();
      });

      // Press use photo
      fireEvent.press(getByTestId('camera-use-photo-button'));

      expect(mockNavigate).toHaveBeenCalledWith('NameInput', {
        photoUri: 'file:///captured-photo.jpg',
      });
    });
  });
});
