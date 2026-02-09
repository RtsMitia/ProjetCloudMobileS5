import { toastController } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

export function useNotificationDisplay() {
    const router = useRouter();

    async function showForegroundNotification(notification: {
        title: string;
        body: string;
        data?: Record<string, unknown>;
    }) {
        const toast = await toastController.create({
            header: notification.title,
            message: notification.body,
            duration: 5000,
            position: 'top',
            color: 'primary',
            icon: notificationsOutline,
            buttons: [
                {
                    text: 'Voir',
                    role: 'action',
                    handler: () => {
                        handleNotificationAction(notification.data);
                    },
                },
                {
                    text: 'Fermer',
                    role: 'cancel',
                },
            ],
        });

        await toast.present();
    }

    function handleNotificationAction(data?: Record<string, unknown>) {
        if (!data) return;

        if (data.signalementId && typeof data.signalementId === 'string') {
            router.push({
                name: 'SignalementDetail',
                params: { id: data.signalementId as string },
            });
        }

        if (data.type === 'STATUS_CHANGE') {
            router.push(`/mes-signalements`);
        }
    }

    async function showSimpleToast(message: string, color: 'success' | 'warning' | 'danger' = 'success') {
        const toast = await toastController.create({
            message,
            duration: 3000,
            position: 'bottom',
            color,
        });

        await toast.present();
    }

    return {
        showForegroundNotification,
        handleNotificationAction,
        showSimpleToast,
    };
}
