import { 
  collection, 
  addDoc, 
  doc,
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp,
  onSnapshot,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { SignalementRequest, Signalement } from '@/types/firestore';

export class SignalementService {
  private collectionName = 'signalements';

  async createSignalement(data: SignalementRequest): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      const signalementData = {
        userId: data.userId,
        userEmail: currentUser.email || '',
        
        location: {
          x: data.x,
          y: data.y,
          localisation: data.localisation || ''
        },
        
        description: data.description || '',
        
        status: {
          id: 1,
          nom: 'En attente',
          description: 'Signalement en attente de validation'
        },
        
        createdAt: Timestamp.fromDate(data.createdAt),
        updatedAt: serverTimestamp(), 
        
        photoUrls: [],
        priority: 3 
      };

      const docRef = await addDoc(
        collection(db, this.collectionName), 
        signalementData
      );

      console.log('Signalement créé avec ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du signalement:', error);
      throw error;
    }
  }

  async getUserSignalements(): Promise<Signalement[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Utilisateur non connecté');
      }

      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const signalements: Signalement[] = [];

      querySnapshot.forEach((doc) => {
        signalements.push({ 
          id: doc.id, 
          ...doc.data() 
        } as unknown as Signalement);
      });

      return signalements;
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
      throw error;
    }
  }

  async getAllSignalements(): Promise<Signalement[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const signalements: Signalement[] = [];

      querySnapshot.forEach((doc) => {
        signalements.push({ 
          id: doc.id, ...doc.data() 
        } as unknown as Signalement);
      });

      return signalements;
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
      throw error;
    }
  }

  subscribeToSignalements(
    callback: (signalements: Signalement[]) => void
  ): () => void {
    const q = query(
      collection(db, this.collectionName),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const signalements: Signalement[] = [];
        querySnapshot.forEach((doc) => {
          signalements.push({ 
            id: doc.id, 
            ...doc.data() 
          } as unknown as Signalement);
        });
        
        console.log(`${signalements.length} signalements reçus de Firestore`);
        callback(signalements);
      },
      (error) => {
        console.error('Erreur lors de l\'écoute des signalements:', error);
      }
    );

    return unsubscribe;
  }
}

// Export une instance unique du service
export const signalementService = new SignalementService();
