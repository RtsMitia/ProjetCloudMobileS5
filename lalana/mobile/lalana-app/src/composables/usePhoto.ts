import { ref, onMounted, watch } from 'vue';
import {
    Camera,
    CameraResultType,
    CameraSource,
    Photo,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface UserPhoto {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE_KEY = 'photos';

export function usePhoto() {
    const photos = ref<UserPhoto[]>([]);

    const loadSaved = async () => {
        const photoList = await Preferences.get({ key: PHOTO_STORAGE_KEY });
        const photosInPreferences: UserPhoto[] = photoList.value
            ? JSON.parse(photoList.value)
            : [];

        if (!Capacitor.isNativePlatform()) {
            for (const photo of photosInPreferences) {
                const file = await Filesystem.readFile({
                    path: photo.filepath,
                    directory: Directory.Data,
                });
                photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
            }
        }

        photos.value = photosInPreferences;
    };

    const savePhotos = () => {
        Preferences.set({
            key: PHOTO_STORAGE_KEY,
            value: JSON.stringify(photos.value),
        });
    };

    watch(photos, savePhotos, { deep: true });

    const savePicture = async (
        photo: Photo,
        fileName: string
    ): Promise<UserPhoto> => {
        let base64Data: string;

        if (Capacitor.isNativePlatform()) {
            const file = await Filesystem.readFile({
                path: photo.path!,
            });
            base64Data = file.data as string;
        } else {
            const response = await fetch(photo.webPath!);
            const blob = await response.blob();
            base64Data = await convertBlobToBase64(blob);
        }

        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data,
        });

        if (Capacitor.isNativePlatform()) {
            return {
                filepath: savedFile.uri,
                webviewPath: Capacitor.convertFileSrc(savedFile.uri),
            };
        } else {
            return {
                filepath: fileName,
                webviewPath: photo.webPath,
            };
        }
    };

    const takePhoto = async () => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 90,
        });

        const fileName = `photo_${Date.now()}.jpeg`;
        const savedPhoto = await savePicture(photo, fileName);

        photos.value = [savedPhoto, ...photos.value];
    };

    const pickFromGallery = async () => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Photos,
            quality: 90,
        });

        const fileName = `photo_${Date.now()}.jpeg`;
        const savedPhoto = await savePicture(photo, fileName);

        photos.value = [savedPhoto, ...photos.value];
    };

    const choosePhoto = async () => {
        const photo = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Prompt,
            quality: 90,
            promptLabelHeader: 'Photo',
            promptLabelPhoto: 'Depuis la galerie',
            promptLabelPicture: 'Prendre une photo',
        });

        const fileName = `photo_${Date.now()}.jpeg`;
        const savedPhoto = await savePicture(photo, fileName);

        photos.value = [savedPhoto, ...photos.value];
    };

    const deletePhoto = async (photo: UserPhoto) => {
        const filename = photo.filepath.substring(
            photo.filepath.lastIndexOf('/') + 1
        );
        await Filesystem.deleteFile({
            path: filename,
            directory: Directory.Data,
        });

        photos.value = photos.value.filter((p) => p.filepath !== photo.filepath);
    };

    const convertBlobToBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
        });

    onMounted(loadSaved);

    return {
        photos,
        takePhoto,
        pickFromGallery,
        choosePhoto,
        deletePhoto,
    };
}
