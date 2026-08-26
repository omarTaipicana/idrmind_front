import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import {
  Html5Qrcode,
} from "html5-qrcode";

import "./styles/PsychometricIdentityVerification.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const CAMERA_ELEMENT_ID =
  "psychometric-identity-camera-reader";

const PsychometricIdentityVerification = ({
  token,
  user,
  evaluation,
  onVerified,
}) => {
  /* =======================================================
     REFS
  ======================================================= */

  const scannerRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const cameraContainerRef =
    useRef(null);

  /*
   * Evita que callbacks de una sesión vieja
   * afecten una sesión nueva.
   */
  const cameraNonceRef =
    useRef(0);

  /* =======================================================
     ESTADOS
  ======================================================= */

  const [
    consentAccepted,
    setConsentAccepted,
  ] = useState(false);

  const [
    cameraOn,
    setCameraOn,
  ] = useState(false);

  const [
    cameraReady,
    setCameraReady,
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
    uploadError,
    setUploadError,
  ] = useState("");

  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  /* =======================================================
     NOMBRE DEL PARTICIPANTE
  ======================================================= */

  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  /* =======================================================
     LIMPIAR PREVIEW
  ======================================================= */

  const clearPreview = () => {
    if (previewUrl) {
      try {
        URL.revokeObjectURL(
          previewUrl
        );
      } catch {
        // Sin acción.
      }
    }

    setPreviewUrl("");
    setCapturedBlob(null);
  };

  /* =======================================================
     DETENER CÁMARA

     Misma lógica del scanner que ya tienes funcionando.
  ======================================================= */

  const stopCamera =
    async () => {
      /*
       * Invalida callbacks de la sesión anterior.
       */
      cameraNonceRef.current +=
        1;

      const scanner =
        scannerRef.current;

      if (!scanner) {
        setCameraReady(false);

        return;
      }

      try {
        if (
          scanner.isScanning
        ) {
          await scanner.stop();
        }
      } catch (error) {
        console.warn(
          "No fue posible detener la cámara:",
          error
        );
      }

      try {
        await scanner.clear();
      } catch (error) {
        console.warn(
          "No fue posible limpiar la cámara:",
          error
        );
      }

      scannerRef.current =
        null;

      setCameraReady(false);
    };

  /* =======================================================
     MENSAJES DE ERROR
  ======================================================= */

  const getCameraErrorMessage = (
    error
  ) => {
    const name =
      error?.name || "";

    const message =
      String(
        error?.message ||
          error ||
          ""
      ).toLowerCase();

    if (
      name ===
        "NotAllowedError" ||
      name ===
        "PermissionDeniedError" ||
      message.includes(
        "permission"
      )
    ) {
      return "El permiso de cámara fue rechazado. Habilita el acceso a la cámara desde la configuración del navegador e inténtalo nuevamente.";
    }

    if (
      name ===
        "NotFoundError" ||
      name ===
        "DevicesNotFoundError"
    ) {
      return "No se encontró una cámara disponible en este dispositivo.";
    }

    if (
      name ===
        "NotReadableError" ||
      name ===
        "TrackStartError"
    ) {
      return "La cámara está siendo utilizada por otra aplicación o no se encuentra disponible en este momento.";
    }

    if (
      message.includes(
        "https"
      )
    ) {
      return "El navegador requiere una conexión HTTPS segura para utilizar la cámara.";
    }

    return "No fue posible abrir la cámara. Verifica los permisos del navegador e inténtalo nuevamente.";
  };

  /* =======================================================
     INICIAR CÁMARA

     Solo cambiamos estado.
     El useEffect se encarga de iniciar Html5Qrcode
     una vez que el DIV ya existe en el DOM.
  ======================================================= */

  const startCamera = () => {
    setCameraError("");
    setUploadError("");

    if (
      !consentAccepted
    ) {
      setCameraError(
        "Debes aceptar la autorización antes de habilitar la cámara."
      );

      return;
    }

    clearPreview();

    setCameraReady(false);
    setCameraOn(true);
  };

  /* =======================================================
     CONTROL DE CÁMARA

     Este patrón replica el componente StaffScanner
     que ya funciona correctamente en tu aplicación.
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const start =
      async () => {
        if (!cameraOn) {
          return;
        }

        /*
         * Cada encendido genera una sesión nueva.
         */
        const myNonce =
          ++cameraNonceRef.current;

        setCameraReady(false);
        setCameraError("");

        /*
         * Esperamos un ciclo para garantizar
         * que React ya montó el contenedor.
         */
        await new Promise(
          (resolve) => {
            window.requestAnimationFrame(
              resolve
            );
          }
        );

        if (
          cancelled ||
          myNonce !==
            cameraNonceRef.current
        ) {
          return;
        }

        const element =
          document.getElementById(
            CAMERA_ELEMENT_ID
          );

        if (!element) {
          setCameraError(
            "No fue posible preparar el visor de la cámara."
          );

          setCameraOn(false);

          return;
        }

        /*
         * Limpiamos una instancia previa,
         * por seguridad.
         */
        if (
          scannerRef.current
        ) {
          try {
            if (
              scannerRef
                .current
                .isScanning
            ) {
              await scannerRef
                .current
                .stop();
            }
          } catch {
            // Sin acción.
          }

          try {
            await scannerRef
              .current
              .clear();
          } catch {
            // Sin acción.
          }

          scannerRef.current =
            null;
        }

        const scanner =
          new Html5Qrcode(
            CAMERA_ELEMENT_ID
          );

        scannerRef.current =
          scanner;

        try {
          /*
           * Cámara frontal.
           *
           * Es el equivalente a:
           * facingMode: "environment"
           * que utilizas en StaffScanner,
           * pero aquí necesitamos selfie.
           */
          await scanner.start(
            {
              facingMode:
                "user",
            },

            {
              fps: 10,

              /*
               * Sin qrbox.
               *
               * Queremos utilizar toda
               * el área de la cámara.
               */
              aspectRatio:
                4 / 3,

              disableFlip:
                true,
            },

            /*
             * Html5Qrcode necesita callback
             * de lectura correcta.
             *
             * Aquí no estamos leyendo QR,
             * así que simplemente ignoramos.
             */
            () => {},

            /*
             * También ignoramos errores
             * de lectura de QR.
             *
             * Que no encuentre QR es normal.
             */
            () => {}
          );

          if (
            cancelled ||
            myNonce !==
              cameraNonceRef.current
          ) {
            return;
          }

          /* ===============================================
             ESPERAR AL VIDEO REAL GENERADO POR LA LIBRERÍA
          =============================================== */

          let attempts = 0;

          let video = null;

          while (
            attempts < 30
          ) {
            video =
              cameraContainerRef
                .current
                ?.querySelector(
                  "video"
                ) ||
              document.querySelector(
                `#${CAMERA_ELEMENT_ID} video`
              );

            if (
              video &&
              video.videoWidth >
                0 &&
              video.videoHeight >
                0
            ) {
              break;
            }

            await new Promise(
              (resolve) =>
                window.setTimeout(
                  resolve,
                  100
                )
            );

            attempts += 1;
          }

          if (
            !video
          ) {
            throw new Error(
              "No se encontró el visor de la cámara."
            );
          }

          /*
           * Intentamos reproducir explícitamente.
           */
          try {
            video.muted =
              true;

            video.playsInline =
              true;

            await video.play();
          } catch (
            playError
          ) {
            console.warn(
              "El video ya puede estar reproduciéndose:",
              playError
            );
          }

          console.log(
            "✅ Cámara de identidad lista:",
            {
              videoWidth:
                video.videoWidth,

              videoHeight:
                video.videoHeight,

              readyState:
                video.readyState,

              paused:
                video.paused,
            }
          );

          if (
            video.videoWidth >
              0 &&
            video.videoHeight >
              0
          ) {
            setCameraReady(
              true
            );
          } else {
            throw new Error(
              "La cámara no entregó una imagen válida."
            );
          }
        } catch (error) {
          console.error(
            "Error iniciando cámara de identidad:",
            error
          );

          if (
            scannerRef.current ===
            scanner
          ) {
            try {
              if (
                scanner
                  .isScanning
              ) {
                await scanner.stop();
              }
            } catch {
              // Sin acción.
            }

            try {
              await scanner.clear();
            } catch {
              // Sin acción.
            }

            scannerRef.current =
              null;
          }

          if (
            !cancelled
          ) {
            setCameraReady(
              false
            );

            setCameraError(
              getCameraErrorMessage(
                error
              )
            );

            setCameraOn(
              false
            );
          }
        }
      };

    const stop =
      async () => {
        await stopCamera();
      };

    if (cameraOn) {
      start();
    } else {
      stop();
    }

    return () => {
      cancelled =
        true;

      stop();
    };
  }, [cameraOn]);

  /* =======================================================
     CLEANUP TOTAL
  ======================================================= */

  useEffect(() => {
    return () => {
      cameraNonceRef.current +=
        1;

      const scanner =
        scannerRef.current;

      if (scanner) {
        if (
          scanner.isScanning
        ) {
          scanner
            .stop()
            .catch(
              () => {}
            );
        }

        scanner
          .clear()
          .catch(
            () => {}
          );
      }

      scannerRef.current =
        null;
    };
  }, []);

  /* =======================================================
     TOMAR FOTOGRAFÍA
  ======================================================= */

  const capturePhoto =
    async () => {
      setCameraError("");
      setUploadError("");

      if (
        !cameraReady
      ) {
        setCameraError(
          "La cámara todavía se está preparando. Espera un momento."
        );

        return;
      }

      const video =
        cameraContainerRef
          .current
          ?.querySelector(
            "video"
          ) ||
        document.querySelector(
          `#${CAMERA_ELEMENT_ID} video`
        );

      const canvas =
        canvasRef.current;

      if (
        !video ||
        !canvas
      ) {
        setCameraError(
          "No fue posible obtener la imagen de la cámara."
        );

        return;
      }

      if (
        video.videoWidth <=
          0 ||
        video.videoHeight <=
          0
      ) {
        setCameraError(
          "La cámara todavía no está entregando una imagen válida."
        );

        return;
      }

      /* ===============================================
         TAMAÑO DE FOTO

         Máximo 1280px.
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
          width *
            scale
        );

      height =
        Math.round(
          height *
            scale
        );

      canvas.width =
        width;

      canvas.height =
        height;

      const context =
        canvas.getContext(
          "2d",
          {
            alpha:
              false,
          }
        );

      if (!context) {
        setCameraError(
          "No fue posible procesar la fotografía."
        );

        return;
      }

      /* ===============================================
         FONDO
      =============================================== */

      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        width,
        height
      );

      /* ===============================================
         FOTOGRAFÍA

         Espejamos la captura para que coincida
         con la forma natural de una selfie.
      =============================================== */

      context.save();

      context.translate(
        width,
        0
      );

      context.scale(
        -1,
        1
      );

      context.drawImage(
        video,
        0,
        0,
        width,
        height
      );

      context.restore();

      /* ===============================================
         CONVERTIR A JPEG
      =============================================== */

      canvas.toBlob(
        async (
          blob
        ) => {
          if (!blob) {
            setCameraError(
              "No fue posible generar la fotografía."
            );

            return;
          }

          if (
            previewUrl
          ) {
            try {
              URL.revokeObjectURL(
                previewUrl
              );
            } catch {
              // Sin acción.
            }
          }

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
           * Apagamos físicamente
           * la cámara después de capturar.
           */
          await stopCamera();

          setCameraOn(
            false
          );
        },

        "image/jpeg",

        0.84
      );
    };

  /* =======================================================
     REPETIR FOTOGRAFÍA
  ======================================================= */

  const retryPhoto =
    async () => {
      clearPreview();

      setCameraError("");
      setUploadError("");

      /*
       * Si por alguna razón sigue encendida,
       * primero la detenemos.
       */
      await stopCamera();

      setCameraOn(
        false
      );

      /*
       * Pequeña pausa para que Html5Qrcode
       * termine de liberar la cámara.
       */
      window.setTimeout(
        () => {
          setCameraOn(
            true
          );
        },
        150
      );
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

      setIsUploading(
        true
      );

      setUploadError(
        ""
      );

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

        clearPreview();

        await stopCamera();

        setCameraOn(
          false
        );

        if (
          onVerified
        ) {
          onVerified(
            response.data
          );
        }
      } catch (error) {
        console.error(
          "Error registrando fotografía:",
          error.response
            ?.data ||
            error
        );

        setUploadError(
          error.response
            ?.data
            ?.message ||
            "No fue posible registrar la fotografía. Inténtalo nuevamente."
        );
      } finally {
        setIsUploading(
          false
        );
      }
    };

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
        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            PARTICIPANTE
        ================================================= */}

        <div className="psychometric-identity__participant">
          <div className="psychometric-identity__participant-avatar">
            {user
              ?.firstName
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

        {/* =================================================
            INTRO
        ================================================= */}

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

        {/* =================================================
            INFORMACIÓN
        ================================================= */}

        {!cameraOn &&
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
                      event
                        .target
                        .checked
                    );

                    setCameraError(
                      ""
                    );

                    setUploadError(
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
            </>
          )}

        {/* =================================================
            CÁMARA

            Igual que tu StaffScanner:
            el contenedor se monta primero y el useEffect
            inicia Html5Qrcode después.
        ================================================= */}

        {cameraOn &&
          !previewUrl && (
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

              <div
                className="psychometric-identity__camera-frame"
                ref={
                  cameraContainerRef
                }
              >
                <div
                  id={
                    CAMERA_ELEMENT_ID
                  }
                  className="psychometric-identity__camera-reader"
                />

                <div className="psychometric-identity__face-guide">
                  <span />
                </div>

                <div className="psychometric-identity__camera-help">
                  {cameraReady
                    ? "Mira directamente a la cámara"
                    : "Iniciando cámara..."}
                </div>
              </div>

              <button
                type="button"
                className="psychometric-identity__button psychometric-identity__button--primary psychometric-identity__button--full"
                onClick={
                  capturePhoto
                }
                disabled={
                  !cameraReady
                }
              >
                {cameraReady
                  ? "📷 Tomar fotografía"
                  : "Iniciando cámara..."}
              </button>

              <button
                type="button"
                className="psychometric-identity__camera-cancel"
                onClick={
                  async () => {
                    await stopCamera();

                    setCameraOn(
                      false
                    );
                  }
                }
              >
                Cancelar cámara
              </button>
            </div>
          )}

        {/* =================================================
            PREVIEW
        ================================================= */}

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

        {/* =================================================
            ERROR
        ================================================= */}

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

        {/* =================================================
            CANVAS
        ================================================= */}

        <canvas
          ref={
            canvasRef
          }
          className="psychometric-identity__canvas"
        />

        {/* =================================================
            FOOTER
        ================================================= */}

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