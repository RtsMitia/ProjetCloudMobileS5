<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Connexion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-input
          v-model="email"
          type="email"
          label="Email"
          label-placement="floating"
        />
      </ion-item>

      <ion-item>
        <ion-input
          v-model="password"
          type="password"
          label="Mot de passe"
          label-placement="floating"
        />
      </ion-item>

      <ion-button expand="block" @click="login">
        Se connecter
      </ion-button>
      <ion-text color="danger" v-if="error">
        {{ error }}
      </ion-text>

      <ion-text color="success" v-if="success">
        Connecté : {{ user.email }} (uid: {{ user.uid }})
      </ion-text>

      <pre v-if="user" style="white-space: pre-wrap; word-break: break-word; margin-top: 12px;">{{ userJson }}</pre>

      <section style="margin-top:12px;">
        <strong>Debug email</strong>
        <div>Raw: <code>{{ email }}</code></div>
        <div>Trimmed: <code>{{ emailTrim }}</code></div>
        <div>Chars: <code>{{ emailCodes }}</code></div>
      </section>
    </ion-content>
  </ion-page>
</template>
<script setup lang="ts">
    import { ref, computed } from "vue";
    import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonText } from '@ionic/vue';
    import { signInWithEmailAndPassword } from "firebase/auth";
    import { auth } from "@/services/firebase/firebase";
    import { useRouter } from "vue-router";

    const email = ref("");
    const password = ref("");
    const error = ref("");
    const success = ref(false);
    const user = ref<any>(null);

    const userJson = computed(() => (user.value ? JSON.stringify(user.value, null, 2) : ""));

    const router = useRouter();

    function validateEmailAddress(emailStr: string) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    }

    const emailTrim = computed(() => email.value.trim());
    const emailCodes = computed(() => {
      if (!email.value) return '';
      return Array.from(email.value).map(c => c.charCodeAt(0)).join(', ');
    });

    const login = async () => {
    error.value = "";
    success.value = false;
    user.value = null;

    // use computed trimmed value
    const _email = emailTrim.value;
    if (!validateEmailAddress(_email)) {
      error.value = "Adresse e‑mail invalide";
      console.warn('Email invalide fourni:', email.value, 'trimmed:', _email, 'codes:', emailCodes.value);
      return;
    }

    console.log('Tentative de connexion avec:', _email, 'raw:', email.value, 'codes:', emailCodes.value);

    try {
      const userCredential = await signInWithEmailAndPassword(
      auth,
      _email,
      password.value
      );

      console.log("Connecté :", userCredential.user.uid);
      user.value = userCredential.user;
      success.value = true;
      error.value = "";
    } catch (e: any) {
      console.error('Erreur auth Firebase:', e);
      if (e && e.code === 'auth/invalid-email') {
        error.value = 'Adresse e‑mail invalide (format)';
      } else if (e && e.code === 'auth/user-not-found') {
        error.value = 'Aucun utilisateur trouvé pour cet e‑mail';
      } else if (e && e.code === 'auth/wrong-password') {
        error.value = 'Mot de passe incorrect';
      } else {
        error.value = e && e.message ? e.message : 'Erreur lors de la connexion';
      }
      success.value = false;
      user.value = null;
    }
    };
</script>
