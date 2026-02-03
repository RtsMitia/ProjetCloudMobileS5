import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  WrenchScrewdriverIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "../utils/helpers";

function ProblemMarker({ 
  problem, 
  isSelected, 
  onClick,
  onPopupOpen,
  onPopupClose 
}) {
  
  const getProblemeIcon = (statusValeur, isSelected = false) => {
    let iconUrl;
    let iconSize = isSelected ? [32, 52] : [20, 32];
    let iconAnchor = isSelected ? [16, 52] : [10, 32];

    switch (statusValeur) {
      case 10:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png";
        break;
      case 20:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png";
        break;
      case 30:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
        break;
      default:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
        break;
    }

    return new Icon({
      iconUrl: iconUrl,
      iconSize: iconSize,
      iconAnchor: iconAnchor,
      shadowUrl: markerShadow,
      shadowSize: isSelected ? [52, 52] : [32, 32],
      shadowAnchor: isSelected ? [16, 52] : [10, 32],
      popupAnchor: [1, isSelected ? -48 : -28],
      className: isSelected ? "selected-marker" : "",
    });
  };

  return (
    <Marker
      position={[problem.y, problem.x]}
      icon={getProblemeIcon(problem.statusValeur, isSelected)}
      eventHandlers={{
        click: () => onClick(problem.id),
        popupopen: onPopupOpen,
        popupclose: onPopupClose,
      }}
    >
      <Popup>
        <div className="font-sans p-1 min-w-[260px]">
          <div className="flex items-center gap-2 mb-2">
            <WrenchScrewdriverIcon className="h-4 w-4 text-blue-500" />
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Problème #{problem.id}
                {isSelected && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Sélectionné</span>
                )}
              </h3>
              <p className="text-xs text-gray-500">
                Créé par: {problem.userEmail}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-3 w-3 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-700">Localisation</p>
                <p className="text-xs text-gray-600">{problem.localisation}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ClipboardDocumentListIcon className="h-3 w-3 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-700">Description</p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">
                  {problem.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-1.5 bg-blue-50 rounded">
                <p className="text-xs font-medium text-blue-700">Surface</p>
                <p className="text-sm font-semibold text-blue-800">{problem.surface} m²</p>
              </div>
              <div className="p-1.5 bg-emerald-50 rounded">
                <p className="text-xs font-medium text-emerald-700">Budget</p>
                <p className="text-sm font-semibold text-emerald-800">{formatCurrency(problem.budgetEstime)}</p>
              </div>
            </div>

            {problem.entrepriseName && (
              <div className="border-t pt-2">
                <div className="flex items-start gap-2">
                  <BuildingOfficeIcon className="h-3 w-3 text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700 mb-1">Entreprise assignée</p>
                    <div className="bg-blue-50 p-1.5 rounded">
                      <p className="text-xs font-semibold text-gray-700">
                        {problem.entrepriseName}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <EnvelopeIcon className="h-2.5 w-2.5 text-gray-500" />
                        <p className="text-xs text-gray-600">
                          {problem.entrepriseContact}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-700">Statut problème</p>
                </div>
                <StatusBadge 
                  statusValeur={problem.statusValeur} 
                  type="probleme"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <UserIcon className="h-2.5 w-2.5 text-gray-400" />
                <p className="text-xs text-gray-600">
                  Signalé par: {problem.userEmail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default ProblemMarker;