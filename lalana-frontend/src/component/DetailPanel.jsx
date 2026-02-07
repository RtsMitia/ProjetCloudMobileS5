import {
  XMarkIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  HashtagIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "../utils/helpers.jsx";

function DetailPanel({ type, data, onClose }) {
  if (!data) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-[380px] bg-white shadow-2xl z-[1000] flex flex-col animate-slide-in overflow-hidden border-r border-gray-200">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${
        type === "probleme" 
          ? "bg-gradient-to-r from-blue-600 to-blue-500" 
          : "bg-gradient-to-r from-rose-600 to-rose-500"
      }`}>
        <div className="flex items-center gap-2 text-white">
          {type === "probleme" ? (
            <WrenchScrewdriverIcon className="h-5 w-5" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5" />
          )}
          <h2 className="text-base font-bold">
            {type === "probleme" ? `Problème #${data.id}` : `Signalement #${data.id}`}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Statut */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Statut</span>
          {type === "probleme" ? (
            <StatusBadge statusValeur={data.statusValeur} type="probleme" />
          ) : (
            <StatusBadge status={data.statusLiebelle} />
          )}
        </div>

        {/* Localisation */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Localisation</h3>
          </div>
          <p className="text-sm text-gray-600 pl-6">{data.localisation}</p>
          <p className="text-xs text-gray-400 pl-6">
            Coord: {data.y?.toFixed(6)}, {data.x?.toFixed(6)}
          </p>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Description</h3>
          </div>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg pl-6 leading-relaxed">
            {data.description}
          </p>
        </div>

        {/* Utilisateur */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Signalé par</h3>
          </div>
          <p className="text-sm text-gray-600 pl-6">{data.userEmail}</p>
        </div>

        {/* Date */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Date de création</h3>
          </div>
          <p className="text-sm text-gray-600 pl-6">
            {formatDate(data.createdAt || data.signalementCreatedAt)}
          </p>
        </div>

        {/* Section spécifique aux problèmes */}
        {type === "probleme" && (
          <>
            {/* Surface et Budget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowsPointingOutIcon className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-xs font-medium text-blue-600">Surface</p>
                </div>
                <p className="text-lg font-bold text-blue-800">{data.surface} m²</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <CurrencyDollarIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <p className="text-xs font-medium text-emerald-600">Budget estimé</p>
                </div>
                <p className="text-lg font-bold text-emerald-800">{formatCurrency(data.budgetEstime)}</p>
              </div>
            </div>

            {/* Signalement associé */}
            {data.signalementId && (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" />
                  <h3 className="text-sm font-semibold text-rose-700">Signalement associé</h3>
                </div>
                <div className="space-y-1 pl-6">
                  <div className="flex items-center gap-2">
                    <HashtagIcon className="h-3 w-3 text-rose-400" />
                    <p className="text-xs text-gray-600">ID: {data.signalementId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Statut: {data.signalementStatus}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Entreprise assignée */}
            {data.entrepriseName && (
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-semibold text-indigo-700">Entreprise assignée</h3>
                </div>
                <div className="space-y-2 pl-6">
                  <p className="text-sm font-semibold text-gray-800">{data.entrepriseName}</p>
                  {data.entrepriseContact && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-600">{data.entrepriseContact}</p>
                    </div>
                  )}
                  {data.entrepriseAdresse && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-600">{data.entrepriseAdresse}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Section spécifique aux signalements */}
        {type === "signalement" && (
          <>
            {data.userId && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HashtagIcon className="h-4 w-4 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-700">ID Utilisateur</h3>
                </div>
                <p className="text-sm text-gray-600 pl-6">{data.userId}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DetailPanel;
