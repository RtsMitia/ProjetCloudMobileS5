import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    QuerySnapshot,
    DocumentData,
    updateDoc,
    doc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import type { ProblemeRequest, Probleme } from '@/types/firestore';

/**
 * Service pour gérer la collection "problemes" dans Firestore
 */
export class ProblemeService {
    private collectionName = 'problemes';

    async createProbleme(data: ProblemeRequest): Promise<string> {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const problemeData = {
                id: null,
                surface: data.surface,
                budgetEstime: data.budgetEstime,
                niveau: data.niveau || 1,
                entrepriseId: data.entrepriseId || null,
                entrepriseName: data.entrepriseName || null,
                entrepriseContact: data.entrepriseContact || null,
                statusId: data.statusId,
                statusNom: data.statusNom,
                statusValeur: data.statusValeur,
                signalementId: data.signalementId,
                userId: data.userId,
                userEmail: data.userEmail,
                x: data.x,
                y: data.y,
                localisation: data.localisation,
                description: data.description,
                statusLibelle: data.statusLibelle,
                createdAt: typeof data.createdAt === 'string'
                    ? data.createdAt
                    : Timestamp.fromDate(data.createdAt || new Date()),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(
                collection(db, this.collectionName),
                problemeData
            );

            console.log('Problème créé avec ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Erreur lors de la création du problème:', error);
            throw error;
        }
    }

    async getProblemesBySignalement(signalementId: number): Promise<Probleme[]> {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('signalementId', '==', signalementId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const problemes: Probleme[] = [];

            querySnapshot.forEach((doc) => {
                problemes.push({
                    id: doc.id,
                    ...doc.data()
                } as unknown as Probleme);
            });

            return problemes;
        } catch (error) {
            console.error('Erreur lors de la récupération des problèmes par signalement:', error);
            throw error;
        }
    }

    async getProblemesByUser(userId: number): Promise<Probleme[]> {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const problemes: Probleme[] = [];

            querySnapshot.forEach((doc) => {
                problemes.push({
                    id: doc.id,
                    ...doc.data()
                } as unknown as Probleme);
            });

            return problemes;
        } catch (error) {
            console.error('Erreur lors de la récupération des problèmes par utilisateur:', error);
            throw error;
        }
    }

    async getAllProblemes(): Promise<Probleme[]> {
        try {
            const q = query(
                collection(db, this.collectionName),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const problemes: Probleme[] = [];

            querySnapshot.forEach((doc) => {
                problemes.push({
                    id: doc.id,
                    ...doc.data()
                } as unknown as Probleme);
            });

            return problemes;
        } catch (error) {
            console.error('Erreur lors de la récupération de tous les problèmes:', error);
            throw error;
        }
    }

    async updateProblemeStatus(
        problemeId: string,
        statusId: number,
        statusNom: string,
        statusValeur: number,
        statusLibelle: string
    ): Promise<void> {
        try {
            const problemeRef = doc(db, this.collectionName, problemeId);
            await updateDoc(problemeRef, {
                statusId,
                statusNom,
                statusValeur,
                statusLibelle,
                updatedAt: serverTimestamp()
            });

            console.log('Statut du problème mis à jour:', problemeId);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut du problème:', error);
            throw error;
        }
    }

    async assignEntreprise(
        problemeId: string,
        entrepriseId: number,
        entrepriseName: string,
        entrepriseContact: string
    ): Promise<void> {
        try {
            const problemeRef = doc(db, this.collectionName, problemeId);
            await updateDoc(problemeRef, {
                entrepriseId,
                entrepriseName,
                entrepriseContact,
                updatedAt: serverTimestamp()
            });

            console.log('Entreprise assignée au problème:', problemeId);
        } catch (error) {
            console.error('Erreur lors de l\'assignation de l\'entreprise:', error);
            throw error;
        }
    }

    subscribeToProblemes(
        callback: (problemes: Probleme[]) => void
    ): () => void {
        const q = query(
            collection(db, this.collectionName),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot: QuerySnapshot<DocumentData>) => {
                const problemes: Probleme[] = [];
                querySnapshot.forEach((doc) => {
                    problemes.push({
                        id: doc.id,
                        ...doc.data()
                    } as unknown as Probleme);
                });

                console.log(`${problemes.length} problèmes reçus de Firestore`);
                callback(problemes);
            },
            (error) => {
                console.error('Erreur lors de l\'écoute des problèmes:', error);
            }
        );

        return unsubscribe;
    }

    subscribeToProblemesBySignalement(
        signalementId: number,
        callback: (problemes: Probleme[]) => void
    ): () => void {
        const q = query(
            collection(db, this.collectionName),
            where('signalementId', '==', signalementId),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (querySnapshot: QuerySnapshot<DocumentData>) => {
                const problemes: Probleme[] = [];
                querySnapshot.forEach((doc) => {
                    problemes.push({
                        id: doc.id,
                        ...doc.data()
                    } as unknown as Probleme);
                });

                console.log(`${problemes.length} problèmes reçus pour le signalement ${signalementId}`);
                callback(problemes);
            },
            (error) => {
                console.error('Erreur lors de l\'écoute des problèmes par signalement:', error);
            }
        );

        return unsubscribe;
    }
}

// Export une instance unique du service
export const problemeService = new ProblemeService();
