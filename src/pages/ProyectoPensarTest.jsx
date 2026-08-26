import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import IsLoading from "../components/shared/isLoading";

import "./styles/ProyectoPensarTest.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const ProyectoPensarTest = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  /* =======================================================
     ACCESO Y DATOS
  ======================================================= */

  const [testAccess, setTestAccess] =
    useState(null);

  const [accessError, setAccessError] =
    useState(null);

  const [
    isLoadingAccess,
    setIsLoadingAccess,
  ] = useState(true);

  /* =======================================================
   MODALES
======================================================= */

  const [
    showFinishModal,
    setShowFinishModal,
  ] = useState(false);

  const [
    showCompletedModal,
    setShowCompletedModal,
  ] = useState(false);

  /* =======================================================
     ESTADO DEL TEST
  ======================================================= */

  const [
    currentSectionIndex,
    setCurrentSectionIndex,
  ] = useState(0);

  const [
    localAnswers,
    setLocalAnswers,
  ] = useState({});

  const [
    initialized,
    setInitialized,
  ] = useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isFinishing, setIsFinishing] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState("");

  const [saveError, setSaveError] =
    useState("");

  const [
    sectionError,
    setSectionError,
  ] = useState("");

  const [
    finishError,
    setFinishError,
  ] = useState("");

  const [
    completedData,
    setCompletedData,
  ] = useState(null);

  /* =======================================================
     VERIFICACIÓN DE IDENTIDAD
  ======================================================= */

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const cameraStreamRef =
    useRef(null);

  const [
    identityConsentAccepted,
    setIdentityConsentAccepted,
  ] = useState(false);

  const [
    identityCameraStarted,
    setIdentityCameraStarted,
  ] = useState(false);

  const [
    identityCapturedBlob,
    setIdentityCapturedBlob,
  ] = useState(null);

  const [
    identityPreviewUrl,
    setIdentityPreviewUrl,
  ] = useState("");

  const [
    identityCameraError,
    setIdentityCameraError,
  ] = useState("");

  const [
    identityUploadError,
    setIdentityUploadError,
  ] = useState("");

  const [
    isUploadingIdentity,
    setIsUploadingIdentity,
  ] = useState(false);

  /* =======================================================
     CARGAR TEST POR TOKEN
  ======================================================= */

  useEffect(() => {
    const loadTestAccess = async () => {
      if (!token) {
        setAccessError({
          response: {
            data: {
              message:
                "No se recibió el código de acceso al test.",
              code: "TOKEN_REQUIRED",
            },
          },
        });

        setIsLoadingAccess(false);
        return;
      }

      setIsLoadingAccess(true);
      setAccessError(null);

      try {
        const response = await axios.get(
          `${API_URL}/psychometric/access/${encodeURIComponent(
            token
          )}`
        );

        setTestAccess(response.data);
      } catch (error) {
        console.error(
          "Error al abrir el test:",
          error.response?.data || error
        );

        setAccessError(error);
      } finally {
        setIsLoadingAccess(false);
      }
    };

    loadTestAccess();
  }, [token]);

  /* =======================================================
     DATOS NORMALIZADOS
  ======================================================= */

  const evaluation =
    testAccess?.evaluation || null;

  const user =
    testAccess?.user || null;

  const course =
    testAccess?.course || null;

  const test =
    testAccess?.test || null;

  const sections = useMemo(() => {
    return Array.isArray(test?.sections)
      ? test.sections
      : [];
  }, [test]);

  const savedAnswers = useMemo(() => {
    return Array.isArray(
      testAccess?.savedAnswers
    )
      ? testAccess.savedAnswers
      : [];
  }, [testAccess]);

  const currentSection =
    sections[currentSectionIndex] ||
    null;

  const identityVerification =
    testAccess?.identityVerification ||
    null;

  const initialIdentityCompleted =
    Boolean(
      identityVerification
        ?.initial
        ?.completed
    );

  /* =======================================================
     HELPERS VERIFICACIÓN DE IDENTIDAD
  ======================================================= */

  const stopIdentityCamera = () => {
    const stream =
      cameraStreamRef.current;

    if (stream) {
      stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    cameraStreamRef.current =
      null;

    if (videoRef.current) {
      videoRef.current.srcObject =
        null;
    }

    setIdentityCameraStarted(false);
  };

  const clearIdentityPreview = () => {
    setIdentityCapturedBlob(null);

    setIdentityPreviewUrl(
      (previous) => {
        if (previous) {
          URL.revokeObjectURL(
            previous
          );
        }

        return "";
      }
    );
  };

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

  const startIdentityCamera =
    async () => {
      setIdentityCameraError("");
      setIdentityUploadError("");

      if (
        !identityConsentAccepted
      ) {
        setIdentityCameraError(
          "Debes aceptar la autorización antes de habilitar la cámara."
        );

        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {
        setIdentityCameraError(
          "Este navegador no permite utilizar la cámara. Utiliza una versión actualizada de Chrome, Edge, Safari o Firefox."
        );

        return;
      }

      try {
        stopIdentityCamera();
        clearIdentityPreview();

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

        cameraStreamRef.current =
          stream;

        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            stream;

          await videoRef.current
            .play();
        }

        setIdentityCameraStarted(
          true
        );
      } catch (error) {
        console.error(
          "Error habilitando cámara:",
          error
        );

        setIdentityCameraError(
          getCameraErrorMessage(
            error
          )
        );
      }
    };

  const captureIdentityPhoto =
    () => {
      setIdentityCameraError("");
      setIdentityUploadError("");

      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (
        !video ||
        !canvas
      ) {
        setIdentityCameraError(
          "No fue posible acceder a la cámara."
        );

        return;
      }

      if (
        !video.videoWidth ||
        !video.videoHeight
      ) {
        setIdentityCameraError(
          "La cámara todavía se está iniciando. Espera un momento e inténtalo nuevamente."
        );

        return;
      }

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
        setIdentityCameraError(
          "No fue posible procesar la fotografía."
        );

        return;
      }

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
            setIdentityCameraError(
              "No fue posible generar la fotografía."
            );

            return;
          }

          clearIdentityPreview();

          const url =
            URL.createObjectURL(
              blob
            );

          setIdentityCapturedBlob(
            blob
          );

          setIdentityPreviewUrl(
            url
          );

          stopIdentityCamera();
        },

        "image/jpeg",

        0.82
      );
    };

  const retryIdentityPhoto =
    async () => {
      clearIdentityPreview();

      await startIdentityCamera();
    };

  const submitInitialIdentity =
    async () => {
      if (
        !identityCapturedBlob
      ) {
        setIdentityUploadError(
          "Debes tomar una fotografía antes de continuar."
        );

        return;
      }

      if (
        !identityConsentAccepted
      ) {
        setIdentityUploadError(
          "Debes aceptar la autorización para registrar la fotografía."
        );

        return;
      }

      setIsUploadingIdentity(true);
      setIdentityUploadError("");

      try {
        const formData =
          new FormData();

        formData.append(
          "photo",
          identityCapturedBlob,
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

        clearIdentityPreview();
        stopIdentityCamera();

        setTestAccess(
          (previous) => {
            if (!previous) {
              return previous;
            }

            return {
              ...previous,

              evaluation: {
                ...previous
                  .evaluation,

                estado:
                  response.data
                    ?.evaluation
                    ?.estado ||
                  previous
                    ?.evaluation
                    ?.estado,

                fechaInicio:
                  response.data
                    ?.evaluation
                    ?.fechaInicio ||
                  previous
                    ?.evaluation
                    ?.fechaInicio,
              },

              identityVerification: {
                ...previous
                  .identityVerification,

                required: true,

                initial: {
                  ...previous
                    ?.identityVerification
                    ?.initial,

                  completed:
                    true,

                  id:
                    response.data
                      ?.identityVerification
                      ?.id ||
                    null,

                  status:
                    response.data
                      ?.identityVerification
                      ?.status ||
                    "captured",

                  capturedAt:
                    response.data
                      ?.identityVerification
                      ?.capturedAt ||
                    new Date()
                      .toISOString(),

                  consentAccepted:
                    true,

                  consentVersion:
                    response.data
                      ?.identityVerification
                      ?.consentVersion ||
                    null,
                },
              },
            };
          }
        );
      } catch (error) {
        console.error(
          "Error registrando fotografía de identidad:",
          error.response?.data ||
          error
        );

        setIdentityUploadError(
          error.response?.data
            ?.message ||
          "No fue posible registrar la fotografía. Inténtalo nuevamente."
        );
      } finally {
        setIsUploadingIdentity(
          false
        );
      }
    };

  useEffect(() => {
    return () => {
      const stream =
        cameraStreamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }
    };
  }, []);

  /* =======================================================
     RESTAURAR RESPUESTAS GUARDADAS
  ======================================================= */

  useEffect(() => {
    if (
      initialized ||
      !testAccess
    ) {
      return;
    }

    const answersMap = {};

    savedAnswers.forEach((answer) => {
      answersMap[answer.questionId] = {
        questionId:
          answer.questionId,

        valorNumerico:
          answer.valorNumerico,

        valorBooleano:
          answer.valorBooleano,

        valorTexto:
          answer.valorTexto,

        selectedOptions:
          Array.isArray(
            answer.selectedOptions
          )
            ? answer.selectedOptions
            : [],
      };
    });

    setLocalAnswers(answersMap);
    setInitialized(true);
  }, [
    initialized,
    savedAnswers,
    testAccess,
  ]);

  /* =======================================================
     TODAS LAS PREGUNTAS
  ======================================================= */

  const allQuestions =
    useMemo(() => {
      return sections.flatMap(
        (section, sectionIndex) => {
          const questions =
            Array.isArray(
              section?.questions
            )
              ? section.questions
              : [];

          return questions.map(
            (question) => ({
              ...question,
              sectionId:
                section.id,
              sectionName:
                section.nombre,
              sectionIndex,
            })
          );
        }
      );
    }, [sections]);

  const totalQuestions =
    allQuestions.length;

  /* =======================================================
     HELPERS DE RESPUESTAS
  ======================================================= */

  const hasAnswer = (answer) => {
    if (!answer) return false;

    const hasNumeric =
      answer.valorNumerico !== null &&
      answer.valorNumerico !==
      undefined &&
      answer.valorNumerico !== "";

    const hasBoolean =
      answer.valorBooleano !== null &&
      answer.valorBooleano !==
      undefined;

    const hasText = Boolean(
      String(
        answer.valorTexto || ""
      ).trim()
    );

    const hasOptions =
      Array.isArray(
        answer.selectedOptions
      ) &&
      answer.selectedOptions.length > 0;

    return (
      hasNumeric ||
      hasBoolean ||
      hasText ||
      hasOptions
    );
  };

  const isQuestionComplete = (
    question
  ) => {
    const answer =
      localAnswers[question.id];

    if (!answer) return false;

    switch (
    question.tipoRespuesta
    ) {
      case "escala_bipolar":
      case "escala_1_5":
        return (
          answer.valorNumerico !==
          null &&
          answer.valorNumerico !==
          undefined &&
          answer.valorNumerico !== ""
        );

      case "seleccion_unica":
        return (
          Array.isArray(
            answer.selectedOptions
          ) &&
          answer.selectedOptions
            .length === 1
        );

      case "seleccion_ponderada": {
        const minimum = Number(
          question.seleccionesMinimas ??
          2
        );

        const maximum = Number(
          question.seleccionesMaximas ??
          2
        );

        const selected =
          Array.isArray(
            answer.selectedOptions
          )
            ? answer.selectedOptions
              .length
            : 0;

        return (
          selected >= minimum &&
          selected <= maximum
        );
      }

      default:
        return hasAnswer(answer);
    }
  };

  const getSectionQuestions = (
    section
  ) => {
    return Array.isArray(
      section?.questions
    )
      ? section.questions
      : [];
  };

  const getPendingInSection = (
    section
  ) => {
    return getSectionQuestions(
      section
    ).filter(
      (question) =>
        question.obligatoria !==
        false &&
        !isQuestionComplete(
          question
        )
    );
  };

  const isSectionComplete = (
    section
  ) => {
    const questions =
      getSectionQuestions(section);

    if (!questions.length) {
      return false;
    }

    return (
      getPendingInSection(section)
        .length === 0
    );
  };

  const getAnsweredInSection = (
    section
  ) => {
    return getSectionQuestions(
      section
    ).filter((question) =>
      isQuestionComplete(question)
    ).length;
  };

  /* =======================================================
     PROGRESO
  ======================================================= */

  const localAnsweredQuestions =
    useMemo(() => {
      return allQuestions.filter(
        (question) =>
          isQuestionComplete(
            question
          )
      ).length;
    }, [
      allQuestions,
      localAnswers,
    ]);

  const localProgressPercentage =
    totalQuestions > 0
      ? Number(
        (
          (localAnsweredQuestions /
            totalQuestions) *
          100
        ).toFixed(2)
      )
      : 0;

  const pendingRequiredQuestions =
    useMemo(() => {
      return allQuestions.filter(
        (question) =>
          question.obligatoria !==
          false &&
          !isQuestionComplete(
            question
          )
      );
    }, [
      allQuestions,
      localAnswers,
    ]);

  const canFinish =
    totalQuestions > 0 &&
    pendingRequiredQuestions.length ===
    0;

  /* =======================================================
     ACTUALIZAR RESPUESTA
  ======================================================= */

  const updateLocalAnswer = (
    questionId,
    answerData
  ) => {
    setLocalAnswers(
      (previous) => ({
        ...previous,

        [questionId]: {
          questionId,

          ...previous[
          questionId
          ],

          ...answerData,
        },
      })
    );

    setSaveMessage("");
    setSaveError("");
    setSectionError("");
    setFinishError("");
  };

  /* =======================================================
     OPCIONES
  ======================================================= */

  const getSelectedOptionIds = (
    questionId
  ) => {
    const selected =
      localAnswers[questionId]
        ?.selectedOptions || [];

    return selected
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.optionId
      )
      .filter(Boolean);
  };

  const handleSingleOption = (
    questionId,
    optionId
  ) => {
    updateLocalAnswer(
      questionId,
      {
        valorNumerico: null,
        valorBooleano: null,
        valorTexto: null,

        selectedOptions: [
          {
            optionId,
            prioridad: 1,
          },
        ],
      }
    );
  };

  const handleMultipleOption = (
    question,
    optionId
  ) => {
    const selectedIds =
      getSelectedOptionIds(
        question.id
      );

    const alreadySelected =
      selectedIds.includes(
        optionId
      );

    let newSelectedIds = [];

    if (alreadySelected) {
      newSelectedIds =
        selectedIds.filter(
          (id) => id !== optionId
        );
    } else {
      const maximumSelections =
        Number(
          question.seleccionesMaximas ??
          2
        );

      if (
        selectedIds.length >=
        maximumSelections
      ) {
        return;
      }

      newSelectedIds = [
        ...selectedIds,
        optionId,
      ];
    }

    updateLocalAnswer(
      question.id,
      {
        valorNumerico: null,
        valorBooleano: null,
        valorTexto: null,

        selectedOptions:
          newSelectedIds.map(
            (id, index) => ({
              optionId: id,
              prioridad:
                index + 1,
            })
          ),
      }
    );
  };

  /* =======================================================
     RENDERIZAR PREGUNTAS
  ======================================================= */

  const renderQuestionInput = (
    question
  ) => {
    const answer =
      localAnswers[question.id] ||
      {};

    const options =
      Array.isArray(
        question.options
      )
        ? question.options
        : [];

    const selectedOptionIds =
      getSelectedOptionIds(
        question.id
      );

    switch (
    question.tipoRespuesta
    ) {
      /* =================================================
         ANIMODO
      ================================================= */

      case "escala_bipolar": {
        const min = Number(
          question.valorMinimo ??
          1
        );

        const max = Number(
          question.valorMaximo ??
          6
        );

        const values =
          Array.from(
            {
              length:
                max - min + 1,
            },
            (_, index) =>
              min + index
          );

        /*
         * Las frases reales están dentro
         * de configuracion, no en opciones.
         */
        const leftLabel =
          question.configuracion
            ?.afirmacionIzquierda ||
          "";

        const rightLabel =
          question.configuracion
            ?.afirmacionDerecha ||
          "";

        return (
          <div className="psychometric-question__bipolar">
            <div className="psychometric-question__bipolar-label psychometric-question__bipolar-label--left">
              {leftLabel}
            </div>

            <div className="psychometric-question__scale-values">
              {values.map(
                (value) => {
                  const selected =
                    Number(
                      answer.valorNumerico
                    ) === value;

                  return (
                    <label
                      key={value}
                      className={
                        selected
                          ? "psychometric-question__scale-option psychometric-question__scale-option--selected"
                          : "psychometric-question__scale-option"
                      }
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={value}
                        checked={
                          selected
                        }
                        onChange={() =>
                          updateLocalAnswer(
                            question.id,
                            {
                              valorNumerico:
                                value,
                              valorBooleano:
                                null,
                              valorTexto:
                                null,
                              selectedOptions:
                                [],
                            }
                          )
                        }
                      />

                      <strong>
                        {value}
                      </strong>
                    </label>
                  );
                }
              )}
            </div>

            <div className="psychometric-question__bipolar-label psychometric-question__bipolar-label--right">
              {rightLabel}
            </div>
          </div>
        );
      }

      /* =================================================
         ESCALA 1 A 5
      ================================================= */

      case "escala_1_5": {
        const min = Number(
          question.valorMinimo ??
          1
        );

        const max = Number(
          question.valorMaximo ??
          5
        );

        const values =
          Array.from(
            {
              length:
                max - min + 1,
            },
            (_, index) =>
              min + index
          );

        return (
          <div className="psychometric-question__numeric-scale">
            {values.map(
              (value) => {
                const selected =
                  Number(
                    answer.valorNumerico
                  ) === value;

                return (
                  <label
                    key={value}
                    className={
                      selected
                        ? "psychometric-question__numeric-option psychometric-question__numeric-option--selected"
                        : "psychometric-question__numeric-option"
                    }
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={value}
                      checked={
                        selected
                      }
                      onChange={() =>
                        updateLocalAnswer(
                          question.id,
                          {
                            valorNumerico:
                              value,
                            valorBooleano:
                              null,
                            valorTexto:
                              null,
                            selectedOptions:
                              [],
                          }
                        )
                      }
                    />

                    <strong>
                      {value}
                    </strong>

                    <small>
                      {value === min
                        ? "Bajo"
                        : value ===
                          max
                          ? "Alto"
                          : ""}
                    </small>
                  </label>
                );
              }
            )}
          </div>
        );
      }

      /* =================================================
         SELECCIÓN ÚNICA
      ================================================= */

      case "seleccion_unica":
        return (
          <div className="psychometric-question__options">
            {options.map(
              (option) => {
                const selected =
                  selectedOptionIds.includes(
                    option.id
                  );

                return (
                  <label
                    key={option.id}
                    className={
                      selected
                        ? "psychometric-question__option psychometric-question__option--selected"
                        : "psychometric-question__option"
                    }
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={
                        selected
                      }
                      onChange={() =>
                        handleSingleOption(
                          question.id,
                          option.id
                        )
                      }
                    />

                    <span>
                      {option.texto}
                    </span>
                  </label>
                );
              }
            )}
          </div>
        );

      /* =================================================
         SELECCIÓN PONDERADA
      ================================================= */

      case "seleccion_ponderada": {
        const minimumSelections =
          Number(
            question.seleccionesMinimas ??
            2
          );

        const maximumSelections =
          Number(
            question.seleccionesMaximas ??
            2
          );

        return (
          <div className="psychometric-question__options">
            <p className="psychometric-question__selection-help">
              Selecciona exactamente{" "}
              <strong>
                {maximumSelections}
              </strong>{" "}
              opciones. La primera
              seleccionada tendrá prioridad
              1 y la segunda prioridad 2.
            </p>

            <div className="psychometric-question__selection-status">
              Seleccionadas:{" "}
              <strong>
                {
                  selectedOptionIds.length
                }
                {" / "}
                {
                  maximumSelections
                }
              </strong>
            </div>

            {options.map(
              (option) => {
                const selectedIndex =
                  selectedOptionIds.indexOf(
                    option.id
                  );

                const selected =
                  selectedIndex !==
                  -1;

                const limitReached =
                  !selected &&
                  selectedOptionIds
                    .length >=
                  maximumSelections;

                return (
                  <label
                    key={option.id}
                    className={[
                      "psychometric-question__option",

                      selected
                        ? "psychometric-question__option--selected"
                        : "",

                      limitReached
                        ? "psychometric-question__option--disabled"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={
                        selected
                      }
                      disabled={
                        limitReached
                      }
                      onChange={() =>
                        handleMultipleOption(
                          question,
                          option.id
                        )
                      }
                    />

                    {selected && (
                      <strong className="psychometric-question__priority">
                        {selectedIndex +
                          1}
                      </strong>
                    )}

                    <span>
                      {option.texto}
                    </span>
                  </label>
                );
              }
            )}

            {selectedOptionIds.length <
              minimumSelections && (
                <p className="psychometric-question__validation">
                  Debes seleccionar{" "}
                  {
                    minimumSelections
                  }{" "}
                  opciones para completar
                  esta pregunta.
                </p>
              )}
          </div>
        );
      }

      default:
        return (
          <div className="psychometric-question__unsupported">
            Tipo de pregunta no
            reconocido:{" "}
            <strong>
              {
                question.tipoRespuesta
              }
            </strong>
          </div>
        );
    }
  };

  /* =======================================================
     PREPARAR RESPUESTAS
  ======================================================= */

  const buildAnswersPayload = (
    questions
  ) => {
    return questions
      .map((question) => {
        const answer =
          localAnswers[
          question.id
          ];

        if (!answer) return null;

        return {
          questionId:
            question.id,

          valorNumerico:
            answer.valorNumerico ??
            null,

          valorBooleano:
            answer.valorBooleano ??
            null,

          valorTexto:
            answer.valorTexto ??
            null,

          selectedOptions:
            Array.isArray(
              answer.selectedOptions
            )
              ? answer.selectedOptions
                .map(
                  (
                    selected,
                    index
                  ) => ({
                    optionId:
                      typeof selected ===
                        "string"
                        ? selected
                        : selected.optionId,

                    prioridad:
                      typeof selected ===
                        "string"
                        ? index + 1
                        : selected.prioridad ??
                        index + 1,
                  })
                )
                .filter(
                  (selected) =>
                    selected.optionId
                )
              : [],
        };
      })
      .filter(Boolean);
  };

  /* =======================================================
     GUARDAR RESPUESTAS
  ======================================================= */

  const saveAnswers = async (
    questions,
    showMessage = true
  ) => {
    const answers =
      buildAnswersPayload(
        questions
      );

    if (!answers.length) {
      if (showMessage) {
        setSaveError(
          "No existen respuestas para guardar."
        );
      }

      return false;
    }

    setIsSaving(true);
    setSaveError("");

    if (showMessage) {
      setSaveMessage("");
    }

    try {
      const response =
        await axios.put(
          `${API_URL}/psychometric/access/${encodeURIComponent(
            token
          )}/answers`,
          {
            answers,
          }
        );

      if (showMessage) {
        setSaveMessage(
          response.data?.message ||
          "Respuestas guardadas correctamente."
        );
      }

      return true;
    } catch (error) {
      console.error(
        "Error guardando respuestas:",
        error.response?.data ||
        error
      );

      setSaveError(
        error.response?.data
          ?.message ||
        "No se pudieron guardar las respuestas."
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  };

  /* =======================================================
     SCROLL
  ======================================================= */

  const scrollTestToTop = () => {
    const container =
      document.querySelector(
        ".psychometric-test"
      );

    if (container) {
      container.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToQuestion = (
    questionId
  ) => {
    setTimeout(() => {
      document
        .getElementById(
          `question-${questionId}`
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 200);
  };

  /* =======================================================
     VALIDAR SECCIÓN ACTUAL
  ======================================================= */

  const validateCurrentSection =
    () => {
      const pending =
        getPendingInSection(
          currentSection
        );

      if (!pending.length) {
        setSectionError("");
        return true;
      }

      setSectionError(
        `Debes responder las ${pending.length} pregunta(s) pendientes antes de continuar.`
      );

      scrollToQuestion(
        pending[0].id
      );

      return false;
    };

  /* =======================================================
     NAVEGACIÓN
  ======================================================= */

  const goPrevious = async () => {
    const currentQuestions =
      getSectionQuestions(
        currentSection
      );

    if (
      currentQuestions.some(
        (question) =>
          hasAnswer(
            localAnswers[
            question.id
            ]
          )
      )
    ) {
      await saveAnswers(
        currentQuestions,
        false
      );
    }

    setCurrentSectionIndex(
      (previous) =>
        Math.max(
          previous - 1,
          0
        )
    );

    setSectionError("");

    setTimeout(
      scrollTestToTop,
      50
    );
  };

  const goNext = async () => {
    if (
      !validateCurrentSection()
    ) {
      return;
    }

    const saved =
      await saveAnswers(
        getSectionQuestions(
          currentSection
        ),
        true
      );

    if (!saved) return;

    setCurrentSectionIndex(
      (previous) =>
        Math.min(
          previous + 1,
          sections.length - 1
        )
    );

    setSectionError("");

    setTimeout(
      scrollTestToTop,
      50
    );
  };

  const goToSection = async (
    index
  ) => {
    if (
      index ===
      currentSectionIndex
    ) {
      return;
    }

    /*
     * Siempre puede regresar a una
     * sección anterior.
     */
    if (
      index <
      currentSectionIndex
    ) {
      const questions =
        getSectionQuestions(
          currentSection
        );

      if (
        questions.some(
          (question) =>
            hasAnswer(
              localAnswers[
              question.id
              ]
            )
        )
      ) {
        await saveAnswers(
          questions,
          false
        );
      }

      setCurrentSectionIndex(
        index
      );

      setSectionError("");

      setTimeout(
        scrollTestToTop,
        50
      );

      return;
    }

    /*
     * Para avanzar desde el menú debe
     * completar primero la sección actual.
     */
    if (
      !validateCurrentSection()
    ) {
      return;
    }

    const saved =
      await saveAnswers(
        getSectionQuestions(
          currentSection
        ),
        false
      );

    if (!saved) return;

    setCurrentSectionIndex(
      index
    );

    setSectionError("");

    setTimeout(
      scrollTestToTop,
      50
    );
  };

  const isFirstSection =
    currentSectionIndex === 0;

  const isLastSection =
    currentSectionIndex ===
    sections.length - 1;

  /* =======================================================
     FINALIZAR TEST
  ======================================================= */

  const showFirstPendingQuestion =
    () => {
      const firstPending =
        pendingRequiredQuestions[0];

      if (!firstPending) {
        setFinishError("");
        return true;
      }

      setCurrentSectionIndex(
        firstPending.sectionIndex
      );

      setFinishError(
        `Faltan ${pendingRequiredQuestions.length} preguntas obligatorias. Revisa la sección "${firstPending.sectionName}".`
      );

      scrollToQuestion(
        firstPending.id
      );

      return false;
    };

  /* =======================================================
 CONFIRMAR FINALIZACIÓN
======================================================= */

  const confirmFinishEvaluation =
    async () => {
      setShowFinishModal(false);

      setIsFinishing(true);
      setFinishError("");
      setSaveError("");
      setSaveMessage("");

      try {
        /* ===============================================
           1. GUARDAR TODAS LAS RESPUESTAS
        =============================================== */

        const saved =
          await saveAnswers(
            allQuestions,
            false
          );

        if (!saved) {
          setFinishError(
            "No fue posible guardar todas las respuestas antes de finalizar."
          );

          return;
        }

        /* ===============================================
           2. FINALIZAR EVALUACIÓN
        =============================================== */

        const response =
          await axios.post(
            `${API_URL}/psychometric/access/${encodeURIComponent(
              token
            )}/finish`
          );

        /* ===============================================
           3. GUARDAR RESPUESTA
        =============================================== */

        setCompletedData(
          response.data
        );

        /* ===============================================
           4. MOSTRAR MODAL DE ÉXITO
        =============================================== */

        setShowCompletedModal(
          true
        );
      } catch (error) {
        console.error(
          "Error finalizando el test:",
          error.response?.data ||
          error
        );

        setFinishError(
          error.response?.data
            ?.message ||
          "No se pudo finalizar el test."
        );
      } finally {
        setIsFinishing(false);
      }
    };

  /* =======================================================
     SOLICITAR FINALIZACIÓN
  ======================================================= */

  const finishEvaluation = () => {
    if (!validateCurrentSection()) {
      return;
    }

    if (!showFirstPendingQuestion()) {
      return;
    }

    /*
     * En lugar de window.confirm,
     * abrimos modal profesional.
     */
    setShowFinishModal(true);
  };

  /* =======================================================
     ERRORES DE ACCESO
  ======================================================= */

  const accessErrorMessage =
    accessError?.response?.data
      ?.message ||
    "El enlace no es válido, ha expirado o ya no permite acceder al test.";

  const accessErrorCode =
    accessError?.response?.data
      ?.code || null;

  const accessStatus =
    accessError?.response?.status ||
    null;

  /* =======================================================
     ESTADOS DE PANTALLA
  ======================================================= */

  if (isLoadingAccess) {
    return <IsLoading />;
  }

  if (accessError) {
    return (
      <main className="psychometric-test-error">
        <div className="psychometric-test-error__card">
          <img
            src="/images/test_logo.png"
            alt="Proyecto Pensar"
          />

          <h1>
            No se pudo abrir el test
          </h1>

          <p>
            {accessErrorMessage}
          </p>

          {accessErrorCode && (
            <small>
              Código:{" "}
              {accessErrorCode}
            </small>
          )}

          {accessStatus && (
            <small>
              Estado HTTP:{" "}
              {accessStatus}
            </small>
          )}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

 

  if (
    !testAccess ||
    !test ||
    !sections.length ||
    !currentSection
  ) {
    return (
      <main className="psychometric-test-error">
        <div className="psychometric-test-error__card">
          <img
            src="/images/test_logo.png"
            alt="Proyecto Pensar"
          />

          <h1>
            Test no disponible
          </h1>

          <p>
            No se encontraron
            secciones o preguntas
            configuradas.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     VERIFICACIÓN DE IDENTIDAD INICIAL
  ======================================================= */

  if (
    testAccess
      ?.identityVerification
      ?.required &&
    !initialIdentityCompleted
  ) {
    const participantName =
      [
        user?.firstName,
        user?.lastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Participante";

    return (
      <main className="psychometric-identity">
        <div className="psychometric-identity__background">
          <span className="psychometric-identity__shape psychometric-identity__shape--one" />
          <span className="psychometric-identity__shape psychometric-identity__shape--two" />
        </div>

        <section className="psychometric-identity__card">
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
                {participantName}
              </strong>

              <small>
                Evaluación #
                {evaluation
                  ?.numeroEvaluacion ||
                  1}
              </small>
            </div>
          </div>

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
                Para respaldar la identidad
                de la persona que realiza
                esta evaluación y preservar
                la integridad del proceso,
                necesitamos registrar una
                fotografía del participante.
              </p>
            </div>
          </div>

          {!identityCameraStarted &&
            !identityPreviewUrl && (
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
                      frente y procura tener
                      buena iluminación.
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
                      asociada únicamente a
                      esta evaluación y
                      almacenada como evidencia
                      privada del proceso. No
                      se publicará ni se
                      mostrará dentro del test.
                    </p>
                  </div>
                </div>

                <label className="psychometric-identity__consent">
                  <input
                    type="checkbox"
                    checked={
                      identityConsentAccepted
                    }
                    onChange={(
                      event
                    ) => {
                      setIdentityConsentAccepted(
                        event.target
                          .checked
                      );

                      setIdentityCameraError(
                        ""
                      );
                    }}
                  />

                  <span>
                    He leído y autorizo la
                    captura de mi fotografía
                    para respaldar la identidad
                    asociada a esta evaluación.
                  </span>
                </label>
              </>
            )}

          {identityCameraStarted && (
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
                  Mira directamente a la cámara
                </div>
              </div>

              <button
                type="button"
                className="psychometric-identity__button psychometric-identity__button--primary psychometric-identity__button--full"
                onClick={
                  captureIdentityPhoto
                }
              >
                📷 Tomar fotografía
              </button>
            </div>
          )}

          {identityPreviewUrl && (
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
                Verifica que tu rostro sea
                claramente visible antes de
                continuar.
              </p>

              <div className="psychometric-identity__preview">
                <img
                  src={
                    identityPreviewUrl
                  }
                  alt="Fotografía de verificación"
                />
              </div>

              <div className="psychometric-identity__preview-actions">
                <button
                  type="button"
                  className="psychometric-identity__button psychometric-identity__button--secondary"
                  onClick={
                    retryIdentityPhoto
                  }
                  disabled={
                    isUploadingIdentity
                  }
                >
                  ↻ Repetir fotografía
                </button>

                <button
                  type="button"
                  className="psychometric-identity__button psychometric-identity__button--primary"
                  onClick={
                    submitInitialIdentity
                  }
                  disabled={
                    isUploadingIdentity
                  }
                >
                  {isUploadingIdentity
                    ? "Registrando..."
                    : "Confirmar e iniciar evaluación →"}
                </button>
              </div>
            </div>
          )}

          {(identityCameraError ||
            identityUploadError) && (
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
                    {identityCameraError ||
                      identityUploadError}
                  </p>
                </div>
              </div>
            )}

          {!identityCameraStarted &&
            !identityPreviewUrl && (
              <button
                type="button"
                className="psychometric-identity__button psychometric-identity__button--primary psychometric-identity__button--full"
                onClick={
                  startIdentityCamera
                }
                disabled={
                  !identityConsentAccepted ||
                  isUploadingIdentity
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
  }

  /* =======================================================
     VISTA PRINCIPAL
  ======================================================= */

  return (
    <main className="psychometric-test">


{/* =====================================================
    MODAL CONFIRMAR FINALIZACIÓN
===================================================== */}

{showFinishModal && (
  <div
    className="psychometric-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="finish-modal-title"
  >
    <div
      className="psychometric-modal__backdrop"
      onClick={() =>
        !isFinishing &&
        setShowFinishModal(false)
      }
    />

    <div className="psychometric-modal__card">
      <button
        type="button"
        className="psychometric-modal__close"
        onClick={() =>
          setShowFinishModal(false)
        }
        disabled={isFinishing}
        aria-label="Cerrar"
      >
        ×
      </button>

      <div className="psychometric-modal__brand">
        <img
          src="/images/test_logo.png"
          alt="Proyecto Pensar"
        />
      </div>

      <div className="psychometric-modal__icon psychometric-modal__icon--question">
        ✓
      </div>

      <span className="psychometric-modal__eyebrow">
        PROYECTO PENSAR
      </span>

      <h2 id="finish-modal-title">
        ¿Finalizar tu evaluación?
      </h2>

      <p>
        Has completado todas las
        preguntas obligatorias del
        test.
      </p>

      <div className="psychometric-modal__notice">
        <span className="psychometric-modal__notice-icon">
          !
        </span>

        <div>
          <strong>
            Confirma antes de continuar
          </strong>

          <p>
            Una vez finalizada la
            evaluación ya no podrás
            modificar tus respuestas.
          </p>
        </div>
      </div>

      <div className="psychometric-modal__summary">
        <div>
          <span>
            Preguntas
          </span>

          <strong>
            {localAnsweredQuestions}
            {" / "}
            {totalQuestions}
          </strong>
        </div>

        <div>
          <span>
            Progreso
          </span>

          <strong>
            {Math.round(
              localProgressPercentage
            )}
            %
          </strong>
        </div>

        <div>
          <span>
            Evaluación
          </span>

          <strong>
            #
            {evaluation
              ?.numeroEvaluacion ||
              1}
          </strong>
        </div>
      </div>

      <div className="psychometric-modal__actions">
        <button
          type="button"
          className="psychometric-modal__button psychometric-modal__button--secondary"
          onClick={() =>
            setShowFinishModal(
              false
            )
          }
          disabled={isFinishing}
        >
          Seguir revisando
        </button>

        <button
          type="button"
          className="psychometric-modal__button psychometric-modal__button--primary"
          onClick={
            confirmFinishEvaluation
          }
          disabled={isFinishing}
        >
          {isFinishing
            ? "Finalizando..."
            : "Sí, finalizar test"}
        </button>
      </div>
    </div>
  </div>
)}


{/* =====================================================
    MODAL EVALUACIÓN COMPLETADA
===================================================== */}

{showCompletedModal &&
  completedData && (
    <div
      className="psychometric-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completed-modal-title"
    >
      <div className="psychometric-modal__backdrop" />

      <div className="psychometric-modal__card psychometric-modal__card--success">
        <div className="psychometric-modal__brand">
          <img
            src="/images/test_logo.png"
            alt="Proyecto Pensar"
          />
        </div>

        <div className="psychometric-modal__success-animation">
          <span className="psychometric-modal__success-ring" />

          <span className="psychometric-modal__success-check">
            ✓
          </span>
        </div>

        <span className="psychometric-modal__eyebrow">
          EVALUACIÓN FINALIZADA
        </span>

        <h2 id="completed-modal-title">
          ¡Test completado correctamente!
        </h2>

        <p className="psychometric-modal__lead">
          {completedData?.message ||
            "Tu evaluación fue finalizada correctamente."}
        </p>

        <div className="psychometric-modal__success-panel">
          <div className="psychometric-modal__mail-icon">
            ✉
          </div>

          <div>
            <strong>
              Revisa tu correo electrónico
            </strong>

            <p>
              Te enviaremos las siguientes
              indicaciones para continuar
              con el proceso de Proyecto
              Pensar.
            </p>

            {user?.email && (
              <span>
                {user.email}
              </span>
            )}
          </div>
        </div>

        <div className="psychometric-modal__completed-info">
          <div>
            <span>
              Evaluación
            </span>

            <strong>
              #
              {evaluation
                ?.numeroEvaluacion ||
                1}
            </strong>
          </div>

          <div>
            <span>
              Estado
            </span>

            <strong>
              Completada
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="psychometric-modal__button psychometric-modal__button--primary psychometric-modal__button--full"
          onClick={() =>
            navigate("/")
          }
        >
          Finalizar y volver al inicio
        </button>

        <small className="psychometric-modal__security">
          Tus respuestas han sido
          registradas correctamente.
        </small>
      </div>
    </div>
  )}


      {(isSaving ||
        isFinishing) && (
          <IsLoading />
        )}

      <header className="psychometric-test__header">
        <div className="psychometric-test__brand">
          <img
            src="/images/test_logo.png"
            alt="Proyecto Pensar"
          />

          <div>
            <span>
              Proyecto Pensar
            </span>

            <h1>
              {test.nombre ||
                course?.nombre ||
                "Test psicotécnico"}
            </h1>
          </div>
        </div>

        <div className="psychometric-test__user">
          <small>
            Participante
          </small>

          <strong>
            {[
              user?.firstName,
              user?.lastName,
            ]
              .filter(Boolean)
              .join(" ") ||
              "Participante"}
          </strong>

          {user?.empresa && (
            <span>
              {user.empresa.nombre}

              {user.seccion?.nombre
                ? ` · ${user.seccion.nombre}`
                : ""}
            </span>
          )}
        </div>
      </header>

      <section className="psychometric-test__status">
        <div className="psychometric-test__status-info">
          <div>
            <span>
              Evaluación
            </span>

            <strong>
              #
              {evaluation
                ?.numeroEvaluacion ||
                1}
            </strong>
          </div>

          <div>
            <span>
              Sección
            </span>

            <strong>
              {currentSectionIndex +
                1}
              {" de "}
              {sections.length}
            </strong>
          </div>

          <div>
            <span>
              Respondidas
            </span>

            <strong>
              {
                localAnsweredQuestions
              }
              {" de "}
              {totalQuestions}
            </strong>
          </div>
        </div>

        <div className="psychometric-test__progress">
          <div className="psychometric-test__progress-header">
            <span>
              Progreso general
            </span>

            <strong>
              {
                localProgressPercentage
              }
              %
            </strong>
          </div>

          <div className="psychometric-test__progress-track">
            <div
              className="psychometric-test__progress-bar"
              style={{
                width:
                  `${localProgressPercentage}%`,
              }}
            />
          </div>
        </div>
      </section>

      {(saveMessage ||
        saveError) && (
          <div
            className={
              saveError
                ? "psychometric-test__save-message psychometric-test__save-message--error"
                : "psychometric-test__save-message psychometric-test__save-message--success"
            }
          >
            {saveError ||
              saveMessage}
          </div>
        )}

      <div className="psychometric-test__layout">
        {/* =================================
            MENÚ DE SECCIONES
        ================================= */}

        <aside className="psychometric-test__sidebar">
          <h2>
            Secciones
          </h2>

          <div className="psychometric-test__section-list">
            {sections.map(
              (
                section,
                index
              ) => {
                const questions =
                  getSectionQuestions(
                    section
                  );

                const answered =
                  getAnsweredInSection(
                    section
                  );

                const active =
                  index ===
                  currentSectionIndex;

                const completed =
                  isSectionComplete(
                    section
                  );

                const className = [
                  "psychometric-test__section-item",

                  active
                    ? "psychometric-test__section-item--active"
                    : "",

                  completed
                    ? "psychometric-test__section-item--completed"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    className={
                      className
                    }
                    onClick={() =>
                      goToSection(
                        index
                      )
                    }
                    disabled={
                      isSaving ||
                      isFinishing
                    }
                  >
                    <span>
                      {completed
                        ? "✓"
                        : index + 1}
                    </span>

                    <div>
                      <strong>
                        {
                          section.nombre
                        }
                      </strong>

                      <small>
                        {answered}
                        {" / "}
                        {
                          questions.length
                        }

                        {completed
                          ? " · Completa"
                          : ""}
                      </small>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </aside>

        {/* =================================
            SECCIÓN ACTUAL
        ================================= */}

        <section className="psychometric-test__content">
          <div className="psychometric-test__section-header">
            <span>
              Sección{" "}
              {currentSectionIndex +
                1}
            </span>

            <h2>
              {
                currentSection.nombre
              }
            </h2>

            {currentSection
              .descripcion && (
                <p>
                  {
                    currentSection
                      .descripcion
                  }
                </p>
              )}

            {currentSection
              .instrucciones && (
                <div className="psychometric-test__instructions">
                  {
                    currentSection
                      .instrucciones
                  }
                </div>
              )}
          </div>

          <div className="psychometric-test__questions">
            {getSectionQuestions(
              currentSection
            ).map(
              (
                question,
                index
              ) => {
                const answered =
                  isQuestionComplete(
                    question
                  );

                const pending =
                  question.obligatoria !==
                  false &&
                  !answered;

                return (
                  <article
                    id={`question-${question.id}`}
                    key={
                      question.id
                    }
                    className={[
                      "psychometric-question",

                      answered
                        ? "psychometric-question--answered"
                        : "",

                      pending &&
                        sectionError
                        ? "psychometric-question--pending"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <div className="psychometric-question__header">
                      <span className="psychometric-question__number">
                        {index + 1}
                      </span>

                      <div>
                        {question.tipoRespuesta !==
                          "escala_bipolar" && (
                            <h3>
                              {
                                question.pregunta
                              }
                            </h3>
                          )}

                        {question
                          .instrucciones && (
                            <p>
                              {
                                question.instrucciones
                              }
                            </p>
                          )}
                      </div>

                      {answered && (
                        <span className="psychometric-question__completed">
                          ✓ Respondida
                        </span>
                      )}
                    </div>

                    {renderQuestionInput(
                      question
                    )}
                  </article>
                );
              }
            )}
          </div>

          {sectionError && (
            <div
              className="psychometric-test__finish-error"
              role="alert"
            >
              <strong>
                Sección incompleta
              </strong>

              <span>
                {sectionError}
              </span>
            </div>
          )}

          {finishError && (
            <div
              className="psychometric-test__finish-error"
              role="alert"
            >
              <strong>
                Aún no puedes finalizar
              </strong>

              <span>
                {finishError}
              </span>
            </div>
          )}

          <footer className="psychometric-test__footer">
            <button
              type="button"
              className="psychometric-test__button psychometric-test__button--secondary"
              onClick={
                goPrevious
              }
              disabled={
                isFirstSection ||
                isSaving ||
                isFinishing
              }
            >
              ← Anterior
            </button>

            {!isLastSection ? (
              <button
                type="button"
                className="psychometric-test__button"
                onClick={
                  goNext
                }
                disabled={
                  isSaving ||
                  isFinishing
                }
              >
                {isSaving
                  ? "Guardando..."
                  : isSectionComplete(
                    currentSection
                  )
                    ? "Guardar y continuar →"
                    : `Faltan ${getPendingInSection(
                      currentSection
                    ).length
                    } preguntas`}
              </button>
            ) : (
              <button
                type="button"
                className={[
                  "psychometric-test__button",
                  "psychometric-test__button--finish",

                  !canFinish
                    ? "psychometric-test__button--incomplete"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={
                  finishEvaluation
                }
                disabled={
                  isSaving ||
                  isFinishing
                }
              >
                {isFinishing
                  ? "Finalizando..."
                  : canFinish
                    ? "Finalizar test"
                    : `Faltan ${pendingRequiredQuestions.length} preguntas`}
              </button>
            )}
          </footer>
        </section>
      </div>
    </main>
  );
};

export default ProyectoPensarTest;