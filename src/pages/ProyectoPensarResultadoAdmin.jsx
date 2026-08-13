import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import axios from "axios";

import getConfigToken from "../services/getConfigToken";

import "./styles/ProyectoPensarResultado.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const ProyectoPensarResultadoAdmin = () => {
  const { evaluationId } =
    useParams();

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
     CARGAR RESULTADO ADMINISTRATIVO
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadResult =
      async () => {
        if (
          !evaluationId ||
          !String(
            evaluationId,
          ).trim()
        ) {
          setError(
            "No se recibió una evaluación válida.",
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
              `${API_URL}/psychometric/results/${evaluationId}`,
              getConfigToken(),
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
            "Error cargando resultado psicométrico administrativo:",
            err?.response?.data ||
              err,
          );

          const backend =
            err?.response?.data;

          if (
            err?.response
              ?.status === 401
          ) {
            setError(
              "Tu sesión no es válida o ha expirado.",
            );
          } else if (
            err?.response
              ?.status === 403
          ) {
            setError(
              backend?.message ||
                "No tienes permisos para consultar este resultado.",
            );
          } else if (
            err?.response
              ?.status === 404
          ) {
            setError(
              backend?.message ||
                "No se encontró la evaluación solicitada.",
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
  }, [evaluationId]);

  /* =========================================================
     NORMALIZAR RESPUESTA
  ========================================================= */

  const evaluation =
    data?.evaluation ||
    data ||
    {};

  const user =
    data?.user ||
    evaluation
      ?.inscripcion
      ?.user ||
    {};

  const course =
    data?.course ||
    evaluation
      ?.test
      ?.course ||
    {};

  const result =
    data?.result ||
    evaluation?.resultado ||
    {};

  const personality =
    data?.personality ||
    result?.personality ||
    evaluation
      ?.personality ||
    {};

  const animodo =
    result?.animodo ||
    {};

  const brain =
    result?.brain ||
    {};

  const communication =
    result?.communication ||
    {};

  const vak =
    result?.vak ||
    {};

  const negotiation =
    result?.negotiation ||
    {};

  const persistence =
    result?.persistence ||
    {};

  /* =========================================================
     NOMBRE
  ========================================================= */

  const fullName =
    useMemo(
      () =>
        [
          user?.grado,
          user?.firstName,
          user?.lastName,
        ]
          .filter(Boolean)
          .join(" "),
      [
        user?.grado,
        user?.firstName,
        user?.lastName,
      ],
    );

  /* =========================================================
     FECHA
  ========================================================= */

  const formatDate = (
    value,
  ) => {
    if (!value) {
      return "-";
    }

    try {
      return new Intl.DateTimeFormat(
        "es-EC",
        {
          timeZone:
            "America/Guayaquil",

          year:
            "numeric",

          month:
            "long",

          day:
            "2-digit",

          hour:
            "2-digit",

          minute:
            "2-digit",
        },
      ).format(
        new Date(value),
      );
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

    return `${Math.round(
      number,
    )}%`;
  };

  /* =========================================================
     DATOS DE RESULTADO
  ========================================================= */

  const animodoResult =
    animodo?.animal ||
    personality
      ?.resultadoAnimodo ||
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
    personality
      ?.categoriaCerebro ||
    "-";

  const headColor =
    brain?.headColor ||
    personality?.colorCabeza ||
    "-";

  const chestColor =
    communication
      ?.dominantColor ||
    personality?.colorPecho ||
    "-";

  const communicationType =
    communication
      ?.communicationType ||
    personality
      ?.tipoComunicacion ||
    "-";

  /* =========================================================
     BARRA
  ========================================================= */

  const PercentageBar = ({
    label,
    value,
  }) => {
    const normalized =
      Math.max(
        0,
        Math.min(
          100,
          Number(value) || 0,
        ),
      );

    return (
      <div className="ppr-bar">
        <div className="ppr-bar__head">
          <span>
            {label}
          </span>

          <strong>
            {formatPercent(
              normalized,
            )}
          </strong>
        </div>

        <div className="ppr-bar__track">
          <span
            className="ppr-bar__fill"
            style={{
              width:
                `${normalized}%`,
            }}
          />
        </div>
      </div>
    );
  };

  /* =========================================================
     ABRIR PDF ADMINISTRATIVO
  ========================================================= */

  const handleOpenPdf =
    async () => {
      if (!evaluationId) {
        return;
      }

      try {
        setOpeningPdf(true);

        /*
         * El endpoint administrativo
         * requiere JWT.
         *
         * Se solicita como blob.
         */
        const response =
          await axios.get(
            `${API_URL}/psychometric/results/${evaluationId}/pdf`,
            {
              ...getConfigToken(),

              responseType:
                "blob",
            },
          );

        const blob =
          new Blob(
            [response.data],
            {
              type:
                "application/pdf",
            },
          );

        const pdfUrl =
          window.URL.createObjectURL(
            blob,
          );

        const newWindow =
          window.open(
            pdfUrl,
            "_blank",
          );

        /*
         * Si el navegador bloquea
         * la nueva pestaña,
         * se descarga el documento.
         */
        if (!newWindow) {
          const link =
            document.createElement(
              "a",
            );

          link.href =
            pdfUrl;

          link.download =
            `resultado-proyecto-pensar-${evaluationId}.pdf`;

          document.body.appendChild(
            link,
          );

          link.click();

          link.remove();
        }

        setTimeout(
          () => {
            window.URL.revokeObjectURL(
              pdfUrl,
            );
          },
          10000,
        );
      } catch (error) {
        console.error(
          "Error abriendo PDF psicométrico:",
          error,
        );

        const contentType =
          error?.response
            ?.headers?.[
            "content-type"
          ];

        if (
          error?.response
            ?.data instanceof
            Blob &&
          contentType?.includes(
            "application/json",
          )
        ) {
          try {
            const text =
              await error.response.data.text();

            const json =
              JSON.parse(text);

            alert(
              json?.message ||
                "No fue posible generar el PDF.",
            );

            return;
          } catch {
            // continúa
          }
        }

        alert(
          "No fue posible generar el PDF del resultado.",
        );
      } finally {
        setOpeningPdf(false);
      }
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
            Cargando resultado...
          </h2>

          <p>
            Consultando la evaluación
            psicométrica.
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
            No fue posible abrir el resultado
          </h2>

          <p>
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="ppr-page">
      <div className="ppr-shell">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="ppr-hero">
          <div className="ppr-hero__content">
            <span className="ppr-eyebrow">
              RESULTADO ADMINISTRATIVO
            </span>

            <h1>
              Informe psicométrico
            </h1>

            <p className="ppr-hero__subtitle">
              {course?.nombre ||
                "Proyecto Pensar"}
            </p>

            <div className="ppr-person">
              <div>
                <span>
                  Participante
                </span>

                <strong>
                  {fullName ||
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
                  Finalizada
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
                  ? "⏳ Generando PDF..."
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
            DATOS ADMINISTRATIVOS
        =================================================== */}

        <section className="ppr-validation">
          <div>
            <span>
              Estado evaluación
            </span>

            <strong>
              {evaluation?.estado ||
                "-"}
            </strong>
          </div>

          <div>
            <span>
              Resultado liberado
            </span>

            <strong>
              {evaluation
                ?.resultadoLiberado
                ? "Sí"
                : "No"}
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
              Vista administrativa
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

              <small>
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
              </small>
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
                Color asociado:{" "}
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
                Canal predominante
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

        <section className="ppr-card">
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
        </section>

        {/* ===================================================
            COMUNICACIÓN
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
            <div className="ppr-bars">
              <PercentageBar
                label="Amarillo"
                value={
                  communication
                    ?.percentages
                    ?.AMARILLO
                }
              />

              <PercentageBar
                label="Rojo"
                value={
                  communication
                    ?.percentages
                    ?.ROJO
                }
              />

              <PercentageBar
                label="Azul"
                value={
                  communication
                    ?.percentages
                    ?.AZUL
                }
              />

              <PercentageBar
                label="Verde"
                value={
                  communication
                    ?.percentages
                    ?.VERDE
                }
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
            CEREBRO
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

            <div className="ppr-result-chip">
              {brainCategory}
            </div>
          </div>

          <div className="ppr-brain-grid">
            <article
              className={
                brainCategory ===
                "IZQUIERDO"
                  ? "ppr-brain-card ppr-brain-card--active"
                  : "ppr-brain-card"
              }
            >
              <span>
                IZQUIERDO
              </span>

              <strong>
                {brain?.scores
                  ?.IZQUIERDO ??
                  0}
              </strong>

              <small>
                Pensar / Visual
              </small>
            </article>

            <article
              className={
                brainCategory ===
                "CENTRAL"
                  ? "ppr-brain-card ppr-brain-card--active"
                  : "ppr-brain-card"
              }
            >
              <span>
                CENTRAL
              </span>

              <strong>
                {brain?.scores
                  ?.CENTRAL ??
                  0}
              </strong>

              <small>
                Hacer / Auditivo
              </small>
            </article>

            <article
              className={
                brainCategory ===
                "DERECHO"
                  ? "ppr-brain-card ppr-brain-card--active"
                  : "ppr-brain-card"
              }
            >
              <span>
                DERECHO
              </span>

              <strong>
                {brain?.scores
                  ?.DERECHO ??
                  0}
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
            FORMA NEGOCIADORA
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
              {prettyText(
                vak?.dominantStyle,
              )}
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

            <div className="ppr-text-block">
              <h3>
                Forma de aprender
              </h3>

              <p>
                {personality
                  ?.formaAprender ||
                  "Sin información disponible."}
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            INFORMACIÓN ADMINISTRATIVA
        =================================================== */}

        <section className="ppr-card">
          <div className="ppr-section-heading">
            <div>
              <span className="ppr-section-kicker">
                INFORMACIÓN ADMINISTRATIVA
              </span>

              <h2>
                Datos de la evaluación
              </h2>
            </div>
          </div>

          <div className="ppr-diagnostic-grid">
            <article className="ppr-diagnostic-item">
              <span>
                EVALUATION ID
              </span>

              <strong
                style={{
                  fontSize:
                    "0.73rem",
                  wordBreak:
                    "break-all",
                }}
              >
                {evaluation?.id ||
                  evaluationId}
              </strong>
            </article>

            <article className="ppr-diagnostic-item">
              <span>
                PERSONALITY ID
              </span>

              <strong
                style={{
                  fontSize:
                    "0.73rem",
                  wordBreak:
                    "break-all",
                }}
              >
                {evaluation
                  ?.personalityId ||
                  personality?.id ||
                  "-"}
              </strong>
            </article>

            <article className="ppr-diagnostic-item">
              <span>
                RESULTADO LIBERADO
              </span>

              <strong>
                {evaluation
                  ?.resultadoLiberado
                  ? "Sí"
                  : "No"}
              </strong>
            </article>
          </div>
        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="ppr-footer">
          <p>
            Vista administrativa del resultado
            psicométrico. Esta información es de
            carácter personal y debe manejarse de
            acuerdo con las políticas de acceso del
            sistema.
          </p>

          <div className="ppr-footer__actions">
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
                ? "⏳ Generando..."
                : "📄 Ver informe PDF"}
            </button>
          </div>

          <small>
            ©{" "}
            {new Date().getFullYear()}{" "}
            iDr.Mind.
          </small>
        </footer>
      </div>
    </div>
  );
};

export default ProyectoPensarResultadoAdmin;