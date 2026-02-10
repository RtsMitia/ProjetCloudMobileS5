import API_BASE_URL from "./config";

/**
 * Récupérer une configuration par clé
 */
export const fetchConfigByKey = async (key) => {
  const response = await fetch(`${API_BASE_URL}/api/config/${key}`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error(`Configuration non trouvée pour la clé: ${key}`);
};

/**
 * Récupérer la valeur PM2 de configuration
 */
export const fetchPM2Value = async () => {
  const config = await fetchConfigByKey("PM2");
  const value = parseFloat(config.valeur.replace(',', '.'));
  if (isNaN(value)) {
    throw new Error(`Valeur PM2 invalide: ${config.valeur}`);
  }
  return value;
};

/**
 * Mettre à jour une configuration
 */
export const updateConfig = async (key, valeur) => {
  const response = await fetch(`${API_BASE_URL}/api/config/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valeur: valeur.toString() }),
  });
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message || "Erreur lors de la mise à jour");
};
