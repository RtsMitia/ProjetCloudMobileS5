
export const cloudinaryConfig = {
  cloudName: 'YOUR_CLOUD_NAME',     
  uploadPreset: 'YOUR_UPLOAD_PRESET', 
  folder: 'signalements',             
};

export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
}
