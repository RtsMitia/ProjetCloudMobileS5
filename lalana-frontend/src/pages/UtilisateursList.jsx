import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  UserGroupIcon,
  EnvelopeIcon,
  LockOpenIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function UtilisateursList() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchUtilisateurs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/users');
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Formater les données
          const formattedData = data.data.map(user => ({
            id: user.id,
            email: user.email || "Email non disponible",
            password: user.password, 
            firebaseToken: user.firebaseToken,
            currentStatus: user.currentStatus || 0,
            // statut
            statut: user.currentStatus === 1 ? "Actif" : "Bloqué",
            // Dérivé de l'email pour le nom d'affichage
            displayName: user.email.split('@')[0],
            rawData: user
          }));
          
          setUtilisateurs(formattedData);
          console.log(`${formattedData.length} utilisateurs chargés depuis l'API`);
        } else {
          console.error("Format de données invalide:", data);
          setUtilisateurs(getMockUtilisateurs());
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        setError(error.message);
        setUtilisateurs(getMockUtilisateurs());
      } finally {
        setIsLoading(false);
      }
    };

    // Données mockées pour fallback
    const getMockUtilisateurs = () => {
      return [
        {
          id: 1,
          email: "alice@example.com",
          password: "mitiamitia",
          firebaseToken: null,
          currentStatus: 1,
          statut: "Actif",
          displayName: "alice",
        },
        {
          id: 2,
          email: "bob@example.com",
          password: "mitiamitia",
          firebaseToken: null,
          currentStatus: 1,
          statut: "Actif",
          displayName: "bob",
        },
        {
          id: 3,
          email: "admin@ville.mg",
          password: "admin123",
          firebaseToken: null,
          currentStatus: 1,
          statut: "Actif",
          displayName: "admin",
        },
        {
          id: 4,
          email: "entreprise@voirie.mg",
          password: "entreprise123",
          firebaseToken: null,
          currentStatus: 0,
          statut: "Bloqué",
          displayName: "entreprise",
        },
      ];
    };

    fetchUtilisateurs();
  }, []);

  // Fonction pour synchroniser avec Firebase (bloquer)
  const handleSyncBlock = async () => {
    setIsSyncing(true);
    try {
      // Simuler une synchronisation avec Firebase pour bloquer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert("Synchronisation avec Firebase (bloquer) en cours...");
      // Ici, vous ajouteriez votre logique de synchronisation réelle
      console.log("Synchronisation avec Firebase - Blocage");
      
      // Exemple de mise à jour
      setUtilisateurs(prev => prev.map(user => ({
        ...user,
        // Logique de blocage Firebase
      })));
      
    } catch (error) {
      console.error("Erreur de synchronisation Firebase (bloquer):", error);
      alert("Erreur lors de la synchronisation avec Firebase");
    } finally {
      setIsSyncing(false);
    }
  };

  // Fonction pour synchroniser avec Firebase (débloquer)
  const handleSyncUnblock = async () => {
    setIsSyncing(true);
    try {
      // Simuler une synchronisation avec Firebase pour débloquer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert("Synchronisation avec Firebase (débloquer) en cours...");
      // Ici, vous ajouteriez votre logique de synchronisation réelle
      console.log("Synchronisation avec Firebase - Déblocage");
      
      // Exemple de mise à jour
      setUtilisateurs(prev => prev.map(user => ({
        ...user,
        // Logique de déblocage Firebase
      })));
      
    } catch (error) {
      console.error("Erreur de synchronisation Firebase (débloquer):", error);
      alert("Erreur lors de la synchronisation avec Firebase");
    } finally {
      setIsSyncing(false);
    }
  };

  // Fonction pour débloquer un utilisateur
  const handleDeblockUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${userId}/deblock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setUtilisateurs(prevUsers => 
          prevUsers.map(user => 
            user.id === userId 
              ? { ...user, currentStatus: 1, statut: "Actif" }
              : user
          )
        );
        alert(`Utilisateur #${userId} débloqué avec succès`);
      } else {
        throw new Error(`Erreur lors du déblocage: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur déblocage utilisateur:", error);
      alert("Erreur lors du déblocage de l'utilisateur");
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatutColor = (currentStatus) => {
    if (currentStatus === 1) {
      return { 
        bgColor: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        iconColor: "text-emerald-600",
        badgeColor: "bg-emerald-100 text-emerald-800",
        bgLight: "bg-emerald-50"
      };
    } else {
      return { 
        bgColor: "bg-rose-100 text-rose-800 border border-rose-200",
        iconColor: "text-rose-600",
        badgeColor: "bg-rose-100 text-rose-800",
        bgLight: "bg-rose-50"
      };
    }
  };

  // Filtrer les utilisateurs
  const getUtilisateursFiltres = () => {
    let filtered = utilisateurs;
    
    // Filtre par statut
    if (filterStatus !== "all") {
      const statusValue = parseInt(filterStatus);
      filtered = filtered.filter(user => user.currentStatus === statusValue);
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(query) ||
        user.displayName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const utilisateursFiltres = getUtilisateursFiltres();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des utilisateurs...</span>
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
              Erreur lors du chargement des utilisateurs: {error}
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
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gestion de tous les utilisateurs de la plateforme ({utilisateursFiltres.length} sur {utilisateurs.length})
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
          {/* Bouton Synchroniser Firebase - Bloquer */}
          <button
            onClick={handleSyncBlock}
            disabled={isSyncing}
            className="inline-flex items-center justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSyncing ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Synchronisation...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Sync Firebase - Bloquer
              </>
            )}
          </button>

          {/* Bouton Synchroniser Firebase - Débloquer */}
          <button
            onClick={handleSyncUnblock}
            disabled={isSyncing}
            className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSyncing ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Synchronisation...
              </>
            ) : (
              <>
                <CloudArrowDownIcon className="h-5 w-5 mr-2" />
                Sync Firebase - Débloquer
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par email ou nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="1">Actifs (status 1)</option>
              <option value="0">Bloqués (status 0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {utilisateursFiltres.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterStatus !== "all" 
                ? "Essayez de modifier vos critères de recherche"
                : "Aucun utilisateur n'a été enregistré pour le moment"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Utilisateur
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Contact
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Token Firebase
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {utilisateursFiltres.map((user) => {
                  const statutInfo = getStatutColor(user.currentStatus);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-4 pl-4 pr-3">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${statutInfo.bgLight}`}>
                            <UserGroupIcon className={`h-5 w-5 ${statutInfo.iconColor}`} />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900 capitalize">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500">ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">{user.email}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Mot de passe: ••••••••
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className={`inline-flex items-center px-3 py-2 rounded-lg ${statutInfo.bgColor}`}>
                          {user.currentStatus === 1 ? (
                            <>
                              <LockOpenIcon className="h-4 w-4 mr-2" />
                              <div>
                                <div className="font-medium">Actif</div>
                                <div className="text-xs opacity-75">Status: 1</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <LockClosedIcon className="h-4 w-4 mr-2" />
                              <div>
                                <div className="font-medium">Bloqué</div>
                                <div className="text-xs opacity-75">Status: 0</div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm">
                          {user.firebaseToken ? (
                            <div className="flex items-center">
                              <CloudArrowUpIcon className="h-4 w-4 text-blue-500 mr-2" />
                              <div>
                                <div className="text-gray-900 font-medium">Connecté</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">
                                  {user.firebaseToken.substring(0, 12)}...
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                              <span className="italic">Non connecté</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1">
                          {user.currentStatus === 0 && (
                            <button
                              onClick={() => handleDeblockUser(user.id)}
                              className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                              title="Débloquer l'utilisateur"
                            >
                              <LockOpenIcon className="h-4 w-4 mr-1" />
                              <span className="text-sm">Débloquer</span>
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

      {/* Statistiques */}
      {utilisateursFiltres.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Carte Total Utilisateurs */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4 ring-4 ring-blue-50">
                  <UserGroupIcon className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Total utilisateurs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {utilisateurs.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Utilisateurs Actifs */}
          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full bg-emerald-100 p-3 mr-4 ring-4 ring-emerald-50">
                  <LockOpenIcon className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">Utilisateurs actifs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {utilisateurs.filter(u => u.currentStatus === 1).length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {utilisateurs.length > 0 
                    ? `${Math.round((utilisateurs.filter(u => u.currentStatus === 1).length / utilisateurs.length) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Carte Utilisateurs Bloqués */}
          <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-xl shadow-lg border border-rose-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-full bg-rose-100 p-3 mr-4 ring-4 ring-rose-50">
                  <LockClosedIcon className="h-7 w-7 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-rose-900">Utilisateurs bloqués</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {utilisateurs.filter(u => u.currentStatus === 0).length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                  {utilisateurs.length > 0 
                    ? `${Math.round((utilisateurs.filter(u => u.currentStatus === 0).length / utilisateurs.length) * 100)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}