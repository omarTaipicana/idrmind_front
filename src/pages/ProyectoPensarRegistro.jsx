import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";

import "./styles/ProyectoPensarRegistro.css";

/* =========================================================
   RUTAS
========================================================= */

const PATH_COURSES = "/courses";
const PATH_EMPRESAS =
  "/empresas/public";

const PATH_EMPRESA_SECCIONES =
  "/empresa-secciones/public";

const PATH_PSYCHOMETRIC_REGISTER =
  "/psychometric/register";

/* =========================================================
   ESTADO INICIAL
========================================================= */

const INITIAL_FORM = {
  cedula: "",
  email: "",
  nombres: "",
  apellidos: "",
  celular: "",

  aceptacion: false,
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.rows)) {
    return value.rows;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
};

const isEnabled = (value) => {
  return ![
    false,
    0,
    "0",
    "false",
  ].includes(value);
};

const formatName = (value = "") => {
  return String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" ");
};

/* =========================================================
   COMPONENTE
========================================================= */

const ProyectoPensarRegistro = () => {
  const navigate = useNavigate();

  /* =======================================================
     FORMULARIO
  ======================================================= */

  const [form, setForm] = useState(
    INITIAL_FORM
  );

  const [
    participacionEmpresarial,
    setParticipacionEmpresarial,
  ] = useState(false);

  const [
    empresaSeleccionada,
    setEmpresaSeleccionada,
  ] = useState("");

  const [
    seccionSeleccionada,
    setSeccionSeleccionada,
  ] = useState("");

  const [message, setMessage] =
    useState("");

  const [localError, setLocalError] =
    useState("");

  /* =======================================================
     APIs
  ======================================================= */

  const [
    courses,
    getCourses,
    ,
    ,
    ,
    coursesError,
    isLoadingCourses,
  ] = useCrud();

  const [
    empresas,
    getEmpresas,
    ,
    ,
    ,
    empresasError,
    isLoadingEmpresas,
  ] = useCrud();

  const [
    empresaSecciones,
    getEmpresaSecciones,
    ,
    ,
    ,
    seccionesError,
    isLoadingSecciones,
  ] = useCrud();

  const [
    ,
    ,
    postPsychometricRegister,
    ,
    ,
    registerError,
    isLoadingRegister,
    registrationResult,
  ] = useCrud();

  /* =======================================================
     LISTAS NORMALIZADAS
  ======================================================= */

  const coursesList = useMemo(() => {
    return normalizeList(courses);
  }, [courses]);

  const empresasList = useMemo(() => {
    return normalizeList(empresas).filter(
      (empresa) =>
        isEnabled(empresa?.activo)
    );
  }, [empresas]);

  const seccionesList = useMemo(() => {
    return normalizeList(
      empresaSecciones
    ).filter(
      (seccion) =>
        isEnabled(seccion?.activo)
    );
  }, [empresaSecciones]);

  /* =======================================================
     IDENTIFICAR TEST
  ======================================================= */

  const psychometricCourse = useMemo(() => {
    return coursesList.find((course) => {
      const sigla = String(
        course?.sigla || ""
      )
        .trim()
        .toLowerCase();

      const tipo = String(
        course?.tipo || ""
      )
        .trim()
        .toLowerCase();

      const esTest =
        sigla ===
        "test_psicotecnico" ||
        sigla ===
        "test_psicometrico" ||
        tipo ===
        "test_psicotecnico" ||
        tipo ===
        "test_psicometrico";

      return (
        esTest &&
        isEnabled(course?.vigente)
      );
    });
  }, [coursesList]);

  /* =======================================================
     CARGA INICIAL
  ======================================================= */

  useEffect(() => {
    getCourses(PATH_COURSES);

    getEmpresas(
      `${PATH_EMPRESAS}?activo=true`
    );
  }, []);

  /* =======================================================
     CARGAR SECCIONES
  ======================================================= */

  useEffect(() => {
    if (
      !participacionEmpresarial ||
      !empresaSeleccionada
    ) {
      setSeccionSeleccionada("");
      return;
    }

    getEmpresaSecciones(
      `${PATH_EMPRESA_SECCIONES}` +
      `?empresaId=${empresaSeleccionada}` +
      `&activo=true`
    );
  }, [
    participacionEmpresarial,
    empresaSeleccionada,
  ]);

  /* =======================================================
     RESPUESTA DE REGISTRO
  ======================================================= */

  useEffect(() => {
    if (!registrationResult) return;

    setMessage(
      registrationResult?.message ||
      "Registro completado. Revisa tu correo para acceder al test."
    );

    setLocalError("");

    setForm(INITIAL_FORM);
    setParticipacionEmpresarial(false);
    setEmpresaSeleccionada("");
    setSeccionSeleccionada("");
  }, [registrationResult]);

  /* =======================================================
     ERRORES API
  ======================================================= */

  useEffect(() => {
    const requestError =
      coursesError ||
      empresasError ||
      seccionesError ||
      registerError;

    if (!requestError) return;

    const apiMessage =
      requestError?.response?.data
        ?.message ||
      requestError?.response?.data
        ?.error ||
      "Ocurrió un error al procesar la solicitud.";

    setLocalError(apiMessage);
  }, [
    coursesError,
    empresasError,
    seccionesError,
    registerError,
  ]);

  /* =======================================================
     CAMBIOS DEL FORMULARIO
  ======================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setLocalError("");
    setMessage("");
  };

  const selectIndividual = () => {
    setParticipacionEmpresarial(false);
    setEmpresaSeleccionada("");
    setSeccionSeleccionada("");

    setLocalError("");
    setMessage("");
  };

  const selectEnterprise = () => {
    setParticipacionEmpresarial(true);

    setLocalError("");
    setMessage("");
  };

  const handleEmpresaChange = (
    event
  ) => {
    const empresaId =
      event.target.value;

    setEmpresaSeleccionada(
      empresaId
    );

    setSeccionSeleccionada("");

    setLocalError("");
    setMessage("");
  };

  /* =======================================================
     VALIDACIÓN
  ======================================================= */

  const validateForm = () => {
    if (!psychometricCourse) {
      return (
        "No se encontró un test psicométrico " +
        "vigente con la sigla test_psicotecnico."
      );
    }

    if (!form.cedula.trim()) {
      return (
        "Ingrese su número de " +
        "identificación."
      );
    }

    if (!form.email.trim()) {
      return (
        "Ingrese su correo electrónico."
      );
    }

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      );

    if (!validEmail) {
      return (
        "Ingrese un correo electrónico válido."
      );
    }

    if (!form.nombres.trim()) {
      return "Ingrese sus nombres.";
    }

    if (!form.apellidos.trim()) {
      return "Ingrese sus apellidos.";
    }

    const celular = String(
      form.celular || ""
    ).replace(/\D/g, "");

    if (
      celular &&
      !/^09\d{8}$/.test(celular)
    ) {
      return (
        "El celular debe iniciar con 09 " +
        "y tener 10 dígitos."
      );
    }

    if (
      participacionEmpresarial &&
      !empresaSeleccionada
    ) {
      return (
        "Seleccione la empresa a la que pertenece."
      );
    }

    if (
      participacionEmpresarial &&
      !seccionSeleccionada
    ) {
      return (
        "Seleccione la sección de la empresa."
      );
    }

    if (!form.aceptacion) {
      return (
        "Debe aceptar el tratamiento " +
        "de datos para continuar."
      );
    }

    return null;
  };

  /* =======================================================
     ENVIAR REGISTRO
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError("");
    setMessage("");

    const payload = {
      cedula: String(form.cedula)
        .trim()
        .replace(/\s+/g, ""),

      email: String(form.email)
        .trim()
        .toLowerCase(),

      nombres: formatName(
        form.nombres
      ),

      apellidos: formatName(
        form.apellidos
      ),

      celular:
        String(form.celular || "")
          .replace(/\D/g, "") ||
        null,

      empresaId:
        participacionEmpresarial
          ? empresaSeleccionada
          : null,

      seccionId:
        participacionEmpresarial
          ? seccionSeleccionada
          : null,

      courseId:
        psychometricCourse.id,

      aceptacion: true,
    };

    postPsychometricRegister(
      PATH_PSYCHOMETRIC_REGISTER,
      payload
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  const isLoading =
    isLoadingCourses ||
    isLoadingEmpresas ||
    isLoadingSecciones ||
    isLoadingRegister;

  return (
    <main className="pensar-register">
      {isLoading && <IsLoading />}

      <div className="pensar-register__background">
        <span className="pensar-register__shape pensar-register__shape--one" />

        <span className="pensar-register__shape pensar-register__shape--two" />
      </div>

      <section className="pensar-register__shell">
        <button
          type="button"
          className="pensar-register__back"
          onClick={() => navigate("/")}
        >
          ← Volver al inicio
        </button>

        {/* =====================================
            INTRO
        ===================================== */}

        <aside className="pensar-register__intro">
          <div className="pensar-register__brand">
            <img
              src="/images/test_logo.png"
              alt="Proyecto Pensar"
            />
          </div>

          <span className="pensar-register__badge">
            Evaluación de habilidades
            blandas
          </span>

          <h1>
            Inicia tu proceso de evaluación
          </h1>

          <p>
            Completa tus datos. Al finalizar
            el registro recibirás en tu correo
            un enlace personal y seguro para
            desarrollar el test.
          </p>

          <div className="pensar-register__steps">
            <article>
              <strong>1</strong>
              <span>
                Registra tus datos
              </span>
            </article>

            <article>
              <strong>2</strong>
              <span>
                Recibe el enlace
              </span>
            </article>

            <article>
              <strong>3</strong>
              <span>
                Desarrolla el test
              </span>
            </article>
          </div>
        </aside>

        {/* =====================================
            FORMULARIO
        ===================================== */}

        <form
          className="pensar-register__form"
          onSubmit={handleSubmit}
        >
          <div className="pensar-register__form-header">
            <div>
              <span>Registro</span>

              <h2>
                Información del participante
              </h2>
            </div>

            {psychometricCourse && (
              <div className="pensar-register__course">
                <small>
                  Evaluación disponible
                </small>

                <strong>
                  {psychometricCourse.nombre}
                </strong>
              </div>
            )}
          </div>

          {/* =================================
              MENSAJES
          ================================= */}

          {localError && (
            <div
              className="pensar-register__message pensar-register__message--error"
              role="alert"
            >
              {localError}
            </div>
          )}

          {message && (
            <div
              className="pensar-register__message pensar-register__message--success"
              role="status"
            >
              <strong>
                Registro completado
              </strong>

              <span>{message}</span>

              <span>
                Revisa también la carpeta de
                correo no deseado.
              </span>
            </div>
          )}

          {/* =================================
              DATOS PERSONALES
          ================================= */}

          <div className="pensar-register__grid">
            <label className="pensar-register__field">
              <span>
                Identificación *
              </span>

              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                placeholder="Cédula o pasaporte"
                autoComplete="off"
              />
            </label>

            <label className="pensar-register__field">
              <span>
                Correo electrónico *
              </span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
            </label>

            <label className="pensar-register__field">
              <span>Nombres *</span>

              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                placeholder="Tus nombres"
                autoComplete="given-name"
              />
            </label>

            <label className="pensar-register__field">
              <span>Apellidos *</span>

              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                placeholder="Tus apellidos"
                autoComplete="family-name"
              />
            </label>

            <label className="pensar-register__field pensar-register__field--full">
              <span>Celular</span>

              <input
                type="text"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                placeholder="09XXXXXXXX"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
              />
            </label>
          </div>

          {/* =================================
              EMPRESA Y SECCIÓN
          ================================= */}

          <section className="pensar-register__company">
            <div className="pensar-register__section-title">
              <span>Organización</span>

              <h3>
                ¿Perteneces a una empresa?
              </h3>
            </div>

            <div className="pensar-register__company-options">
              <label>
                <input
                  type="radio"
                  name="tipoParticipacion"
                  checked={
                    !participacionEmpresarial
                  }
                  onChange={
                    selectIndividual
                  }
                />

                <span>
                  <strong>
                    Participación individual
                  </strong>

                  No pertenezco a una empresa
                  registrada
                </span>
              </label>

              <label>
                <input
                  type="radio"
                  name="tipoParticipacion"
                  checked={
                    participacionEmpresarial
                  }
                  onChange={
                    selectEnterprise
                  }
                />

                <span>
                  <strong>
                    Participación empresarial
                  </strong>

                  Pertenezco a una empresa o
                  institución
                </span>
              </label>
            </div>

            {/* =================================
                SELECTORES EMPRESARIALES
            ================================= */}

            {participacionEmpresarial && (
              <div className="pensar-register__grid pensar-register__company-fields">
                <label className="pensar-register__field">
                  <span>Empresa *</span>

                  <select
                    value={
                      empresaSeleccionada
                    }
                    onChange={
                      handleEmpresaChange
                    }
                  >
                    <option value="">
                      Seleccione una empresa
                    </option>

                    {empresasList.map(
                      (empresa) => (
                        <option
                          key={empresa.id}
                          value={empresa.id}
                        >
                          {empresa.nombreComercial ||
                            empresa.razonSocial ||
                            empresa.nombre ||
                            "Empresa sin nombre"}
                        </option>
                      )
                    )}
                  </select>

                  {!isLoadingEmpresas &&
                    empresasList.length ===
                    0 && (
                      <small className="registro_field_error">
                        No existen empresas
                        disponibles.
                      </small>
                    )}
                </label>

                <label className="pensar-register__field">
                  <span>
                    Sección o departamento *
                  </span>

                  <select
                    value={
                      seccionSeleccionada
                    }
                    onChange={(event) =>
                      setSeccionSeleccionada(
                        event.target.value
                      )
                    }
                    disabled={
                      !empresaSeleccionada ||
                      isLoadingSecciones
                    }
                  >
                    <option value="">
                      {isLoadingSecciones
                        ? "Cargando secciones..."
                        : empresaSeleccionada
                          ? "Seleccione una sección"
                          : "Primero seleccione una empresa"}
                    </option>

                    {seccionesList.map(
                      (seccion) => (
                        <option
                          key={seccion.id}
                          value={seccion.id}
                        >
                          {seccion.nombre}
                        </option>
                      )
                    )}
                  </select>

                  {empresaSeleccionada &&
                    !isLoadingSecciones &&
                    seccionesList.length ===
                    0 && (
                      <small className="registro_field_error">
                        Esta empresa no tiene
                        secciones disponibles.
                      </small>
                    )}
                </label>
              </div>
            )}
          </section>

          {/* =================================
              ACEPTACIÓN
          ================================= */}

          <label className="pensar-register__acceptance">
            <input
              type="checkbox"
              name="aceptacion"
              checked={
                form.aceptacion
              }
              onChange={handleChange}
            />

            <span>
              Acepto el tratamiento de mis
              datos para gestionar esta
              evaluación y recibir las
              comunicaciones relacionadas con
              el test.
            </span>
          </label>

          {/* =================================
              ENVÍO
          ================================= */}

          <button
            type="submit"
            className="pensar-register__submit"
            disabled={
              isLoadingRegister ||
              !psychometricCourse
            }
          >
            {isLoadingRegister
              ? "Registrando..."
              : "Registrarme y recibir enlace"}
          </button>

          {!isLoadingCourses &&
            !psychometricCourse && (
              <p className="pensar-register__unavailable">
                El test psicométrico no se
                encuentra disponible actualmente.
              </p>
            )}
        </form>
      </section>
    </main>
  );
};

export default ProyectoPensarRegistro;