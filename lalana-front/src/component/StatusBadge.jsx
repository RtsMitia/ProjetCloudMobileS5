import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

function StatusBadge({ status, type = "signalement", statusValeur }) {
  const getConfig = () => {
    if (type === "probleme") {
      switch (statusValeur) {
        case 10: // Ouvert
          return {
            color: "text-amber-700 bg-amber-50 border border-amber-200",
            icon: <ExclamationTriangleIcon className="h-3 w-3 text-amber-600" />,
            text: "Ouvert"
          };
        case 20: // Assigné
          return {
            color: "text-blue-700 bg-blue-50 border border-blue-200",
            icon: <WrenchScrewdriverIcon className="h-3 w-3 text-blue-600" />,
            text: "Assigné"
          };
        case 30: // Résolu
          return {
            color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
            icon: <CheckCircleIcon className="h-3 w-3 text-emerald-600" />,
            text: "Résolu"
          };
        default:
          return {
            color: "text-slate-700 bg-slate-50 border border-slate-200",
            icon: <ExclamationCircleIcon className="h-3 w-3 text-slate-600" />,
            text: "Inconnu"
          };
      }
    } else {
      // Signalement
      if (status === "Résolu") return {
        color: "text-emerald-700 bg-emerald-50 border border-emerald-200",
        icon: <CheckCircleIcon className="h-3 w-3 text-emerald-600" />,
        text: status
      };
      if (status === "En cours") return {
        color: "text-amber-700 bg-amber-50 border border-amber-200",
        icon: <ClockIcon className="h-3 w-3 text-amber-600" />,
        text: status
      };
      return {
        color: "text-rose-700 bg-rose-50 border border-rose-200",
        icon: <ExclamationCircleIcon className="h-3 w-3 text-rose-600" />,
        text: status
      };
    }
  };

  const config = getConfig();

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
      {config.icon}
      {config.text}
    </span>
  );
}

export default StatusBadge;