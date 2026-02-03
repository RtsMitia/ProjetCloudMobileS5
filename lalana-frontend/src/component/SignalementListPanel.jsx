import { useState } from "react";
import {
    XMarkIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    UserIcon,
    CalendarIcon
} from "@heroicons/react/24/outline";
import StatusFilter from "./StatusFilter";

function SignalementListPanel({
    signalements,
    selectedSignalementId,
    onSignalementClick,
    onClose,
    filterStatus,
    onFilterChange,
    searchQuery,
    onSearchChange,
}) {
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

    const handleSearch = (e) => {
        const value = e.target.value;
        setLocalSearchQuery(value);
        onSearchChange(value);
    };

    const filteredSignalements = signalements.filter(sig => {
        if (filterStatus !== "all") {
            if (filterStatus === "pending" && sig.valeur !== 10) return false;
            if (filterStatus === "inprogress" && sig.valeur !== 20) return false;
            if (filterStatus === "resolved" && sig.valeur !== 30) return false;
        }

        if (localSearchQuery) {
            const query = localSearchQuery.toLowerCase();
            return (
                sig.localisation.toLowerCase().includes(query) ||
                sig.description.toLowerCase().includes(query) ||
                sig.userEmail.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const getStatusColor = (valeur) => {
        switch (valeur) {
            case 10:
                return "bg-amber-100 text-amber-800 border-amber-200";
            case 20:
                return "bg-blue-100 text-blue-800 border-blue-200";
            case 30:
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
          
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Date inconnue";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full md:w-1/3 bg-white border-l border-gray-200 shadow-lg overflow-y-auto">
            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-gray-800">Liste des signalements</h3>
                        <p className="text-sm text-gray-500">{filteredSignalements.length} résultats</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-3 space-y-3">
                    {/* Barre de recherche */}
                    <div className="relative">
                        <input
                            type="text"
                            value={localSearchQuery}
                            onChange={handleSearch}
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Filtres */}
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-4 w-4 text-gray-500" />
                        <StatusFilter
                            filterStatus={filterStatus}
                            onFilterChange={onFilterChange}
                            compact={false}
                        />
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {filteredSignalements.map((sig) => (
                    <div
                        key={`sig-list-item-${sig.id}`}
                        onClick={() => onSignalementClick(sig.id)}
                        className={`p-4 cursor-pointer transition-colors ${selectedSignalementId === sig.id
                                ? "bg-rose-50 border-l-4 border-rose-500"
                                : "hover:bg-gray-50 border-l-4 border-transparent"
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                    Signalement #{sig.id}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(sig.valeur)}`}>
                                    {sig.statusLiebelle}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {/* Localisation */}
                            <div className="flex items-start gap-2">
                                <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700 line-clamp-1">
                                    {sig.localisation}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 line-clamp-2 ml-6">
                                {sig.description}
                            </p>

                            {/* Utilisateur */}
                            <div className="flex items-center gap-2 ml-6">
                                <UserIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{sig.userEmail}</span>
                            </div>

                            {/* Date */}
                            <div className="flex items-center gap-2 ml-6">
                                <CalendarIcon className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{formatDate(sig.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredSignalements.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Aucun signalement trouvé</p>
                        <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos filtres</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SignalementListPanel;
