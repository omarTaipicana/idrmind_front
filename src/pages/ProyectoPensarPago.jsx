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

import IsLoading from "../components/shared/isLoading";

import "./styles/ProyectoPensarPago.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const ProyectoPensarPago = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  /* =======================================================
     ESTADO
  ======================================================= */

  const [
    accessData,
    setAccessData,
  ] = useState(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    accessError,
    setAccessError,
  ] = useState(null);

  const [
    comprobante,
    setComprobante,
  ] = useState(null);

  const [
    valorDepositado,
    setValorDepositado,
  ] = useState("");

  const [
    entidad,
    setEntidad,
  ] = useState("");

  const [
    idDeposito,
    setIdDeposito,
  ] = useState("");

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    successData,
    setSuccessData,
  ] = useState(null);

  /* =======================================================
     CARGAR DATOS DEL PAGO
  ======================================================= */

  useEffect(() => {
    const loadPaymentAccess = async () => {
      if (!token) {
        setAccessError({
          message:
            "No se recibió el token de pago.",
        });

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setAccessError(null);

      try {
        const response =
          await axios.get(
            `${API_URL}/psychometric/payment/${encodeURIComponent(
              token
            )}`
          );

        setAccessData(
          response.data
        );
      } catch (error) {
        console.error(
          "Error cargando pago psicométrico:",
          error.response?.data ||
            error
        );

        setAccessError(
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentAccess();
  }, [token]);

  /* =======================================================
     DATOS NORMALIZADOS
  ======================================================= */

  const evaluation =
    accessData?.evaluation ||
    null;

  const user =
    accessData?.user ||
    null;

  const course =
    accessData?.course ||
    null;

  const payment =
    accessData?.payment ||
    null;

  const nombreCompleto =
    useMemo(() => {
      return [
        user?.firstName,
        user?.lastName,
      ]
        .filter(Boolean)
        .join(" ");
    }, [user]);

  /* =======================================================
     VALIDAR ARCHIVO
  ======================================================= */

  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    setFormError("");

    if (!file) {
      setComprobante(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setComprobante(null);

      setFormError(
        "El comprobante debe ser JPG, PNG, WEBP o PDF."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (
      file.size >
      maxSize
    ) {
      setComprobante(null);

      setFormError(
        "El comprobante no puede superar los 10 MB."
      );

      event.target.value = "";

      return;
    }

    setComprobante(file);
  };

  /* =======================================================
     VALIDAR FORMULARIO
  ======================================================= */

  const validateForm = () => {
    if (!comprobante) {
      setFormError(
        "Debes seleccionar el comprobante de pago."
      );

      return false;
    }

    if (
      valorDepositado ===
        "" ||
      valorDepositado ===
        null ||
      valorDepositado ===
        undefined
    ) {
      setFormError(
        "Ingresa el valor depositado."
      );

      return false;
    }

    const valor =
      Number(valorDepositado);

    if (
      Number.isNaN(valor) ||
      valor <= 0
    ) {
      setFormError(
        "El valor depositado no es válido."
      );

      return false;
    }

    setFormError("");

    return true;
  };

  /* =======================================================
     REGISTRAR PAGO
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setFormError("");

      try {
        const formData =
          new FormData();

        formData.append(
          "imagePago",
          comprobante
        );

        formData.append(
          "valorDepositado",
          valorDepositado
        );

        if (
          entidad.trim()
        ) {
          formData.append(
            "entidad",
            entidad.trim()
          );
        }

        if (
          idDeposito.trim()
        ) {
          formData.append(
            "idDeposito",
            idDeposito.trim()
          );
        }

        if (
          observacion.trim()
        ) {
          formData.append(
            "observacion",
            observacion.trim()
          );
        }

        const response =
          await axios.post(
            `${API_URL}/psychometric/payment/${encodeURIComponent(
              token
            )}`,
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        setSuccessData(
          response.data
        );

        setAccessData(
          (previous) => ({
            ...previous,

            payment: {
              alreadyRegistered:
                true,

              verified:
                false,

              paymentId:
                response.data
                  ?.payment?.id ||
                null,
            },
          })
        );
      } catch (error) {
        console.error(
          "Error registrando pago psicométrico:",
          error.response?.data ||
            error
        );

        setFormError(
          error.response?.data
            ?.message ||
            "No se pudo registrar el comprobante."
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  /* =======================================================
     CARGANDO
  ======================================================= */

  if (isLoading) {
    return <IsLoading />;
  }

  /* =======================================================
     ERROR DE ACCESO
  ======================================================= */

  if (accessError) {
    const message =
      accessError?.response
        ?.data?.message ||
      accessError?.message ||
      "El enlace de pago no es válido o ha expirado.";

    return (
      <main className="ppago">
        <section className="ppago__statusCard">
          <div className="ppago__statusIcon">
            !
          </div>

          <h1>
            No se pudo abrir el pago
          </h1>

          <p>{message}</p>

          <button
            type="button"
            className="ppago__primaryButton"
            onClick={() =>
              navigate("/")
            }
          >
            Volver al inicio
          </button>
        </section>
      </main>
    );
  }

  /* =======================================================
     PAGO REGISTRADO
  ======================================================= */

  if (
    successData ||
    payment?.alreadyRegistered
  ) {
    const verified =
      payment?.verified === true;

    return (
      <main className="ppago">
        <section className="ppago__statusCard ppago__statusCard--success">
          <div className="ppago__statusIcon ppago__statusIcon--success">
            ✓
          </div>

          <span className="ppago__eyebrow">
            Proyecto Pensar
          </span>

          <h1>
            {verified
              ? "Pago validado"
              : "Comprobante recibido"}
          </h1>

          <p>
            {successData
              ?.message ||
              (verified
                ? "El pago de esta evaluación ya fue validado."
                : "Ya existe un comprobante registrado para esta evaluación y está pendiente de validación.")}
          </p>

          {evaluation && (
            <div className="ppago__summary">
              <div>
                <span>
                  Evaluación
                </span>

                <strong>
                  N.º{" "}
                  {
                    evaluation.numeroEvaluacion
                  }
                </strong>
              </div>

              <div>
                <span>
                  Participante
                </span>

                <strong>
                  {nombreCompleto ||
                    "Participante"}
                </strong>
              </div>

              <div>
                <span>
                  Estado
                </span>

                <strong>
                  {verified
                    ? "Validado"
                    : "Pendiente de validación"}
                </strong>
              </div>
            </div>
          )}

          {!verified && (
            <div className="ppago__notice ppago__notice--info">
              Una vez validado el
              pago recibirás un
              correo con el enlace
              para consultar tu
              resultado.
            </div>
          )}

          <button
            type="button"
            className="ppago__primaryButton"
            onClick={() =>
              navigate("/")
            }
          >
            Volver al inicio
          </button>
        </section>
      </main>
    );
  }

  /* =======================================================
     FORMULARIO
  ======================================================= */

  return (
    <main className="ppago">
      {isSubmitting && (
        <IsLoading />
      )}

      <section className="ppago__shell">
        <header className="ppago__header">
          <div className="ppago__brand">
            <img
              src="/images/test_logo.png"
              alt="Proyecto Pensar"
            />

            <div>
              <span>
                Proyecto Pensar
              </span>

              <h1>
                Registro de pago
              </h1>
            </div>
          </div>

          <div className="ppago__secureBadge">
            Enlace seguro
          </div>
        </header>

        <div className="ppago__grid">
          {/* =================================
              INFORMACIÓN
          ================================= */}

          <aside className="ppago__infoCard">
            <span className="ppago__eyebrow">
              Información de la
              evaluación
            </span>

            <h2>
              {course?.nombre ||
                "Test Psicotécnico"}
            </h2>

            <div className="ppago__infoList">
              <div className="ppago__infoItem">
                <span>
                  Participante
                </span>

                <strong>
                  {nombreCompleto ||
                    "Participante"}
                </strong>
              </div>

              <div className="ppago__infoItem">
                <span>
                  Correo
                </span>

                <strong>
                  {user?.email ||
                    "No disponible"}
                </strong>
              </div>

              <div className="ppago__infoItem">
                <span>
                  Evaluación
                </span>

                <strong>
                  N.º{" "}
                  {
                    evaluation?.numeroEvaluacion
                  }
                </strong>
              </div>

              <div className="ppago__infoItem">
                <span>
                  Código
                </span>

                <strong>
                  {course?.sigla ||
                    "-"}
                </strong>
              </div>
            </div>

            <div className="ppago__notice">
              No necesitas ingresar
              nuevamente tu cédula,
              correo ni datos de
              inscripción. Este
              enlace ya está asociado
              a tu evaluación.
            </div>

            <div className="ppago__process">
              <div>
                <span>1</span>
                <p>
                  Registra tu
                  comprobante.
                </p>
              </div>

              <div>
                <span>2</span>
                <p>
                  Nuestro equipo
                  valida el pago.
                </p>
              </div>

              <div>
                <span>3</span>
                <p>
                  Recibes por correo
                  el acceso a tus
                  resultados.
                </p>
              </div>
            </div>
          </aside>

          {/* =================================
              FORMULARIO
          ================================= */}

          <section className="ppago__formCard">
            <div className="ppago__formHeader">
              <span className="ppago__eyebrow">
                Comprobante
              </span>

              <h2>
                Registra tu pago
              </h2>

              <p>
                Completa la
                información y adjunta
                una imagen o PDF del
                comprobante.
              </p>
            </div>

            <form
              className="ppago__form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="ppago__field">
                <label
                  htmlFor="valorDepositado"
                >
                  Valor depositado
                  <span>*</span>
                </label>

                <div className="ppago__moneyInput">
                  <span>$</span>

                  <input
                    id="valorDepositado"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      valorDepositado
                    }
                    onChange={(
                      event
                    ) =>
                      setValorDepositado(
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              </div>

              <div className="ppago__twoColumns">
                {/* <div className="ppago__field">
                  <label
                    htmlFor="entidad"
                  >
                    Entidad
                  </label>

                  <input
                    id="entidad"
                    type="text"
                    placeholder="Banco o cooperativa"
                    value={entidad}
                    onChange={(
                      event
                    ) =>
                      setEntidad(
                        event.target
                          .value
                      )
                    }
                  />
                </div>

                <div className="ppago__field">
                  <label
                    htmlFor="idDeposito"
                  >
                    ID / referencia
                  </label>

                  <input
                    id="idDeposito"
                    type="text"
                    placeholder="Número de operación"
                    value={
                      idDeposito
                    }
                    onChange={(
                      event
                    ) =>
                      setIdDeposito(
                        event.target
                          .value
                      )
                    }
                  />
                </div> */}
              </div>

              <div className="ppago__field">
                <label
                  htmlFor="imagePago"
                >
                  Comprobante
                  <span>*</span>
                </label>

                <label
                  className={
                    comprobante
                      ? "ppago__fileBox ppago__fileBox--selected"
                      : "ppago__fileBox"
                  }
                  htmlFor="imagePago"
                >
                  <input
                    id="imagePago"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    onChange={
                      handleFileChange
                    }
                  />

                  <div className="ppago__fileIcon">
                    {comprobante
                      ? "✓"
                      : "↑"}
                  </div>

                  <div>
                    <strong>
                      {comprobante
                        ? comprobante.name
                        : "Seleccionar comprobante"}
                    </strong>

                    <span>
                      {comprobante
                        ? `${(
                            comprobante.size /
                            1024 /
                            1024
                          ).toFixed(
                            2
                          )} MB`
                        : "JPG, PNG, WEBP o PDF · Máx. 10 MB"}
                    </span>
                  </div>
                </label>
              </div>

              {/* <div className="ppago__field">
                <label
                  htmlFor="observacion"
                >
                  Observación
                </label>

                <textarea
                  id="observacion"
                  rows="4"
                  placeholder="Información adicional del pago (opcional)"
                  value={
                    observacion
                  }
                  onChange={(
                    event
                  ) =>
                    setObservacion(
                      event.target
                        .value
                    )
                  }
                />
              </div> */}

              {formError && (
                <div
                  className="ppago__formError"
                  role="alert"
                >
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="ppago__submitButton"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting
                  ? "Registrando..."
                  : "Registrar comprobante"}
              </button>

              <p className="ppago__privacy">
                El comprobante se
                asociará únicamente a
                esta evaluación.
              </p>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
};

export default ProyectoPensarPago;