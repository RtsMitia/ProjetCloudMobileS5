
export const cloudinaryConfig = {
  cloudName: 'drgearabk',     
  uploadPreset: 'Upload_TP_Mobile_Cloud', 
  folder: 'signalements',             
};

export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
}
