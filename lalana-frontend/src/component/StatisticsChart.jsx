import { useMemo } from "react";
import { ChartBarIcon, ClockIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

// `StatisticsChart` now expects precomputed `stats` provided by the backend (or test response).
// Shape: { counts: {...}, averages: {...}, minMax: {...}, histogram: [...], samples: [...] }
export default function StatisticsChart({ stats, isLoading }) {
  const statistics = useMemo(() => {
    if (!stats) return null;

    return {
      avgNouveauToEnCours: stats.averages?.nouveauToEnCours ?? 0,
      avgEnCoursToTermine: stats.averages?.enCoursToTermine ?? 0,
      avgTotal: stats.averages?.totalNouveauToTermine ?? 0,
      minTotal: stats.minMax?.min ?? 0,
      maxTotal: stats.minMax?.max ?? 0,
      nouveauCount: stats.counts?.nouveau ?? 0,
      enCoursCount: stats.counts?.enCours ?? 0,
      termineCount: stats.counts?.termine ?? 0,
      totalCount: stats.counts?.total ?? 0,
      completedPercentage:
        stats.counts && stats.counts.total
          ? ((stats.counts.termine / stats.counts.total) * 100).toFixed(1)
          : "0.0",
    };
  }, [stats]);

  const chartData = useMemo(() => {
    if (!statistics) return [];
    return [
      { label: "Nouveau → En cours", value: Number(statistics.avgNouveauToEnCours), color: "bg-amber-500", textColor: "text-amber-700" },
      { label: "En cours → Terminé", value: Number(statistics.avgEnCoursToTermine), color: "bg-blue-500", textColor: "text-blue-700" },
      { label: "Délai Total Moyen", value: Number(statistics.avgTotal), color: "bg-emerald-500", textColor: "text-emerald-700" },
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

  if (!statistics || statistics.totalCount === 0) {
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
