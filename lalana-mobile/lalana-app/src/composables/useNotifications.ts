import { ref, onUnmounted } from 'vue';
import { notificationService } from '@/services';
import { useNotificationDisplay } from './useNotificationDisplay';
import type { PluginListenerHandle } from '@capacitor/core';
import type { PushNotificationSchema } from '@capacitor/push-notifications';

export function useNotifications() {
    const notificationPermission = ref<'granted' | 'denied' | 'prompt'>('prompt');
    const fcmToken = ref<string | null>(null);
    const lastNotification = ref<{ title: string; body: string; data?: Record<string, unknown> } | null>(null);
    const isInitialized = ref(false);
    const error = ref<string | null>(null);

    let listeners: PluginListenerHandle[] = [];
    const { showForegroundNotification } = useNotificationDisplay();

    async function initializeNotifications(): Promise<boolean> {
        if (isInitialized.value) {
            return true;
        }

        try {
            error.value = null;

            const success = await notificationService.initialize();

            if (success) {
                isInitialized.value = true;
                notificationPermission.value = 'granted';
                fcmToken.value = notificationService.getToken();

                const foregroundListener = await notificationService.addPushReceivedListener(
                    (notification: PushNotificationSchema) => {
                        console.log('[useNotifications] Notification foreground reçue:', notification);
                        
                        const notificationData = {
                            title: notification.title || 'Notification',
                            body: notification.body || '',
                            data: notification.data
                        };
                        
                        lastNotification.value = notificationData;
                        showForegroundNotification(notificationData);
                    }
                );
                listeners.push(foregroundListener);

                console.log('[useNotifications] Initialisé avec succès, token:', fcmToken.value?.substring(0, 20) + '...');
            } else {
                notificationPermission.value = 'denied';
            }

            return success;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur inconnue';
            console.error('[useNotifications] Erreur initialisation:', err);
            return false;
        }
    }

    async function requestPermission(): Promise<boolean> {
        try {
            const permission = await notificationService.requestPermission();
            notificationPermission.value = permission;
            return permission === 'granted';
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur permission';
            return false;
        }
    }

    async function checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
        const permission = await notificationService.checkPermission();
        notificationPermission.value = permission;
        return permission;
    }

    function isSupported(): boolean {
        return notificationService.isSupported();
    }

    function getToken(): string | null {
        return notificationService.getToken();
    }

    async function updateTokenInFirestore(): Promise<void> {
        const token = notificationService.getToken();
        if (token) {
            await notificationService.saveTokenToFirestore(token);
            console.log('[useNotifications] Token mis à jour dans Firestore');
        }
    }

    function cleanup() {
        listeners.forEach(listener => listener.remove());
        listeners = [];
        console.log('[useNotifications] Listeners nettoyés');
    }

    onUnmounted(() => {
        cleanup();
    });

    return {
        notificationPermission,
        fcmToken,
        lastNotification,
        isInitialized,
        error,

        initializeNotifications,
        requestPermission,
        checkPermission,
        isSupported,
        getToken,
        updateTokenInFirestore,
        cleanup
    };
}
