import { useState } from "react";
import { 
  XMarkIcon, 
  MagnifyingGlassIcon,
  FunnelIcon 
} from "@heroicons/react/24/outline";
import ProblemListItem from "./ProblemListItem";
import StatusFilter from "./StatusFilter";

function ProblemListPanel({
  problems,
  selectedProblemId,
  onProblemClick,
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

  const filteredProblems = problems.filter(problem => {
    if (filterStatus !== "all") {
      if (filterStatus === "pending" && problem.statusValeur !== 10) return false;
      if (filterStatus === "inprogress" && problem.statusValeur !== 20) return false;
      if (filterStatus === "resolved" && problem.statusValeur !== 30) return false;
    }
    
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase();
      return (
        problem.localisation.toLowerCase().includes(query) ||
        problem.description.toLowerCase().includes(query) ||
        problem.userEmail.toLowerCase().includes(query) ||
        (problem.entrepriseName?.toLowerCase().includes(query) || false)
      );
    }
    
    return true;
  });

  return (
    <div className="w-full md:w-1/3 bg-white border-l border-gray-200 shadow-lg overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800">Liste des problèmes</h3>
            <p className="text-sm text-gray-500">{filteredProblems.length} résultats</p>
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
        {filteredProblems.map((problem) => (
          <ProblemListItem
            key={`list-item-${problem.id}`}
            problem={problem}
            isSelected={selectedProblemId === problem.id}
            onClick={() => onProblemClick(problem.id)}
          />
        ))}
        
        {filteredProblems.length === 0 && (
          <div className="p-8 text-center">
            <div className="h-12 w-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucun problème trouvé</p>
            <p className="text-sm text-gray-400 mt-1">Essayez de modifier vos filtres</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProblemListPanel;