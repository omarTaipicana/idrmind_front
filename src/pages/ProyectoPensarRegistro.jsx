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
const PATH_VALIDATE = "/validate";

const PATH_EMPRESAS =
  "/empresas/public";

const PATH_EMPRESA_SECCIONES =
  "/empresa-secciones/public";

const PATH_PSYCHOMETRIC_REGISTER =
  "/psychometric/register";

/* =========================================================
   MODOS DE PARTICIPACIÓN
========================================================= */

const PARTICIPATION = {
  CURRENT: "current",
  INDIVIDUAL: "individual",
  ENTERPRISE: "enterprise",
};

/* =========================================================
   ESTADO INICIAL
========================================================= */

const INITIAL_FORM = {
  cedula: "",
  email: "",
  nombres: "",
  apellidos: "",
  celular: "",
  dateBirth: "",
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

const normalizeEmail = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase();
};

const getCompanyName = (empresa) => {
  if (!empresa) {
    return "Empresa asignada";
  }

  return (
    empresa.nombreComercial ||
    empresa.razonSocial ||
    empresa.nombre ||
    "Empresa asignada"
  );
};

/* =========================================================
   COMPONENTE
========================================================= */

const ProyectoPensarRegistro = () => {
  const navigate = useNavigate();

  /* =======================================================
     FORMULARIO
  ======================================================= */

  const [form, setForm] =
    useState(INITIAL_FORM);

  /*
   * Primero únicamente verificamos correo.
   */
  const [
    correoValidado,
    setCorreoValidado,
  ] = useState(false);

  const [
    userRegister,
    setUserRegister,
  ] = useState(null);

  const [
    participationMode,
    setParticipationMode,
  ] = useState(
    PARTICIPATION.INDIVIDUAL
  );

  const [
    editingCompany,
    setEditingCompany,
  ] = useState(false);

  const [
    empresaSeleccionada,
    setEmpresaSeleccionada,
  ] = useState("");

  const [
    seccionSeleccionada,
    setSeccionSeleccionada,
  ] = useState("");

  const [
    localError,
    setLocalError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

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

  /*
   * Exactamente el mismo patrón de RegistroAlumnos:
   *
   * postValidate(PATH_VALIDATE, body)
   */
  const [
    ,
    ,
    postValidate,
    ,
    ,
    validateError,
    isLoadingValidate,
    validate,
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
     LISTAS
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
     IDENTIFICAR TEST PSICOMÉTRICO
  ======================================================= */

  const psychometricCourse =
    useMemo(() => {
      return coursesList.find(
        (course) => {
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
            isEnabled(
              course?.vigente
            )
          );
        }
      );
    }, [coursesList]);

  /* =======================================================
     EMPRESA DEL USUARIO
  ======================================================= */

  const empresaUsuario =
    useMemo(() => {
      if (
        !userRegister?.empresaId
      ) {
        return null;
      }

      return (
        empresasList.find(
          (empresa) =>
            String(empresa.id) ===
            String(
              userRegister.empresaId
            )
        ) || null
      );
    }, [
      empresasList,
      userRegister,
    ]);

  const seccionUsuario =
    useMemo(() => {
      if (
        !userRegister?.seccionId
      ) {
        return null;
      }

      return (
        seccionesList.find(
          (seccion) =>
            String(seccion.id) ===
            String(
              userRegister.seccionId
            )
        ) || null
      );
    }, [
      seccionesList,
      userRegister,
    ]);

  const userHasCompany =
    Boolean(
      userRegister?.empresaId
    );

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
      !empresaSeleccionada
    ) {
      return;
    }

    getEmpresaSecciones(
      `${PATH_EMPRESA_SECCIONES}` +
        `?empresaId=${empresaSeleccionada}` +
        `&activo=true`
    );
  }, [empresaSeleccionada]);

  /* =======================================================
     PROCESAR VALIDACIÓN
  ======================================================= */

  useEffect(() => {
    if (!validate) {
      return;
    }

    /*
     * En RegistroAlumnos esto evita
     * reinscribir al mismo curso.
     *
     * Para el test psicométrico probablemente
     * sí permitimos nuevos intentos.
     *
     * Por eso NO bloqueamos por enrolled.
     */

    const usuario =
      validate.user || null;

    setUserRegister(usuario);
    setCorreoValidado(true);

    setLocalError("");
    setMessage("");

    /*
     * Usuario existente.
     */
    if (usuario) {
      setForm((previous) => ({
        ...previous,

        email:
          usuario.email ||
          previous.email,

        cedula:
          usuario.cI ||
          previous.cedula,

        nombres:
          usuario.firstName ||
          previous.nombres,

        apellidos:
          usuario.lastName ||
          previous.apellidos,

        celular:
          usuario.cellular ||
          previous.celular,

        dateBirth:
          usuario.dateBirth ||
          previous.dateBirth,
      }));

      /*
       * Tiene empresa.
       */
      if (
        usuario.empresaId
      ) {
        setParticipationMode(
          PARTICIPATION.CURRENT
        );

        setEmpresaSeleccionada(
          usuario.empresaId
        );

        setSeccionSeleccionada(
          usuario.seccionId || ""
        );

        setEditingCompany(false);

        getEmpresaSecciones(
          `${PATH_EMPRESA_SECCIONES}` +
            `?empresaId=${usuario.empresaId}` +
            `&activo=true`
        );

        return;
      }
    }

    /*
     * Usuario nuevo o existente sin empresa.
     */
    setParticipationMode(
      PARTICIPATION.INDIVIDUAL
    );

    setEmpresaSeleccionada("");
    setSeccionSeleccionada("");

    setEditingCompany(false);
  }, [validate]);

  /* =======================================================
     REGISTRO EXITOSO
  ======================================================= */

  useEffect(() => {
    if (!registrationResult) {
      return;
    }

    setMessage(
      registrationResult?.message ||
        "Registro completado. Revisa tu correo para acceder al test."
    );

    setLocalError("");

    /*
     * No limpiamos instantáneamente el mensaje.
     * Sí limpiamos información del formulario.
     */
    setForm(INITIAL_FORM);

    setCorreoValidado(false);
    setUserRegister(null);

    setEmpresaSeleccionada("");
    setSeccionSeleccionada("");

    setParticipationMode(
      PARTICIPATION.INDIVIDUAL
    );

    setEditingCompany(false);
  }, [registrationResult]);

  /* =======================================================
     ERRORES
  ======================================================= */

  useEffect(() => {
    if (!validateError) {
      return;
    }

    const apiMessage =
      validateError?.response?.data
        ?.message ||
      validateError?.response?.data
        ?.error ||
      "No se pudo validar el usuario.";

    setLocalError(apiMessage);
  }, [validateError]);

  useEffect(() => {
    const requestError =
      coursesError ||
      empresasError ||
      seccionesError ||
      registerError;

    if (!requestError) {
      return;
    }

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

  const handleChange = (
    event
  ) => {
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

  /* =======================================================
     VALIDAR CORREO
  ======================================================= */

  const handleValidateEmail = (
    event
  ) => {
    event.preventDefault();

    setLocalError("");
    setMessage("");

    const email =
      normalizeEmail(
        form.email
      );

    if (!email) {
      setLocalError(
        "Ingrese su correo electrónico."
      );

      return;
    }

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      );

    if (!validEmail) {
      setLocalError(
        "Ingrese un correo electrónico válido."
      );

      return;
    }

    if (!psychometricCourse) {
      setLocalError(
        "El test psicométrico no está disponible."
      );

      return;
    }

    /*
     * Mismo mecanismo utilizado
     * por RegistroAlumnos.
     */
    const body = {
      email,

      code:
        psychometricCourse.sigla,
    };

    postValidate(
      PATH_VALIDATE,
      body
    );
  };

  /* =======================================================
     CAMBIAR CORREO
  ======================================================= */

  const volverAValidar = () => {
    setCorreoValidado(false);

    setUserRegister(null);

    setEmpresaSeleccionada("");
    setSeccionSeleccionada("");

    setParticipationMode(
      PARTICIPATION.INDIVIDUAL
    );

    setEditingCompany(false);

    setForm((previous) => ({
      ...INITIAL_FORM,

      email:
        previous.email || "",
    }));

    setLocalError("");
    setMessage("");
  };

  /* =======================================================
     PARTICIPACIÓN
  ======================================================= */

  const selectCurrentCompany =
    () => {
      if (
        !userRegister?.empresaId
      ) {
        return;
      }

      setParticipationMode(
        PARTICIPATION.CURRENT
      );

      setEmpresaSeleccionada(
        userRegister.empresaId
      );

      setSeccionSeleccionada(
        userRegister.seccionId ||
          ""
      );

      setEditingCompany(false);

      getEmpresaSecciones(
        `${PATH_EMPRESA_SECCIONES}` +
          `?empresaId=${userRegister.empresaId}` +
          `&activo=true`
      );

      setLocalError("");
    };

  const selectIndividual =
    () => {
      setParticipationMode(
        PARTICIPATION.INDIVIDUAL
      );

      setEmpresaSeleccionada("");
      setSeccionSeleccionada("");

      setEditingCompany(true);

      setLocalError("");
    };

  const selectEnterprise =
    () => {
      setParticipationMode(
        PARTICIPATION.ENTERPRISE
      );

      /*
       * Si ya tiene empresa,
       * empezamos mostrando la actual.
       */
      if (
        userRegister?.empresaId
      ) {
        setEmpresaSeleccionada(
          userRegister.empresaId
        );

        setSeccionSeleccionada(
          userRegister.seccionId ||
            ""
        );
      } else {
        setEmpresaSeleccionada("");
        setSeccionSeleccionada("");
      }

      setEditingCompany(true);

      setLocalError("");
    };

  /* =======================================================
     CAMBIAR EMPRESA
  ======================================================= */

  const handleEmpresaChange = (
    event
  ) => {
    const empresaId =
      event.target.value;

    setEmpresaSeleccionada(
      empresaId
    );

    /*
     * Cada empresa posee sus propias secciones.
     */
    setSeccionSeleccionada("");

    setLocalError("");
  };

  /* =======================================================
     VALIDACIÓN DEL REGISTRO
  ======================================================= */

  const validateForm = () => {
    if (!psychometricCourse) {
      return (
        "No se encontró un test psicométrico vigente."
      );
    }

    if (
      !form.cedula.trim()
    ) {
      return (
        "Ingrese su número de identificación."
      );
    }

    if (
      !form.email.trim()
    ) {
      return (
        "Ingrese su correo electrónico."
      );
    }

    if (
      !form.nombres.trim()
    ) {
      return "Ingrese sus nombres.";
    }

    if (
      !form.apellidos.trim()
    ) {
      return "Ingrese sus apellidos.";
    }

    if (
      !form.dateBirth
    ) {
      return (
        "Ingrese su fecha de nacimiento."
      );
    }

    const birthDate =
      new Date(
        `${form.dateBirth}T00:00:00`
      );

    const today =
      new Date();

    today.setHours(
      23,
      59,
      59,
      999
    );

    if (
      Number.isNaN(
        birthDate.getTime()
      )
    ) {
      return (
        "Ingrese una fecha de nacimiento válida."
      );
    }

    if (
      birthDate > today
    ) {
      return (
        "La fecha de nacimiento no puede ser futura."
      );
    }

    const celular =
      String(
        form.celular || ""
      ).replace(/\D/g, "");

    if (
      celular &&
      !/^09\d{8}$/.test(
        celular
      )
    ) {
      return (
        "El celular debe iniciar con 09 y tener 10 dígitos."
      );
    }

    /*
     * Nueva empresa o cambio de empresa.
     */
    if (
      participationMode ===
        PARTICIPATION.ENTERPRISE &&
      !empresaSeleccionada
    ) {
      return (
        "Seleccione la empresa a la que pertenece."
      );
    }

    if (
      participationMode ===
        PARTICIPATION.ENTERPRISE &&
      !seccionSeleccionada
    ) {
      return (
        "Seleccione la sección de la empresa."
      );
    }

    /*
     * Si mantiene empresa actual,
     * debe existir al menos la empresa.
     */
    if (
      participationMode ===
        PARTICIPATION.CURRENT &&
      !userRegister?.empresaId
    ) {
      return (
        "No fue posible determinar la empresa registrada."
      );
    }

    if (
      !form.aceptacion
    ) {
      return (
        "Debe aceptar el tratamiento de datos para continuar."
      );
    }

    return null;
  };

  /* =======================================================
     REGISTRAR
  ======================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setLocalError(
        validationError
      );

      return;
    }

    setLocalError("");
    setMessage("");

    let empresaIdFinal =
      null;

    let seccionIdFinal =
      null;

    /*
     * Mantener datos registrados.
     */
    if (
      participationMode ===
      PARTICIPATION.CURRENT
    ) {
      empresaIdFinal =
        userRegister?.empresaId ||
        null;

      seccionIdFinal =
        userRegister?.seccionId ||
        null;
    }

    /*
     * Selección nueva.
     */
    if (
      participationMode ===
      PARTICIPATION.ENTERPRISE
    ) {
      empresaIdFinal =
        empresaSeleccionada ||
        null;

      seccionIdFinal =
        seccionSeleccionada ||
        null;
    }

    /*
     * INDIVIDUAL:
     *
     * empresaIdFinal = null
     * seccionIdFinal = null
     */

    const payload = {
      cedula: String(
        form.cedula
      )
        .trim()
        .replace(/\s+/g, ""),

      email:
        normalizeEmail(
          form.email
        ),

      nombres:
        formatName(
          form.nombres
        ),

      apellidos:
        formatName(
          form.apellidos
        ),

      celular:
        String(
          form.celular || ""
        ).replace(/\D/g, "") ||
        null,

      dateBirth:
        form.dateBirth ||
        null,

      empresaId:
        empresaIdFinal,

      seccionId:
        seccionIdFinal,

      /*
       * Backend sabrá qué decidió
       * explícitamente el usuario.
       */
      participationMode,

      courseId:
        psychometricCourse.id,

      aceptacion: true,
    };

    console.log(
      "PAYLOAD PSYCHOMETRIC:",
      payload
    );

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
    isLoadingValidate ||
    isLoadingEmpresas ||
    isLoadingSecciones ||
    isLoadingRegister;

  return (
    <main className="pensar-register">
      {isLoading && (
        <IsLoading />
      )}

      <div className="pensar-register__background">
        <span className="pensar-register__shape pensar-register__shape--one" />

        <span className="pensar-register__shape pensar-register__shape--two" />
      </div>

      <section className="pensar-register__shell">
        <button
          type="button"
          className="pensar-register__back"
          onClick={() =>
            navigate("/")
          }
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
                Verifica tu correo
              </span>
            </article>

            <article>
              <strong>2</strong>

              <span>
                Confirma tus datos
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

        <div className="pensar-register__form">
          <div className="pensar-register__form-header">
            <div>
              <span>
                Registro
              </span>

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
                  {
                    psychometricCourse
                      .nombre
                  }
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

              <span>
                {message}
              </span>

              <span>
                Revisa también la carpeta
                de correo no deseado.
              </span>
            </div>
          )}

          {/* =================================
              PASO 1 - VALIDAR CORREO
          ================================= */}

          {!correoValidado && (
            <form
              onSubmit={
                handleValidateEmail
              }
            >
              <div className="pensar-register__verify">
                <div className="pensar-register__section-title">
                  <span>
                    Verificación
                  </span>

                  <h3>
                    Ingresa tu correo electrónico
                  </h3>

                  <p>
                    Verificaremos si ya tienes
                    información registrada en
                    iDr.Mind.
                  </p>
                </div>

                <label className="pensar-register__field">
                  <span>
                    Correo electrónico *
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                  />
                </label>

                <button
                  type="submit"
                  className="pensar-register__submit"
                  disabled={
                    isLoadingValidate ||
                    !psychometricCourse
                  }
                >
                  {isLoadingValidate
                    ? "Verificando..."
                    : "Continuar"}
                </button>
              </div>
            </form>
          )}

          {/* =================================
              PASO 2 - REGISTRO
          ================================= */}

          {correoValidado && (
            <form
              onSubmit={handleSubmit}
            >
              {/* ===============================
                  USUARIO ENCONTRADO
              =============================== */}

              {userRegister && (
                <section className="pensar-register__existing-user">
                  <div>
                    <small>
                      Usuario encontrado
                    </small>

                    <strong>
                      {userRegister.firstName ||
                        ""}{" "}
                      {userRegister.lastName ||
                        ""}
                    </strong>

                    <span>
                      {
                        userRegister.email
                      }
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      volverAValidar
                    }
                  >
                    Cambiar correo
                  </button>
                </section>
              )}

              {!userRegister && (
                <section className="pensar-register__existing-user">
                  <div>
                    <small>
                      Nuevo participante
                    </small>

                    <strong>
                      Completa tus datos
                    </strong>

                    <span>
                      {form.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={
                      volverAValidar
                    }
                  >
                    Cambiar correo
                  </button>
                </section>
              )}

              {/* ===============================
                  DATOS PERSONALES
              =============================== */}

              <div className="pensar-register__grid">
                <label className="pensar-register__field">
                  <span>
                    Identificación *
                  </span>

                  <input
                    type="text"
                    name="cedula"
                    value={
                      form.cedula
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Cédula o pasaporte"
                  />
                </label>

                <label className="pensar-register__field">
                  <span>
                    Correo electrónico
                  </span>

                  <input
                    type="email"
                    value={
                      form.email
                    }
                    disabled
                  />
                </label>

                <label className="pensar-register__field">
                  <span>
                    Nombres *
                  </span>

                  <input
                    type="text"
                    name="nombres"
                    value={
                      form.nombres
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Tus nombres"
                  />
                </label>

                <label className="pensar-register__field">
                  <span>
                    Apellidos *
                  </span>

                  <input
                    type="text"
                    name="apellidos"
                    value={
                      form.apellidos
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Tus apellidos"
                  />
                </label>

                <label className="pensar-register__field">
                  <span>
                    Celular
                  </span>

                  <input
                    type="text"
                    name="celular"
                    value={
                      form.celular
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="09XXXXXXXX"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </label>

                <label className="pensar-register__field">
                  <span>
                    Fecha de nacimiento *
                  </span>

                  <input
                    type="date"
                    name="dateBirth"
                    value={
                      form.dateBirth
                    }
                    onChange={
                      handleChange
                    }
                    max={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                </label>
              </div>

              {/* ===============================
                  EMPRESA
              =============================== */}

              <section className="pensar-register__company">
                <div className="pensar-register__section-title">
                  <span>
                    Organización
                  </span>

                  <h3>
                    Tipo de participación
                  </h3>
                </div>

                {/* ============================
                    EMPRESA ACTUAL
                ============================ */}

                {userHasCompany &&
                  !editingCompany && (
                    <div className="pensar-register__current-company">
                      <div>
                        <small>
                          Empresa registrada
                        </small>

                        <strong>
                          {getCompanyName(
                            empresaUsuario
                          )}
                        </strong>

                        <span>
                          Sección:{" "}
                          {seccionUsuario
                            ?.nombre ||
                            (userRegister
                              ?.seccionId
                              ? "Sección asignada"
                              : "Sin sección")}
                        </span>

                        <p>
                          Actualmente tu perfil
                          está asociado a esta
                          empresa.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingCompany(
                            true
                          )
                        }
                      >
                        Editar participación
                      </button>
                    </div>
                  )}

                {/* ============================
                    OPCIONES
                ============================ */}

                {(!userHasCompany ||
                  editingCompany) && (
                  <div className="pensar-register__company-options">
                    {userHasCompany && (
                      <label>
                        <input
                          type="radio"
                          name="participation"
                          checked={
                            participationMode ===
                            PARTICIPATION.CURRENT
                          }
                          onChange={
                            selectCurrentCompany
                          }
                        />

                        <span>
                          <strong>
                            Mantener empresa actual
                          </strong>

                          {getCompanyName(
                            empresaUsuario
                          )}
                        </span>
                      </label>
                    )}

                    <label>
                      <input
                        type="radio"
                        name="participation"
                        checked={
                          participationMode ===
                          PARTICIPATION.INDIVIDUAL
                        }
                        onChange={
                          selectIndividual
                        }
                      />

                      <span>
                        <strong>
                          Inscripción individual
                        </strong>

                        Esta evaluación no se
                        asociará a una empresa
                      </span>
                    </label>

                    <label>
                      <input
                        type="radio"
                        name="participation"
                        checked={
                          participationMode ===
                          PARTICIPATION.ENTERPRISE
                        }
                        onChange={
                          selectEnterprise
                        }
                      />

                      <span>
                        <strong>
                          Participación empresarial
                        </strong>

                        Seleccionar o cambiar
                        empresa y sección
                      </span>
                    </label>
                  </div>
                )}

                {/* ============================
                    CAMBIAR EMPRESA
                ============================ */}

                {participationMode ===
                  PARTICIPATION.ENTERPRISE && (
                  <div className="pensar-register__grid pensar-register__company-fields">
                    <label className="pensar-register__field">
                      <span>
                        Empresa *
                      </span>

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
                              key={
                                empresa.id
                              }
                              value={
                                empresa.id
                              }
                            >
                              {getCompanyName(
                                empresa
                              )}
                            </option>
                          )
                        )}
                      </select>
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
                            event.target
                              .value
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
                              key={
                                seccion.id
                              }
                              value={
                                seccion.id
                              }
                            >
                              {
                                seccion.nombre
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>
                )}

                {/* ============================
                    INDIVIDUAL
                ============================ */}

                {participationMode ===
                  PARTICIPATION.INDIVIDUAL && (
                  <div className="pensar-register__individual-notice">
                    <strong>
                      Participación individual
                    </strong>

                    <p>
                      Esta evaluación se
                      registrará sin empresa ni
                      sección asociada.
                    </p>
                  </div>
                )}
              </section>

              {/* ===============================
                  ACEPTACIÓN
              =============================== */}

              <label className="pensar-register__acceptance">
                <input
                  type="checkbox"
                  name="aceptacion"
                  checked={
                    form.aceptacion
                  }
                  onChange={
                    handleChange
                  }
                />

                <span>
                  Acepto el tratamiento de mis
                  datos para gestionar esta
                  evaluación y recibir las
                  comunicaciones relacionadas
                  con el test.
                </span>
              </label>

              {/* ===============================
                  BOTONES
              =============================== */}

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

              <button
                type="button"
                className="pensar-register__back-email"
                onClick={
                  volverAValidar
                }
              >
                Usar otro correo
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProyectoPensarRegistro;