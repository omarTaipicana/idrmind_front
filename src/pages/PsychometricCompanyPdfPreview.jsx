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

import "./styles/PsychometricCompanyPdfPreview.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const PsychometricCompanyPdfPreview = () => {
  const {
    empresaId,
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
      if (!empresaId) {
        return "";
      }

      return `${API_URL}/psychometric/dashboard/organizations/${empresaId}/pdf-preview`;
    }, [
      empresaId,
    ]);

  /* =======================================================
     CARGAR PDF
  ======================================================= */

  const loadPdf =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          !empresaId ||
          !endpoint
        ) {
          setError(
            "No se recibió un empresaId válido."
          );

          setLoading(
            false
          );

          return;
        }

        try {
          if (
            !silent
          ) {
            setLoading(
              true
            );
          }

          setError(
            ""
          );

          const response =
            await axios.get(
              endpoint,
              {
                ...getConfigToken(),

                responseType:
                  "blob",

                params: {
                  /*
                   * Evita caché del navegador,
                   * Apache o proxy.
                   */
                  v:
                    Date.now(),
                },
              }
            );

          const contentType =
            response.headers?.[
              "content-type"
            ] ||
            "";

          if (
            !contentType.includes(
              "application/pdf"
            )
          ) {
            if (
              response.data instanceof
              Blob
            ) {
              try {
                const text =
                  await response.data.text();

                const json =
                  JSON.parse(
                    text
                  );

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
              [
                response.data,
              ],
              {
                type:
                  "application/pdf",
              }
            );

          const objectUrl =
            URL.createObjectURL(
              blob
            );

          setPdfUrl(
            (
              previousUrl
            ) => {
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
        } catch (
          err
        ) {
          console.error(
            "Error cargando preview PDF empresarial:",
            err
          );

          let message =
            err?.response
              ?.data
              ?.message ||
            err?.message ||
            "No fue posible generar la vista previa empresarial.";

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
          if (
            !silent
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        endpoint,
        empresaId,
      ]
    );

  /* =======================================================
     PRIMERA CARGA
  ======================================================= */

  useEffect(() => {
    loadPdf();

    return () => {
      setPdfUrl(
        (
          currentUrl
        ) => {
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
  }, [
    loadPdf,
  ]);

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
        ) ||
        3
      );

    const interval =
      window.setInterval(
        () => {
          loadPdf({
            silent:
              true,
          });
        },
        seconds *
          1000
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
    <main className="company-pdf-preview-page">
      <section className="company-pdf-preview-shell">

        {/* ===============================================
            TOOLBAR
        =============================================== */}

        <header className="company-pdf-preview-toolbar">
          <div className="company-pdf-preview-toolbar__info">
            <span className="company-pdf-preview-toolbar__eyebrow">
              PROYECTO PENSAR
            </span>

            <h1>
              Diseñador de informe empresarial
            </h1>

            <p>
              Modifica
              {" "}
              <strong>
                generarInformePsicometricoEmpresa.js
              </strong>
              {" "}
              en el backend y actualiza esta vista para comprobar los cambios.
            </p>
          </div>

          <div className="company-pdf-preview-toolbar__actions">
            <button
              type="button"
              className="company-pdf-preview-btn company-pdf-preview-btn--primary"
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
            CONTROLES
        =============================================== */}

        <div className="company-pdf-preview-controls">
          <div className="company-pdf-preview-controls__item">
            <span>
              Empresa
            </span>

            <strong>
              {empresaId ||
                "-"}
            </strong>
          </div>

          <div className="company-pdf-preview-controls__item">
            <span>
              Última actualización
            </span>

            <strong>
              {
                formattedLastUpdate
              }
            </strong>
          </div>

          <label className="company-pdf-preview-autorefresh">
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

          <label className="company-pdf-preview-frequency">
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
              <option
                value={2}
              >
                2 s
              </option>

              <option
                value={3}
              >
                3 s
              </option>

              <option
                value={5}
              >
                5 s
              </option>

              <option
                value={10}
              >
                10 s
              </option>
            </select>
          </label>
        </div>

        {/* ===============================================
            ERROR
        =============================================== */}

        {error && (
          <div className="company-pdf-preview-error">
            <strong>
              No se pudo generar el PDF empresarial
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

        <section className="company-pdf-preview-viewer">
          {loading &&
          !pdfUrl ? (
            <div className="company-pdf-preview-loading">
              <span className="company-pdf-preview-spinner" />

              <strong>
                Generando informe empresarial...
              </strong>

              <p>
                El backend está creando nuevamente el PDF.
              </p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={
                pdfUrl
              }
              title="Preview informe empresarial Proyecto Pensar"
              className="company-pdf-preview-frame"
            />
          ) : (
            <div className="company-pdf-preview-loading">
              <strong>
                Sin PDF
              </strong>

              <p>
                Pulsa Actualizar PDF para generar la vista.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default PsychometricCompanyPdfPreview;
