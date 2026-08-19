import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import "./styles/ProyectoPensarResultado.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const ProyectoPensarResultado = () => {
  const { token } = useParams();

  const navigate =
    useNavigate();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    data,
    setData,
  ] = useState(null);

  const [
    openingPdf,
    setOpeningPdf,
  ] = useState(false);

  /* =========================================================
     CARGAR RESULTADO
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadResult =
      async () => {
        if (
          !token ||
          !String(
            token,
          ).trim()
        ) {
          setError(
            "El enlace del resultado no es válido.",
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setError("");

          const {
            data: response,
          } =
            await axios.get(
              `${API_URL}/psychometric/result/${token}`,
            );

          if (!mounted) {
            return;
          }

          setData(response);
        } catch (err) {
          if (!mounted) {
            return;
          }

          console.error(
            "Error cargando resultado psicométrico:",
            err?.response?.data ||
            err,
          );

          const backend =
            err?.response?.data;

          if (
            err?.response
              ?.status === 410
          ) {
            setError(
              backend?.message ||
              "El enlace del resultado ha expirado.",
            );
          } else if (
            err?.response
              ?.status === 403
          ) {
            setError(
              backend?.message ||
              "El resultado todavía no está disponible.",
            );
          } else if (
            err?.response
              ?.status === 404
          ) {
            setError(
              backend?.message ||
              "No se encontró el resultado solicitado.",
            );
          } else {
            setError(
              backend?.message ||
              "No fue posible cargar el resultado psicométrico.",
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [token]);

  /* =========================================================
     DATOS
  ========================================================= */

  const user =
    data?.user || {};

  const evaluation =
    data?.evaluation || {};

  const course =
    data?.course || {};

  /*
   * La personalidad puede venir
   * a nivel superior o dentro del
   * resultado almacenado.
   */
  const result =
    data?.result || {};

  const personality =
    data?.personality ||
    result?.personality ||
    {};

  const payment =
    data?.payment || {};

  const animodo =
    result?.animodo || {};

  const communication =
    result?.communication || {};

  const brain =
    result?.brain || {};

  const negotiation =
    result?.negotiation || {};

  const vak =
    result?.vak || {};

  const persistence =
    result?.persistence || {};


  const productivityIndex =
    result?.productivityIndex || {};

  /* =========================================================
     NOMBRE
  ========================================================= */

  const firstName =
    useMemo(
      () =>
        [

          user?.firstName,

        ]
          .filter(Boolean)
          .join(" "),
      [

        user?.firstName,

      ],
    );

  const lastName =
    useMemo(
      () =>
        [

          user?.lastName,
        ]
          .filter(Boolean)
          .join(" "),
      [

        user?.lastName,
      ],
    );


  const fullName =
    useMemo(
      () =>
        [
          user?.firstName,
          user?.lastName,
        ]
          .filter(Boolean)
          .join(" "),
      [
        user?.firstName,
        user?.lastName,
      ],
    );

  /* =========================================================
     FECHA
  ========================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    try {
      return new Intl.DateTimeFormat(
        "es-EC",
        {
          timeZone: "America/Guayaquil",

          year: "numeric",
          month: "long",
          day: "2-digit",

          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",

          hour12: false,
        }
      ).format(new Date(value));
    } catch {
      return "-";
    }
  };

  /* =========================================================
     TEXTO
  ========================================================= */

  const prettyText = (
    value,
    fallback = "-",
  ) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return fallback;
    }

    return String(value)
      .replace(/_/g, " ")
      .trim();
  };

  /* =========================================================
     PORCENTAJE
  ========================================================= */

  const formatPercent = (
    value,
  ) => {
    const number =
      Number(value);

    if (
      !Number.isFinite(
        number,
      )
    ) {
      return "0%";
    }

    /*
     * Mostramos entero como Excel.
     * Ej:
     * 21.59 -> 22 %
     */
    return `${Math.round(
      number,
    )}%`;
  };

  /* =========================================================
     ABRIR PDF
  ========================================================= */

  const handleOpenPdf =
    async () => {
      if (!token) {
        return;
      }

      try {
        setOpeningPdf(true);

        const pdfUrl =
          `${API_URL}/psychometric/result/${token}/pdf`;

        window.open(
          pdfUrl,
          "_blank",
          "noopener,noreferrer",
        );
      } finally {
        setTimeout(
          () => {
            setOpeningPdf(false);
          },
          500,
        );
      }
    };

  /* =========================================================
     RESULTADOS CALCULADOS
  ========================================================= */

  const animodoResult =
    animodo?.animal ||
    personality?.resultadoAnimodo ||
    personality?.animal ||
    "-";

  const personalityAnimal =
    personality?.animal ||
    "-";

  const brainType =
    brain?.brainType ||
    personality?.tipoCerebro ||
    "-";

  const brainCategory =
    brain?.brainCategory ||
    personality?.categoriaCerebro ||
    "-";

  const headColor =
    brain?.headColor ||
    personality?.colorCabeza ||
    "-";

  const chestColor =
    communication?.dominantColor ||
    personality?.colorPecho ||
    "-";

  const communicationType =
    communication
      ?.communicationType ||
    personality
      ?.tipoComunicacion ||
    "-";

  /* =========================================================
     BARRA DE PORCENTAJE
  ========================================================= */

  const PercentageBar = ({
    label,
    value,
    color = "azul",
  }) => {
    const safeValue =
      Math.min(
        100,
        Math.max(
          0,
          Number(value) || 0
        )
      );

    return (
      <div
        className={`ppr-bar ppr-bar--${color}`}
      >
        <div className="ppr-bar__head">
          <div className="ppr-bar__label">
            <span className="ppr-bar__dot" />

            <span>{label}</span>
          </div>

          <strong>
            {safeValue.toFixed(2)}%
          </strong>
        </div>

        <div className="ppr-bar__track">
          <span
            className="ppr-bar__fill"
            style={{
              width: `${safeValue}%`,
            }}
          />
        </div>
      </div>
    );
  };
  /* =========================================================
     BARRA DE PUNTAJE
  ========================================================= */

  const ScoreBar = ({
    label,
    value,
    maxValue,
  }) => {
    const score =
      Number(value) || 0;

    const maximum =
      Number(maxValue) || 1;

    const percent =
      Math.max(
        0,
        Math.min(
          100,
          (score / maximum) *
          100,
        ),
      );

    return (
      <div className="ppr-score">
        <div className="ppr-score__head">
          <span>
            {label}
          </span>

          <strong>
            {score}
          </strong>
        </div>

        <div className="ppr-score__track">
          <span
            className="ppr-score__fill"
            style={{
              width:
                `${percent}%`,
            }}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="ppr-page">
        <div className="ppr-state">
          <div className="ppr-spinner" />

          <h2>
            Cargando tu resultado...
          </h2>

          <p>
            Estamos preparando la
            información de tu
            evaluación.
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="ppr-page">
        <div className="ppr-state ppr-state--error">
          <div className="ppr-state__icon">
            ⚠️
          </div>

          <h2>
            No fue posible abrir el
            resultado
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="ppr-btn ppr-btn--secondary"
            onClick={() =>
              navigate("/")
            }
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     RESULTADO
  ========================================================= */

  return (
    <div className="ppr-page">
      <div className="ppr-shell">

        {/* ===================================================
            ENCABEZADO EMPRESARIAL
        =================================================== */}

        <section className="ppr-hero">
          <div className="ppr-hero__content">
            <span className="ppr-eyebrow">
              RESULTADO DE LA EVALUACIÓN
            </span>

            <h1>
              Índice de Productividad Personal (IPP)
            </h1>

            <p className="ppr-hero__subtitle">
              {course?.nombre ||
                "Test Psicotécnico de Personalidad"}
            </p>

            <div className="ppr-person">
              <div>
                <span>
                  Participante
                </span>

                <strong>
                  {firstName ||
                    "Participante"}
                </strong>
                <strong>
                  {lastName ||
                    "Participante"}
                </strong>
              </div>

              <div>
                <span>
                  Evaluación
                </span>

                <strong>
                  N.º{" "}
                  {evaluation
                    ?.numeroEvaluacion ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Fecha
                </span>

                <strong>
                  {formatDate(
                    evaluation
                      ?.fechaFinalizacion,
                  )}
                </strong>
              </div>
            </div>

            <div className="ppr-hero__actions">
              <button
                type="button"
                className="ppr-btn ppr-btn--primary"
                onClick={
                  handleOpenPdf
                }
                disabled={
                  openingPdf
                }
              >
                {openingPdf
                  ? "⏳ Abriendo..."
                  : "📄 Ver informe PDF"}
              </button>
            </div>
          </div>

          {/* =================================================
              PERSONALIDAD
              SIEMPRE FONDO BLANCO
          ================================================= */}

          <div className="ppr-hero__profileArea">
            <div className="ppr-personality-card">
              <span className="ppr-personality-card__label">
                PERFIL DE PERSONALIDAD
              </span>

              <div className="ppr-personality-card__image">
                {personality?.imagenUrl ? (
                  <img
                    src={
                      personality.imagenUrl
                    }
                    alt={
                      personality?.nombre ||
                      personalityAnimal
                    }
                    className="ppr-personality-image"
                  />
                ) : (
                  <div className="ppr-personality-placeholder">
                    🧠
                  </div>
                )}
              </div>

              <strong className="ppr-personality-card__animal">
                {personalityAnimal}
              </strong>

              {personality?.nombre && (
                <span className="ppr-personality-card__name">
                  {
                    personality.nombre
                  }
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            DIAGNÓSTICO FINAL
        =================================================== */}

        <section className="ppr-card ppr-diagnostic">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                DIAGNÓSTICO FINAL
              </span>

              <h2>
                Síntesis del perfil
              </h2>
            </div>

            <span className="ppr-status-badge">
              Vista General
            </span>
          </div>

          <div className="ppr-diagnostic-grid">

            <article className="ppr-diagnostic-item">
              <span>
                ANIMODO
              </span>

              <strong>
                {animodoResult}
              </strong>

              {/* <small>
                Sentir / Pensar:{" "}
                <b>
                  {animodo?.axes
                    ?.sentirPensar ??
                    "-"}
                </b>
                {" · "}
                Actuar / Observar:{" "}
                <b>
                  {animodo?.axes
                    ?.actuarObservar ??
                    "-"}
                </b>
              </small> */}
            </article>

            <article className="ppr-diagnostic-item">
              <span>
                COMUNICACIÓN
              </span>

              <strong>
                {communicationType}
              </strong>

              <small>
                Color dominante:{" "}
                <b>
                  {chestColor}
                </b>
              </small>
            </article>

            <article className="ppr-diagnostic-item">
              <span>
                TIPO DE CEREBRO
              </span>

              <strong>
                {brainType}
              </strong>

              <small>
                Color de cabeza:{" "}
                <b>
                  {headColor}
                </b>
              </small>
            </article>

            <article className="ppr-diagnostic-item">
              <span>
                NEGOCIACIÓN
              </span>

              <strong>
                {negotiation
                  ?.classification ||
                  "-"}
              </strong>

              <small>
                Puntaje:{" "}
                <b>
                  {negotiation
                    ?.totalScore ??
                    "-"}
                </b>
              </small>
            </article>

            <article className="ppr-diagnostic-item">
              <span>
                SISTEMA VAK
              </span>

              <strong>
                {vak?.dominantStyle ||
                  "-"}
              </strong>

              <small>
                Canal de aprendizaje
              </small>
            </article>

            <article className="ppr-diagnostic-item">
              <span>
                PERSISTENCIA
              </span>

              <strong>
                {persistence?.level ||
                  "-"}
              </strong>

              <small>
                Índice:{" "}
                <b>
                  {persistence?.score ??
                    "-"}
                  /4
                </b>
              </small>
            </article>
          </div>
        </section>

        {/* ===================================================
            ANIMODO
        =================================================== */}

        {/* <section className="ppr-card">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                ANIMODO
              </span>

              <h2>
                Preferencia conductual
              </h2>
            </div>

            <div className="ppr-result-chip">
              {animodoResult}
            </div>
          </div>

          <div className="ppr-excel-result-row">
            <div className="ppr-excel-metric">
              <span>
                SENTIR / PENSAR
              </span>

              <strong>
                {animodo?.axes
                  ?.sentirPensar ??
                  "-"}
              </strong>
            </div>

            <div className="ppr-excel-metric">
              <span>
                ACTUAR / OBSERVAR
              </span>

              <strong>
                {animodo?.axes
                  ?.actuarObservar ??
                  "-"}
              </strong>
            </div>

            <div className="ppr-excel-metric ppr-excel-metric--result">
              <span>
                RESULTADO
              </span>

              <strong>
                {animodoResult}
              </strong>
            </div>
          </div>
        </section> */}



        {/* ===================================================
            PERFIL INTEGRAL
        =================================================== */}

        <section className="ppr-card ppr-profile-detail">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                PERFIL INTEGRAL
              </span>

              <h2>
                {personality?.nombre ||
                  personalityAnimal}
              </h2>
            </div>

            {personality?.codigo && (
              <span className="ppr-code">
                {
                  personality.codigo
                }
              </span>
            )}
          </div>

          {personality?.descripcion && (
            <div className="ppr-text-block">
              <h3>
                Descripción
              </h3>

              <p>
                {
                  personality
                    .descripcion
                }
              </p>
            </div>
          )}

          <div className="ppr-profile-text-grid">
            <div className="ppr-text-block">
              <h3>
                Forma de pensar
              </h3>

              <p>
                {personality
                  ?.formaPensar ||
                  "Sin información disponible."}
              </p>
            </div>
            {/* 
            <div className="ppr-text-block">
              <h3>
                Forma de aprender
              </h3>

              <p>
                {personality
                  ?.formaAprender ||
                  "Sin información disponible."}
              </p>
            </div> */}
          </div>
        </section>

        {/* ===================================================
            COLORES DE COMUNICACIÓN
        =================================================== */}

        <section className="ppr-card">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                COLORES DE COMUNICACIÓN
              </span>

              <h2>
                Estilo de comunicación
              </h2>
            </div>

            <div className="ppr-result-chip">
              {communicationType}
            </div>
          </div>

          <div className="ppr-two-cols">
            <div className="ppr-bars ppr-bars--communication">
              <PercentageBar
                label="Amarillo"
                value={communication?.percentages?.AMARILLO}
                color="amarillo"
              />

              <PercentageBar
                label="Rojo"
                value={communication?.percentages?.ROJO}
                color="rojo"
              />

              <PercentageBar
                label="Azul"
                value={communication?.percentages?.AZUL}
                color="azul"
              />

              <PercentageBar
                label="Verde"
                value={communication?.percentages?.VERDE}
                color="verde"
              />
            </div>

            <div className="ppr-result-panel">
              <span>
                COLOR DOMINANTE
              </span>

              <strong>
                {chestColor}
              </strong>

              <div className="ppr-result-panel__divider" />

              <span>
                TIPO DE COMUNICACIÓN
              </span>

              <strong className="ppr-result-panel__secondary">
                {communicationType}
              </strong>
            </div>
          </div>

          {personality
            ?.descripcionComunicacion && (
              <div className="ppr-text-block">
                <h3>
                  Interpretación
                </h3>

                <p>
                  {
                    personality
                      .descripcionComunicacion
                  }
                </p>
              </div>
            )}
        </section>

        {/* ===================================================
            TIPO DE CEREBRO
        =================================================== */}

        <section className="ppr-card">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                TIPO DE CEREBRO
              </span>

              <h2>
                Dominancia cerebral
              </h2>
            </div>

            <div
              className={`ppr-result-chip ppr-result-chip--${brainCategory?.toLowerCase()}`}
            >
              {brainCategory}
            </div>
          </div>

          <div className="ppr-brain-grid">
            {/* IZQUIERDO */}
            <article
              className={`ppr-brain-card ppr-brain-card--izquierdo ${brainCategory === "IZQUIERDO"
                ? "ppr-brain-card--active"
                : ""
                }`}
            >
              {brainCategory === "IZQUIERDO" && (
                <span className="ppr-brain-card__dominant">
                  DOMINANTE
                </span>
              )}

              <span className="ppr-brain-card__title">
                IZQUIERDO
              </span>

              <strong>
                {brain?.scores?.IZQUIERDO ?? 0}
              </strong>

              <small>
                Pensar / Visual
              </small>
            </article>

            {/* CENTRAL */}
            <article
              className={`ppr-brain-card ppr-brain-card--central ${brainCategory === "CENTRAL"
                ? "ppr-brain-card--active"
                : ""
                }`}
            >
              {brainCategory === "CENTRAL" && (
                <span className="ppr-brain-card__dominant">
                  DOMINANTE
                </span>
              )}

              <span className="ppr-brain-card__title">
                CENTRAL
              </span>

              <strong>
                {brain?.scores?.CENTRAL ?? 0}
              </strong>

              <small>
                Hacer / Auditivo
              </small>
            </article>

            {/* DERECHO */}
            <article
              className={`ppr-brain-card ppr-brain-card--derecho ${brainCategory === "DERECHO"
                ? "ppr-brain-card--active"
                : ""
                }`}
            >
              {brainCategory === "DERECHO" && (
                <span className="ppr-brain-card__dominant">
                  DOMINANTE
                </span>
              )}

              <span className="ppr-brain-card__title">
                DERECHO
              </span>

              <strong>
                {brain?.scores?.DERECHO ?? 0}
              </strong>

              <small>
                Sentir / Kinestésico
              </small>
            </article>
          </div>

          <div className="ppr-result-strip">
            <span>
              RESULTADO
            </span>

            <strong>
              {brainType}
            </strong>

            <small>
              Color asociado:{" "}
              <b>
                {headColor}
              </b>
            </small>
          </div>
        </section>

        {/* ===================================================
            NEGOCIACIÓN
        =================================================== */}

        <section className="ppr-card">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                FORMA NEGOCIADORA
              </span>

              <h2>
                Perfil de negociación
              </h2>
            </div>

            <div className="ppr-result-chip">
              {negotiation
                ?.classification ||
                "-"}
            </div>
          </div>

          <div className="ppr-negotiation-grid">
            <div className="ppr-big-number">
              <span>
                PUNTAJE
              </span>

              <strong>
                {negotiation
                  ?.totalScore ??
                  "-"}
              </strong>

              <small>
                de 90
              </small>
            </div>

            <div className="ppr-negotiation-result">
              <span>
                CLASIFICACIÓN
              </span>

              <strong>
                {negotiation
                  ?.classification ||
                  "-"}
              </strong>

              {negotiation
                ?.quality && (
                  <p>
                    {
                      negotiation
                        .quality
                    }
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* ===================================================
            VAK
        =================================================== */}

        <section className="ppr-card">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                SISTEMA REPRESENTACIONAL VAK
              </span>

              <h2>
                Preferencia de aprendizaje
              </h2>
            </div>

            <div className="ppr-result-chip">
              {vak?.dominantStyle ||
                "-"}
            </div>
          </div>

          <div className="ppr-vak-grid">
            <article
              className={
                vak?.dominantStyle ===
                  "VISUAL"
                  ? "ppr-vak-card ppr-vak-card--active"
                  : "ppr-vak-card"
              }
            >
              <span>
                VISUAL
              </span>

              <strong>
                {vak?.scores
                  ?.VISUAL ??
                  0}
              </strong>
            </article>

            <article
              className={
                vak?.dominantStyle ===
                  "AUDITIVO"
                  ? "ppr-vak-card ppr-vak-card--active"
                  : "ppr-vak-card"
              }
            >
              <span>
                AUDITIVO
              </span>

              <strong>
                {vak?.scores
                  ?.AUDITIVO ??
                  0}
              </strong>
            </article>

            <article
              className={
                vak?.dominantStyle ===
                  "KINESTESICO"
                  ? "ppr-vak-card ppr-vak-card--active"
                  : "ppr-vak-card"
              }
            >
              <span>
                KINESTÉSICO
              </span>

              <strong>
                {vak?.scores
                  ?.KINESTESICO ??
                  0}
              </strong>
            </article>
          </div>

          <div className="ppr-result-strip">
            <span>
              CANAL PREDOMINANTE
            </span>

            <strong>
              {prettyText(
                vak?.dominantStyle,
              )}
            </strong>
          </div>
        </section>

        {/* ===================================================
            PERSISTENCIA
        =================================================== */}

        <section className="ppr-card">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                PERSISTENCIA
              </span>

              <h2>
                Indicador integrado
              </h2>
            </div>

            <div
              className={`ppr-persistence-badge ppr-persistence-badge--${String(
                persistence?.level ||
                "",
              ).toLowerCase()}`}
            >
              {persistence?.level ||
                "-"}
            </div>
          </div>

          <div className="ppr-persistence-grid">
            <div>
              <span>
                Animodo
              </span>

              <strong>
                {persistence
                  ?.indicators
                  ?.animodo ??
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                Comunicación
              </span>

              <strong>
                {persistence
                  ?.indicators
                  ?.communication ??
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                Cerebro
              </span>

              <strong>
                {persistence
                  ?.indicators
                  ?.brain ??
                  "-"}
              </strong>
            </div>

            <div>
              <span>
                Negociación
              </span>

              <strong>
                {persistence
                  ?.indicators
                  ?.negotiation ??
                  "-"}
              </strong>
            </div>
          </div>

          <div className="ppr-result-strip">
            <span>
              ÍNDICE
            </span>

            <strong>
              {persistence?.score ??
                "-"}
              /4
            </strong>

            <small>
              Resultado final:{" "}
              <b>
                {persistence?.level ||
                  "-"}
              </b>
            </small>
          </div>
        </section>


        {/* ===================================================
    ÍNDICE DE PRODUCTIVIDAD PERSONAL
=================================================== */}

        <section className="ppr-card ppr-productivity">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                ÍNDICE DE PRODUCTIVIDAD PERSONAL
              </span>

              <h2>
                Resultado integral de productividad
              </h2>
            </div>

            <div
              className={`ppr-productivity-grade ppr-productivity-grade--${String(
                productivityIndex?.classification || "f"
              ).toLowerCase()}`}
            >
              {productivityIndex?.classification || "-"}
            </div>
          </div>

          <div className="ppr-productivity-main">

            {/* ============================
        PORCENTAJE PRINCIPAL
    ============================ */}

            <div className="ppr-productivity-score">
              <span className="ppr-productivity-score__label">
                ÍNDICE FINAL
              </span>

              <strong>
                {Math.round(
                  Number(productivityIndex?.percentage || 0)
                )}
                %
              </strong>

              <small>
                Factor{" "}
                <b>
                  {Number(
                    productivityIndex?.factor || 0
                  ).toFixed(3)}
                </b>
              </small>
            </div>

            {/* ============================
        INFORMACIÓN
    ============================ */}

            <div className="ppr-productivity-summary">
              <div>
                <span>
                  PUNTAJE
                </span>

                <strong>
                  {productivityIndex?.score ?? "-"}
                  {" / "}
                  {productivityIndex?.maxScore ?? 6}
                </strong>
              </div>

              <div>
                <span>
                  CLASIFICACIÓN
                </span>

                <strong>
                  {productivityIndex?.classification || "-"}
                </strong>
              </div>

              <div>
                <span>
                  FACTOR
                </span>

                <strong>
                  {Number(
                    productivityIndex?.factor || 0
                  ).toFixed(3)}
                </strong>
              </div>
            </div>
          </div>

          {/* =================================================
      BARRA GENERAL
  ================================================= */}

          <div className="ppr-productivity-progress">
            <div className="ppr-productivity-progress__head">
              <span>
                Nivel de productividad personal
              </span>

              <strong>
                {Number(
                  productivityIndex?.percentage || 0
                ).toFixed(1)}
                %
              </strong>
            </div>

            <div className="ppr-productivity-progress__track">
              <span
                className={`ppr-productivity-progress__fill ppr-productivity-progress__fill--${String(
                  productivityIndex?.classification || "f"
                ).toLowerCase()}`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        productivityIndex?.percentage || 0
                      )
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* =================================================
      COMPONENTES
  ================================================= */}
{/* 
          <div className="ppr-productivity-detail">

            <div className="ppr-productivity-detail__item">
              <span>
                Persistencia
              </span>

              <strong>
                {productivityIndex
                  ?.detail
                  ?.persistence
                  ?.result || "-"}
              </strong>

              <small>
                Valor:{" "}
                <b>
                  {productivityIndex
                    ?.detail
                    ?.persistence
                    ?.value ?? "-"}
                </b>
              </small>
            </div>

            <div className="ppr-productivity-detail__item">
              <span>
                Comunicación
              </span>

              <strong>
                {productivityIndex
                  ?.detail
                  ?.communication
                  ?.result || "-"}
              </strong>

              <small>
                Valor:{" "}
                <b>
                  {productivityIndex
                    ?.detail
                    ?.communication
                    ?.value ?? "-"}
                </b>
              </small>
            </div>

            <div className="ppr-productivity-detail__item">
              <span>
                Animodo
              </span>

              <strong>
                {prettyText(
                  productivityIndex
                    ?.detail
                    ?.animodo
                    ?.result
                )}
              </strong>

              <small>
                Valor:{" "}
                <b>
                  {productivityIndex
                    ?.detail
                    ?.animodo
                    ?.value ?? "-"}
                </b>
              </small>
            </div>

            <div className="ppr-productivity-detail__item">
              <span>
                Cerebro
              </span>

              <strong>
                {productivityIndex
                  ?.detail
                  ?.brain
                  ?.result || "-"}
              </strong>

              <small>
                Valor:{" "}
                <b>
                  {productivityIndex
                    ?.detail
                    ?.brain
                    ?.value ?? "-"}
                </b>
              </small>
            </div>

            <div className="ppr-productivity-detail__item">
              <span>
                Negociación
              </span>

              <strong>
                {productivityIndex
                  ?.detail
                  ?.negotiation
                  ?.result || "-"}
              </strong>

              <small>
                Valor:{" "}
                <b>
                  {productivityIndex
                    ?.detail
                    ?.negotiation
                    ?.value ?? "-"}
                </b>
              </small>
            </div>

            <div className="ppr-productivity-detail__item">
              <span>
                Sistema VAK
              </span>

              <strong>
                {prettyText(
                  productivityIndex
                    ?.detail
                    ?.vak
                    ?.result
                )}
              </strong>

              <small>
                Valor:{" "}
                <b>
                  {productivityIndex
                    ?.detail
                    ?.vak
                    ?.value ?? "-"}
                </b>
              </small>
            </div>
          </div> */}

          <div className="ppr-productivity-note">
            <span>
              IPP
            </span>

            <p>
              El Índice de Productividad Personal integra los
              principales resultados de la evaluación y permite
              observar de forma global cómo interactúan la
              persistencia, comunicación, preferencia conductual,
              dominancia cerebral, negociación y sistema
              representacional.
            </p>
          </div>
        </section>


        {/* ===================================================
            INFORMACIÓN DE VALIDACIÓN
        =================================================== */}

        <section className="ppr-validation">
          <div>
            <span>
              Estado
            </span>

            <strong>
              Resultado validado
            </strong>
          </div>

          <div>
            <span>
              Evaluación
            </span>

            <strong>
              N.º{" "}
              {evaluation
                ?.numeroEvaluacion ||
                "-"}
            </strong>
          </div>

          {/* {payment
            ?.valorDepositado !==
            undefined &&
            payment
              ?.valorDepositado !==
            null && (
              <div>
                <span>
                  Pago registrado
                </span>

                <strong>
                  $
                  {Number(
                    payment
                      .valorDepositado ||
                    0,
                  ).toFixed(2)}
                </strong>
              </div>
            )} */}
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="ppr-footer">
          <p>
            Este informe constituye
            una herramienta de
            autoconocimiento y
            desarrollo. Los resultados
            deben interpretarse de
            manera integral.
          </p>

          <button
            type="button"
            className="ppr-btn ppr-btn--primary"
            onClick={
              handleOpenPdf
            }
            disabled={
              openingPdf
            }
          >
            {openingPdf
              ? "⏳ Abriendo..."
              : "📄 Ver informe completo en PDF"}
          </button>

          <small>
            ©{" "}
            {new Date().getFullYear()}{" "}
            iDr.Mind. Todos los
            derechos reservados.
          </small>
        </footer>
      </div>
    </div>
  );
};

export default ProyectoPensarResultado;