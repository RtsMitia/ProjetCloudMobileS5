<template>
  <ion-toast
    :is-open="isOpen"
    :message="message"
    :duration="duration"
    :position="position"
    :color="color"
    :buttons="buttons"
    @didDismiss="handleDismiss"
  >
    <template v-if="header" #header>
      <div class="toast-header">
        <ion-icon :icon="icon" v-if="icon"></ion-icon>
        <strong>{{ header }}</strong>
      </div>
    </template>
  </ion-toast>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonToast, IonIcon } from '@ionic/vue';
import { notificationsOutline } from 'ionicons/icons';

interface NotificationToastProps {
  position?: 'top' | 'bottom' | 'middle';
  duration?: number;
  color?: string;
  icon?: string;
}

const props = withDefaults(defineProps<NotificationToastProps>(), {
  position: 'top',
  duration: 4000,
  color: 'primary',
  icon: notificationsOutline,
});

const isOpen = ref(false);
const header = ref('');
const message = ref('');
const buttons = ref<any[]>([]);

interface ShowToastOptions {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  onAction?: () => void;
}

function show(options: ShowToastOptions) {
  header.value = options.title;
  message.value = options.body;
  
  buttons.value = [
    {
      text: 'Fermer',
      role: 'cancel',
    },
  ];

  if (options.onAction) {
    buttons.value.unshift({
      text: 'Voir',
      role: 'action',
      handler: () => {
        options.onAction?.();
      },
    });
  }

  isOpen.value = true;
}

function hide() {
  isOpen.value = false;
}

function handleDismiss() {
  isOpen.value = false;
}

defineExpose({
  show,
  hide,
});
</script>

<style scoped>
.toast-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toast-header ion-icon {
  font-size: 20px;
}
</style>
