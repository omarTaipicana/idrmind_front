import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/PrincipalHeader.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useAuth from "../../hooks/useAuth";

import { FaBars, FaTimes } from "react-icons/fa";

const PrincipalHeader = () => {
  const superAdmin = import.meta.env.VITE_CI_SUPERADMIN;

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
    grado7: false,
  });

  // Configurar grados según CI o rol
  useEffect(() => {
    if (!user?.role) return;

    const ci = user?.cI;
    const role = user?.role;

    setGrados({
      grado1: ci === superAdmin, // Superadmin (acceso total)
      grado2: role === "Administrador",
      grado3: role === "Sub-Administrador",
      grado4: role === "Validador",
      grado5: role === "Secretaria",
      grado6: role?.slice(0, 9) === "instituto",
      grado7: ![
        superAdmin,
        "Administrador",
        "Sub-Administrador",
        "Validador",
        "Secretaria",
      ].includes(role),
    });
  }, [user, superAdmin]);

  // Validar token
  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;

      const success = await loggedUser();

      if (!success) {
        console.log("❌ Token inválido, removido");
        localStorage.removeItem("token");
        setUserLogged(null);
        window.__RN_LOGOUT__?.();
      }
    };
    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Cerrar menú si se agranda a desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

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

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  /** LINKS SEGÚN ROL (misma lógica) */
  const renderRoleLinks = (onClick) => {
    if (!token) return null;

    if (grados.grado1) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/instituto" onClick={onClick}>
            Instituto
          </Link>
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
          <Link to="/dashboard" onClick={onClick}>
            Dashboard
          </Link>
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
          <Link to="/edit_user" onClick={onClick}>
            Editar Usuario
          </Link>
        </>
      );
    }

    if (grados.grado2) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
          <Link to="/dashboard" onClick={onClick}>
            Dashboard
          </Link>
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
        </>
      );
    }

    if (grados.grado3) {
      return (
        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
        </>
      );
    }

    if (grados.grado4) {
      return (


        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
        </>


      );
    }
    if (grados.grado5) {
      return (


        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/secre" onClick={onClick}>
            Secretaria
          </Link>
        </>
      );
    }
    if (grados.grado6) {
      return (


        <>
          <Link to="/home" onClick={onClick}>
            Home
          </Link>
          <Link to="/instituto" onClick={onClick}>
            Instituto
          </Link>
        </>
      );
    }


    return null;
  };

  /** LINKS DE ACCIONES (misma lógica que tu renderAuthDesktop) */
  const renderAuthActions = (onClick) => {
    if (!token) return null;

    if (grados.grado1) {
      return (
        <>
          <Link to="/dashboard" onClick={onClick}>
            Dashboard
          </Link>
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
          <Link to="/edit_user" onClick={onClick}>
            Editar Usuario
          </Link>
        </>
      );
    }

    if (grados.grado2) {
      return (
        <>
          <Link to="/dashboard" onClick={onClick}>
            Dashboard
          </Link>
          <Link to="/validacion" onClick={onClick}>
            Validacion
          </Link>
        </>
      );
    }

    if (grados.grado3) {
      return (
        <Link to="/secre" onClick={onClick}>
          Secretaria
        </Link>
      );
    }

    if (grados.grado4) {
      return (
        <Link to="/validacion" onClick={onClick}>
          Validacion
        </Link>
      );
    }

    if (grados.grado5) {
      return (
        <Link to="/secre" onClick={onClick}>
          Secretaria
        </Link>
      );
    }

    if (grados.grado6) {
      return (
        <Link to="/instituto" onClick={onClick}>
          Instituto
        </Link>
      );
    }

    return null;
  };

  /** AUTH A LA DERECHA (igual LandingPage) */
  const renderAuthRight = () => {
    if (!token) {
      return (
        <>
          <button type="button" className="topbar-link" onClick={() => navigate("/register")}>
            Registrarse
          </button>
          <span className="topbar-separator">|</span>
          <button type="button" className="topbar-link" onClick={() => navigate("/login")}>
            Ingresar
          </button>
        </>
      );
    }

    return (
      <>
        <button type="button" className="topbar-link" onClick={() => navigate("/login")}>
          Mi cuenta
        </button>
      </>
    );
  };

  /** MENÚ MOBILE (igual LandingPage: links + auth dentro) */
  const renderMobileMenu = () => {
    return (
      <div className={`navbar_mobile_menu ${menuOpen ? "navbar_mobile_menu--open" : ""}`}>
        {/* Links (roles) */}
        {token ? (
          <>
            <button type="button" onClick={() => { closeMenu(); navigate("/home"); }}>
              Home
            </button>

            {/* Mantener exactamente tus rutas por rol */}
            {grados.grado1 && (
              <>
                <button type="button" onClick={() => { closeMenu(); navigate("/instituto"); }}>
                  Instituto
                </button>
                <button type="button" onClick={() => { closeMenu(); navigate("/secre"); }}>
                  Secretaria
                </button>
              </>
            )}

            {grados.grado2 && (
              <button type="button" onClick={() => { closeMenu(); navigate("/secre"); }}>
                Secretaria
              </button>
            )}

            {grados.grado3 && (
              <button type="button" onClick={() => { closeMenu(); navigate("/validacion"); }}>
                Validacion
              </button>
            )}
          </>
        ) : (
          <>
            <button type="button" onClick={() => { closeMenu(); navigate("/"); }}>
              Inicio
            </button>
          </>
        )}

        {/* Acciones (derecha desktop) */}
        {token && (
          <>
           
            {grados.grado1 && (
              <>
                <button type="button" onClick={() => { closeMenu(); navigate("/dashboard"); }}>
                  Dashboard
                </button>
                <button type="button" onClick={() => { closeMenu(); navigate("/validacion"); }}>
                  Validacion
                </button>
                <button type="button" onClick={() => { closeMenu(); navigate("/edit_user"); }}>
                  Editar Usuario
                </button>
              </>
            )}

            {grados.grado2 && (
              <>
                <button type="button" onClick={() => { closeMenu(); navigate("/dashboard"); }}>
                  Dashboard
                </button>
                <button type="button" onClick={() => { closeMenu(); navigate("/validacion"); }}>
                  Validacion
                </button>
              </>
            )}

            {grados.grado3 && (
              <button type="button" onClick={() => { closeMenu(); navigate("/secre"); }}>
                Secretaria
              </button>
            )}

            {grados.grado4 && (
              <button type="button" onClick={() => { closeMenu(); navigate("/validacion"); }}>
                Validacion
              </button>
            )}

            {grados.grado5 && (
              <button type="button" onClick={() => { closeMenu(); navigate("/secre"); }}>
                Secretaria
              </button>
            )}

            {grados.grado6 && (
              <button type="button" onClick={() => { closeMenu(); navigate("/instituto"); }}>
                Instituto
              </button>
            )}
          </>
        )}

        {/* Auth */}
        <div className="navbar_mobile_divider" />

        {!token ? (
          <div className="navbar_mobile_auth">
            <button type="button" onClick={() => { closeMenu(); navigate("/register"); }}>
              Registrarse
            </button>
            <button type="button" onClick={() => { closeMenu(); navigate("/login"); }}>
              Ingresar
            </button>
          </div>
        ) : (
          <div className="navbar_mobile_auth">
            <button type="button" onClick={() => { closeMenu(); navigate("/login"); }}>
              Mi cuenta
            </button>
            <button
              type="button"
              className="logout__button"
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
            >
              Salir
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="header_nav">
      <nav className="navbar">
        {/* Logo izquierda (igual Landing) */}
        <img
          src="/images/idrmind_logo_sf.png"
          alt="Logo iDr.Mind"
          className="logo_navbar_ph"
          onClick={() => {
            closeMenu();
            navigate("/");
          }}
        />

        {/* Hamburguesa (mobile) */}
        <div className="menu_icon" onClick={toggleMenu} aria-label="Abrir menú">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        {/* Links (centro) */}
        <div className="navbar_links">
          {/* si no hay token, puedes dejar vacío o poner "Inicio" (como Landing pone Inicio) */}
          {!token ? (
            <button type="button" className="navbtn" onClick={() => navigate("/")}>
              Inicio
            </button>
          ) : (
            <>
              {/* conservas tu lógica exacta con Links */}
              {renderRoleLinks(closeMenu)}
            </>
          )}
        </div>

        {/* Auth derecha (mismo div que navbar, igual Landing) */}
        <div className="topbar-right">{renderAuthRight()}</div>
      </nav>

      {/* Mobile menu */}
      {renderMobileMenu()}
    </header>
  );
};

export default PrincipalHeader;
