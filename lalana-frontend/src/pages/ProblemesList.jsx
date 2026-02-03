import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  WrenchScrewdriverIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

export default function ProblemesList() {
  const [problemes, setProblemes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formater les données de problèmes reçues de l'API
  const formatProblemeData = (apiData) => {
    return apiData.map(item => ({
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
      // Données du signalement associé
      userId: item.signalement?.user?.id || null,
      userEmail: item.signalement?.user?.email || "Utilisateur inconnu",
      x: item.signalement?.point?.y || 0, // longitude
      y: item.signalement?.point?.x || 0, // latitude
      localisation: item.signalement?.point?.localisation || "Localisation inconnue",
      description: item.signalement?.description || "Pas de description",
      signalementCreatedAt: item.signalement?.createdAt || null,
      signalementStatus: item.signalement?.status?.nom || "Non défini",
      signalementValeur: item.signalement?.status?.valeur || 0,
      // Alias pour compatibilité
      createdAt: item.signalement?.createdAt || new Date().toISOString(),
      // Données originales
      rawData: item
    }));
  };

  // Récupérer les problèmes depuis l'API
  useEffect(() => {
    const fetchProblemes = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/problemes');

        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          const formattedData = formatProblemeData(data.data);
          setProblemes(formattedData);
          console.log(`${formattedData.length} problèmes chargés depuis l'API`);
        } else {
          console.error("Format de données invalide:", data);
          setProblemes(getMockProblemes());
        }
      } catch (error) {
        console.error("Erreur lors du chargement des problèmes:", error);
        setError(error.message);
        setProblemes(getMockProblemes());
      } finally {
        setIsLoading(false);
      }
    };

    // Données mockées pour fallback
    const getMockProblemes = () => {
      return [];
    };

    fetchProblemes();
  }, []);

  // Fonction pour mettre un problème en cours de traitement
  const handleProcesserProbleme = async (problemeId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/problemes/${problemeId}/processer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setProblemes(prevProblemes =>
          prevProblemes.map(prob =>
            prob.id === problemeId
              ? {
                ...prob,
                statusValeur: 20,
                statusNom: "En cours de traitement",
                statusId: 2
              }
              : prob
          )
        );
        alert(`Problème #${problemeId} mis en cours de traitement avec succès`);
      } else {
        throw new Error(`Erreur lors du traitement: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur traitement problème:", error);

      if (window.confirm("L'API n'est pas disponible. Voulez-vous marquer ce problème comme en cours localement ?")) {
        setProblemes(prevProblemes =>
          prevProblemes.map(prob =>
            prob.id === problemeId
              ? {
                ...prob,
                statusValeur: 20,
                statusNom: "En cours de traitement",
                statusId: 2
              }
              : prob
          )
        );
        alert(`Problème #${problemeId} marqué comme en cours localement`);
      }
    }
  };

  // Fonction pour marquer un problème comme résolu
  const handleResoudreProbleme = async (problemeId) => {
    try {
      // Appel API pour mettre à jour le statut du problème
      const response = await fetch(`http://localhost:8080/api/problemes/${problemeId}/resoudre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setProblemes(prevProblemes =>
          prevProblemes.map(prob =>
            prob.id === problemeId
              ? {
                ...prob,
                statusValeur: 30,
                statusNom: "Résolu",
                statusId: 3
              }
              : prob
          )
        );
        alert(`Problème #${problemeId} marqué comme résolu avec succès`);
      } else {
        throw new Error(`Erreur lors de la résolution: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur résolution problème:", error);

      // Fallback: Mettre à jour localement si l'API n'est pas disponible
      if (window.confirm("L'API n'est pas disponible. Voulez-vous marquer ce problème comme résolu localement ?")) {
        setProblemes(prevProblemes =>
          prevProblemes.map(prob =>
            prob.id === problemeId
              ? {
                ...prob,
                statusValeur: 30,
                statusNom: "Résolu",
                statusId: 3
              }
              : prob
          )
        );
        alert(`Problème #${problemeId} marqué comme résolu localement`);
      }
    }
  };

  // Fonction pour obtenir les informations de statut
  const getStatusInfo = (statusValeur, statusNom) => {
    // Utilise le nom du statut de l'API si disponible, sinon utilise la valeur
    const statusText = statusNom || "Non défini";

    switch (statusValeur) {
      case 10:
        return {
          text: statusText,
          color: "bg-amber-100 text-amber-800 border border-amber-200",
          iconColor: "text-amber-600",
          isResolved: false
        };
      case 20:
        return {
          text: statusText,
          color: "bg-blue-100 text-blue-800 border border-blue-200",
          iconColor: "text-blue-600",
          isResolved: false
        };
      case 30:
        return {
          text: statusText,
          color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
          iconColor: "text-emerald-600",
          isResolved: true
        };
      default:
        return {
          text: statusText,
          color: "bg-gray-100 text-gray-800 border border-gray-200",
          iconColor: "text-gray-600",
          isResolved: false
        };
    }
  };

  // Formater la devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les problèmes
  const getProblemesFiltres = () => {
    let filtered = problemes;

    // Filtre par statut
    if (filterStatus !== "all") {
      const statusValue = parseInt(filterStatus);
      filtered = filtered.filter(p => p.statusValeur === statusValue);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.localisation.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.userEmail.toLowerCase().includes(query) ||
        (p.entrepriseName && p.entrepriseName.toLowerCase().includes(query)) ||
        p.statusNom.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const problemesFiltres = getProblemesFiltres();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des problèmes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Erreur lors du chargement des problèmes: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Problèmes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Liste de tous les problèmes en cours de traitement ({problemesFiltres.length} sur {problemes.length})
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">

          {/* Bouton pour ajouter un nouveau probleme - peut être active si nécessaire */}

        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par localisation, description, entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="10">Ouverts (valeur 10)</option>
              <option value="20">Assignés (valeur 20)</option>
              <option value="30">Résolus (valeur 30)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {problemesFiltres.length === 0 ? (
          <div className="text-center py-12">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun problème trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterStatus !== "all"
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun problème n'a été enregistré pour le moment"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Localisation
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Entreprise
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Surface & Budget
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date création
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {problemesFiltres.map((prob) => {
                  const statusInfo = getStatusInfo(prob.statusValeur, prob.statusNom);
                  return (
                    <tr key={prob.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">#{prob.id}</span>
                          <span className="text-xs text-gray-500">
                            Signalement: #{prob.signalementId}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-900 font-medium line-clamp-1">
                              {prob.localisation}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {prob.description}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <UserIcon className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{prob.userEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        {prob.entrepriseName ? (
                          <div className="flex items-start gap-2">
                            <BuildingOfficeIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {prob.entrepriseName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {prob.entrepriseContact}
                              </p>
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                {prob.entrepriseAdresse}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">{prob.surface} m²</span>
                          </div>
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 text-emerald-600 mr-1" />
                            <span className="text-sm font-semibold text-emerald-700">
                              {formatCurrency(prob.budgetEstime)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <WrenchScrewdriverIcon className={`h-3 w-3 mr-1.5 ${statusInfo.iconColor}`} />
                            {statusInfo.text}
                          </span>
                          <span className="text-xs text-gray-500">
                            Signalement: {prob.signalementStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {formatDate(prob.createdAt)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Bouton Processer - visible uniquement si le statut est 10 (ouvert) */}
                          {prob.statusValeur === 10 && (
                            <button
                              onClick={() => handleProcesserProbleme(prob.id)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded"
                              title="Mettre en cours de traitement"
                            >
                              <PlayIcon className="h-5 w-5" />
                            </button>
                          )}

                          {/* Bouton Résoudre - visible uniquement si le problème n'est pas déjà résolu */}
                          {prob.statusValeur !== 30 && (
                            <button
                              onClick={() => handleResoudreProbleme(prob.id)}
                              className="text-emerald-600 hover:text-emerald-900 p-1.5 hover:bg-emerald-50 rounded"
                              title="Marquer comme résolu"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}