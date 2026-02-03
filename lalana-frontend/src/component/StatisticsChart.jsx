import { useMemo } from "react";
import {
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export default function StatisticsChart({ problemes, isLoading }) {
  // Calcul des statistiques
  const statistics = useMemo(() => {
    if (problemes.length === 0) return null;

    // Fonction pour calculer le délai en jours entre deux dates
    const calculateDelayInDays = (startDate, endDate) => {
      if (!startDate || !endDate) return null;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    };

    // Délai Nouveau → En cours
    const nouveauToEnCoursDelays = problemes
      .filter((p) => p.dateNouveauStatus && p.dateEnCoursStatus)
      .map((p) =>
        calculateDelayInDays(p.dateNouveauStatus, p.dateEnCoursStatus)
      )
      .filter((d) => d !== null);

    // Délai En cours → Terminé
    const enCoursToTermineDelays = problemes
      .filter((p) => p.dateEnCoursStatus && p.dateTermineStatus)
      .map((p) =>
        calculateDelayInDays(p.dateEnCoursStatus, p.dateTermineStatus)
      )
      .filter((d) => d !== null);

    // Délai Total (Nouveau → Terminé)
    const totalDelays = problemes
      .filter((p) => p.dateNouveauStatus && p.dateTermineStatus)
      .map((p) => calculateDelayInDays(p.dateNouveauStatus, p.dateTermineStatus))
      .filter((d) => d !== null);

    // Calcul des moyennes
    const avgNouveauToEnCours =
      nouveauToEnCoursDelays.length > 0
        ? nouveauToEnCoursDelays.reduce((a, b) => a + b, 0) /
          nouveauToEnCoursDelays.length
        : 0;

    const avgEnCoursToTermine =
      enCoursToTermineDelays.length > 0
        ? enCoursToTermineDelays.reduce((a, b) => a + b, 0) /
          enCoursToTermineDelays.length
        : 0;

    const avgTotal =
      totalDelays.length > 0
        ? totalDelays.reduce((a, b) => a + b, 0) / totalDelays.length
        : 0;

    // Calcul du min et max pour le total
    const minTotal = totalDelays.length > 0 ? Math.min(...totalDelays) : 0;
    const maxTotal = totalDelays.length > 0 ? Math.max(...totalDelays) : 0;

    // Comptage par statut
    const nouveauCount = problemes.filter((p) => p.statusValeur === 10).length;
    const enCoursCount = problemes.filter((p) => p.statusValeur === 20).length;
    const termineCount = problemes.filter((p) => p.statusValeur === 30).length;

    return {
      avgNouveauToEnCours: avgNouveauToEnCours.toFixed(1),
      avgEnCoursToTermine: avgEnCoursToTermine.toFixed(1),
      avgTotal: avgTotal.toFixed(1),
      minTotal,
      maxTotal,
      nouveauCount,
      enCoursCount,
      termineCount,
      totalCount: problemes.length,
      completedPercentage: ((termineCount / problemes.length) * 100).toFixed(1),
    };
  }, [problemes]);

  // Calcul des données pour le graphique en barres
  const chartData = useMemo(() => {
    if (!statistics) return [];
    return [
      {
        label: "Nouveau → En cours",
        value: parseFloat(statistics.avgNouveauToEnCours),
        color: "bg-amber-500",
        textColor: "text-amber-700",
      },
      {
        label: "En cours → Terminé",
        value: parseFloat(statistics.avgEnCoursToTermine),
        color: "bg-blue-500",
        textColor: "text-blue-700",
      },
      {
        label: "Délai Total Moyen",
        value: parseFloat(statistics.avgTotal),
        color: "bg-emerald-500",
        textColor: "text-emerald-700",
      },
    ];
  }, [statistics]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!statistics || problemes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Aucune donnée
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Aucune statistique disponible pour le moment.
          </p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* En-tête */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Statistiques de Traitement
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Analyse des délais moyens de traitement des problèmes
        </p>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50">
        <div className="bg-white rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Nouveau
              </p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {statistics.nouveauCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                En cours
              </p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {statistics.enCoursCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Terminé
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {statistics.termineCount}
              </p>
            </div>
            <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">
                Taux de Complétion
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {statistics.completedPercentage}%
              </p>
            </div>
            <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-gray-600">
                {statistics.termineCount}/{statistics.totalCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des délais moyens */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Délais Moyens de Traitement (en jours)
        </h3>
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <span className={`text-sm font-bold ${item.textColor}`}>
                  {item.value} jours
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-8">
                <div
                  className={`${item.color} h-8 rounded-full flex items-center justify-end pr-3 text-white text-xs font-medium transition-all duration-500`}
                  style={{
                    width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                    minWidth: item.value > 0 ? "60px" : "0",
                  }}
                >
                  {item.value > 0 && `${item.value}j`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques additionnelles */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Délai Minimum
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {statistics.minTotal} jours
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Délai Moyen Total
            </p>
            <p className="text-lg font-bold text-emerald-600 mt-1">
              {statistics.avgTotal} jours
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Délai Maximum
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {statistics.maxTotal} jours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
