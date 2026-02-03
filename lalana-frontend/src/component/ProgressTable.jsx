import { useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function ProgressTable({ problemes, isLoading }) {
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statusValeur) => {
    switch (statusValeur) {
      case 10:
        return "text-amber-700 bg-amber-50 border-amber-200";
      case 20:
        return "text-blue-700 bg-blue-50 border-blue-200";
      case 30:
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statusValeur) => {
    switch (statusValeur) {
      case 10:
        return <ClockIcon className="h-4 w-4" />;
      case 20:
        return <PlayCircleIcon className="h-4 w-4" />;
      case 30:
        return <CheckCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  // Fonction pour obtenir le nom du statut
  const getStatusName = (statusValeur) => {
    switch (statusValeur) {
      case 10:
        return "Nouveau";
      case 20:
        return "En cours";
      case 30:
        return "Terminé";
      default:
        return "Inconnu";
    }
  };

  // Fonction pour obtenir le pourcentage d'avancement
  const getProgressPercentage = (statusValeur) => {
    switch (statusValeur) {
      case 10:
        return 0;
      case 20:
        return 50;
      case 30:
        return 100;
      default:
        return 0;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour trier les problèmes
  const sortProblemes = (data) => {
    return [...data].sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "status":
          aVal = a.statusValeur;
          bVal = b.statusValeur;
          break;
        case "date":
          aVal = new Date(a.dateNouveauStatus || 0);
          bVal = new Date(b.dateNouveauStatus || 0);
          break;
        default:
          return 0;
      }
      return sortOrder === "asc" 
        ? (aVal > bVal ? 1 : -1)
        : (aVal < bVal ? 1 : -1);
    });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const sortedProblemes = sortProblemes(problemes);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Tableau d'Avancement des Travaux
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Suivez la progression de chaque problème avec les dates clés
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("id")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  ID
                  {sortBy === "id" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localisation
              </th>
              <th
                onClick={() => handleSort("status")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Statut
                  {sortBy === "status" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avancement
              </th>
              <th
                onClick={() => handleSort("date")}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  Date Nouveau
                  {sortBy === "date" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date En cours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Terminé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProblemes.map((probleme) => (
              <tr key={probleme.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    #{probleme.id}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {probleme.localisation || "Non spécifié"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      probleme.statusValeur
                    )}`}
                  >
                    {getStatusIcon(probleme.statusValeur)}
                    {getStatusName(probleme.statusValeur)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          probleme.statusValeur === 30
                            ? "bg-emerald-500"
                            : probleme.statusValeur === 20
                            ? "bg-blue-500"
                            : "bg-amber-500"
                        }`}
                        style={{
                          width: `${getProgressPercentage(probleme.statusValeur)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {getProgressPercentage(probleme.statusValeur)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {formatDate(probleme.dateNouveauStatus)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {formatDate(probleme.dateEnCoursStatus)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {formatDate(probleme.dateTermineStatus)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {probleme.entrepriseName || "Non assigné"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedProblemes.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucun problème
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucun problème à afficher pour le moment.
          </p>
        </div>
      )}
    </div>
  );
}
