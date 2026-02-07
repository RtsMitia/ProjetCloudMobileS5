import API_BASE_URL from "./config";

// ===================== ENTREPRISES =====================

/**
 * Récupérer toutes les entreprises
 */
export const fetchEntreprises = async () => {
  const response = await fetch(`${API_BASE_URL}/api/entreprises`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error("Format de données invalide pour les entreprises");
};

// ===================== SYNCHRONISATION =====================

/**
 * Synchronisation globale avec Firebase
 */
export const syncGlobal = async () => {
  const response = await fetch(`${API_BASE_URL}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Erreur lors de la synchronisation");
  return response.json();
};
