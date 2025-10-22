import { useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const SubAdminRoutes = () => {
  const [, , , loggedUser, , , , , , , , , , user, ,] = useAuth();
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;
  const rolAdmin = import.meta.env.VITE_ROL_ADMIN;
  const rolSubAdmin = import.meta.env.VITE_ROL_SUB_ADMIN;

  useEffect(() => {
    loggedUser();
  }, []);

  if (user) {
    if (
      user?.role === rolAdmin ||
      user?.role === rolSubAdmin ||
      user?.cI === superAdmin
    ) {
      return <Outlet />;
    } else {
      return <Navigate to="/home" />;
    }
  }
};

export default SubAdminRoutes;
