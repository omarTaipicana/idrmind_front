import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const InstitutoProtectedRoute = () => {
    const[, , , loggedUser, , , , , , , , , , user,,] = useAuth();
    


    useEffect(() => {
        loggedUser();
    }, []);

    if (user) {
        if (
            user?.role?.slice(0, 9) === "instituto" ||
            user?.isSuperAdmin === true
        ) {
            return <Outlet />;
        } else {
            return <Navigate to="/home" />;
        }
    }
};
export default InstitutoProtectedRoute