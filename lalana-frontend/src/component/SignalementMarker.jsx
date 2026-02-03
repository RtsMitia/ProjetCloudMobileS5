import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/helpers";

function SignalementMarker({ signalement }) {
  
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
    >
      <Popup>
        <div className="font-sans p-1 min-w-[240px]">
          <div className="flex items-center gap-2 mb-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              Signalement #{signalement.id}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPinIcon className="h-3 w-3 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-700">Localisation</p>
                <p className="text-xs text-gray-600">{signalement.localisation}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ClipboardDocumentListIcon className="h-3 w-3 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-700">Description</p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1">
                  {signalement.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <UserIcon className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Signalé par</p>
                  <p className="text-xs text-gray-600">{signalement.userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3 w-3 text-gray-400" />
                <div>
                  <p className="text-xs font-medium text-gray-700">Date</p>
                  <p className="text-xs text-gray-600">{formatDate(signalement.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div>
                <p className="text-xs font-medium text-gray-700">Statut</p>
                <StatusBadge status={signalement.statusLiebelle} />
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default SignalementMarker;