import { ref, computed, onUnmounted } from 'vue';
import { signalementService } from '@/services/firebase/signalement.service';
import type { Signalement, SignalementRequest } from '@/types/firestore';
import { useAuth } from './useAuth';

export function useSignalements() {
  const { currentUser, isAuthenticated } = useAuth();
  
  const signalements = ref<Signalement[]>([]);
  const filteredSignalements = ref<Signalement[]>([]);
  const isLoading = ref(false);
  const error = ref<string>('');
  
  const selectedStatus = ref<string>('all');
  const showOnlyMySignalements = ref<boolean>(false);
  
  let unsubscribe: (() => void) | null = null;

  function subscribeToSignalements(): void {
    unsubscribe = signalementService.subscribeToSignalements((newSignalements) => {
      signalements.value = newSignalements;
      applyFilters();
    });
  }

  function unsubscribeFromSignalements(): void {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  function applyFilters(): void {
    let filtered = [...signalements.value];

    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter(s => s.statusLibelle === selectedStatus.value);
    }

    if (showOnlyMySignalements.value && currentUser.value?.uid) {
      filtered = filtered.filter(s => s.userId === currentUser.value?.uid);
    }

    filteredSignalements.value = filtered;
  }

  async function createSignalement(
    lat: number,
    lng: number,
    description: string,
    localisation: string
  ): Promise<string> {
    if (!currentUser.value) {
      throw new Error('Utilisateur non connecté');
    }

    isLoading.value = true;
    error.value = '';

    try {
      const signalementData: SignalementRequest = {
        id: null,
        userId: currentUser.value.uid,
        x: lng,
        y: lat,
        localisation,
        description,
        statusLibelle: 'En attente',
        createdAt: new Date().toISOString()
      };

      const id = await signalementService.createSignalement(signalementData);
      console.log('✅ Signalement créé:', id);
      return id;
    } catch (e: any) {
      error.value = 'Impossible de créer le signalement';
      console.error('❌ Erreur:', e);
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserSignalements(): Promise<Signalement[]> {
    isLoading.value = true;
    try {
      return await signalementService.getUserSignalements();
    } catch (e: any) {
      error.value = 'Impossible de récupérer vos signalements';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  // Statistiques
  const stats = computed(() => ({
    total: signalements.value.length,
    filtered: filteredSignalements.value.length,
    byStatus: {
      enAttente: signalements.value.filter(s => s.statusLibelle === 'En attente').length,
      valide: signalements.value.filter(s => s.statusLibelle === 'Validé').length,
      enCours: signalements.value.filter(s => s.statusLibelle === 'En cours').length,
      resolu: signalements.value.filter(s => s.statusLibelle === 'Résolu').length,
      rejete: signalements.value.filter(s => s.statusLibelle === 'Rejeté').length,
    }
  }));

  // Cleanup automatique
  onUnmounted(() => {
    unsubscribeFromSignalements();
  });

  return {
    // State
    signalements,
    filteredSignalements,
    isLoading,
    error,
    stats,
    
    // Filtres
    selectedStatus,
    showOnlyMySignalements,
    
    // Actions
    subscribeToSignalements,
    unsubscribeFromSignalements,
    applyFilters,
    createSignalement,
    fetchUserSignalements
  };
}
