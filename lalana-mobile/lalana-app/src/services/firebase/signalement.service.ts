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
  private collectionName = 'signalementListe';
  private addCollectionName = 'signalementAdd';


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
          ...doc.data(),
          id: doc.id,
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
          ...doc.data(),
          id: doc.id,
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

    const listeCollectionRef = collection(db, this.collectionName);

    const addCollectionRef = collection(db, this.addCollectionName);

    let signalementsList: Signalement[] = [];
    let signalementsAdd: Signalement[] = [];

    const mergeAndCallback = () => {
      const allSignalements = [...signalementsList, ...signalementsAdd];
      const uniqueMap = new Map<string, Signalement>();
      allSignalements.forEach(s => {
        if (s.id) uniqueMap.set(s.id, s);
      });
      const merged = Array.from(uniqueMap.values());
      merged.sort((a, b) => {
        const getTime = (d: any): number => {
          if (!d) return 0;
          if (d.toMillis) return d.toMillis(); // Firestore Timestamp
          if (d.seconds) return d.seconds * 1000; // Timestamp-like object
          const parsed = new Date(d).getTime();
          return isNaN(parsed) ? 0 : parsed;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });

      console.log(`${merged.length} signalements (${signalementsList.length} liste + ${signalementsAdd.length} add)`);
      callback(merged);
    };

    const unsubListe = onSnapshot(
      listeCollectionRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        signalementsList = [];
        querySnapshot.forEach((doc) => {
          signalementsList.push({
            ...doc.data(),
            id: doc.id,
          } as unknown as Signalement);
        });
        mergeAndCallback();
      },
      (error) => {
        console.error('Erreur écoute signalementListe:', error);
      }
    );

    const unsubAdd = onSnapshot(
      addCollectionRef,
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        signalementsAdd = [];
        querySnapshot.forEach((doc) => {
          signalementsAdd.push({
            ...doc.data(),
            id: doc.id,
          } as unknown as Signalement);
        });
        mergeAndCallback();
      },
      (error) => {
        console.error('Erreur écoute signalementAdd:', error);
      }
    );

    // Retourner une fonction qui unsubscribe des deux
    return () => {
      unsubListe();
      unsubAdd();
    };
  }
}

// Export une instance unique du service
export const signalementService = new SignalementService();
