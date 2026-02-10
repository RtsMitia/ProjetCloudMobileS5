import { ref, computed } from 'vue';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/services/firebase/firebase';
import { useRouter } from 'vue-router';
import { Capacitor } from '@capacitor/core';

/**
 * Composable pour gérer l'authentification Firebase
 */
export function useAuth() {
  const router = useRouter();
  const currentUser = ref<User | null>(auth.currentUser);
  const isAuthenticated = computed(() => currentUser.value !== null);
  const isLoading = ref(false);
  const error = ref<string>('');

  // Écouter les changements d'état d'authentification
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
  });

  /**
   * Connexion avec email et mot de passe
   */
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true;
    error.value = '';

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      currentUser.value = userCredential.user;
      console.log('✅ Connecté:', userCredential.user.uid);

      // Initialiser les notifications push SEULEMENT sur mobile natif
      if (Capacitor.isNativePlatform()) {
        setTimeout(async () => {
          try {
            const { notificationService } = await import('@/services/notification.service');
            console.log('🔔 [AUTH] Initialisation notifications push pour userId:', userCredential.user.uid);
            await notificationService.initialize();
          } catch (notifError) {
            console.error('❌ Erreur init notifications (non bloquant):', notifError);
          }
        }, 500);
      } else {
        console.log('ℹ️ [AUTH] Plateforme web, notifications via Firestore onSnapshot');
      }

      return true;
    } catch (e: any) {
      console.error('❌ Erreur auth Firebase:', e);
      error.value = getAuthErrorMessage(e.code);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Déconnexion
   */
  async function logout(): Promise<void> {
    try {
      await signOut(auth);
      currentUser.value = null;
      router.push('/login');
      console.log('✅ Déconnecté');
    } catch (e: any) {
      console.error('❌ Erreur de déconnexion:', e);
      error.value = 'Erreur lors de la déconnexion';
    }
  }

  /**
   * Accéder en tant que visiteur
   */
  function continueAsGuest(): void {
    router.push('/map');
  }

  /**
   * Rediriger vers la page de login
   */
  function goToLogin(): void {
    router.push('/login');
  }

  /**
   * Obtenir le message d'erreur en français
   */
  function getAuthErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Adresse e-mail invalide';
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé pour cet e-mail';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard.';
      case 'auth/network-request-failed':
        return 'Erreur réseau. Vérifiez votre connexion.';
      default:
        return 'Erreur lors de la connexion';
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    continueAsGuest,
    goToLogin
  };
}
