import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  fetchSignalements as fetchSignalementsAPI,
  syncSignalementsFirebase,
  envoyerSignalementTechnicien,
} from "../api/signalementService";

export default function SignalementsList() {
  const [signalements, setSignalements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const navigate = useNavigate();

  // Formater les données de signalements reçues de l'API
  // (déjà géré par signalementService)

  // Fonction pour synchroniser avec Firebase
  const handleSyncFirebase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    
    try {
      const data = await syncSignalementsFirebase();
      setSyncStatus({
        type: "success",
        message: data.message || "Synchronisation Firebase réussie !",
        details: data.details || null
      });
      
      // Rafraîchir les données après synchronisation
      loadSignalements();
    } catch (error) {
      console.error("Erreur lors de la synchronisation Firebase:", error);
      setSyncStatus({
        type: "error",
        message: error.message || "Impossible de se connecter au serveur",
        details: null
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => { setSyncStatus(null); }, 5000);
    }
  };

  // Récupérer les signalements depuis l'API
  const loadSignalements = async () => {
    setIsLoading(true);
    try {
      const formattedData = await fetchSignalementsAPI();
      setSignalements(formattedData);
      console.log(`${formattedData.length} signalements chargés depuis l'API`);
    } catch (error) {
      console.error("Erreur lors du chargement des signalements:", error);
      setError(error.message);
      setSignalements(getMockSignalements());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSignalements();
  }, []);

  // Données mockées pour fallback
  const getMockSignalements = () => {
    return [
      
    ];
  };

  // Fonction pour envoyer un signalement à un technicien
  const handleEnvoyerTechnicien = async (signalementId) => {
    try {
      await envoyerSignalementTechnicien(signalementId);
      setSignalements(prevSignalements => 
        prevSignalements.map(sig => 
          sig.id === signalementId 
            ? { 
                ...sig, 
                statusValeur: 20, 
                statusNom: "En cours",
                statusId: 2
              } 
            : sig
        )
      );
      alert(`Signalement #${signalementId} envoyé à un technicien avec succès`);
    } catch (error) {
      console.error("Erreur envoi technicien:", error);
      
      if (window.confirm("L'API n'est pas disponible. Voulez-vous marquer ce signalement comme 'En cours' localement ?")) {
        setSignalements(prevSignalements => 
          prevSignalements.map(sig => 
            sig.id === signalementId 
              ? { 
                  ...sig, 
                  statusValeur: 20, 
                  statusNom: "En cours",
                  statusId: 2
                } 
              : sig
          )
        );
        alert(`Signalement #${signalementId} marqué comme 'En cours' localement`);
      }
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statusValeur) => {
    switch (statusValeur) {
      case 10: // Nouveau
        return { 
          bgColor: "bg-rose-100 text-rose-800 border border-rose-200",
          iconColor: "text-rose-600",
          text: "Nouveau"
        };
      case 20: // En cours
        return { 
          bgColor: "bg-amber-100 text-amber-800 border border-amber-200",
          iconColor: "text-amber-600",
          text: "En cours"
        };
      case 30: // Résolu
        return { 
          bgColor: "bg-emerald-100 text-emerald-800 border border-emerald-200",
          iconColor: "text-emerald-600",
          text: "Résolu"
        };
      default:
        return { 
          bgColor: "bg-gray-100 text-gray-800 border border-gray-200",
          iconColor: "text-gray-600",
          text: "Inconnu"
        };
    }
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

  // Filtrer les signalements
  const getSignalementsFiltres = () => {
    let filtered = signalements;
    
    // Filtre par statut
    if (filterStatus !== "all") {
      const statusValue = parseInt(filterStatus);
      filtered = filtered.filter(s => s.statusValeur === statusValue);
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.localisation.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.userEmail.toLowerCase().includes(query) ||
        s.statusNom.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const signalementsFiltres = getSignalementsFiltres();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des signalements...</span>
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
              Erreur lors du chargement des signalements: {error}
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
          <div className="flex items-center gap-3">
            <Link
              to="/backoffice"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Signalements</h1>
              <p className="mt-2 text-sm text-gray-700">
                Liste de tous les signalements reçus par les citoyens ({signalementsFiltres.length} sur {signalements.length})
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <div className="relative">
            <button
              onClick={handleSyncFirebase}
              disabled={isSyncing}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-300 ${
                isSyncing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-md'
              }`}
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Synchronisation...' : 'Synchroniser Firebase'}
            </button>
            
            {/* Message de statut */}
            {syncStatus && (
              <div className={`
                absolute top-full mt-2 right-0
                px-4 py-2 rounded-lg shadow-lg
                text-sm font-medium min-w-[300px]
                animate-fadeIn z-50
                ${syncStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
                }
              `}>
                <div className="font-semibold mb-1">
                  {syncStatus.type === "success" ? "✓ Synchronisation réussie" : "✗ Erreur de synchronisation"}
                </div>
                <div className="text-sm">{syncStatus.message}</div>
                {syncStatus.details && (
                  <div className="mt-1 text-xs opacity-75">
                    Détails: {syncStatus.details}
                  </div>
                )}
              </div>
            )}
          </div>
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
                placeholder="Rechercher par localisation, description, utilisateur..."
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
              <option value="10">Nouveaux </option>
              <option value="20">En cours</option>
              <option value="30">Resolus </option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {signalementsFiltres.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun signalement trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterStatus !== "all" 
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun signalement n'a été enregistré pour le moment"}
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
                    Localisation & Description
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date création
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {signalementsFiltres.map((sig) => {
                  const statusInfo = getStatusColor(sig.statusValeur);
                  return (
                    <tr key={sig.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3">
                        <div className="text-sm font-medium text-gray-900">#{sig.id}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Coord: {sig.y.toFixed(4)}, {sig.x.toFixed(4)}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {sig.localisation}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {sig.description}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                              <CalendarDaysIcon className="h-3 w-3" />
                              {formatDate(sig.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              sig.userStatus === 1 ? "bg-emerald-100" : "bg-rose-100"
                            }`}>
                              <UserIcon className={`h-4 w-4 ${
                                sig.userStatus === 1 ? "text-emerald-600" : "text-rose-600"
                              }`} />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {sig.userEmail.split('@')[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {sig.userEmail}
                            </p>
                            <p className="text-xs mt-1">
                              <span className={`px-1.5 py-0.5 rounded ${
                                sig.userStatus === 1 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : "bg-rose-100 text-rose-800"
                              }`}>
                                {sig.userStatus === 1 ? "Actif" : "Bloqué"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor}`}>
                          {sig.statusValeur === 10 && <ExclamationTriangleIcon className={`h-3 w-3 mr-1.5 ${statusInfo.iconColor}`} />}
                          {sig.statusValeur === 20 && <WrenchScrewdriverIcon className={`h-3 w-3 mr-1.5 ${statusInfo.iconColor}`} />}
                          {sig.statusValeur === 30 && <CheckCircleIcon className={`h-3 w-3 mr-1.5 ${statusInfo.iconColor}`} />}
                          {sig.statusNom}
                        </span>
                        <div className="mt-1 text-xs text-gray-500">
                          Valeur: {sig.statusValeur}
                          {sig.firestoreSynced && (
                            <div className="inline-flex items-center ml-2">
                              <span className="text-emerald-600">✓ Firebase</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {formatDate(sig.createdAt)}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-start space-x-2">
                          
                          
                          {/* Bouton conditionnel selon le statut */}
                          {sig.statusValeur === 10 && (
                            <button
                              onClick={() => handleEnvoyerTechnicien(sig.id)}
                              className="text-emerald-600 hover:text-emerald-900 p-1.5 hover:bg-emerald-50 rounded transition-colors"
                              title="Envoyer à un technicien"
                            >
                              <WrenchScrewdriverIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          {sig.statusValeur === 20 && (
                            <Link
                              to={`/backoffice/rapportTech/${sig.id}`}
                              className="text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-indigo-50 rounded transition-colors"
                              title="Voir rapport technicien"
                            >
                              <DocumentTextIcon className="h-5 w-5" />
                            </Link>
                          )}
                          
                          {sig.statusValeur === 30 && (
                            <div className="px-2 py-1 bg-emerald-50 rounded text-xs text-emerald-700">
                              Terminé
                            </div>
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

      {/* Styles d'animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}