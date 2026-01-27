import { MapPinIcon } from "@heroicons/react/24/outline";

function Legend() {
  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2 mb-3">
        <MapPinIcon className="h-5 w-5 text-blue-500" />
        <h4 className="font-semibold text-gray-700">Légende des marqueurs</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex items-center p-2 bg-gray-50 rounded border">
          <div className="w-3 h-3 bg-rose-500 rounded-full mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Signalements</p>
            <p className="text-xs text-gray-500">Nouveaux signalements</p>
          </div>
        </div>
        <div className="flex items-center p-2 bg-gray-50 rounded border">
          <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Problèmes ouverts</p>
            <p className="text-xs text-gray-500">Status: 10 (À traiter)</p>
          </div>
        </div>
        <div className="flex items-center p-2 bg-gray-50 rounded border">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Problèmes assignés</p>
            <p className="text-xs text-gray-500">Status: 20 (En cours)</p>
          </div>
        </div>
        <div className="flex items-center p-2 bg-gray-50 rounded border">
          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
          <div>
            <p className="text-sm font-medium text-gray-700">Problèmes résolus</p>
            <p className="text-xs text-gray-500">Status: 30 (Terminé)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Legend;