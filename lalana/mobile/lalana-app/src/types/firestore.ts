import { Timestamp } from 'firebase/firestore';

/**
 * Interface pour les utilisateurs
 */
export interface User {
  email: string;
  role: number; // 0 = utilisateur, 1 = admin/manager
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Interface pour la localisation
 */
export interface Location {
  x: number; // Longitude
  y: number; // Latitude
  localisation: string; // Adresse ou description
}

/**
 * Interface pour le statut d'un signalement
 */
export interface SignalementStatus {
  id: number;
  nom: string; // Ex: "En attente", "Validé", "En cours", "Résolu"
  description: string;
}

/**
 * Interface pour un signalement complet (document dans Firestore)
 */
export interface Signalement {
  id?: string; 
  userId: string;
  userEmail: string;
  location: Location;
  description: string;
  status: SignalementStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  photoUrls?: string[]; 
  priority?: number; 
}

export interface SignalementRequest {
  userId: string; 
  x: number; 
  y: number; 
  localisation: string | null; 
  description?: string; 
  createdAt: Date; 
}

/**
 * Interface pour le statut d'un problème
 */
export interface ProblemeStatus {
  id: number;
  nom: string;
  description: string;
  valeur: number; // 0-100 (pourcentage)
}

/**
 * Interface pour une entreprise
 */
export interface Entreprise {
  id: number;
  nom: string;
  adresse: string;
  telephone: string;
}

/**
 * Interface pour un problème (créé par le manager)
 */
export interface Probleme {
  signalementId: string;
  surface: number; // m²
  budgetEstime: number;
  entreprise: Entreprise | null;
  status: ProblemeStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Interface pour les statuts de signalement (collection de référence)
 */
export interface StatusSignalementRef {
  id: number;
  nom: string;
  description: string;
  ordre: number;
}

/**
 * Interface pour les statuts de problème (collection de référence)
 */
export interface StatusProblemeRef {
  id: number;
  nom: string;
  description: string;
  valeur: number;
  ordre: number;
}
