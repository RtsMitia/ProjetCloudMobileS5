import { alertController } from '@ionic/vue';

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
   * Afficher un formulaire pour créer un signalement
   */
  async showSignalementForm(): Promise<{ description: string; localisation: string } | null> {
    return new Promise(async (resolve) => {
      const alert = await alertController.create({
        header: 'Décrire le problème',
        inputs: [
          {
            name: 'description',
            type: 'textarea',
            placeholder: 'Décrivez le problème routier (nid-de-poule, route dégradée, etc.)'
          },
          {
            name: 'localisation',
            type: 'text',
            placeholder: 'Adresse ou nom du lieu (optionnel)'
          }
        ],
        buttons: [
          {
            text: 'Annuler',
            role: 'cancel',
            handler: () => resolve(null)
          },
          {
            text: 'Envoyer',
            handler: (data) => resolve(data)
          }
        ]
      });
      await alert.present();
    });
  },

  /**
   * Afficher une alerte d'info pour le mode signalement
   */
  async showSignalementModeInfo(): Promise<void> {
    await this.showAlert(
      'Mode signalement activé',
      'Cliquez sur la carte pour placer un marqueur à l\'emplacement du problème.'
    );
  }
};
