import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAdminToken } from "../utils/config";

function ProtectedRoute() {
    const [isAdmin, setIsAdmin] = useState(null); // null = loading, true/false = result
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        async function checkAdmin() {
            if (!token) {
                setIsAdmin(false);
                return;
            }

            const result = await isAdminToken(token);
            setIsAdmin(result);
        }

        checkAdmin();
    }, [token]);

    // Afficher un loader pendant la vérification
    if (isAdmin === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    // Rediriger vers /login si pas admin
    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    // Si admin, afficher les routes enfants
    return <Outlet />;
}

export default ProtectedRoute;
