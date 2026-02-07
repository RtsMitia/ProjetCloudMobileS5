import { Marker, Tooltip } from "react-leaflet";
import { Icon } from "leaflet";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  ExclamationTriangleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";

function SignalementMarker({ signalement, onClick }) {
  
  const getSignalementIcon = () => {
    return new Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      iconSize: [20, 32],
      iconAnchor: [10, 32],
      shadowUrl: markerShadow,
      shadowSize: [32, 32],
      shadowAnchor: [10, 32],
      popupAnchor: [1, -28],
    });
  };

  return (
    <Marker
      position={[signalement.y, signalement.x]}
      icon={getSignalementIcon()}
      eventHandlers={{
        click: () => onClick(signalement.id),
      }}
    >
      {/* Tooltip affiché au hover */}
      <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
        <div className="font-sans p-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              Signalement #{signalement.id}
            </h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <MapPinIcon className="h-3 w-3 text-gray-400" />
              <p className="text-xs text-gray-600">{signalement.localisation}</p>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{signalement.description}</p>
            <div className="flex justify-between items-center pt-1">
              <span className="text-xs text-gray-400">{signalement.userEmail}</span>
              <StatusBadge status={signalement.statusLiebelle} />
            </div>
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}

export default SignalementMarker;