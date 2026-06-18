import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { LargeButton } from '../components/LargeButton';
import { useItemStore } from '../store/itemStore';
import * as photoStorage from '../services/photoStorage';
import { colors, fonts, spacing } from '../theme';

type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;
type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Camera'>;

/**
 * Camera Screen for capturing item photos.
 *
 * Flow:
 * 1. Shows full-screen camera viewfinder
 * 2. User taps large "Capture" button
 * 3. Shows photo preview with "Retake" and "Use Photo" options
 *
 * Handles camera permission denied with friendly message and settings link.
 *
 * Requirements: 1.2, 5.2, 6.3
 */
export const CameraScreen: React.FC = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const route = useRoute<CameraScreenRouteProp>();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const items = useItemStore((state) => state.items);
  const updateItem = useItemStore((state) => state.updateItem);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
      }
    } catch {
      // If capture fails, stay on viewfinder so user can retry
    } finally {
      setIsCapturing(false);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
  };

  const handleUsePhoto = async () => {
    if (!capturedUri) return;

    if (route.params.mode === 'new') {
      navigation.navigate('NameInput', { photoUri: capturedUri });
    } else if (route.params.mode === 'update') {
      const { itemId } = route.params;
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      setIsProcessing(true);
      try {
        // 1. Save the new photo to local storage (resize + thumbnail)
        const { photoUri: newPhotoUri, thumbnailUri: newThumbnailUri } =
          await photoStorage.savePhoto(capturedUri);

        // 2. Keep references to old photo URIs before updating
        const oldPhotoUri = item.photoUri;
        const oldThumbnailUri = item.thumbnailUri;

        // 3. Update the item in the store (updates database + refreshes state + updates timestamp)
        await updateItem(itemId, {
          photoUri: newPhotoUri,
          thumbnailUri: newThumbnailUri,
        });

        // 4. Delete old photo files from device storage
        await photoStorage.deletePhoto(oldPhotoUri, oldThumbnailUri);

        // 5. Navigate to Confirmation screen with 'updated' action
        navigation.navigate('Confirmation', {
          itemId,
          action: 'updated',
        });
      } catch {
        setIsProcessing(false);
        Alert.alert(
          'Something went wrong',
          'We couldn\'t update the location. Let\'s try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  // Permission still loading
  if (!permission) {
    return (
      <View style={styles.centeredContainer} testID="camera-loading">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.messageText}>Setting up camera...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer} testID="camera-permission-denied">
        <Text
          style={styles.headingText}
          accessibilityRole="header"
        >
          Camera Access Needed
        </Text>
        <Text style={styles.messageText}>
          Camera access is needed to take photos of your items. Please allow
          camera access in your device settings.
        </Text>
        <View style={styles.buttonGroup}>
          <LargeButton
            title="Allow Camera Access"
            onPress={requestPermission}
            variant="primary"
            testID="camera-request-permission-button"
            accessibilityLabel="Allow camera access"
          />
          <LargeButton
            title="Open Settings"
            onPress={handleOpenSettings}
            variant="secondary"
            testID="camera-open-settings-button"
            accessibilityLabel="Open device settings to allow camera access"
          />
          <LargeButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="secondary"
            testID="camera-go-back-button"
            accessibilityLabel="Go back to previous screen"
          />
        </View>
      </View>
    );
  }

  // Preview mode — photo has been captured
  if (capturedUri) {
    return (
      <View style={styles.previewContainer} testID="camera-preview">
        <Image
          source={{ uri: capturedUri }}
          style={styles.previewImage}
          accessibilityRole="image"
          accessibilityLabel="Captured photo preview"
          resizeMode="contain"
        />
        {isProcessing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.textOnPrimary} />
            <Text style={styles.processingText}>Saving new location...</Text>
          </View>
        ) : (
          <View style={styles.previewButtonGroup}>
            <LargeButton
              title="Retake"
              onPress={handleRetake}
              variant="secondary"
              testID="camera-retake-button"
              accessibilityLabel="Retake photo"
            />
            <LargeButton
              title="Use Photo"
              onPress={handleUsePhoto}
              variant="primary"
              testID="camera-use-photo-button"
              accessibilityLabel="Use this photo"
            />
          </View>
        )}
      </View>
    );
  }

  // Camera viewfinder mode
  return (
    <View style={styles.cameraContainer} testID="camera-viewfinder">
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      <View style={styles.captureButtonContainer}>
        <LargeButton
          title="Capture"
          onPress={handleCapture}
          variant="primary"
          disabled={isCapturing}
          style={styles.captureButton}
          testID="camera-capture-button"
          accessibilityLabel="Capture photo"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  camera: {
    flex: 1,
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  captureButton: {
    width: '100%',
    minHeight: 56,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  headingText: {
    fontSize: fonts.heading,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  messageText: {
    fontSize: fonts.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    lineHeight: 26,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  previewImage: {
    flex: 1,
  },
  previewButtonGroup: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.md,
  },
  processingOverlay: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  processingText: {
    fontSize: fonts.body,
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
});

export default CameraScreen;
