import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
} from "react";

import "./App.css";

/* =========================================================
   PÁGINAS GENERALES
========================================================= */

import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Verify from "./pages/auth/Verify";
import ResetPasswordSendEmail from "./pages/auth/ResetPasswordSendEmail";
import ChangePassword from "./pages/auth/ChangePassword";

import ValidacionPago from "./pages/ValidacionPago";
import Dashboard from "./pages/Dashboard";
import Secretaria from "./pages/Secretaria";
import Instituto from "./pages/Instituto";
import UserEdit from "./pages/UserEdit";

import EvaluacionDocente from "./pages/EvaluacionDocente";
import EvaluacionCurso from "./pages/EvaluacionCurso";

/* =========================================================
   COMPONENTES COMPARTIDOS
========================================================= */

import Alert from "./components/shared/Alert";
import PrincipalHeader from "./components/shared/PrincipalHeader";
import Footer from "./components/shared/Footer";

/* =========================================================
   FORMULARIOS
========================================================= */

import RegistroAlumnos from "./components/Formularios/RegistroAlumnos";

import {
  RegistroPagos,
} from "./components/Formularios/RegistroPagos";

/* =========================================================
   RUTAS PROTEGIDAS
========================================================= */

import ProtectedRoutes from "./routes/ProtectedRoutes";
import ValidadorProtectedRoute from "./routes/ValidadorProtectedRoute";
import SubAdminProtectedRoutes from "./routes/SubAdminProtectedRoutes";
import SecretariaRoutes from "./routes/SecretariaRoutes";
import InstitutoProtectedRoute from "./routes/InstitutoProtectedRoute";
import SuperAdminProtectedRoute from "./routes/SuperAdminProtectedRoute";

/* =========================================================
   CURSOS / SERVICIOS
========================================================= */

import CursoInfo from "./components/Cursos/CursoInfo";

import Ipel from "./components/Servicios/Ipel";
import Ipp from "./components/Servicios/Ipp";
import Capacitaciones from "./components/Servicios/Capacitaciones";
import Membresias from "./components/Servicios/Membresias";
import Franquicias from "./components/Servicios/Franquicias";
import SistemaDeEvaluacion from "./components/Servicios/SistemaDeEvaluacion";

/* =========================================================
   PROYECTO PENSAR
========================================================= */

import ProyectoPensarRegistro from "./pages/ProyectoPensarRegistro";
import ProyectoPensarTest from "./pages/ProyectoPensarTest";
import ProyectoPensarPago from "./pages/ProyectoPensarPago";
import ProyectoPensarResultado from "./pages/ProyectoPensarResultado";
import ProyectoPensarResultadoAdmin from "./pages/ProyectoPensarResultadoAdmin";
import ProyectoPensarPdfPreview from "./pages/ProyectoPensarPdfPreview";

/* =========================================================
   APP
========================================================= */

const App = () => {
  const location =
    useLocation();

  /* =======================================================
     RUTAS PÚBLICAS INDEPENDIENTES
     
     Estas páginas llegan principalmente desde enlaces
     enviados por correo.

     No deben cargar:
     - PrincipalHeader
     - Footer
     - lógica de autenticación del header
  ======================================================= */

  const publicStandaloneRoutes = [
    "/test-psicotecnico/",
    "/pago-test/",
    "/resultado-psicometrico/",
  ];

  const isStandalonePublicPage =
    publicStandaloneRoutes.some(
      (route) =>
        location.pathname.startsWith(
          route,
        ),
    );

  /* =======================================================
     HEADER
  ======================================================= */

  const showHeader =
    location.pathname !== "/" &&
    !isStandalonePublicPage;

  /* =======================================================
     SCROLL AL CAMBIAR DE RUTA
  ======================================================= */

  useEffect(() => {
    window.scrollTo(
      0,
      0,
    );
  }, [
    location.pathname,
  ]);

  /* =======================================================
     COMUNICACIÓN CON REACT NATIVE
  ======================================================= */

  useEffect(() => {
    window.__RN_LOGOUT__ =
      () => {
        try {
          window.ReactNativeWebView?.postMessage(
            JSON.stringify({
              type:
                "LOGOUT",
            }),
          );
        } catch {
          // No hacer nada
          // si no estamos dentro
          // de React Native.
        }
      };

    return () => {
      delete window.__RN_LOGOUT__;
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div>
      {/* =================================================
          HEADER
      ================================================= */}

      {showHeader && (
        <PrincipalHeader />
      )}

      {/* =================================================
          CONTENIDO PRINCIPAL
      ================================================= */}

      <main
        className={
          showHeader
            ? "app-main app-main--with-header"
            : "app-main"
        }
      >
        <Routes>
          {/* =============================================
              LANDING
          ============================================= */}

          <Route
            path="/"
            element={
              <LandingPage />
            }
          />

          {/* =============================================
              SERVICIOS
          ============================================= */}

          <Route
            path="/servicios/ipel"
            element={<Ipel />}
          />

          <Route
            path="/servicios/ipp"
            element={<Ipp />}
          />

          <Route
            path="/servicios/capacitaciones"
            element={
              <Capacitaciones />
            }
          />

          <Route
            path="/servicios/membresias"
            element={
              <Membresias />
            }
          />

          <Route
            path="/servicios/franquicias"
            element={
              <Franquicias />
            }
          />

          <Route
            path="/servicios/sistema_evaluación"
            element={
              <SistemaDeEvaluacion />
            }
          />

          {/* =============================================
              AUTENTICACIÓN
          ============================================= */}

          <Route
            path="/register"
            element={
              <Register />
            }
          />

          <Route
            path="/verify/:code"
            element={
              <Verify />
            }
          />

          <Route
            path="/reset_password"
            element={
              <ResetPasswordSendEmail />
            }
          />

          <Route
            path="/reset_password/:code"
            element={
              <ChangePassword />
            }
          />

          <Route
            path="/login"
            element={
              <Login />
            }
          />

          {/* =============================================
              INSCRIPCIÓN / PAGOS TRADICIONALES
          ============================================= */}

          <Route
            path="/register_discente/:code"
            element={
              <RegistroAlumnos />
            }
          />

          <Route
            path="/register_pago/:code"
            element={
              <RegistroPagos />
            }
          />

          {/* =============================================
              PROYECTO PENSAR
              REGISTRO PÚBLICO
          ============================================= */}

          <Route
            path="/proyectopensar"
            element={
              <ProyectoPensarRegistro />
            }
          />

          {/* =============================================
              PROYECTO PENSAR
              REALIZAR TEST POR TOKEN
              PÚBLICO / SIN LOGIN
          ============================================= */}

          <Route
            path="/test-psicotecnico/:token"
            element={
              <ProyectoPensarTest />
            }
          />

          {/* =============================================
              PROYECTO PENSAR
              REGISTRAR PAGO POR TOKEN
              PÚBLICO / SIN LOGIN
          ============================================= */}

          <Route
            path="/pago-test/:token"
            element={
              <ProyectoPensarPago />
            }
          />

          {/* =============================================
              PROYECTO PENSAR
              RESULTADO PÚBLICO POR TOKEN
          ============================================= */}

          <Route
            path="/resultado-psicometrico/:token"
            element={
              <ProyectoPensarResultado />
            }
          />

          {/* =============================================
              PROYECTO PENSAR
              RESULTADO ADMINISTRATIVO
              
              Esta ruta NO es standalone pública.
              Conserva header y sesión administrativa.
          ============================================= */}

          <Route
            path="/resultado-psicometrico-admin/:evaluationId"
            element={
              <ProyectoPensarResultadoAdmin />
            }
          />

          <Route
            path="/resultado-psicometrico-pdf-preview/:evaluationId"
            element={
              <ProyectoPensarPdfPreview />
            }
          />

          {/* =============================================
              CURSOS
          ============================================= */}

          <Route
            path="/curso/:code"
            element={
              <CursoInfo />
            }
          />

          {/* =============================================
              RUTAS PROTEGIDAS
          ============================================= */}

          <Route
            element={
              <ProtectedRoutes />
            }
          >
            {/* ===========================================
                HOME
            =========================================== */}

            <Route
              path="/home"
              element={
                <Home />
              }
            />

            {/* ===========================================
                EVALUACIÓN CURSO
            =========================================== */}

            <Route
              path="/evaluacion/:inscripcionId"
              element={
                <EvaluacionCurso />
              }
            />

            <Route
              path="/evaluar-curso/:token"
              element={
                <EvaluacionCurso />
              }
            />

            {/* ===========================================
                INSTITUTO
            =========================================== */}

            <Route
              element={
                <InstitutoProtectedRoute />
              }
            >
              <Route
                path="/instituto"
                element={
                  <Instituto />
                }
              />
            </Route>

            {/* ===========================================
                SECRETARÍA
            =========================================== */}

            <Route
              element={
                <SecretariaRoutes />
              }
            >
              <Route
                path="/secre"
                element={
                  <Secretaria />
                }
              />
            </Route>

            {/* ===========================================
                VALIDADOR
            =========================================== */}

            <Route
              element={
                <ValidadorProtectedRoute />
              }
            >
              <Route
                path="/validacion"
                element={
                  <ValidacionPago />
                }
              />

              {/* =========================================
                  SUB ADMIN
              ========================================= */}

              <Route
                element={
                  <SubAdminProtectedRoutes />
                }
              >
                <Route
                  path="/dashboard"
                  element={
                    <Dashboard />
                  }
                />

                {/* =======================================
                    SUPER ADMIN
                ======================================= */}

                <Route
                  element={
                    <SuperAdminProtectedRoute />
                  }
                >
                  <Route
                    path="/edit_user"
                    element={
                      <UserEdit />
                    }
                  />

                  <Route
                    path="/evaluacion-docente"
                    element={
                      <EvaluacionDocente />
                    }
                  />
                </Route>
              </Route>
            </Route>
          </Route>
        </Routes>
      </main>

      {/* =================================================
          FOOTER

          No se monta en:
          - test psicotécnico
          - pago psicométrico
          - resultado público
      ================================================= */}

      {!isStandalonePublicPage && (
        <Footer />
      )}

      {/* =================================================
          ALERTAS GLOBALES
      ================================================= */}

      <Alert />
    </div>
  );
};

export default App;