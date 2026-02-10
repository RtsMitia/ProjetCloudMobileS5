import { ref, onUnmounted } from 'vue';
import { notificationService } from '@/services';
import { Capacitor } from '@capacitor/core';

export function useNotifications() {
    const isInitialized = ref(false);
    const error = ref<string | null>(null);

    async function initializeNotifications(): Promise<void> {
        if (isInitialized.value) {
            return;
        }

        if (!Capacitor.isNativePlatform()) {
            console.log('[useNotifications] Plateforme web, notifications push non supportées');
            return;
        }

        try {
            error.value = null;
            await notificationService.initialize();
            isInitialized.value = true;
            console.log('[useNotifications] Initialisé avec succès');
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur inconnue';
            console.error('[useNotifications] Erreur initialisation:', err);
        }
    }

    return {
        isInitialized,
        error,
        initializeNotifications,
    };
}
