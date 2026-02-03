import {
  MapIcon,
  ListBulletIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import StatusFilter from "./StatusFilter";
import { useNavigate } from "react-router-dom";
import { isAdminToken , isLogedIn } from "../utils/config";


function MapControls({
  totalPoints,
  problemsEnCours,
  selectedProblem,
  showList,
  onToggleList,
  isFullscreen,
  onToggleFullscreen,
  selectedProblemId,
  onClearSelection,
  showSignalements,
  onToggleSignalements,
  showProblemes,
  onToggleProblemes,
  filterStatus,
  onFilterChange,
  searchQuery,
  onSearchChange,
  signalementCount,
  problemeCount,
}) {
  const navigate = useNavigate();
  const handleBackOfficeClick = () => {
    navigate("/backoffice");
  };
  
  const handleLoginClick = () => {
    navigate("/login");
  };
  const token = localStorage.getItem("token") || "";
  

  return (
    <>
      <div className="bg-white shadow-sm border-b border-gray-200 transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <MapIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Carte Interactive des Signalements</h2>
              <p className="text-sm text-gray-500">
                {totalPoints} points • {problemsEnCours} en cours
                {selectedProblem && (
                  <span className="ml-2 text-blue-600 font-medium">
                    → Focus: Problème #{selectedProblem.id}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            {/* Barre de recherche */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <button
              onClick={onToggleList}
              className={`flex items-center gap-1 px-3 py-2 text-sm ${showList ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'} rounded-lg transition-colors`}
            >
              <ListBulletIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </button>
            {isAdminToken(token) && (
            <button 
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors`}
              onClick={handleBackOfficeClick}
            >
              <ListBulletIcon className="h-4 w-4" />
              <span className="hidden sm:inline">BackOffice</span>

            </button>
            ) } 
            
            <button
              onClick={onToggleFullscreen}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              {isFullscreen ? (  
                <>
                  <ArrowsPointingInIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Réduire</span>
                </>
              ) : (
                <>
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Plein écran</span>
                </>
              )}
            </button>

            <button
              onClick={handleLoginClick}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
            
            {selectedProblemId && (
              <button
                onClick={onClearSelection}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Désélectionner</span>
              </button>
            )}
          </div>
        </div>

        {/* Contrôles de filtre */}
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtres:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-signalements"
                  checked={showSignalements}
                  onChange={onToggleSignalements}
                  className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                />
                <label htmlFor="show-signalements" className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  Signalements ({signalementCount})
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-problemes"
                  checked={showProblemes}
                  onChange={onToggleProblemes}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="show-problemes" className="ml-2 text-sm text-gray-700 flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Problèmes ({problemeCount})
                </label>
              </div>
              
              <StatusFilter 
                filterStatus={filterStatus}
                onFilterChange={onFilterChange}
                compact={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MapControls;