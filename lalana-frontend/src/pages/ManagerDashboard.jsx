import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import ProgressTable from "../component/ProgressTable";
import StatisticsChart from "../component/StatisticsChart";

export default function ManagerDashboard() {
  const [problemes, setProblemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [useTestData, setUseTestData] = useState(true);

  // Test data for development
  const getTestData = () => {
    return [
      {
        id: 1,
        surface: 25.5,
        budgetEstime: 15000,
        entrepriseId: 1,
        entrepriseName: "Construction Plus",
        statusValeur: 30, // Terminé
        localisation: "Avenue de l'Indépendance, Antananarivo",
        dateNouveauStatus: "2026-01-15T08:30:00",
        dateEnCoursStatus: "2026-01-17T10:00:00",
        dateTermineStatus: "2026-01-25T16:30:00",
      },
      {
        id: 2,
        surface: 18.2,
        budgetEstime: 12000,
        entrepriseId: 2,
        entrepriseName: "Travaux Experts",
        statusValeur: 20, // En cours
        localisation: "Route de Tamatave, Toamasina",
        dateNouveauStatus: "2026-01-20T09:15:00",
        dateEnCoursStatus: "2026-01-22T14:20:00",
        dateTermineStatus: null,
      },
      {
        id: 3,
        surface: 32.8,
        budgetEstime: 22000,
        entrepriseId: null,
        entrepriseName: null,
        statusValeur: 10, // Nouveau
        localisation: "Boulevard de France, Fianarantsoa",
        dateNouveauStatus: "2026-01-28T11:00:00",
        dateEnCoursStatus: null,
        dateTermineStatus: null,
      },
      {
        id: 4,
        surface: 45.0,
        budgetEstime: 30000,
        entrepriseId: 1,
        entrepriseName: "Construction Plus",
        statusValeur: 30, // Terminé
        localisation: "Rue de la République, Mahajanga",
        dateNouveauStatus: "2026-01-10T07:45:00",
        dateEnCoursStatus: "2026-01-12T09:30:00",
        dateTermineStatus: "2026-01-20T15:00:00",
      },
      {
        id: 5,
        surface: 15.7,
        budgetEstime: 8500,
        entrepriseId: 3,
        entrepriseName: "Réparations Rapides",
        statusValeur: 20, // En cours
        localisation: "Avenue de la Libération, Antsirabe",
        dateNouveauStatus: "2026-01-25T10:20:00",
        dateEnCoursStatus: "2026-01-27T13:45:00",
        dateTermineStatus: null,
      },
      {
        id: 6,
        surface: 28.3,
        budgetEstime: 18000,
        entrepriseId: 2,
        entrepriseName: "Travaux Experts",
        statusValeur: 30, // Terminé
        localisation: "Route Nationale 7, Tuléar",
        dateNouveauStatus: "2026-01-12T08:00:00",
        dateEnCoursStatus: "2026-01-15T11:30:00",
        dateTermineStatus: "2026-01-28T17:00:00",
      },
      {
        id: 7,
        surface: 22.1,
        budgetEstime: 14500,
        entrepriseId: null,
        entrepriseName: null,
        statusValeur: 10, // Nouveau
        localisation: "Avenue du 26 Juin, Antsiranana",
        dateNouveauStatus: "2026-01-30T09:30:00",
        dateEnCoursStatus: null,
        dateTermineStatus: null,
      },
      {
        id: 8,
        surface: 38.5,
        budgetEstime: 25000,
        entrepriseId: 1,
        entrepriseName: "Construction Plus",
        statusValeur: 20, // En cours
        localisation: "Boulevard Joffre, Antananarivo",
        dateNouveauStatus: "2026-01-22T08:45:00",
        dateEnCoursStatus: "2026-01-24T10:15:00",
        dateTermineStatus: null,
      },
      {
        id: 9,
        surface: 12.8,
        budgetEstime: 7000,
        entrepriseId: 3,
        entrepriseName: "Réparations Rapides",
        statusValeur: 30, // Terminé
        localisation: "Rue Poincaré, Morondava",
        dateNouveauStatus: "2026-01-08T07:30:00",
        dateEnCoursStatus: "2026-01-10T09:00:00",
        dateTermineStatus: "2026-01-18T14:30:00",
      },
      {
        id: 10,
        surface: 50.2,
        budgetEstime: 35000,
        entrepriseId: 2,
        entrepriseName: "Travaux Experts",
        statusValeur: 20, // En cours
        localisation: "Avenue de Madagascar, Nosy Be",
        dateNouveauStatus: "2026-01-26T10:00:00",
        dateEnCoursStatus: "2026-01-29T12:30:00",
        dateTermineStatus: null,
      },
    ];
  };

  // Format API data to match our structure
  const formatProblemeData = (apiData) => {
    return apiData.map((item) => {
      // Extract status history dates
      const history = item.statusHistory || [];
      const nouveauHistory = history.find((h) => h.statusValeur === 10);
      const enCoursHistory = history.find((h) => h.statusValeur === 20);
      const termineHistory = history.find((h) => h.statusValeur === 30);

      return {
        id: item.id,
        surface: item.surface || 0,
        budgetEstime: item.budgetEstime || 0,
        entrepriseId: item.entreprise?.id || null,
        entrepriseName: item.entreprise?.nom || null,
        statusValeur: item.problemeStatus?.valeur || 0,
        localisation:
          item.signalement?.point?.localisation || "Localisation inconnue",
        dateNouveauStatus: nouveauHistory?.changedAt || item.createdAt || null,
        dateEnCoursStatus: enCoursHistory?.changedAt || null,
        dateTermineStatus: termineHistory?.changedAt || null,
      };
    });
  };

  // Fetch data from API or use test data
  useEffect(() => {
    const fetchProblemes = async () => {
      setIsLoading(true);
      setError(null);

      if (useTestData) {
        // Simulate API delay
        setTimeout(() => {
          setProblemes(getTestData());
          setIsLoading(false);
        }, 500);
        return;
      }

      try {
        // TODO: Update this endpoint when backend is ready with status history
        const response = await fetch(
          "http://localhost:8080/api/problemes/manager-stats"
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data) {
          const formattedData = formatProblemeData(data.data);
          setProblemes(formattedData);
        } else {
          console.error("Format de données invalide:", data);
          setProblemes(getTestData());
          setUseTestData(true);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setError(error.message);
        // Fallback to test data
        setProblemes(getTestData());
        setUseTestData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblemes();
  }, [useTestData]);

  // Filter problemes by status
  const filteredProblemes = problemes.filter((p) => {
    if (filterStatus === "all") return true;
    return p.statusValeur === parseInt(filterStatus);
  });

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (useTestData) {
        setProblemes(getTestData());
      }
      setIsLoading(false);
    }, 500);
  };

  const toggleDataSource = () => {
    setUseTestData(!useTestData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/backoffice"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tableau de Bord Manager
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Vue d'ensemble de la progression et des statistiques
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Data source toggle */}
              <button
                onClick={toggleDataSource}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useTestData
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {useTestData ? "Données Test" : "Données API"}
              </button>

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon
                  className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualiser
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrer:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Tous ({problemes.length})
              </button>
              <button
                onClick={() => setFilterStatus("10")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "10"
                    ? "bg-amber-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Nouveau ({problemes.filter((p) => p.statusValeur === 10).length}
                )
              </button>
              <button
                onClick={() => setFilterStatus("20")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "20"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                En cours (
                {problemes.filter((p) => p.statusValeur === 20).length})
              </button>
              <button
                onClick={() => setFilterStatus("30")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "30"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Terminé (
                {problemes.filter((p) => p.statusValeur === 30).length})
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && !useTestData && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-medium">Erreur:</span> {error}. Utilisation
                des données de test.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Statistics Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                Statistiques de Performance
              </h2>
            </div>
            <StatisticsChart problemes={filteredProblemes} isLoading={isLoading} />
          </div>

          {/* Progress Table Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TableCellsIcon className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                Suivi Détaillé de l'Avancement
              </h2>
            </div>
            <ProgressTable problemes={filteredProblemes} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
