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
 * Format nouveau : flat structure avec x, y, localisation et statusLibelle
 */
export interface Signalement {
  id?: string | null;
  userId: string;
  userEmail?: string;
  x: number; // Longitude
  y: number; // Latitude
  localisation: string; // Adresse ou description
  description: string;
  statusLibelle: string; // Ex: "En attente", "En cours", "Résolu"
  createdAt: Timestamp | string;
  updatedAt?: Timestamp;
  photoUrls?: string[]; 
  priority?: number; 
}

export interface SignalementRequest {
  id?: null;
  userId: string; 
  x: number; 
  y: number; 
  localisation: string; 
  description: string; 
  statusLibelle?: string;
  createdAt: Date | string; 
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
 * Format flat pour Firestore
 */
export interface Probleme {
  id?: number | null;
  surface: number; // m²
  budgetEstime: number;
  entrepriseId: number | null;
  entrepriseName: string | null;
  entrepriseContact: string | null;
  statusId: number;
  statusNom: string;
  statusValeur: number; // 0-100
  signalementId: number;
  userId: number;
  userEmail: string;
  x: number; // Longitude
  y: number; // Latitude
  localisation: string;
  description: string;
  statusLibelle: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface ProblemeRequest {
  id?: null;
  surface: number;
  budgetEstime: number;
  entrepriseId?: number | null;
  entrepriseName?: string | null;
  entrepriseContact?: string | null;
  statusId: number;
  statusNom: string;
  statusValeur: number;
  signalementId: number;
  userId: number;
  userEmail: string;
  x: number;
  y: number;
  localisation: string;
  description: string;
  statusLibelle: string;
  createdAt?: Date | string;
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
