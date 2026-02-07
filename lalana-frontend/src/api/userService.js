import API_BASE_URL from "./config";

// ===================== UTILISATEURS =====================

/**
 * Formater les données brutes d'un utilisateur
 */
export const formatUserData = (user) => ({
  id: user.id,
  email: user.email || "Email non disponible",
  password: user.password,
  firebaseToken: user.firebaseToken,
  currentStatus: user.currentStatus || 0,
  statut: user.currentStatus === 1 ? "Actif" : "Bloqué",
  displayName: user.email ? user.email.split("@")[0] : "inconnu",
  rawData: user,
});

/**
 * Récupérer tous les utilisateurs
 */
export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/api/users`);
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return data.data.map(formatUserData);
  }
  throw new Error("Format de données invalide");
};

/**
 * Récupérer un utilisateur par ID
 */
export const fetchUserById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success && data.data) {
    return data.data;
  }
  throw new Error("Format de données invalide");
};

/**
 * Mettre à jour un utilisateur
 */
export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error(`Erreur HTTP! Statut: ${response.status}`);
  const data = await response.json();
  if (data.success) {
    return data;
  }
  throw new Error(data.message || "Erreur lors de la mise à jour");
};

/**
 * Débloquer un utilisateur
 */
export const deblockUser = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/deblock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Erreur lors du déblocage: ${response.status}`);
  return response.json();
};
