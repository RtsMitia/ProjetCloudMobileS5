import API_BASE_URL from "./config";
import { pathImages } from "../utils/config";

// ===================== PROBLEMES =====================

/**
 * Formater les données brutes d'un problème depuis l'API
 */
export const formatProblemeData = (item) => ({
  id: item.id,
  surface: item.surface || 0,
  budgetEstime: item.budgetEstime || 0,
  entrepriseId: item.entreprise?.id || null,
  entrepriseName: item.entreprise?.nom || null,
  entrepriseContact: item.entreprise?.telephone || null,
  entrepriseAdresse: item.entreprise?.adresse || null,
  statusId: item.problemeStatus?.id || 0,
  statusNom: item.problemeStatus?.nom || "Non défini",
  statusValeur: item.problemeStatus?.valeur || 0,
  signalementId: item.signalement?.id || null,
  userId: item.signalement?.user?.id || null,
  userEmail: item.signalement?.user?.email || "Utilisateur inconnu",
  x: item.signalement?.point?.y || 0,
  y: item.signalement?.point?.x || 0,
  localisation: item.signalement?.point?.localisation || "Localisation inconnue",
  description: item.signalement?.description || "Pas de description",
  signalementCreatedAt: item.signalement?.createdAt || null,
  signalementStatus: item.signalement?.status?.nom || "Non défini",
  signalementValeur: item.signalement?.status?.valeur || 0,
  statusLiebelle: item.problemeStatus?.nom || "Non défini",
  createdAt: item.signalement?.createdAt || new Date().toISOString(),
  rawData: item,
  images: (item.signalement?.images || []).map((img) => ({
    url: img.nomFichier ? `${pathImages()}${img.nomFichier}` : null,
    nomFichier: img.nomFichier || "Image",
  })).filter((img) => img.url),
});

/**
 * Formater un tableau de problèmes
 */
export const formatProblemeList = (apiData) => apiData.map(formatProblemeData);

/**
 * Récupérer tous les problèmes
 */
export const fetchProblemes = async () => {
  const response = await fetch(`${API_BASE_URL}/api/problemes`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return formatProblemeList(data.data);
  }
  throw new Error("Format de données invalide");
};

export const fetchProblemesMap = async () => {
  const response = await fetch(`${API_BASE_URL}/api/problemes/nonresolus`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return formatProblemeList(data.data);
  }
  throw new Error("Format de données invalide");
};

/**
 * Mettre un problème en cours de traitement
 */
export const processerProbleme = async (problemeId) => {
  const response = await fetch(`${API_BASE_URL}/api/problemes/${problemeId}/processer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Erreur lors du traitement: ${response.status}`);
  return response.json();
};

/**
 * Marquer un problème comme résolu
 */
export const resoudreProbleme = async (problemeId) => {
  const response = await fetch(`${API_BASE_URL}/api/problemes/${problemeId}/resoudre`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Erreur lors de la résolution: ${response.status}`);
  return response.json();
};

/**
 * Récupérer les stats manager des problèmes
 */
export const fetchManagerStats = async () => {
  const response = await fetch(`${API_BASE_URL}/api/problemes/manager-stats`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error("Format de données invalide");
};
