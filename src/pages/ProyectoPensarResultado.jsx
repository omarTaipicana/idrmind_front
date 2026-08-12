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
  const { token } =
    useParams();

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

          setLoading(
            false,
          );

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

          setData(
            response,
          );
        } catch (err) {
          if (!mounted) {
            return;
          }

          console.error(
            "Error cargando resultado psicométrico:",
            err?.response
              ?.data ||
              err,
          );

          const backend =
            err?.response
              ?.data;

          if (
            err?.response
              ?.status ===
            410
          ) {
            setError(
              backend?.message ||
                "El enlace del resultado ha expirado.",
            );
          } else if (
            err?.response
              ?.status ===
            403
          ) {
            setError(
              backend?.message ||
                "El resultado todavía no está disponible.",
            );
          } else if (
            err?.response
              ?.status ===
            404
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
          if (
            mounted
          ) {
            setLoading(
              false,
            );
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
    data?.user ||
    {};

  const evaluation =
    data?.evaluation ||
    {};

  const course =
    data?.course ||
    {};

  const personality =
    data?.personality ||
    {};

  const result =
    data?.result ||
    {};

  const payment =
    data?.payment ||
    {};

  const animodo =
    result?.animodo ||
    {};

  const communication =
    result?.communication ||
    {};

  const brain =
    result?.brain ||
    {};

  const negotiation =
    result?.negotiation ||
    {};

  const vak =
    result?.vak ||
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
          user?.firstName,
          user?.lastName,
        ]
          .filter(
            Boolean,
          )
          .join(" "),
      [
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

          day: "2-digit",
        },
      ).format(
        new Date(
          value,
        ),
      );
    } catch {
      return "-";
    }
  };

  /* =========================================================
     PORCENTAJE
  ========================================================= */

  const formatPercent = (
    value,
  ) => {
    const n =
      Number(value);

    if (
      !Number.isFinite(
        n,
      )
    ) {
      return "0%";
    }

    return `${n.toFixed(
      1,
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
        setOpeningPdf(
          true,
        );

        /*
         * Como el endpoint es público
         * y devuelve application/pdf,
         * lo abrimos directamente.
         */
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
            setOpeningPdf(
              false,
            );
          },
          500,
        );
      }
    };

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
          Number(
            value,
          ) || 0,
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
            Estamos preparando la información
            de tu evaluación.
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

          <button
            type="button"
            className="ppr-btn ppr-btn--secondary"
            onClick={() =>
              navigate(
                "/",
              )
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
        {/* ===============================================
            HERO
        =============================================== */}

        <section className="ppr-hero">
          <div className="ppr-hero__content">
            <span className="ppr-eyebrow">
              PROYECTO PENSAR
            </span>

            <h1>
              Tu informe de resultados
            </h1>

            <p>
              {course?.nombre ||
                "Test Psicotécnico de Personalidad"}
            </p>

            <div className="ppr-person">
              <strong>
                {fullName ||
                  "Participante"}
              </strong>

              <span>
                Evaluación N.º{" "}
                {evaluation?.numeroEvaluacion ||
                  "-"}
              </span>

              <span>
                Finalizada el{" "}
                {formatDate(
                  evaluation?.fechaFinalizacion,
                )}
              </span>
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

          <div className="ppr-hero__visual">
            {personality?.imagenUrl ? (
              <img
                src={
                  personality.imagenUrl
                }
                alt={
                  personality?.nombre ||
                  "Perfil de personalidad"
                }
                className="ppr-personality-image"
              />
            ) : (
              <div className="ppr-personality-placeholder">
                🧠
              </div>
            )}
          </div>
        </section>

        {/* ===============================================
            PERFIL
        =============================================== */}

        <section className="ppr-card ppr-profile">
          <div>
            <span className="ppr-section-label">
              PERFIL INTEGRAL
            </span>

            <h2>
              {personality?.nombre ||
                "Resultado psicométrico"}
            </h2>

            {personality?.codigo && (
              <span className="ppr-code">
                {
                  personality.codigo
                }
              </span>
            )}
          </div>

          <p>
            {personality?.descripcion ||
              "Tu perfil combina los resultados obtenidos en las diferentes dimensiones de la evaluación."}
          </p>
        </section>

        {/* ===============================================
            RESUMEN
        =============================================== */}

        <section>
          <div className="ppr-section-title">
            <span>
              RESULTADOS PRINCIPALES
            </span>

            <h2>
              Tu diagnóstico integral
            </h2>
          </div>

          <div className="ppr-summary-grid">
            <article className="ppr-summary-card">
              <span>
                Animodo
              </span>

              <strong>
                {animodo?.animal ||
                  personality?.animal ||
                  "-"}
              </strong>

              <small>
                Perfil conductual
              </small>
            </article>

            <article className="ppr-summary-card">
              <span>
                Tipo de cerebro
              </span>

              <strong>
                {brain?.brainType ||
                  personality?.tipoCerebro ||
                  "-"}
              </strong>

              <small>
                {brain?.headColor ||
                  personality?.colorCabeza
                  ? `Color ${
                      brain?.headColor ||
                      personality?.colorCabeza
                    }`
                  : ""}
              </small>
            </article>

            <article className="ppr-summary-card">
              <span>
                Comunicación
              </span>

              <strong>
                {communication?.communicationType ||
                  personality?.tipoComunicacion ||
                  "-"}
              </strong>

              <small>
                {communication?.dominantColor ||
                  personality?.colorPecho
                  ? `Color ${
                      communication?.dominantColor ||
                      personality?.colorPecho
                    }`
                  : ""}
              </small>
            </article>

            <article className="ppr-summary-card">
              <span>
                VAK
              </span>

              <strong>
                {vak?.dominantStyle ||
                  "-"}
              </strong>

              <small>
                Estilo predominante
              </small>
            </article>

            <article className="ppr-summary-card">
              <span>
                Negociación
              </span>

              <strong>
                {negotiation?.classification ||
                  "-"}
              </strong>

              <small>
                Puntaje{" "}
                {negotiation?.totalScore ??
                  "-"}
              </small>
            </article>

            <article className="ppr-summary-card">
              <span>
                Persistencia
              </span>

              <strong>
                {persistence?.level ||
                  "-"}
              </strong>

              <small>
                Índice{" "}
                {persistence?.score ??
                  "-"}
              </small>
            </article>
          </div>
        </section>

        {/* ===============================================
            ANIMODO
        =============================================== */}

        <section className="ppr-card">
          <div className="ppr-section-title ppr-section-title--inside">
            <span>
              ANIMODO
            </span>

            <h2>
              Sentir, pensar, actuar y observar
            </h2>
          </div>

          <div className="ppr-two-cols">
            <div>
              <div className="ppr-result-highlight">
                <span>
                  Resultado
                </span>

                <strong>
                  {animodo?.animal ||
                    personality?.animal ||
                    "-"}
                </strong>
              </div>

              <div className="ppr-axis-list">
                <div className="ppr-axis">
                  <span>
                    Sentir - Pensar
                  </span>

                  <strong>
                    {animodo?.axes?.sentirPensar ??
                      "-"}
                  </strong>
                </div>

                <div className="ppr-axis">
                  <span>
                    Actuar - Observar
                  </span>

                  <strong>
                    {animodo?.axes?.actuarObservar ??
                      "-"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="ppr-description-block">
              <h3>
                Forma de pensar
              </h3>

              <p>
                {personality?.formaPensar ||
                  "Sin descripción configurada."}
              </p>

              <h3>
                Forma de aprender
              </h3>

              <p>
                {personality?.formaAprender ||
                  "Sin descripción configurada."}
              </p>
            </div>
          </div>
        </section>

        {/* ===============================================
            CEREBRO + VAK
        =============================================== */}

        <section className="ppr-two-panel">
          <article className="ppr-card">
            <div className="ppr-section-title ppr-section-title--inside">
              <span>
                TIPO DE CEREBRO
              </span>

              <h2>
                {brain?.brainType ||
                  personality?.tipoCerebro ||
                  "-"}
              </h2>
            </div>

            <div className="ppr-bars">
              <PercentageBar
                label="Pensante"
                value={
                  brain?.percentages
                    ?.PENSANTE
                }
              />

              <PercentageBar
                label="Emocional"
                value={
                  brain?.percentages
                    ?.EMOCIONAL
                }
              />

              <PercentageBar
                label="Reptiliano"
                value={
                  brain?.percentages
                    ?.REPTILIANO
                }
              />
            </div>
          </article>

          <article className="ppr-card">
            <div className="ppr-section-title ppr-section-title--inside">
              <span>
                SISTEMA VAK
              </span>

              <h2>
                {vak?.dominantStyle ||
                  "-"}
              </h2>
            </div>

            <div className="ppr-bars">
              <PercentageBar
                label="Visual"
                value={
                  vak?.percentages
                    ?.VISUAL
                }
              />

              <PercentageBar
                label="Auditivo"
                value={
                  vak?.percentages
                    ?.AUDITIVO
                }
              />

              <PercentageBar
                label="Kinestésico"
                value={
                  vak?.percentages
                    ?.KINESTESICO
                }
              />
            </div>
          </article>
        </section>

        {/* ===============================================
            COMUNICACIÓN
        =============================================== */}

        <section className="ppr-card">
          <div className="ppr-section-title ppr-section-title--inside">
            <span>
              COMUNICACIÓN
            </span>

            <h2>
              {communication?.communicationType ||
                personality?.tipoComunicacion ||
                "-"}
            </h2>
          </div>

          <div className="ppr-communication-grid">
            <div className="ppr-bars">
              <PercentageBar
                label="Amarillo"
                value={
                  communication?.percentages
                    ?.AMARILLO
                }
              />

              <PercentageBar
                label="Rojo"
                value={
                  communication?.percentages
                    ?.ROJO
                }
              />

              <PercentageBar
                label="Azul"
                value={
                  communication?.percentages
                    ?.AZUL
                }
              />

              <PercentageBar
                label="Verde"
                value={
                  communication?.percentages
                    ?.VERDE
                }
              />
            </div>

            <div className="ppr-description-block">
              <h3>
                Estilo de comunicación
              </h3>

              <p>
                {personality?.descripcionComunicacion ||
                  "Sin descripción configurada."}
              </p>
            </div>
          </div>
        </section>

        {/* ===============================================
            NEGOCIACIÓN / PERSISTENCIA
        =============================================== */}

        <section className="ppr-two-panel">
          <article className="ppr-card">
            <div className="ppr-section-title ppr-section-title--inside">
              <span>
                NEGOCIACIÓN
              </span>

              <h2>
                {negotiation?.classification ||
                  "-"}
              </h2>
            </div>

            <div className="ppr-metric">
              <span>
                Puntaje obtenido
              </span>

              <strong>
                {negotiation?.totalScore ??
                  "-"}
              </strong>
            </div>
          </article>

          <article className="ppr-card">
            <div className="ppr-section-title ppr-section-title--inside">
              <span>
                PERSISTENCIA
              </span>

              <h2>
                {persistence?.level ||
                  "-"}
              </h2>
            </div>

            <div className="ppr-metric">
              <span>
                Índice obtenido
              </span>

              <strong>
                {persistence?.score ??
                  "-"}
              </strong>
            </div>

            {Array.isArray(
              persistence?.factors,
            ) &&
              persistence.factors.length >
                0 && (
                <div className="ppr-tags">
                  {persistence.factors.map(
                    (
                      factor,
                    ) => (
                      <span
                        key={
                          factor
                        }
                      >
                        {String(
                          factor,
                        )
                          .replace(
                            /_/g,
                            " ",
                          )
                          .toLowerCase()}
                      </span>
                    ),
                  )}
                </div>
              )}
          </article>
        </section>

        {/* ===============================================
            PAGO
        =============================================== */}

        <section className="ppr-payment">
          <div>
            <span>
              Resultado liberado
            </span>

            <strong>
              Pago verificado correctamente
            </strong>
          </div>

          <div>
            <span>
              Evaluación
            </span>

            <strong>
              N.º{" "}
              {evaluation?.numeroEvaluacion ||
                "-"}
            </strong>
          </div>

          <div>
            <span>
              Valor registrado
            </span>

            <strong>
              $
              {Number(
                payment?.valorDepositado ||
                  0,
              ).toFixed(
                2,
              )}
            </strong>
          </div>
        </section>

        {/* ===============================================
            FOOTER
        =============================================== */}

        <footer className="ppr-footer">
          <p>
            Este informe es una herramienta de
            autoconocimiento y desarrollo personal.
            Sus resultados deben interpretarse de forma
            integral y no como etiquetas rígidas.
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
            📄 Ver informe completo en PDF
          </button>

          <small>
            ©{" "}
            {new Date().getFullYear()}{" "}
            iDr.Mind. Todos los derechos reservados.
          </small>
        </footer>
      </div>
    </div>
  );
};

export default ProyectoPensarResultado;