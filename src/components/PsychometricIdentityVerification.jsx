import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import "./styles/PsychometricIdentityVerification.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const PsychometricIdentityVerification = ({
  token,
  user,
  evaluation,
  onVerified,
}) => {
  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const [
    consentAccepted,
    setConsentAccepted,
  ] = useState(false);

  const [
    cameraStarted,
    setCameraStarted,
  ] = useState(false);

  const [
    capturedBlob,
    setCapturedBlob,
  ] = useState(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");

  const [
    cameraError,
    setCameraError,
  ] = useState("");

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    uploadError,
    setUploadError,
  ] = useState("");

  /* =======================================================
     DETENER CÁMARA
  ======================================================= */

  const stopCamera = () => {
    const stream =
      streamRef.current;

    if (stream) {
      stream
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );
    }

    streamRef.current =
      null;

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setCameraStarted(false);
  };

  /* =======================================================
     LIMPIAR PREVIEW
  ======================================================= */

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setPreviewUrl("");
    setCapturedBlob(null);
  };

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      const stream =
        streamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  /* =======================================================
     MENSAJE DE ERROR DE CÁMARA
  ======================================================= */

  const getCameraErrorMessage = (
    error
  ) => {
    switch (error?.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return "El permiso de cámara fue rechazado. Habilita el acceso a la cámara desde la configuración de tu navegador e inténtalo nuevamente.";

      case "NotFoundError":
      case "DevicesNotFoundError":
        return "No se encontró una cámara disponible en este dispositivo.";

      case "NotReadableError":
      case "TrackStartError":
        return "La cámara está siendo utilizada por otra aplicación o no puede iniciarse en este momento.";

      case "OverconstrainedError":
        return "La cámara disponible no cumple con la configuración requerida.";

      case "SecurityError":
        return "El navegador bloqueó el acceso a la cámara por motivos de seguridad.";

      default:
        return "No fue posible habilitar la cámara. Verifica los permisos del navegador e inténtalo nuevamente.";
    }
  };

  /* =======================================================
     HABILITAR CÁMARA
  ======================================================= */

  const startCamera =
    async () => {
      setCameraError("");
      setUploadError("");

      if (!consentAccepted) {
        setCameraError(
          "Debes aceptar la autorización antes de habilitar la cámara."
        );

        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        setCameraError(
          "Este navegador no permite utilizar la cámara. Intenta utilizar una versión actualizada de Chrome, Edge, Safari o Firefox."
        );

        return;
      }

      try {
        stopCamera();
        clearPreview();

        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              video: {
                facingMode:
                  "user",

                width: {
                  ideal: 1280,
                },

                height: {
                  ideal: 720,
                },
              },

              audio: false,
            });

        streamRef.current =
          stream;

        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            stream;

          await videoRef.current
            .play();
        }

        setCameraStarted(true);
      } catch (error) {
        console.error(
          "Error habilitando cámara:",
          error
        );

        setCameraError(
          getCameraErrorMessage(
            error
          )
        );
      }
    };

  /* =======================================================
     TOMAR FOTOGRAFÍA
  ======================================================= */

  const capturePhoto =
    async () => {
      setCameraError("");
      setUploadError("");

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (
        !video ||
        !canvas
      ) {
        setCameraError(
          "No fue posible acceder a la cámara."
        );

        return;
      }

      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {
        setCameraError(
          "La cámara todavía se está iniciando. Espera un momento e inténtalo nuevamente."
        );

        return;
      }

      /* ===============================================
         REDIMENSIONAR

         Evitamos subir fotografías gigantes.
         Máximo 1280 px en cualquiera de los lados.
      =============================================== */

      const maxDimension =
        1280;

      let width =
        video.videoWidth;

      let height =
        video.videoHeight;

      const scale =
        Math.min(
          1,
          maxDimension /
            Math.max(
              width,
              height
            )
        );

      width =
        Math.round(
          width * scale
        );

      height =
        Math.round(
          height * scale
        );

      canvas.width =
        width;

      canvas.height =
        height;

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        setCameraError(
          "No fue posible procesar la fotografía."
        );

        return;
      }

      /*
       * La vista se muestra como espejo,
       * pero la fotografía se guarda
       * en orientación normal.
       */
      context.drawImage(
        video,
        0,
        0,
        width,
        height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setCameraError(
              "No fue posible generar la fotografía."
            );

            return;
          }

          clearPreview();

          const url =
            URL.createObjectURL(
              blob
            );

          setCapturedBlob(
            blob
          );

          setPreviewUrl(
            url
          );

          /*
           * Una vez capturada,
           * apagamos la cámara.
           */
          stopCamera();
        },

        "image/jpeg",

        0.82
      );
    };

  /* =======================================================
     REPETIR FOTO
  ======================================================= */

  const retryPhoto =
    async () => {
      clearPreview();

      await startCamera();
    };

  /* =======================================================
     ENVIAR AL BACKEND
  ======================================================= */

  const submitPhoto =
    async () => {
      if (
        !capturedBlob
      ) {
        setUploadError(
          "Debes tomar una fotografía antes de continuar."
        );

        return;
      }

      if (
        !consentAccepted
      ) {
        setUploadError(
          "Debes aceptar la autorización para registrar la fotografía."
        );

        return;
      }

      setIsUploading(true);
      setUploadError("");

      try {
        const formData =
          new FormData();

        formData.append(
          "photo",
          capturedBlob,
          "identity.jpg"
        );

        formData.append(
          "consentAccepted",
          "true"
        );

        const response =
          await axios.post(
            `${API_URL}/psychometric/access/${encodeURIComponent(
              token
            )}/identity`,
            formData
          );

        /*
         * No ponemos manualmente
         * Content-Type.
         *
         * El navegador agrega el boundary
         * correcto de multipart/form-data.
         */

        clearPreview();
        stopCamera();

        if (onVerified) {
          onVerified(
            response.data
          );
        }
      } catch (error) {
        console.error(
          "Error registrando fotografía:",
          error.response?.data ||
            error
        );

        setUploadError(
          error.response?.data
            ?.message ||
            "No fue posible registrar la fotografía. Inténtalo nuevamente."
        );
      } finally {
        setIsUploading(false);
      }
    };

  /* =======================================================
     NOMBRE
  ======================================================= */

  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="psychometric-identity">
      <div className="psychometric-identity__background">
        <span className="psychometric-identity__shape psychometric-identity__shape--one" />
        <span className="psychometric-identity__shape psychometric-identity__shape--two" />
      </div>

      <section className="psychometric-identity__card">
        {/* =============================================
            MARCA
        ============================================= */}

        <header className="psychometric-identity__header">
          <img
            src="/images/test_logo.png"
            alt="Proyecto Pensar"
          />

          <div>
            <span>
              PROYECTO PENSAR
            </span>

            <h1>
              Verificación de identidad
            </h1>
          </div>
        </header>

        {/* =============================================
            PARTICIPANTE
        ============================================= */}

        <div className="psychometric-identity__participant">
          <div className="psychometric-identity__participant-avatar">
            {user?.firstName
              ?.charAt(0)
              ?.toUpperCase() ||
              "P"}
          </div>

          <div>
            <span>
              Participante
            </span>

            <strong>
              {fullName ||
                "Participante"}
            </strong>

            <small>
              Evaluación #
              {evaluation
                ?.numeroEvaluacion ||
                1}
            </small>
          </div>
        </div>

        {/* =============================================
            INTRODUCCIÓN
        ============================================= */}

        <div className="psychometric-identity__intro">
          <div className="psychometric-identity__security-icon">
            <span>
              ✓
            </span>
          </div>

          <div>
            <h2>
              Antes de iniciar
            </h2>

            <p>
              Para respaldar la
              identidad de la persona
              que realiza esta
              evaluación y preservar la
              integridad del proceso,
              necesitamos registrar una
              fotografía del
              participante.
            </p>
          </div>
        </div>

        {/* =============================================
            INFORMACIÓN
        ============================================= */}

        {!cameraStarted &&
          !previewUrl && (
            <>
              <div className="psychometric-identity__information">
                <div>
                  <span className="psychometric-identity__information-icon">
                    1
                  </span>

                  <p>
                    Permite el acceso
                    temporal a la cámara
                    de tu dispositivo.
                  </p>
                </div>

                <div>
                  <span className="psychometric-identity__information-icon">
                    2
                  </span>

                  <p>
                    Ubica tu rostro de
                    frente y procura
                    tener buena
                    iluminación.
                  </p>
                </div>

                <div>
                  <span className="psychometric-identity__information-icon">
                    3
                  </span>

                  <p>
                    Revisa la fotografía
                    antes de confirmar e
                    iniciar el test.
                  </p>
                </div>
              </div>

              <div className="psychometric-identity__privacy">
                <span>
                  🔒
                </span>

                <div>
                  <strong>
                    Uso de la fotografía
                  </strong>

                  <p>
                    La fotografía será
                    asociada únicamente
                    a esta evaluación y
                    almacenada como
                    evidencia privada
                    del proceso. No se
                    publicará ni se
                    mostrará dentro del
                    test.
                  </p>
                </div>
              </div>

              <label className="psychometric-identity__consent">
                <input
                  type="checkbox"
                  checked={
                    consentAccepted
                  }
                  onChange={(
                    event
                  ) => {
                    setConsentAccepted(
                      event.target
                        .checked
                    );

                    setCameraError(
                      ""
                    );
                  }}
                />

                <span>
                  He leído y autorizo la
                  captura de mi
                  fotografía para
                  respaldar la identidad
                  asociada a esta
                  evaluación.
                </span>
              </label>
            </>
          )}

        {/* =============================================
            CÁMARA
        ============================================= */}

        {cameraStarted && (
          <div className="psychometric-identity__camera-section">
            <div className="psychometric-identity__camera-title">
              <div>
                <span>
                  CÁMARA ACTIVA
                </span>

                <h2>
                  Centra tu rostro
                </h2>
              </div>

              <span className="psychometric-identity__live">
                <i />
                EN VIVO
              </span>
            </div>

            <div className="psychometric-identity__camera">
              <video
                ref={
                  videoRef
                }
                autoPlay
                playsInline
                muted
              />

              <div className="psychometric-identity__face-guide">
                <span />
              </div>

              <div className="psychometric-identity__camera-help">
                Mira directamente a
                la cámara
              </div>
            </div>

            <button
              type="button"
              className="psychometric-identity__button psychometric-identity__button--primary"
              onClick={
                capturePhoto
              }
            >
              📷 Tomar fotografía
            </button>
          </div>
        )}

        {/* =============================================
            PREVIEW
        ============================================= */}

        {previewUrl && (
          <div className="psychometric-identity__preview-section">
            <div className="psychometric-identity__camera-title">
              <div>
                <span>
                  FOTOGRAFÍA CAPTURADA
                </span>

                <h2>
                  Revisa tu fotografía
                </h2>
              </div>
            </div>

            <p className="psychometric-identity__preview-help">
              Verifica que tu rostro
              sea claramente visible
              antes de continuar.
            </p>

            <div className="psychometric-identity__preview">
              <img
                src={
                  previewUrl
                }
                alt="Fotografía de verificación"
              />
            </div>

            <div className="psychometric-identity__preview-actions">
              <button
                type="button"
                className="psychometric-identity__button psychometric-identity__button--secondary"
                onClick={
                  retryPhoto
                }
                disabled={
                  isUploading
                }
              >
                ↻ Repetir fotografía
              </button>

              <button
                type="button"
                className="psychometric-identity__button psychometric-identity__button--primary"
                onClick={
                  submitPhoto
                }
                disabled={
                  isUploading
                }
              >
                {isUploading
                  ? "Registrando..."
                  : "Confirmar e iniciar evaluación →"}
              </button>
            </div>
          </div>
        )}

        {/* =============================================
            ERROR
        ============================================= */}

        {(cameraError ||
          uploadError) && (
          <div
            className="psychometric-identity__error"
            role="alert"
          >
            <span>
              !
            </span>

            <div>
              <strong>
                No fue posible continuar
              </strong>

              <p>
                {cameraError ||
                  uploadError}
              </p>
            </div>
          </div>
        )}

        {/* =============================================
            BOTÓN INICIAL
        ============================================= */}

        {!cameraStarted &&
          !previewUrl && (
            <button
              type="button"
              className="psychometric-identity__button psychometric-identity__button--primary psychometric-identity__button--full"
              onClick={
                startCamera
              }
              disabled={
                !consentAccepted
              }
            >
              📷 Habilitar cámara
            </button>
          )}

        <canvas
          ref={
            canvasRef
          }
          className="psychometric-identity__canvas"
        />

        <footer className="psychometric-identity__footer">
          <span>
            🔒
          </span>

          <p>
            Tu fotografía se procesa
            únicamente para respaldar
            esta evaluación.
          </p>
        </footer>
      </section>
    </main>
  );
};

export default PsychometricIdentityVerification;