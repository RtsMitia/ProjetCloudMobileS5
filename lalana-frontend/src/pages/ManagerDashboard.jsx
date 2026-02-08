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
import { fetchManagerStats } from "../api/problemeService";

export default function ManagerDashboard() {
  const [samples, setSamples] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

    

  // Format API data to match our UI structure when backend provides full response
  const formatProblemeData = (apiData) => {
    return apiData.map((item) => {
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
        localisation: item.signalement?.point?.localisation || "Localisation inconnue",
        dateNouveauStatus: nouveauHistory?.changedAt || item.createdAt || null,
        dateEnCoursStatus: enCoursHistory?.changedAt || null,
        dateTermineStatus: termineHistory?.changedAt || null,
      };
    });
  };

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchManagerStats();
      setStats(data);
      setSamples(data.samples || []);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter samples by status
  const filteredProblemes = samples.filter((p) => {
    if (filterStatus === "all") return true;
    return p.statusValeur === parseInt(filterStatus);
  });

  const handleRefresh = () => {
    fetchData();
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
                  Tous ({samples.length})
              </button>
              <button
                onClick={() => setFilterStatus("10")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "10"
                    ? "bg-amber-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                    Nouveau ({samples.filter((p) => p.statusValeur === 10).length})
              </button>
              <button
                onClick={() => setFilterStatus("20")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "20"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                    En cours ({samples.filter((p) => p.statusValeur === 20).length})
              </button>
              <button
                onClick={() => setFilterStatus("30")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === "30"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                    Terminé ({samples.filter((p) => p.statusValeur === 30).length})
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <span className="font-medium">Erreur:</span> {error}
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
            <StatisticsChart stats={stats} isLoading={isLoading} />
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
