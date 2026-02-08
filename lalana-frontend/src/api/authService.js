import API_BASE_URL from "./config";

// ===================== AUTHENTIFICATION =====================

/**
 * Connexion utilisateur
 */
export const signin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de l'authentification");
  }
  return data;
};

/**
 * Inscription utilisateur
 */
export const signup = async (email, password) => {
  const body = { email, password };
  console.log("Signup body:", body); // Debug log
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erreur lors de l'inscription");
  }
  return data;
};
