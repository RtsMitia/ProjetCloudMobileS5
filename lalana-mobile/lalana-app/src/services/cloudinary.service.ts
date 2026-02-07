import { cloudinaryConfig, getCloudinaryUploadUrl } from '@/config/cloudinary.config';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}


export async function uploadToCloudinary(
  base64Data: string,
  publicId: string
): Promise<string> {
  const uploadUrl = getCloudinaryUploadUrl();

  const formData = new FormData();
  formData.append('file', base64Data);
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
