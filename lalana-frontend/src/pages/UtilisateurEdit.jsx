import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    ArrowLeftIcon,
    CheckIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

export default function UtilisateurEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        const fetchUtilisateur = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },

                });

                if (!response.ok) {
                    throw new Error(`Erreur HTTP! Statut: ${response.status}`);
                }

                const data = await response.json();
                console.log("Données utilisateur reçues:", data);

                if (data.success && data.data) {
                    setFormData({
                        email: data.data.email || "",
                        password: "", 
                        currentStatus: data.data.currentStatus || 1,
                        firebaseToken: data.data.firebaseToken || "",
                    });
                } else {
                    throw new Error("Format de données invalide");
                }
            } catch (error) {
                console.error("Erreur lors du chargement de l'utilisateur:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchUtilisateur();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        setSuccessMessage("");

        try {
            // Préparer les données à envoyer (seulement email et mot de passe)
            const dataToSend = {
                email: formData.email
            };
            // Ajouter le mot de passe seulement s'il est rempli
            if (formData.password && formData.password.trim() !== "") {
                dataToSend.password = formData.password;
            }

            const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP! Statut: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setSuccessMessage("Utilisateur mis à jour avec succès!");
                // Rediriger après 1.5 secondes
                setTimeout(() => {
                    navigate("/backoffice/utilisateurs");
                }, 1500);
            } else {
                throw new Error(data.message || "Erreur lors de la mise à jour");
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <UserIcon className="h-8 w-8 text-indigo-600" />
                            Modifier l'utilisateur
                        </h1>
                        <p className="text-gray-600 mt-1">ID: {id}</p>
                    </div>
                    <Link
                        to="/backoffice/utilisateurs"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Retour
                    </Link>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <XMarkIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800">Erreur</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-green-800">Succès</h3>
                            <p className="text-green-700">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Formulaire */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                <EnvelopeIcon className="h-5 w-5 inline mr-2 text-gray-500" />
                                Adresse email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="utilisateur@example.com"
                            />
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                <LockClosedIcon className="h-5 w-5 inline mr-2 text-gray-500" />
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Laissez vide pour ne pas modifier"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Laissez ce champ vide si vous ne souhaitez pas modifier le mot de passe
                            </p>
                        </div>


                        {/* Boutons d'action */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t">
                            <Link
                                to="/backoffice/utilisateurs"
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <CheckIcon className="h-5 w-5" />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
