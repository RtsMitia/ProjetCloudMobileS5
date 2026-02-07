import API_BASE_URL from "./config";
import { pathImages } from "../utils/config";

// ===================== SIGNALEMENTS =====================

/**
 * Formater les données brutes d'un signalement depuis l'API
 */
export const formatSignalementData = (item) => ({
  id: item.id,
  userId: item.user?.id || null,
  userEmail: item.user?.email || "Utilisateur inconnu",
  userStatus: item.user?.currentStatus || 1,
  x: item.point?.y || 0,
  y: item.point?.x || 0,
  localisation: item.point?.localisation || "Localisation inconnue",
  description: item.description || "Pas de description",
  createdAt: item.createdAt || new Date().toISOString(),
  statusId: item.status?.id || 0,
  statusNom: item.status?.nom || "Non défini",
  statusValeur: item.status?.valeur || 0,
  statusLiebelle: item.status?.nom || "Non défini",
  firestoreSynced: item.firestoreSynced || false,
  status: item.status?.nom || "Non défini",
  valeur: item.status?.valeur || 0,
  rawData: item,
  images: (item.images || []).map((img) => ({
    url: img.nomFichier ? `${pathImages()}${img.nomFichier}` : null,
    nomFichier: img.nomFichier || "Image",
  })).filter((img) => img.url),
});

/**
 * Formater un tableau de signalements
 */
export const formatSignalementList = (apiData) => apiData.map(formatSignalementData);

/**
 * Récupérer tous les signalements
 */
export const fetchSignalements = async () => {
  const response = await fetch(`${API_BASE_URL}/api/signalements`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return formatSignalementList(data.data);
  }
  throw new Error("Format de données invalide");
};

/**
 * Récupérer tous les signalements (endpoint alternatif pour la carte)
 */
export const fetchSignalementsMap = async () => {
  const response = await fetch(`${API_BASE_URL}/api/signalements/nonresolus`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return formatSignalementList(data.data);
  }
  throw new Error("Format de données invalide");
};

/**
 * Récupérer un signalement par ID
 */
export const fetchSignalementById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/signalements/${id}`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return formatSignalementData(data.data);
  }
  throw new Error("Format de données invalide");
};

/**
 * Synchroniser les signalements avec Firebase
 */
export const syncSignalementsFirebase = async () => {
  const response = await fetch(`${API_BASE_URL}/api/signalements/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json().catch(() => ({ error: "Erreur inconnue" }));
  if (!response.ok) {
    throw new Error(data.error || `Erreur HTTP ${response.status}`);
  }
  return data;
};

/**
 * Envoyer un signalement à un technicien
 */
export const envoyerSignalementTechnicien = async (signalementId) => {
  const response = await fetch(`${API_BASE_URL}/api/signalements/${signalementId}/sendtech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Erreur lors de l'envoi au technicien: ${response.status}`);
  return response.json();
};

/**
 * Soumettre un rapport technique
 */
export const soumettreRapportTech = async (rapportData) => {
  const response = await fetch(`${API_BASE_URL}/api/signalements/rapportTech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rapportData),
  });
  if (!response.ok) throw new Error(`Erreur lors de la création du rapport: ${response.status}`);
  return response.json();
};
