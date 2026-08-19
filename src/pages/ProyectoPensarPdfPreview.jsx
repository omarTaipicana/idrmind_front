import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import axios from "axios";

import getConfigToken from "../services/getConfigToken";

import "./styles/ProyectoPensarPdfPreview.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const ProyectoPensarPdfPreview = () => {
  const {
    evaluationId,
  } = useParams();

  const [
    pdfUrl,
    setPdfUrl,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    lastUpdate,
    setLastUpdate,
  ] = useState(null);

  const [
    autoRefresh,
    setAutoRefresh,
  ] = useState(false);

  const [
    refreshSeconds,
    setRefreshSeconds,
  ] = useState(3);

  /* =======================================================
     ENDPOINT
  ======================================================= */

  const endpoint =
    useMemo(() => {
      if (!evaluationId) {
        return "";
      }

      return `${API_URL}/psychometric/results/${evaluationId}/pdf-preview`;
    }, [evaluationId]);

  /* =======================================================
     CARGAR PDF
  ======================================================= */

  const loadPdf =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          !evaluationId ||
          !endpoint
        ) {
          setError(
            "No se recibió un evaluationId válido."
          );

          setLoading(false);

          return;
        }

        try {
          if (!silent) {
            setLoading(true);
          }

          setError("");

          const response =
            await axios.get(
              endpoint,
              {
                ...getConfigToken(),

                responseType:
                  "blob",

                params: {
                  /*
                   * Evita cualquier posibilidad
                   * de caché del navegador/proxy.
                   */
                  v:
                    Date.now(),
                },
              }
            );

          const contentType =
            response.headers?.[
              "content-type"
            ] || "";

          if (
            !contentType.includes(
              "application/pdf"
            )
          ) {
            /*
             * Si el backend devolvió JSON
             * dentro del blob, lo leemos.
             */
            if (
              response.data instanceof
              Blob
            ) {
              try {
                const text =
                  await response.data.text();

                const json =
                  JSON.parse(text);

                throw new Error(
                  json?.message ||
                    "La respuesta no contiene un PDF."
                );
              } catch (
                parseError
              ) {
                if (
                  parseError instanceof
                  Error &&
                  parseError.message !==
                    "Unexpected end of JSON input"
                ) {
                  throw parseError;
                }
              }
            }

            throw new Error(
              "La respuesta del servidor no es un PDF."
            );
          }

          const blob =
            new Blob(
              [response.data],
              {
                type:
                  "application/pdf",
              }
            );

          const objectUrl =
            URL.createObjectURL(
              blob
            );

          /*
           * Liberamos el PDF anterior
           * antes de guardar el nuevo.
           */
          setPdfUrl(
            (previousUrl) => {
              if (
                previousUrl
              ) {
                URL.revokeObjectURL(
                  previousUrl
                );
              }

              return objectUrl;
            }
          );

          setLastUpdate(
            new Date()
          );
        } catch (err) {
          console.error(
            "Error cargando preview PDF:",
            err
          );

          let message =
            err?.response
              ?.data?.message ||
            err?.message ||
            "No fue posible generar la vista previa.";

          /*
           * Axios puede devolver el error
           * del backend como Blob.
           */
          if (
            err?.response
              ?.data instanceof
            Blob
          ) {
            try {
              const text =
                await err.response.data.text();

              const json =
                JSON.parse(
                  text
                );

              message =
                json?.message ||
                message;
            } catch {
              // mantener mensaje
            }
          }

          setError(
            message
          );
        } finally {
          if (!silent) {
            setLoading(false);
          }
        }
      },
      [
        endpoint,
        evaluationId,
      ]
    );

  /* =======================================================
     PRIMERA CARGA
  ======================================================= */

  useEffect(() => {
    loadPdf();

    return () => {
      setPdfUrl(
        (currentUrl) => {
          if (
            currentUrl
          ) {
            URL.revokeObjectURL(
              currentUrl
            );
          }

          return "";
        }
      );
    };
  }, [loadPdf]);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    if (
      !autoRefresh
    ) {
      return undefined;
    }

    const seconds =
      Math.max(
        2,
        Number(
          refreshSeconds
        ) || 3
      );

    const interval =
      window.setInterval(
        () => {
          loadPdf({
            silent: true,
          });
        },
        seconds * 1000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    autoRefresh,
    refreshSeconds,
    loadPdf,
  ]);

  /* =======================================================
     FECHA
  ======================================================= */

  const formattedLastUpdate =
    lastUpdate
      ? new Intl.DateTimeFormat(
          "es-EC",
          {
            timeZone:
              "America/Guayaquil",

            hour:
              "2-digit",

            minute:
              "2-digit",

            second:
              "2-digit",

            hour12:
              false,
          }
        ).format(
          lastUpdate
        )
      : "-";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="pdf-preview-page">
      <section className="pdf-preview-shell">

        {/* ===============================================
            TOOLBAR
        =============================================== */}

        <header className="pdf-preview-toolbar">
          <div className="pdf-preview-toolbar__info">
            <span className="pdf-preview-toolbar__eyebrow">
              PROYECTO PENSAR
            </span>

            <h1>
              Diseñador de informe PDF
            </h1>

            <p>
              Edita el generador en el
              backend y actualiza esta
              vista para comprobar los
              cambios.
            </p>
          </div>

          <div className="pdf-preview-toolbar__actions">
            <button
              type="button"
              className="pdf-preview-btn pdf-preview-btn--primary"
              onClick={() =>
                loadPdf()
              }
              disabled={
                loading
              }
            >
              {loading
                ? "Generando..."
                : "↻ Actualizar PDF"}
            </button>
          </div>
        </header>

        {/* ===============================================
            CONTROL BAR
        =============================================== */}

        <div className="pdf-preview-controls">
          <div className="pdf-preview-controls__item">
            <span>
              Evaluación
            </span>

            <strong>
              {evaluationId ||
                "-"}
            </strong>
          </div>

          <div className="pdf-preview-controls__item">
            <span>
              Última actualización
            </span>

            <strong>
              {
                formattedLastUpdate
              }
            </strong>
          </div>

          <label className="pdf-preview-autorefresh">
            <input
              type="checkbox"
              checked={
                autoRefresh
              }
              onChange={(
                event
              ) =>
                setAutoRefresh(
                  event.target
                    .checked
                )
              }
            />

            <span>
              Actualización automática
            </span>
          </label>

          <label className="pdf-preview-frequency">
            <span>
              cada
            </span>

            <select
              value={
                refreshSeconds
              }
              disabled={
                !autoRefresh
              }
              onChange={(
                event
              ) =>
                setRefreshSeconds(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            >
              <option value={2}>
                2 s
              </option>

              <option value={3}>
                3 s
              </option>

              <option value={5}>
                5 s
              </option>

              <option value={10}>
                10 s
              </option>
            </select>
          </label>
        </div>

        {/* ===============================================
            ERROR
        =============================================== */}

        {error && (
          <div className="pdf-preview-error">
            <strong>
              No se pudo generar el PDF
            </strong>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadPdf()
              }
            >
              Intentar nuevamente
            </button>
          </div>
        )}

        {/* ===============================================
            VISOR
        =============================================== */}

        <section className="pdf-preview-viewer">
          {loading &&
          !pdfUrl ? (
            <div className="pdf-preview-loading">
              <span className="pdf-preview-spinner" />

              <strong>
                Generando vista previa...
              </strong>

              <p>
                El backend está creando
                nuevamente el informe.
              </p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Preview informe Proyecto Pensar"
              className="pdf-preview-frame"
            />
          ) : (
            <div className="pdf-preview-loading">
              <strong>
                Sin PDF
              </strong>

              <p>
                Pulsa Actualizar PDF para
                generar la vista.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default ProyectoPensarPdfPreview;