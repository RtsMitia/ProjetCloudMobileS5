import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, Cog6ToothIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { updateConfig } from "../api/configService";

export default function Config() {
  const [prix, setPrix] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prix || isNaN(prix) || parseFloat(prix) <= 0) {
      setMessage({ type: "error", text: "Veuillez entrer un prix valide" });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await updateConfig("PM2", parseFloat(prix));
      setMessage({ type: "success", text: "Prix mis à jour avec succès" });
      setPrix("");
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Erreur lors de la mise à jour" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-3">
            <Link
              to="/backoffice"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
              <p className="mt-2 text-sm text-gray-700">
                Gérer les paramètres de l'application
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Cog6ToothIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Prix par mètre carré (PM2)</h2>
              <p className="text-sm text-gray-600">Définir le prix de base pour le calcul du budget</p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insérer un nouveau prix
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  className="pl-10 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                  placeholder="Entrez le nouveau prix"
                  disabled={isSubmitting}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Ce prix sera utilisé pour calculer automatiquement le budget estimé des problèmes (PM2 × Niveau × Surface)
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Enregistrement...
                </>
              ) : (
                "Enregistrer le nouveau prix"
              )}
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-start ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex-shrink-0">
                {message.type === "success" ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
