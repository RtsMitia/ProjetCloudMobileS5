import { Link, useLocation } from "react-router-dom";
import {
  UserGroupIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  BellIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function BackOffice() {
  const location = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const navigationItems = [
    {
      name: "Problèmes",
      path: "/backoffice/problemes",
      icon: ExclamationTriangleIcon,
      color: "text-red-600 bg-red-50 border-red-100",
      hoverColor: "hover:bg-red-50 hover:border-red-200",
    },
    {
      name: "Utilisateurs",
      path: "/backoffice/utilisateurs",
      icon: UserGroupIcon,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      hoverColor: "hover:bg-blue-50 hover:border-blue-200",
    },
    {
      name: "Signalements",
      path: "/backoffice/signalements",
      icon: BellIcon,
      color: "text-yellow-600 bg-yellow-50 border-yellow-100",
      hoverColor: "hover:bg-yellow-50 hover:border-yellow-200",
    },
  ];

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    
    try {
      const response = await fetch("http://localhost:8080/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSyncStatus({
          type: "success",
          message: data.message || "Synchronisation réussie !",
        });
      } else {
        setSyncStatus({
          type: "error",
          message: "Erreur lors de la synchronisation",
        });
      }
    } catch (error) {
      setSyncStatus({
        type: "error",
        message: "Impossible de se connecter au serveur",
      });
    } finally {
      setIsSyncing(false);
      
      // Supprimer le message de statut après 5 secondes
      setTimeout(() => {
        setSyncStatus(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center p-6">
      {/* En-tête avec titre et bouton de synchronisation */}
      <div className="w-full max-w-6xl mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Titre */}
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Tableau de bord BackOffice
            </h1>
            <p className="text-gray-600 text-lg">
              Gérez votre système de maintenance
            </p>
          </div>

          {/* Bouton de synchronisation */}
          <div className="relative">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`
                flex items-center justify-center gap-3
                px-6 py-3
                rounded-xl
                font-semibold
                transition-all duration-300
                shadow-lg
                ${isSyncing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                }
                text-white
                hover:shadow-xl
                transform hover:-translate-y-0.5
                min-w-[180px]
              `}
            >
              <ArrowPathIcon
                className={`h-5 w-5 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Synchronisation..." : "Synchroniser"}
            </button>

            {/* Message de statut */}
            {syncStatus && (
              <div
                className={`
                  absolute top-full mt-3 left-1/2 transform -translate-x-1/2
                  px-4 py-2 rounded-lg shadow-lg
                  text-sm font-medium
                  animate-fadeIn
                  ${syncStatus.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                  }
                  whitespace-nowrap
                  z-10
                `}
              >
                {syncStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liens au centre */}
      <div className="flex flex-wrap justify-center gap-6 max-w-4xl">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center
                w-48 h-48
                rounded-2xl border-2
                transition-all duration-300
                transform hover:scale-105 hover:shadow-xl
                shadow-lg
                ${isActive
                  ? `${item.color} border-2 scale-105`
                  : `bg-white border-gray-200 ${item.hoverColor}`
                }
              `}
            >
              {/* Icône avec cercle */}
              <div
                className={`
                  p-4 rounded-full mb-4
                  ${isActive
                    ? item.color.replace("50", "100").replace("border-", "")
                    : "bg-gray-100"
                  }
                `}
              >
                <Icon
                  className={`h-12 w-12 ${
                    isActive ? item.color.split(" ")[0] : "text-gray-500"
                  }`}
                />
              </div>

              {/* Nom du lien */}
              <span
                className={`
                  text-xl font-semibold
                  ${isActive ? item.color.split(" ")[0] : "text-gray-700"}
                `}
              >
                {item.name}
              </span>

              {/* Badge si actif */}
              {isActive && (
                <div className="mt-3 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Actif
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Message informatif */}
      <div className="mt-12 text-center text-gray-500 max-w-2xl">
        <p className="text-lg">
          Sélectionnez une section pour gérer votre système de maintenance.
          Chaque section vous permet de visualiser et modifier les données
          correspondantes.
        </p>
      </div>

      {/* Ajout de styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}