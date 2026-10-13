import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const SuperAdminProtectedRoute = () => {
    const [, , , loggedUser, , , , , , , , , , user, ,] = useAuth();
    


    useEffect(() => {
        loggedUser();
    }, []);

    if (user) {
        if (
            user?.isSuperAdmin === true || user?.isSuperAdmin === true
        ) {
            return <Outlet />;
        } else {
            return <Navigate to="/home" />;
        }
    }
};

export default SuperAdminProtectedRoute