import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./styles/PrincipalHeader.css";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useAuth from "../../hooks/useAuth";

import { FaBars, FaTimes } from "react-icons/fa";

const PrincipalHeader = () => {
  

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { key: locationKey } = useLocation();
  const dispatch = useDispatch();

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);
  const role = token ? user?.role : null;
  const superAdmin = !!role && user.isSuperAdmin === true;
  const admin = role === "Administrador";
  const subAdmin = role === "Sub-Administrador";
  const canValidate = superAdmin || admin || subAdmin || role === "Validador";
  const canSecretary = superAdmin || admin || subAdmin || role === "Secretaria";

  const navGroups = [
    { id: "inicio", label: "Inicio", items: [{ to: token ? "/home" : "/", label: "Inicio" }] },
    { id: "operaciones", label: "Operaciones", items: [
      canSecretary && { to: "/secre", label: "Secretaría" },
      canValidate && { to: "/validacion", label: "Validación" },
    ] },
    { id: "reportes", label: "Reportes", items: [
      (superAdmin || admin) && { to: "/dashboard", label: "Dashboard" },
      superAdmin && { to: "/evaluacion-docente", label: "Informe de satisfacción" },
    ] },
    { id: "afiliados", label: token ? "Afiliados" : "Afíliate", items: [
      { to: "/afiliados", label: "Mi negocio" },
      (superAdmin || admin) && { to: "/admin-afiliados", label: "Red de afiliados" },
    ], directLabel: token ? "Afiliados" : "Afíliate" },
    { id: "admin", label: "Administración", items: [
      superAdmin && { to: "/edit_user", label: "Administración" },
    ] },
  ];

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

  useEffect(() => {
    setMenuOpen(false);
    setActiveGroup(null);
  }, [locationKey, token, role]);

  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 960px)");
    const reset = () => { setMenuOpen(false); setActiveGroup(null); };
    breakpoint.addEventListener("change", reset);
    return () => breakpoint.removeEventListener("change", reset);
  }, []);

  useEffect(() => {
    if (!menuOpen && !activeGroup) return;
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
        setActiveGroup(null);
      }
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (activeGroup) {
        headerRef.current?.querySelector(".ph-nav-toggle[aria-expanded='true']")?.focus();
        setActiveGroup(null);
      } else {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, activeGroup]);

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

  const closeMenu = () => {
    setMenuOpen(false);
    setActiveGroup(null);
  };

  const renderNav = (surface) => navGroups.map(({ id, label, items, directLabel }) => {
    const available = items.filter(Boolean);
    if (!available.length) return null;
    if (available.length === 1) {
      const [item] = available;
      return <Link key={id} to={item.to} onClick={closeMenu}>{directLabel || item.label}</Link>;
    }

    const groupId = `ph-${surface}-${id}`;
    const open = activeGroup === groupId;
    return (
      <div className="ph-nav-group" key={id}>
        <button
          type="button"
          className="ph-nav-toggle"
          aria-expanded={open}
          aria-controls={groupId}
          onClick={() => setActiveGroup((current) => current === groupId ? null : groupId)}
        >
          {label} <span aria-hidden="true">▾</span>
        </button>
        <div className="ph-nav-submenu" id={groupId} hidden={!open}>
          {available.map((item) => (
            <Link key={item.to} to={item.to} onClick={closeMenu}>{item.label}</Link>
          ))}
        </div>
      </div>
    );
  });

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
    );
  };

  /** MENÚ MOBILE (igual LandingPage: links + auth dentro) */
  const renderMobileMenu = () => {
    return (
      <div id="ph-mobile-navigation" className={`navbar_mobile_menu ${menuOpen ? "navbar_mobile_menu--open" : ""}`} hidden={!menuOpen}>
        {menuOpen && renderNav("mobile")}
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
    <header className="header_nav ph-header" ref={headerRef}>
      <nav className="navbar" aria-label="Navegación principal">
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
        <button
          type="button"
          ref={menuButtonRef}
          className="menu_icon"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="ph-mobile-navigation"
          onClick={() => { if (menuOpen) closeMenu(); else { setActiveGroup(null); setMenuOpen(true); } }}
        >
          {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>

        <div className="navbar_links">{renderNav("desktop")}</div>

        {/* Auth derecha (mismo div que navbar, igual Landing) */}
        <div className="topbar-right">{renderAuthRight()}</div>
      </nav>

      {/* Mobile menu */}
      {renderMobileMenu()}
    </header>
  );
};

export default PrincipalHeader;
