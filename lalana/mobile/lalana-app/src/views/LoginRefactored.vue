<template>
  <ion-page>
    <ion-header class="modern-header">
      <ion-toolbar class="modern-toolbar">
        <ion-title class="modern-title">Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modern-content">
      <div class="login-container">
        <!-- Logo ou titre de l'application -->
        <div class="app-branding">
          <h1 class="app-title">Lalana</h1>
          <p class="app-subtitle">Gestion des signalements routiers</p>
        </div>

        <!-- Formulaire de connexion -->
        <div class="form-card">
          <div class="form-group">
            <ion-item lines="none" class="modern-item">
              <ion-input
                v-model="email"
                type="email"
                label="Email"
                label-placement="floating"
                :disabled="isLoading"
                class="modern-input"
              />
            </ion-item>
          </div>

          <div class="form-group">
            <ion-item lines="none" class="modern-item">
              <ion-input
                v-model="password"
                type="password"
                label="Mot de passe"
                label-placement="floating"
                :disabled="isLoading"
                class="modern-input"
              />
            </ion-item>
          </div>

          <!-- Boutons -->
          <ion-button 
            expand="block" 
            @click="handleLogin"
            :disabled="isLoading || !isFormValid"
            class="primary-button"
          >
            <ion-spinner v-if="isLoading" name="crescent" slot="start"></ion-spinner>
            Se connecter
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="clear" 
            @click="handleContinueAsGuest" 
            class="guest-button"
            :disabled="isLoading"
          >
            Accéder en tant que visiteur
          </ion-button>
          
          <!-- Messages -->
          <div v-if="error" class="error-message">
            <ion-text color="danger">
              {{ error }}
            </ion-text>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonText,
  IonSpinner
} from '@ionic/vue';
import { useAuth } from '@/composables';
import { useRouter } from 'vue-router';

// Composables
const { login, continueAsGuest, error, isLoading } = useAuth();
const router = useRouter();

// State
const email = ref('');
const password = ref('');

// Validation
const isFormValid = computed(() => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email.value.trim()) && password.value.length > 0;
});

// Handlers
async function handleLogin() {
  const success = await login(email.value, password.value);
  if (success) {
    router.push('/map');
  }
}

function handleContinueAsGuest() {
  continueAsGuest();
}
</script>

<style scoped>
.modern-content {
  --background: #fafafa;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 2rem 1.5rem;
}

.app-branding {
  text-align: center;
  margin-bottom: 3rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

.form-group {
  margin-bottom: 1.25rem;
}

.modern-item {
  --background: #f5f5f5;
  --border-radius: 10px;
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 52px;
  border-radius: 10px;
}

.modern-input {
  --color: #1a1a1a;
  --placeholder-color: #999;
  font-size: 0.95rem;
}

.primary-button {
  --background: #1a1a1a;
  --background-hover: #2a2a2a;
  --background-activated: #000;
  --color: white;
  --border-radius: 10px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  margin-top: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: none;
  font-size: 1rem;
}

.primary-button::part(native) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.guest-button {
  --color: #666;
  --color-hover: #1a1a1a;
  margin-top: 0.75rem;
  font-weight: 500;
  text-transform: none;
  font-size: 0.95rem;
}

.error-message {
  margin-top: 1.25rem;
  padding: 12px;
  background: #fff5f5;
  border-radius: 8px;
  text-align: center;
  border-left: 3px solid #ef4444;
}

.error-message ion-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.modern-header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-toolbar {
  --background: white;
  --border-color: transparent;
}

.modern-title {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1.1rem;
}
</style>
