import { cloudinaryConfig, getCloudinaryUploadUrl } from '@/config/cloudinary.config';
import { Capacitor } from '@capacitor/core';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

/**
 * Convert a base64 data URI to a Blob for reliable FormData upload on native platforms.
 */
function base64ToBlob(dataUri: string): Blob {
  const [header, base64] = dataUri.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

export async function uploadToCloudinary(
  base64Data: string,
  publicId: string
): Promise<string> {
  const uploadUrl = getCloudinaryUploadUrl();

  // Ensure data URI prefix
  const dataUri = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  const formData = new FormData();

  // On native platforms, convert to Blob for reliable FormData upload
  if (Capacitor.isNativePlatform()) {
    const blob = base64ToBlob(dataUri);
    formData.append('file', blob, `${publicId}.jpeg`);
  } else {
    formData.append('file', dataUri);
  }

  formData.append('upload_preset', cloudinaryConfig.uploadPreset);
  formData.append('folder', cloudinaryConfig.folder);
  formData.append('public_id', publicId);

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur upload Cloudinary');
    }

    const result: CloudinaryUploadResult = await response.json();
    console.log('Image uploadée sur Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Erreur upload Cloudinary:', error);
    throw error;
  }
}

export async function uploadSignalementPhotos(
  photos: { base64Data?: string }[],
  signalementId: string
): Promise<string[]> {
  const urls: string[] = [];
  const timestamp = Date.now();

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    if (!photo.base64Data) continue;

    const publicId = `signalement_${signalementId}_${timestamp}_${i + 1}`;

    try {
      const url = await uploadToCloudinary(photo.base64Data, publicId);
      urls.push(url);
    } catch (error) {
      console.error(`Échec upload photo ${i + 1}:`, error);
    }
  }

  return urls;
}
