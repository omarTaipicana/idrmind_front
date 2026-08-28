import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useParams } from "react-router-dom";

import "./styles/RegistroAlumnos.css";
import IsLoading from "../shared/isLoading";

/* =========================================
   TIPOS DE PARTICIPACIÓN
========================================= */

const PARTICIPATION = {
  CURRENT: "current",
  INDIVIDUAL: "individual",
  ENTERPRISE: "enterprise",
};

const RegistroAlumnos = () => {
  const PATH_COURSES = "/courses";
  const PATH_VARIABLES = "/variables";
  const PATH_VALIDATE = "/validate";
  const PATH_INSCRIPCIONES = "/inscripcion";
  const PATH_EMPRESAS = "/empresas/public";
  const PATH_EMPRESA_SECCIONES =
    "/empresa-secciones/public";

  const dispatch = useDispatch();
  const { code } = useParams();

  /* =========================================
     ESTADOS GENERALES
  ========================================= */

  const [idCourse, setIdCourse] =
    useState(null);

  const [
    inscripcionExistente,
    setInscripcionExistente,
  ] = useState(null);

  const [
    userValidacion,
    setUserValidacion,
  ] = useState(null);

  const [
    userRegister,
    setUserRegister,
  ] = useState(null);

  /* =========================================
     EMPRESA Y SECCIÓN
  ========================================= */

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

  /* =========================================
     API
  ========================================= */

  const [
    course,
    getCourse,
    ,
    ,
    ,
    ,
    isLoadingCourse,
  ] = useCrud();

  const [
    variables,
    getVariables,
  ] = useCrud();

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
    postInscripcion,
    ,
    ,
    error,
    isLoadingInscripcion,
    newInscripcion,
  ] = useCrud();

  /* =========================================
     REACT HOOK FORM
  ========================================= */

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  /* =========================================
     DATOS NORMALIZADOS
  ========================================= */

  const coursesList = useMemo(() => {
    if (Array.isArray(course)) {
      return course;
    }

    return course?.data || [];
  }, [course]);

  const empresasList = useMemo(() => {
    const lista = Array.isArray(empresas)
      ? empresas
      : empresas?.data || [];

    return lista.filter(
      (empresa) =>
        empresa?.activo !== false
    );
  }, [empresas]);

  const seccionesList = useMemo(() => {
    const lista =
      Array.isArray(empresaSecciones)
        ? empresaSecciones
        : empresaSecciones?.data || [];

    return lista.filter(
      (seccion) =>
        seccion?.activo !== false
    );
  }, [empresaSecciones]);

  const variablesList = useMemo(() => {
    if (Array.isArray(variables)) {
      return variables;
    }

    return variables?.data || [];
  }, [variables]);

  /* =========================================
     CARGA INICIAL
  ========================================= */

  useEffect(() => {
    getCourse(PATH_COURSES);

    getVariables(PATH_VARIABLES);

    getEmpresas(
      `${PATH_EMPRESAS}?activo=true`
    );
  }, []);

  /* =========================================
     IDENTIFICAR CURSO
  ========================================= */

  useEffect(() => {
    if (
      !coursesList.length ||
      !code
    ) {
      return;
    }

    const foundCourse =
      coursesList.find(
        (item) =>
          item.sigla === code
      );

    if (foundCourse) {
      setIdCourse(
        foundCourse.id
      );
    }
  }, [
    coursesList,
    code,
  ]);

  const cursoActivo =
    coursesList.find(
      (item) =>
        item.sigla === code
    );

  /* =========================================
     ALERTAS DE ERROR
  ========================================= */

  useEffect(() => {
    if (!error) {
      return;
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Error inesperado durante la inscripción.";

    dispatch(
      showAlert({
        message:
          `⚠️ ${message}`,

        alertType: 1,
      })
    );
  }, [
    error,
    dispatch,
  ]);

  useEffect(() => {
    if (!validateError) {
      return;
    }

    const message =
      validateError?.response?.data
        ?.message ||
      validateError?.response?.data
        ?.error ||
      "No se pudo validar el usuario.";

    dispatch(
      showAlert({
        message:
          `⚠️ ${message}`,

        alertType: 1,
      })
    );
  }, [
    validateError,
    dispatch,
  ]);

  useEffect(() => {
    if (!empresasError) {
      return;
    }

    dispatch(
      showAlert({
        message:
          "⚠️ No se pudieron cargar las empresas.",

        alertType: 1,
      })
    );
  }, [
    empresasError,
    dispatch,
  ]);

  useEffect(() => {
    if (!seccionesError) {
      return;
    }

    dispatch(
      showAlert({
        message:
          "⚠️ No se pudieron cargar las secciones.",

        alertType: 1,
      })
    );
  }, [
    seccionesError,
    dispatch,
  ]);

  /* =========================================
     INSCRIPCIÓN EXITOSA
  ========================================= */

  useEffect(() => {
    if (!newInscripcion) {
      return;
    }

    const usuario =
      newInscripcion?.user;

    dispatch(
      showAlert({
        message:
          `✅ Estimad@ ${
            usuario?.firstName || ""
          } ${
            usuario?.lastName || ""
          }, se realizó tu inscripción correctamente.`,

        alertType: 2,
      })
    );

    setUserValidacion(null);

    setUserRegister(null);

    setParticipationMode(
      PARTICIPATION.INDIVIDUAL
    );

    setEditingCompany(false);

    setEmpresaSeleccionada("");

    setSeccionSeleccionada("");

    reset();
  }, [
    newInscripcion,
    dispatch,
    reset,
  ]);

  /* =========================================
     VALIDACIÓN DE USUARIO
  ========================================= */

  const submitVal = (data) => {
    const body = {
      email: String(
        data.email || ""
      )
        .trim()
        .toLowerCase(),

      code,
    };

    postValidate(
      PATH_VALIDATE,
      body
    );
  };

  useEffect(() => {
    if (!validate) {
      return;
    }

    /* =====================================
       YA ESTÁ INSCRITO
    ===================================== */

    if (validate.enrolled) {
      setInscripcionExistente(
        validate.user
      );

      setUserValidacion(null);

      setUserRegister(null);

      dispatch(
        showAlert({
          message:
            "⚠️ Ya estás inscrito en este curso.",

          alertType: 2,
        })
      );

      return;
    }

    const usuario =
      validate.user || null;

    setUserValidacion(
      validate
    );

    setUserRegister(
      usuario
    );

    /*
     * Usuario existente.
     */
    if (usuario) {
      const empresaId =
        usuario.empresaId || "";

      const seccionId =
        usuario.seccionId || "";

      /*
       * Si tiene empresa:
       * por defecto mantenemos
       * la empresa actual.
       */
      if (empresaId) {
        setParticipationMode(
          PARTICIPATION.CURRENT
        );

        setEmpresaSeleccionada(
          empresaId
        );

        setSeccionSeleccionada(
          seccionId
        );

        setEditingCompany(
          false
        );

        getEmpresaSecciones(
          `${PATH_EMPRESA_SECCIONES}` +
            `?empresaId=${empresaId}` +
            `&activo=true`
        );

        return;
      }

      /*
       * Existe pero no tiene empresa.
       */
      setParticipationMode(
        PARTICIPATION.INDIVIDUAL
      );

      setEmpresaSeleccionada("");

      setSeccionSeleccionada("");

      setEditingCompany(false);

      return;
    }

    /*
     * Usuario nuevo.
     */
    setParticipationMode(
      PARTICIPATION.INDIVIDUAL
    );

    setEmpresaSeleccionada("");

    setSeccionSeleccionada("");

    setEditingCompany(false);
  }, [
    validate,
    dispatch,
  ]);

  /* =========================================
     CAMBIO DE EMPRESA
  ========================================= */

  const handleEmpresaChange = async (
    event
  ) => {
    const empresaId =
      event.target.value;

    setEmpresaSeleccionada(
      empresaId
    );

    setSeccionSeleccionada("");

    if (!empresaId) {
      return;
    }

    await getEmpresaSecciones(
      `${PATH_EMPRESA_SECCIONES}` +
        `?empresaId=${empresaId}` +
        `&activo=true`
    );
  };

  /* =========================================
     DATOS DE EMPRESA EXISTENTE
  ========================================= */

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

  const usuarioTieneEmpresa =
    Boolean(
      userRegister?.empresaId
    );

  /* =========================================
     MODOS DE PARTICIPACIÓN
  ========================================= */

  const seleccionarEmpresaActual =
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

      setEditingCompany(
        false
      );

      getEmpresaSecciones(
        `${PATH_EMPRESA_SECCIONES}` +
          `?empresaId=${userRegister.empresaId}` +
          `&activo=true`
      );
    };

  const seleccionarIndividual =
    () => {
      setParticipationMode(
        PARTICIPATION.INDIVIDUAL
      );

      setEmpresaSeleccionada("");

      setSeccionSeleccionada("");

      setEditingCompany(true);
    };

  const seleccionarEmpresarial =
    () => {
      setParticipationMode(
        PARTICIPATION.ENTERPRISE
      );

      /*
       * Si el usuario ya tenía empresa,
       * mostramos esa empresa inicialmente.
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

        getEmpresaSecciones(
          `${PATH_EMPRESA_SECCIONES}` +
            `?empresaId=${userRegister.empresaId}` +
            `&activo=true`
        );
      } else {
        setEmpresaSeleccionada("");

        setSeccionSeleccionada("");
      }

      setEditingCompany(true);
    };

  /* =========================================
     FUNCIONES DE VALIDACIÓN
  ========================================= */

  const validarCedula = (
    cedula
  ) => {
    const valor = String(
      cedula || ""
    ).replace(
      /\D/g,
      ""
    );

    if (
      !/^\d{10}$/.test(
        valor
      )
    ) {
      return false;
    }

    const digitos =
      valor
        .split("")
        .map(Number);

    const digitoVerificador =
      digitos.pop();

    let suma = 0;

    for (
      let index = 0;
      index <
      digitos.length;
      index += 1
    ) {
      let numero =
        digitos[index];

      if (
        index % 2 ===
        0
      ) {
        numero *= 2;

        if (
          numero > 9
        ) {
          numero -= 9;
        }
      }

      suma += numero;
    }

    const decenaSuperior =
      Math.ceil(
        suma / 10
      ) * 10;

    return (
      decenaSuperior -
        suma ===
      digitoVerificador
    );
  };

  const capitalizeWords = (
    value = ""
  ) =>
    String(value)
      .trim()
      .split(/\s+/)
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase() +
          word
            .slice(1)
            .toLowerCase()
      )
      .join(" ");

  /* =========================================
     CAMPOS FALTANTES
  ========================================= */

  const missing = {
    cedula:
      !userRegister?.cI?.trim(),

    celular:
      !userRegister?.cellular?.trim(),

    email:
      !userRegister?.email?.trim(),

    nombres:
      !userRegister?.firstName?.trim(),

    apellidos:
      !userRegister?.lastName?.trim(),

    grado:
      !userRegister?.grado?.trim(),

    subsistema:
      !userRegister?.subsistema?.trim(),
  };

  const tieneDatosFaltantes =
    missing.cedula ||
    missing.celular ||
    missing.nombres ||
    missing.apellidos;

  /* =========================================
     REGISTRAR INSCRIPCIÓN
  ========================================= */

  const submit = (data) => {
    const nombreFormateado =
      data.nombres
        ? capitalizeWords(
            data.nombres
          )
        : "";

    const apellidoFormateado =
      data.apellidos
        ? capitalizeWords(
            data.apellidos
          )
        : "";

    const emailFormateado =
      String(
        data.email || ""
      )
        .trim()
        .toLowerCase();

    const confirmEmailFormateado =
      String(
        data.confirmEmail || ""
      )
        .trim()
        .toLowerCase();

    const cedulaLimpia =
      String(
        data.cedula || ""
      ).replace(
        /\D/g,
        ""
      );

    const celularLimpio =
      String(
        data.celular || ""
      ).replace(
        /\D/g,
        ""
      );

    const emailFinal =
      userRegister?.email ||
      emailFormateado;

    const cedulaFinal =
      userRegister?.cI ||
      cedulaLimpia;

    const celularFinal =
      userRegister?.cellular ||
      celularLimpio;

    const nombresFinal =
      userRegister?.firstName ||
      nombreFormateado;

    const apellidosFinal =
      userRegister?.lastName ||
      apellidoFormateado;

    /* =====================================
       VALIDAR CÉDULA
    ===================================== */

    if (
      !validarCedula(
        cedulaFinal
      )
    ) {
      dispatch(
        showAlert({
          message:
            "⚠️ La cédula ingresada es incorrecta.",

          alertType: 1,
        })
      );

      return;
    }

    /* =====================================
       VALIDAR EMAIL
    ===================================== */

    const isValidEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailFinal
      );

    if (!isValidEmail) {
      dispatch(
        showAlert({
          message:
            "⚠️ El correo electrónico es incorrecto.",

          alertType: 1,
        })
      );

      return;
    }

    if (
      !userRegister &&
      emailFormateado !==
        confirmEmailFormateado
    ) {
      dispatch(
        showAlert({
          message:
            "⚠️ El correo no coincide con el correo de confirmación.",

          alertType: 1,
        })
      );

      return;
    }

    /* =====================================
       VALIDAR CELULAR
    ===================================== */

    if (
      !/^09\d{8}$/.test(
        celularFinal
      )
    ) {
      dispatch(
        showAlert({
          message:
            "⚠️ El celular debe iniciar con 09 y tener 10 dígitos.",

          alertType: 1,
        })
      );

      return;
    }

    /* =====================================
       VALIDAR EMPRESA
    ===================================== */

    if (
      participationMode ===
        PARTICIPATION.ENTERPRISE &&
      !empresaSeleccionada
    ) {
      dispatch(
        showAlert({
          message:
            "⚠️ Seleccione una empresa.",

          alertType: 1,
        })
      );

      return;
    }

    if (
      participationMode ===
        PARTICIPATION.ENTERPRISE &&
      !seccionSeleccionada
    ) {
      dispatch(
        showAlert({
          message:
            "⚠️ Seleccione una sección de la empresa.",

          alertType: 1,
        })
      );

      return;
    }

    /* =====================================
       DEFINIR EMPRESA FINAL
    ===================================== */

    let empresaIdFinal =
      null;

    let seccionIdFinal =
      null;

    /*
     * Mantener empresa actual.
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
     * Empresa nueva / cambio de empresa.
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
     * Individual:
     *
     * empresaIdFinal = null
     * seccionIdFinal = null
     */

    /* =====================================
       BODY
    ===================================== */

    const body = {
      ...data,

      cedula:
        cedulaFinal,

      nombres:
        nombresFinal,

      apellidos:
        apellidosFinal,

      celular:
        celularFinal,

      email:
        emailFinal,

      grado:
        userRegister?.grado ||
        data.grado ||
        null,

      subsistema:
        userRegister?.subsistema ||
        data.subsistema ||
        null,

      empresaId:
        empresaIdFinal,

      seccionId:
        seccionIdFinal,

      /*
       * Le indicamos al backend la
       * decisión explícita.
       */
      participationMode,

      confirmEmail:
        confirmEmailFormateado,

      curso: code,

      courseId:
        idCourse,

      aceptacion:
        Boolean(
          data.aceptacion
        ),
    };

    console.log(
      "INSCRIPCIÓN:",
      body
    );

    postInscripcion(
      PATH_INSCRIPCIONES,
      body
    );
  };

  /* =========================================
     LIMPIAR VALIDACIÓN
  ========================================= */

  const volverAValidar = () => {
    setInscripcionExistente(null);

    setUserValidacion(null);

    setUserRegister(null);

    setParticipationMode(
      PARTICIPATION.INDIVIDUAL
    );

    setEditingCompany(false);

    setEmpresaSeleccionada("");

    setSeccionSeleccionada("");

    reset();
  };

  /* =========================================
     CURSO NO EXISTE
  ========================================= */

  if (
    !isLoadingCourse &&
    coursesList.length > 0 &&
    !cursoActivo
  ) {
    return (
      <div className="registro_container curso_no_encontrado">
        <div className="mensaje_curso_caja">
          <h2>
            ❌ Curso no disponible
          </h2>

          <p>
            El curso con el código{" "}
            <strong>
              {code}
            </strong>{" "}
            no está disponible o no existe.
          </p>

          <p>
            Verifica el enlace o contacta con el
            administrador.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================
     CURSO NO VIGENTE
  ========================================= */

  if (
    cursoActivo?.vigente ===
    false
  ) {
    return (
      <div className="registro_container curso_no_encontrado">
        <div className="mensaje_curso_caja mensaje_curso_caja--finalizado">
          <h2>
            ⏳ Oferta académica finalizada
          </h2>

          <p>
            La oferta académica del{" "}
            <strong>
              {
                cursoActivo?.nombre
              }
            </strong>{" "}
            ha finalizado.
          </p>

          <p>
            Para obtener más información,
            contacta con el administrador.
          </p>

          <div className="mensaje_acciones">
            <a
              className="mensaje_btn"
              href="/#/"
            >
              Ir al inicio
            </a>

            <a
              className="mensaje_btn mensaje_btn--whatsapp"
              href="https://wa.me/593980773229"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================
     COMPONENTE
  ========================================= */

  return (
    <div className="registro_container">
      {(isLoadingCourse ||
        isLoadingValidate ||
        isLoadingInscripcion ||
        isLoadingEmpresas ||
        isLoadingSecciones) && (
        <IsLoading />
      )}

      {/* =====================================
          VISTA 1: VALIDAR CORREO
      ===================================== */}

      {!userValidacion ? (
        <div className="registro_wrapper registro_wrapper--verifica">
          <div className="registro_intro">
            <h2 className="registro_intro_title">
              Inicia tu formación
            </h2>

            <p className="registro_intro_text">
              Ingresa tu correo electrónico para
              comprobar si ya tienes una cuenta y
              continuar con tu inscripción.
            </p>

            <ul className="registro_intro_list">
              <li>
                Si ya tienes información registrada,
                la mostraremos para que puedas
                inscribirte en el nuevo curso.
              </li>

              <li>
                Podrás elegir si esta inscripción es
                individual o si pertenece a una
                empresa.
              </li>
            </ul>

            <p className="registro_intro_highlight">
              ¡El primer paso para avanzar está aquí!
            </p>
          </div>

          <form
            className="formulario_registro_val"
            onSubmit={
              handleSubmit(
                submitVal
              )
            }
          >
            <div className="registro_val_field">
              <label
                htmlFor="email"
                className="registro_label"
              >
                Correo electrónico
              </label>

              <div className="registro_val_row">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  {...register(
                    "email"
                  )}
                />

                <button
                  className="btn_inscripcion"
                  type="submit"
                >
                  Continuar
                </button>
              </div>
            </div>
          </form>

          {inscripcionExistente && (
            <div className="usuario_existente">
              <h3>
                Ya estás inscrito en este curso
              </h3>

              <p>
                <strong>
                  Nombres:
                </strong>{" "}
                {
                  inscripcionExistente.firstName
                }{" "}
                {
                  inscripcionExistente.lastName
                }
              </p>

              <p>
                <strong>
                  Correo:
                </strong>{" "}
                {
                  inscripcionExistente.email
                }
              </p>

              <button
                className="btn_cerrar_existente"
                type="button"
                onClick={
                  volverAValidar
                }
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ===================================
           VISTA 2: FORMULARIO
        =================================== */

        <div className="registro_wrapper registro_wrapper--form">
          <div className="registro_left animate_slide_left">
            <div className="registro_form_header">
              <span className="registro_form_badge">
                Formulario de inscripción
              </span>

              <h2>
                {userRegister
                  ? "Confirma tu información"
                  : "Completa tus datos"}
              </h2>

              <p>
                {userRegister
                  ? "Encontramos tu perfil. Confirma tus datos y selecciona el tipo de participación para esta inscripción."
                  : "Ingresa tus datos personales y selecciona si tu inscripción es individual o empresarial."}
              </p>
            </div>

            <form
              className="formulario_registro"
              onSubmit={
                handleSubmit(
                  submit
                )
              }
            >
              {/* ============================
                  INFORMACIÓN EXISTENTE
              ============================ */}

              {userRegister && (
                <section className="registro_existing_card registro_full_width">
                  <div className="registro_existing_header">
                    <span>
                      ✅
                    </span>

                    <div>
                      <h3>
                        Información encontrada
                      </h3>

                      <p>
                        Estos datos ya están registrados
                        en tu perfil.
                      </p>
                    </div>
                  </div>

                  <div className="registro_existing_grid">
                    <div>
                      <small>
                        Nombres
                      </small>

                      <strong>
                        {userRegister.firstName ||
                          "Falta completar"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Apellidos
                      </small>

                      <strong>
                        {userRegister.lastName ||
                          "Falta completar"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Cédula
                      </small>

                      <strong>
                        {userRegister.cI ||
                          "Falta completar"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Correo electrónico
                      </small>

                      <strong>
                        {userRegister.email ||
                          "Falta completar"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Celular
                      </small>

                      <strong>
                        {userRegister.cellular ||
                          "Falta completar"}
                      </strong>
                    </div>
                  </div>

                  {tieneDatosFaltantes && (
                    <p className="mensaje_inscripcion">
                      Tu perfil está incompleto. Completa
                      únicamente los campos faltantes.
                    </p>
                  )}
                </section>
              )}

              {/* ============================
                  DATOS PERSONALES
              ============================ */}

              <section className="registro_form_section">
                <div className="registro_section_title">
                  <span>
                    👤
                  </span>

                  <div>
                    <h3>
                      Información personal
                    </h3>

                    <p>
                      Datos necesarios para tu
                      inscripción.
                    </p>
                  </div>
                </div>

                <div className="registro_fields_grid">
                  {!userRegister && (
                    <>
                      <label className="registro_label">
                        Confirmar correo electrónico

                        <input
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="Confirma tu correo"
                          {...register(
                            "confirmEmail"
                          )}
                        />
                      </label>

                      <label className="registro_label">
                        Nombres

                        <input
                          type="text"
                          required
                          placeholder="Nombres completos"
                          {...register(
                            "nombres"
                          )}
                        />
                      </label>

                      <label className="registro_label">
                        Apellidos

                        <input
                          type="text"
                          required
                          placeholder="Apellidos completos"
                          {...register(
                            "apellidos"
                          )}
                        />
                      </label>

                      <label className="registro_label">
                        Cédula

                        <input
                          type="text"
                          required
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="10 dígitos"
                          {...register(
                            "cedula"
                          )}
                        />
                      </label>

                      <label className="registro_label">
                        Celular

                        <input
                          type="text"
                          required
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="09XXXXXXXX"
                          {...register(
                            "celular"
                          )}
                        />
                      </label>
                    </>
                  )}

                  {userRegister && (
                    <>
                      {missing.nombres && (
                        <label className="registro_label">
                          Nombres

                          <input
                            type="text"
                            required
                            placeholder="Nombres completos"
                            {...register(
                              "nombres"
                            )}
                          />
                        </label>
                      )}

                      {missing.apellidos && (
                        <label className="registro_label">
                          Apellidos

                          <input
                            type="text"
                            required
                            placeholder="Apellidos completos"
                            {...register(
                              "apellidos"
                            )}
                          />
                        </label>
                      )}

                      {missing.cedula && (
                        <label className="registro_label">
                          Cédula

                          <input
                            type="text"
                            required
                            maxLength={10}
                            inputMode="numeric"
                            placeholder="10 dígitos"
                            {...register(
                              "cedula"
                            )}
                          />
                        </label>
                      )}

                      {missing.celular && (
                        <label className="registro_label">
                          Celular

                          <input
                            type="text"
                            required
                            maxLength={10}
                            inputMode="numeric"
                            placeholder="09XXXXXXXX"
                            {...register(
                              "celular"
                            )}
                          />
                        </label>
                      )}

                      {!missing.nombres && (
                        <input
                          type="hidden"
                          value={
                            userRegister.firstName
                          }
                          {...register(
                            "nombres"
                          )}
                        />
                      )}

                      {!missing.apellidos && (
                        <input
                          type="hidden"
                          value={
                            userRegister.lastName
                          }
                          {...register(
                            "apellidos"
                          )}
                        />
                      )}

                      {!missing.cedula && (
                        <input
                          type="hidden"
                          value={
                            userRegister.cI
                          }
                          {...register(
                            "cedula"
                          )}
                        />
                      )}

                      {!missing.email && (
                        <input
                          type="hidden"
                          value={
                            userRegister.email
                          }
                          {...register(
                            "email"
                          )}
                        />
                      )}

                      {!missing.celular && (
                        <input
                          type="hidden"
                          value={
                            userRegister.cellular
                          }
                          {...register(
                            "celular"
                          )}
                        />
                      )}
                    </>
                  )}
                </div>
              </section>

              {/* ============================
                  EMPRESA Y SECCIÓN
              ============================ */}

              <section className="registro_form_section">
                <div className="registro_section_title">
                  <span>
                    🏢
                  </span>

                  <div>
                    <h3>
                      Tipo de participación
                    </h3>

                    <p>
                      Selecciona si esta inscripción es
                      individual o corresponde a una
                      empresa.
                    </p>
                  </div>
                </div>

                {/* ===========================
                    EMPRESA ACTUAL
                =========================== */}

                {usuarioTieneEmpresa &&
                  !editingCompany && (
                    <div className="registro_company_current">
                      <div className="registro_company_current_icon">
                        🏢
                      </div>

                      <div className="registro_company_current_content">
                        <small>
                          Empresa registrada
                        </small>

                        <strong>
                          {empresaUsuario
                            ? empresaUsuario.nombreComercial ||
                              empresaUsuario.razonSocial ||
                              empresaUsuario.nombre
                            : "Empresa asignada"}
                        </strong>

                        <span>
                          <b>
                            Sección:
                          </b>{" "}
                          {seccionUsuario?.nombre ||
                            (userRegister.seccionId
                              ? "Sección asignada"
                              : "Sin sección específica")}
                        </span>

                        <p>
                          Actualmente tu perfil está
                          asociado a esta empresa.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="registro_company_edit"
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

                {/* ===========================
                    OPCIONES
                =========================== */}

                {(!usuarioTieneEmpresa ||
                  editingCompany) && (
                  <div className="registro_participation_options">
                    {usuarioTieneEmpresa && (
                      <label className="registro_participation_option">
                        <input
                          type="radio"
                          name="participationMode"
                          checked={
                            participationMode ===
                            PARTICIPATION.CURRENT
                          }
                          onChange={
                            seleccionarEmpresaActual
                          }
                        />

                        <span>
                          <strong>
                            Mantener empresa actual
                          </strong>

                          {empresaUsuario
                            ? empresaUsuario.nombreComercial ||
                              empresaUsuario.razonSocial ||
                              empresaUsuario.nombre
                            : "Empresa registrada"}
                        </span>
                      </label>
                    )}

                    <label className="registro_participation_option">
                      <input
                        type="radio"
                        name="participationMode"
                        checked={
                          participationMode ===
                          PARTICIPATION.INDIVIDUAL
                        }
                        onChange={
                          seleccionarIndividual
                        }
                      />

                      <span>
                        <strong>
                          Participación individual
                        </strong>

                        Esta inscripción no estará
                        asociada a una empresa.
                      </span>
                    </label>

                    <label className="registro_participation_option">
                      <input
                        type="radio"
                        name="participationMode"
                        checked={
                          participationMode ===
                          PARTICIPATION.ENTERPRISE
                        }
                        onChange={
                          seleccionarEmpresarial
                        }
                      />

                      <span>
                        <strong>
                          Participación empresarial
                        </strong>

                        Selecciona una empresa y su
                        sección.
                      </span>
                    </label>
                  </div>
                )}

                {/* ===========================
                    EMPRESA / SECCIÓN
                =========================== */}

                {participationMode ===
                  PARTICIPATION.ENTERPRISE && (
                  <div className="registro_company_selector registro_company_selector--participation">
                    <label className="registro_label">
                      Empresa

                      <select
                        value={
                          empresaSeleccionada
                        }
                        onChange={
                          handleEmpresaChange
                        }
                        required
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
                              {empresa.nombreComercial ||
                                empresa.razonSocial ||
                                empresa.nombre}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label className="registro_label">
                      Sección de la empresa

                      <select
                        value={
                          seccionSeleccionada
                        }
                        onChange={(
                          event
                        ) =>
                          setSeccionSeleccionada(
                            event.target
                              .value
                          )
                        }
                        required
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

                      {empresaSeleccionada &&
                        seccionesList.length ===
                          0 &&
                        !isLoadingSecciones && (
                          <small className="registro_field_error">
                            Esta empresa no tiene
                            secciones disponibles.
                          </small>
                        )}
                    </label>
                  </div>
                )}

                {/* ===========================
                    INDIVIDUAL
                =========================== */}

                {participationMode ===
                  PARTICIPATION.INDIVIDUAL && (
                  <div className="registro_individual_notice">
                    <span>
                      👤
                    </span>

                    <div>
                      <strong>
                        Participación individual
                      </strong>

                      <p>
                        Esta inscripción se realizará sin
                        empresa ni sección asociada.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* ============================
                  ACEPTACIÓN Y ENVÍO
              ============================ */}

              <section className="registro_form_section registro_form_section--final">
                <div className="form_check_container">
                  <label className="form_check_label">
                    <input
                      type="checkbox"
                      {...register(
                        "aceptacion",
                        {
                          validate:
                            (
                              value
                            ) =>
                              value ===
                                true ||
                              "Debes aceptar la política para continuar.",
                        }
                      )}
                    />

                    <span>
                      Acepto recibir correos electrónicos
                      con información sobre los cursos y
                      otros contenidos relacionados.
                      Entiendo que mis datos serán tratados
                      de acuerdo con la política de
                      privacidad.
                    </span>
                  </label>

                  {errors.aceptacion && (
                    <p className="form_error">
                      {
                        errors
                          .aceptacion
                          .message
                      }
                    </p>
                  )}
                </div>

                <div className="registro_form_actions">
                  <button
                    className="btn_inscripcion"
                    type="submit"
                    disabled={
                      isLoadingInscripcion ||
                      !idCourse
                    }
                  >
                    Inscribirme

                    <span>
                      ➜
                    </span>
                  </button>

                  <button
                    type="button"
                    className="btn_registro_secondary"
                    onClick={
                      volverAValidar
                    }
                  >
                    Cambiar correo
                  </button>
                </div>
              </section>
            </form>
          </div>

          {/* =================================
              INFORMACIÓN DEL CURSO
          ================================= */}

          <aside className="registro_right animate_slide_right">
            {cursoActivo && (
              <div className="curso_fondo">
                <div
                  className="curso_imagen"
                  style={{
                    backgroundImage:
                      `url(/images/${code}.jpg)`,
                  }}
                />

                <div className="curso_overlay">
                  <span className="curso_badge">
                    Curso disponible
                  </span>

                  <h2>
                    {
                      cursoActivo.nombre
                    }
                  </h2>

                  <p>
                    {
                      cursoActivo.objetivo
                    }
                  </p>

                  <div className="curso_info_footer">
                    <span>
                      🎓 Formación profesional
                    </span>

                    <span>
                      ✓ Inscripción en línea
                    </span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default RegistroAlumnos;