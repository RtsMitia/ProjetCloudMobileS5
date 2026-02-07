import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    EnvelopeIcon,
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    UserPlusIcon,
    ShieldCheckIcon,
    BuildingOffice2Icon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { signup } from "../api/authService";

function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
        // Clear error when user starts typing
        if (error) setError("");
    };

    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.confirmPassword) {
            setError("Veuillez remplir tous les champs");
            return false;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Adresse email invalide");
            return false;
        }

        // Validation mot de passe
        if (formData.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return false;
        }

        // Vérification de la correspondance des mots de passe
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return false;
        }

        // Vérification de l'acceptation des conditions
        if (!formData.acceptTerms) {
            setError("Veuillez accepter les conditions d'utilisation");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!validateForm()) {
            setLoading(false);
            return;
        }

        try {
            // Appel API d'inscription
            const data = await signup(formData.email, formData.password);

            // Succès de l'inscription
            setSuccess("Compte créé avec succès ! Redirection...");
            console.log("Inscription réussie:", data);

            // Redirection vers la liste des utilisateurs après 1.5 secondes
            setTimeout(() => {
                navigate("/backoffice/utilisateurs");
            }, 1500);
        } catch (error) {
            console.error("Erreur d'inscription:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 flex items-center justify-center">
                        <BuildingOffice2Icon className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Créer un compte
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Rejoignez la plateforme de gestion des infrastructures
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Adresse email
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="vous@exemple.mg"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Minimum 6 caractères
                            </p>
                        </div>

                        {/* Confirmation mot de passe */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Acceptation des conditions */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="acceptTerms"
                                    name="acceptTerms"
                                    type="checkbox"
                                    checked={formData.acceptTerms}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="acceptTerms" className="text-gray-700">
                                    J'accepte les{" "}
                                    <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                                        conditions d'utilisation
                                    </Link>{" "}
                                    et la{" "}
                                    <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                                        politique de confidentialité
                                    </Link>
                                </label>
                            </div>
                        </div>

                        {/* Messages d'erreur */}
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <ShieldCheckIcon className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Message de succès */}
                        {success && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bouton de soumission */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white ${loading || success
                                    ? "bg-blue-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    } transition-all duration-200 shadow-sm`}
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <UserPlusIcon className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                                </span>
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création en cours...
                                    </>
                                ) : success ? (
                                    "Compte créé !"
                                ) : (
                                    "Créer mon compte"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <p className="text-center text-sm text-gray-600">
                            Vous avez déjà un compte ?{" "}
                            <Link
                                to="/login"
                                className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Protection des données</h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <p>
                                        Vos informations sont sécurisées et ne seront jamais partagées avec des tiers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Système de Gestion des Infrastructures. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
