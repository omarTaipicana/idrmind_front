import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PrincipalHeader.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useAuth from "../../hooks/useAuth";

const PrincipalHeader = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [grados, setGrados] = useState({
    grado1: false,
    grado2: false,
    grado3: false,
    grado4: false,
    grado5: false,
    grado6: false,
  });

  // Configurar grados según CI o rol
  useEffect(() => {
    if (!user?.role) return;

    const ci = user?.cI;
    const role = user?.role;

    setGrados({
      grado1: ci === "0503627234", // Superadmin (acceso total)
      grado2: role === "Administrador",
      grado3: role === "Sub-Administrador",
      grado4: role === "Validador",
      grado5: role === "Secretaria",
      grado6: ![
        "0503627234",
        "Administrador",
        "Sub-Administrador",
        "Validador",
        "Secretaria",
      ].includes(role),
    });
  }, [user]);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;

      const success = await loggedUser();

      if (!success) {
        console.log("❌ Token inválido, removido");
        localStorage.removeItem("token");
        setUserLogged(null);
      }
    };
    checkToken();
  }, [token]);

  const handleLogout = () => {
    if (user) {
      const capitalizeWord = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

      const firstName = capitalizeWord(user?.firstName);
      const lastName = capitalizeWord(user?.lastName);

      dispatch(
        showAlert({
          message: `⚠️ Hasta pronto ${firstName} ${lastName}, te esperamos.`,
          alertType: 4,
        })
      );
    }
    localStorage.removeItem("token");
    setUserLogged();
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header_nav">
      <section className="principal__header__section">
        <Link to="/" onClick={closeMenu}>
          <img
            src="/images/idrmind_sf.png"
            alt="Logo iDr.Mind."
            className="logo_navbar"
          />
        </Link>

        {/* Botón hamburguesa */}
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav_links ${menuOpen ? "open" : ""}`}>
          {token && (
            <>
              {grados.grado1 ? (
                <>
                  <Link to="/secre" onClick={closeMenu}>
                    Secretaria
                  </Link>
                  <Link to="/dashboard" onClick={closeMenu}>
                    Dashboard
                  </Link>
                  <Link to="/validacion" onClick={closeMenu}>
                    Validacion
                  </Link>
                  <Link to="/home" onClick={closeMenu}>
                    Home
                  </Link>
                </>
              ) : grados.grado2 ? (
                <>
                  <Link to="/secre" onClick={closeMenu}>
                    Secretaria
                  </Link>
                  <Link to="/dashboard" onClick={closeMenu}>
                    Dashboard
                  </Link>
                  <Link to="/validacion" onClick={closeMenu}>
                    Validacion
                  </Link>
                  <Link to="/home" onClick={closeMenu}>
                    Home
                  </Link>
                </>
              ) : grados.grado3 ? (
                <>
                  <Link to="/validacion" onClick={closeMenu}>
                    Validacion
                  </Link>
                  <Link to="/secre" onClick={closeMenu}>
                    Secretaria
                  </Link>
                  <Link to="/home" onClick={closeMenu}>
                    Home
                  </Link>
                </>
              ) : grados.grado4 ? (
                <>
                  <Link to="/validacion" onClick={closeMenu}>
                    Validacion
                  </Link>
                  <Link to="/home" onClick={closeMenu}>
                    Home
                  </Link>
                </>
              ) : grados.grado5 ? (
                <>
                  <Link to="/secre" onClick={closeMenu}>
                    Secretaria
                  </Link>
                  <Link to="/home" onClick={closeMenu}>
                    Home
                  </Link>
                </>
              ) : grados.grado6 ? (
                <Link to="/home" onClick={closeMenu}>
                  Home
                </Link>
              ) : null}
            </>
          )}

          {!token && (
            <>
              <Link to="/register" onClick={closeMenu}>
                Register
              </Link>
              <Link to="/login" onClick={closeMenu}>
                Login
              </Link>
            </>
          )}

          {token && (
            <>
              <Link to="/login" onClick={closeMenu}>
                <img
                  className="user__icon"
                  src="../../../user.png"
                  alt="User Icon"
                />
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="logout__button"
              >
                Salir
              </button>
            </>
          )}
        </nav>
      </section>
    </header>
  );
};

export default PrincipalHeader;
