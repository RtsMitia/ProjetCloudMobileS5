import { alertController, modalController } from '@ionic/vue';
import SignalementFormModal from '@/components/SignalementFormModal.vue';

/**
 * Interface pour les données du formulaire avec photos
 */
export interface SignalementFormData {
  description: string;
  localisation: string;
  photos: { filepath: string; webviewPath: string; base64Data?: string }[];
}

/**
 * Service pour gérer les alertes/dialogs de l'application
 */
export const alertService = {
  /**
   * Afficher une alerte simple
   */
  async showAlert(header: string, message: string): Promise<void> {
    const alert = await alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  },

  /**
   * Afficher une alerte de succès
   */
  async showSuccess(message: string): Promise<void> {
    await this.showAlert('Succès !', message);
  },

  /**
   * Afficher une alerte d'erreur
   */
  async showError(message: string): Promise<void> {
    await this.showAlert('Erreur', message);
  },

  /**
   * Afficher une confirmation
   */
  async showConfirm(
    header: string,
    message: string,
    confirmText: string = 'Confirmer',
    cancelText: string = 'Annuler'
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await alertController.create({
        header,
        message,
        buttons: [
          {
            text: cancelText,
            role: 'cancel',
            handler: () => resolve(false)
          },
          {
            text: confirmText,
            handler: () => resolve(true)
          }
        ]
      });
      await alert.present();
    });
  },

  /**
   * Afficher un formulaire pour créer un signalement avec support photos.
   * Ouvre un modal avec champs description, localisation et boutons caméra/galerie.
   */
  async showSignalementForm(): Promise<SignalementFormData | null> {
    const modal = await modalController.create({
      component: SignalementFormModal,
    });

    await modal.present();

    const { data, role } = await modal.onDidDismiss();

    if (role === 'cancel' || !data) {
      return null;
    }

    return data as SignalementFormData;
  },

  /**
   * Afficher une alerte d'info pour le mode signalement
   */
  async showSignalementModeInfo(): Promise<void> {
    await this.showAlert(
      'Mode signalement activé',
      'Cliquez sur la carte pour placer un marqueur à l\'emplacement du problème.'
    );
  },

  /**
   * Demander le choix de position pour le signalement
   * @returns 'current' pour la position actuelle, 'map' pour cliquer sur la carte, null si annulé
   */
  async showLocationChoice(): Promise<'current' | 'map' | null> {
    return new Promise(async (resolve) => {
      const alert = await alertController.create({
        header: '📍 Localisation du signalement',
        message: 'Où se trouve le problème ?',
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: 'À ma position',
            cssClass: 'primary-button',
            handler: () => resolve('current')
          },
          {
            text: 'Choisir sur la carte',
            handler: () => resolve('map')
          }
        ]
      });
      await alert.present();
    });
  }
};
