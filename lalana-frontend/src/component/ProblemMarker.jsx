import { useRef } from "react";
import { Marker, Tooltip } from "react-leaflet";
import { Icon } from "leaflet";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  WrenchScrewdriverIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";

function ProblemMarker({ 
  problem, 
  isSelected, 
  onClick,
}) {
  const markerRef = useRef(null);

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
      ref={markerRef}
      position={[problem.y, problem.x]}
      icon={getProblemeIcon(problem.statusValeur, isSelected)}
      eventHandlers={{
        click: () => onClick(problem.id),
      }}
    >
      {/* Tooltip affiché au hover */}
      <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
        <div className="font-sans p-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <WrenchScrewdriverIcon className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              Problème #{problem.id}
            </h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-600">{problem.localisation}</p>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{problem.description}</p>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-gray-400">{problem.userEmail}</span>
              <StatusBadge statusValeur={problem.statusValeur} type="probleme" />
            </div>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

export default ProblemMarker;