import {
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "../utils/helpers";

function ProblemListItem({ problem, isSelected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-800">Problème #{problem.id}</h4>
            {isSelected && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Sélectionné</span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{problem.localisation}</p>
        </div>
        <StatusBadge 
          statusValeur={problem.statusValeur} 
          type="probleme"
        />
      </div>
      
      <p className="text-sm text-gray-700 my-2">{problem.description}</p>
      
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Surface: {problem.surface} m²</span>
        </div>
        {problem.niveau && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="font-medium">Niveau: {problem.niveau}/10</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <CurrencyDollarIcon className="h-3 w-3" />
          <span>{formatCurrency(problem.budgetEstime)}</span>
        </div>
        {problem.entrepriseName && (
          <div className="flex items-center gap-1">
            <BuildingOfficeIcon className="h-3 w-3" />
            <span>{problem.entrepriseName}</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>Signalement #{problem.signalementId}</span>
        <span>{formatDate(problem.createdAt)}</span>
      </div>
    </div>
  );
}

export default ProblemListItem;