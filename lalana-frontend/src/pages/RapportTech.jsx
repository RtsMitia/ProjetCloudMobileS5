import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  Square3Stack3DIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { fetchSignalementById, soumettreRapportTech } from "../api/signalementService";
import { fetchEntreprises } from "../api/entrepriseService";
import { fetchPM2Value } from "../api/configService";

export default function RapportTech() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [signalement, setSignalement] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [selectedEntreprise, setSelectedEntreprise] = useState("");
  const [surface, setSurface] = useState("");
  const [budgetEstime, setBudgetEstime] = useState("");
  const [niveau, setNiveau] = useState("");
  const [pm2Value, setPm2Value] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Formater les données du signalement (géré par signalementService)

  // Récupérer le signalement
  useEffect(() => {
    const loadSignalement = async () => {
      setIsLoading(true);
      try {
        const formattedData = await fetchSignalementById(id);
        setSignalement(formattedData);
        
        if (formattedData.statusValeur !== 20) {
          setError("Ce signalement n'a pas été envoyé à un technicien ou le rapport technique n'a pas été initié.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du signalement:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const loadEntreprises = async () => {
      try {
        const data = await fetchEntreprises();
        setEntreprises(data);
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
      }
    };

    const loadPM2 = async () => {
      try {
        const value = await fetchPM2Value();
        setPm2Value(value);
      } catch (error) {
        console.error("Erreur lors du chargement de la configuration PM2:", error);
        alert("Impossible de charger la configuration PM2. Veuillez réessayer.");
      }
    };

    if (id) {
      loadSignalement();
      loadEntreprises();
      loadPM2();
    }
  }, [id]);

  // Auto-calculer le budget estimé quand surface ou niveau changent
  useEffect(() => {
    if (pm2Value && surface && niveau) {
      const calculatedBudget = pm2Value * parseFloat(surface) * parseInt(niveau);
      setBudgetEstime(calculatedBudget.toFixed(2));
    } else {
      setBudgetEstime("");
    }
  }, [pm2Value, surface, niveau]);

  // Fonction pour soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!selectedEntreprise || !surface || !budgetEstime || !niveau) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    
    if (isNaN(surface) || parseFloat(surface) <= 0) {
      alert("La surface doit être un nombre positif");
      return;
    }
    
    if (isNaN(budgetEstime) || parseFloat(budgetEstime) <= 0) {
      alert("Le budget estimé doit être un nombre positif");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const rapportData = {
        signalementId: parseInt(id),
        surface: parseFloat(surface),
        budgetEstime: parseFloat(budgetEstime),
        niveau: parseInt(niveau),
        entrepriseId: parseInt(selectedEntreprise)
      };
      
      console.log("Données à envoyer:", rapportData);
      
      const result = await soumettreRapportTech(rapportData);
      setSuccessMessage("Rapport technique créé avec succès !");
        
      // Rediriger après succès
      setTimeout(() => {
        navigate("/backoffice/problemes");
      }, 2000);
    } catch (error) {
      console.error("Erreur création rapport:", error);
      alert("Erreur lors de la création du rapport technique: " + error.message);
    } finally {
      setIsSubmitting(false);
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

  // Formater la devise
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement du signalement...</span>
      </div>
    );
  }

  if (error && !signalement) {
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
              Erreur: {error}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Rapport Technique</h1>
              <p className="mt-2 text-sm text-gray-700">
                Création d'un rapport technique pour le signalement #{id}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-emerald-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Message d'erreur si statut incorrect */}
        {signalement?.statusValeur !== 20 && (
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-700">
                  Attention: Ce signalement n'a pas été envoyé à un technicien ou le rapport technique n'a pas été initié.
                  Statut actuel: <strong>{signalement?.statusNom}</strong> (valeur: {signalement?.statusValeur})
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche: Informations du signalement */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte Signalement */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Détails du Signalement</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  signalement?.statusValeur === 10 ? 'bg-rose-100 text-rose-800' :
                  signalement?.statusValeur === 20 ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {signalement?.statusNom} (valeur: {signalement?.statusValeur})
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Localisation</p>
                    <p className="text-sm text-gray-600">{signalement?.localisation}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordonnées: {signalement?.y?.toFixed(4)}, {signalement?.x?.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Description</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                      {signalement?.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Utilisateur</p>
                      <p className="text-sm text-gray-600">{signalement?.userEmail}</p>
                      <p className="text-xs text-gray-500">
                        Statut: {signalement?.userStatus === 1 ? 'Actif' : 'Bloqué'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date de création</p>
                      <p className="text-sm text-gray-600">{formatDate(signalement?.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire Rapport Technique */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Formulaire Rapport Technique</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sélection de l'entreprise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-500 inline mr-2" />
                    Entreprise assignée *
                  </label>
                  <select
                    value={selectedEntreprise}
                    onChange={(e) => setSelectedEntreprise(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                    disabled={entreprises.length === 0}
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.map((entreprise) => (
                      <option key={entreprise.id} value={entreprise.id}>
                        {entreprise.nom} - {entreprise.telephone}
                      </option>
                    ))}
                  </select>
                  {entreprises.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">Chargement des entreprises...</p>
                  )}
                  {selectedEntreprise && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Adresse:</span> {
                          entreprises.find(e => e.id === parseInt(selectedEntreprise))?.adresse || "Non disponible"
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Surface */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Square3Stack3DIcon className="h-5 w-5 text-blue-500 inline mr-2" />
                    Surface (m²) *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={surface}
                      onChange={(e) => setSurface(e.target.value)}
                      className="block w-full pr-12 pl-4 py-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">m²</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Surface totale à traiter
                  </p>
                </div>

                {/* Niveau (1-10) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Square3Stack3DIcon className="h-5 w-5 text-blue-500 inline mr-2" />
                    Niveau (1-10) *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[...Array(10)].map((_, i) => {
                      const val = i + 1;
                      return (
                        <label key={val} className={`inline-flex items-center px-2 py-1 border rounded-md cursor-pointer ${String(niveau) === String(val) ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}>
                          <input
                            type="radio"
                            name="niveau"
                            value={val}
                            checked={String(niveau) === String(val)}
                            onChange={(e) => setNiveau(e.target.value)}
                            className="mr-2"
                          />
                          <span className="text-sm">{val}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Choisissez le niveau estimé (1 = faible, 10 = très élevé)</p>
                </div>

                {/* Budget estimé (calculé automatiquement) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-blue-500 inline mr-2" />
                    Budget estimé (MGA) *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">MGA</span>
                    </div>
                    <input
                      type="text"
                      value={budgetEstime ? formatCurrency(parseFloat(budgetEstime)) : "0 MGA"}
                      className="block w-full pl-16 pr-4 py-2 border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed sm:text-sm"
                      disabled
                      readOnly
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Calculé automatiquement: PM2 ({pm2Value || '...'}) × Niveau × Surface
                  </p>
                  {budgetEstime && (
                    <p className="mt-1 text-sm font-medium text-emerald-600">
                      Formule: {pm2Value} × {niveau} × {surface} = {formatCurrency(parseFloat(budgetEstime))}
                    </p>
                  )}
                </div>

                {/* Boutons */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || signalement?.statusValeur !== 20}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          Création en cours...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Créer le rapport technique
                        </>
                      )}
                    </button>
                  </div>
                  {signalement?.statusValeur !== 20 && (
                    <p className="mt-3 text-sm text-amber-600">
                      ⚠️ Le rapport ne peut être créé que pour les signalements avec statut "En cours" (valeur 20)
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Colonne droite: Aperçu des données */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu des données</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">Signalement ID</p>
                  <p className="text-lg font-semibold text-gray-700">#{id}</p>
                </div>

                {selectedEntreprise && (
                  <div className="p-3 bg-emerald-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">Entreprise sélectionnée</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {entreprises.find(e => e.id === parseInt(selectedEntreprise))?.nom || "Non sélectionnée"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {entreprises.find(e => e.id === parseInt(selectedEntreprise))?.telephone || ""}
                    </p>
                  </div>
                )}

                {surface && (
                  <div className="p-3 bg-amber-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">Surface estimée</p>
                    <p className="text-lg font-semibold text-gray-700">{surface} m²</p>
                  </div>
                )}

                {niveau && (
                  <div className="p-3 bg-purple-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">Niveau sélectionné</p>
                    <p className="text-lg font-semibold text-gray-700">{niveau}</p>
                  </div>
                )}

                {budgetEstime && (
                  <div className="p-3 bg-emerald-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">Budget estimé (calculé)</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {formatCurrency(parseFloat(budgetEstime) || 0)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {pm2Value} × {niveau} × {surface}
                    </p>
                  </div>
                )}

                {/* Aperçu JSON des données à envoyer */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Données à envoyer</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {JSON.stringify({
                        signalementId: parseInt(id),
                        surface: surface ? parseFloat(surface) : null,
                        niveau: niveau ? parseInt(niveau) : null,
                        budgetEstime: budgetEstime ? parseFloat(budgetEstime) : null,
                        entrepriseId: selectedEntreprise ? parseInt(selectedEntreprise) : null
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}