import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { generateId } from '../utils/generateId';

/**
 * Directory within the app's document storage where photos are kept.
 */
const PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;

/**
 * Maximum dimensions for full-size photos (maintains aspect ratio).
 */
const MAX_PHOTO_SIZE = 1200;

/**
 * Maximum dimensions for thumbnail images (maintains aspect ratio).
 */
const THUMBNAIL_SIZE = 200;

/**
 * JPEG compression quality (0-1). ~0.8 gives good quality at reasonable file size.
 */
const JPEG_COMPRESS = 0.8;

/**
 * Ensures the photos directory exists.
 */
async function ensurePhotosDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

/**
 * Saves a photo from the given URI to the app's local storage.
 * The photo is resized to a maximum of 1200x1200 (maintaining aspect ratio)
 * and a 200x200 thumbnail is generated.
 *
 * @param uri - Source URI of the photo (local file or camera capture)
 * @returns Object containing the saved photoUri and thumbnailUri
 */
export async function savePhoto(
  uri: string
): Promise<{ photoUri: string; thumbnailUri: string }> {
  await ensurePhotosDirectory();

  const id = generateId();
  const photoPath = `${PHOTOS_DIR}${id}.jpg`;
  const thumbnailPath = `${PHOTOS_DIR}${id}_thumb.jpg`;

  // Resize to max 1200x1200 maintaining aspect ratio and save as JPEG
  const fullSizeResult = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_PHOTO_SIZE, height: MAX_PHOTO_SIZE } }],
    { compress: JPEG_COMPRESS, format: SaveFormat.JPEG }
  );

  // Generate 200x200 thumbnail maintaining aspect ratio
  const thumbnailResult = await manipulateAsync(
    uri,
    [{ resize: { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE } }],
    { compress: JPEG_COMPRESS, format: SaveFormat.JPEG }
  );

  // Move the manipulated images to our photos directory
  await FileSystem.moveAsync({ from: fullSizeResult.uri, to: photoPath });
  await FileSystem.moveAsync({ from: thumbnailResult.uri, to: thumbnailPath });

  return { photoUri: photoPath, thumbnailUri: thumbnailPath };
}

/**
 * Deletes photo and thumbnail files from the device.
 * Gracefully handles the case where files don't exist (no error thrown).
 *
 * @param photoUri - Path to the full-size photo file
 * @param thumbnailUri - Path to the thumbnail file
 */
export async function deletePhoto(
  photoUri: string,
  thumbnailUri: string
): Promise<void> {
  await deleteFileIfExists(photoUri);
  await deleteFileIfExists(thumbnailUri);
}

/**
 * Deletes a file if it exists. Silently succeeds if the file is already gone.
 */
async function deleteFileIfExists(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Gracefully handle any errors (file already deleted, permission issues, etc.)
  }
}
