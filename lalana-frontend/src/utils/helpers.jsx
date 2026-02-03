// Fonctions utilitaires partagées
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getProblemeStatusText = (statusValeur) => {
  switch (statusValeur) {
    case 10:
      return "Ouvert";
    case 20:
      return "Assigné";
    case 30:
      return "Résolu";
    default:
      return "Inconnu";
  }
};