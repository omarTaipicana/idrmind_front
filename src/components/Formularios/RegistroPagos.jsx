import React, { useEffect, useState } from "react";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useParams } from "react-router-dom";
import "./styles/RegistroPagos.css";
import IsLoading from "../shared/isLoading";
import ModalPagoExistente from "./ModalPagoExistente";

export const RegistroPagos = () => {
  const PATH_COURSES = "/courses";
  const PATH_PAGOS = "/pagos";
  const PATH_PAGOSVALIDATE = "/pagovalidate";

  const dispatch = useDispatch();
  const { code } = useParams();

  const [courses, getCourse, , , , , isLoading3, , , ,] = useCrud();
  const [, , postVlidate, , , err, , newValidate] = useCrud();
  const [usuario, setUsuario] = useState(null);
  const [cursoActual, setCursoActual] = useState(null);
  const [inscrito, setInscrito] = useState();
  const [pagoExistente, setPagoExistente] = useState(null);
  const [certificadoPagado, setCertificadoPagado] = useState(false);

  const [total, setTotal] = useState(0);

  const [
    resUploads,
    getUpload,
    postUpload,
    deleteUpload,
    updateUpload,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    uploadPdf,
    newUpload,
  ] = useCrud();

  const resUpload = resUploads.filter((p) => p.confirmacion === true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const watchExtras = watch(["moneda", "distintivo"]);

  useEffect(() => {
    getCourse(PATH_COURSES);
    getUpload(PATH_PAGOS);
  }, [inscrito]);

  useEffect(() => {
    if (certificadoPagado) {
      let precio = 0;
      if (watchExtras[0]) precio += 15;
      if (watchExtras[1]) precio += 10;
      setTotal(precio);
    } else {
      let precio = 26;
      if (watchExtras[0]) precio += 15;
      if (watchExtras[1]) precio += 10;
      setTotal(precio);
    }
  }, [watchExtras, certificadoPagado]);

  // Buscar curso activo según code
  const cursoActivo = courses.find((c) => c.sigla === code);

  useEffect(() => {
    if (newValidate) {
      setUsuario(newValidate?.user);
      setInscrito(newValidate?.inscripcion);
    }

    if (newValidate?.pagos.length > 0) {
      setPagoExistente(newValidate?.pagos);
    }

    if (newValidate?.message) {
      dispatch(
        showAlert({
          message: newValidate?.message,
          alertType: 1,
        })
      );
      return;
    }
  }, [newValidate]);

  const buscarCedula = (data) => {
    const cedula = data?.cedula.trim();
    const body = { cedula, code };

    postVlidate(PATH_PAGOSVALIDATE, body);
  };

  const submit = (data) => {
    const body = {
      ...data,
      curso: code,
      inscripcionId: inscrito.id,
    };

    const file = data.archivo[0];

    uploadPdf(PATH_PAGOS, body, file);

    reset();
    setCursoActual(null);
    setTotal(26);
  };


  useEffect(() => {
    if (newUpload) {
      const extras = [];
      if (newUpload.moneda) extras.push("moneda");
      if (newUpload.distintivo) extras.push("distintivo");

      const extrasTexto =
        extras.length > 0 ? `, incluyendo ${extras.join(" y ")}` : "";
      dispatch(
        showAlert({
          message: `✅ Estimado/a ${usuario?.firstName} ${usuario?.lastName}, se registro tu pago de $${newUpload.valorDepositado} por el certificado${extrasTexto}.`,
          alertType: 2,
        })
      );
      setUsuario(null);
      setInscrito(null);
    }
  }, [newUpload]);

  if (!cursoActivo) {
    return (
      <div className="registro_container curso_no_encontrado">
        {isLoading3 && <IsLoading />}

        <div className="mensaje_curso_caja">
          <h2>❌ Curso no disponible</h2>
          <p>
            El curso con el código <strong>{code}</strong> no se encuentra
            disponible o no existe en nuestra base de datos.
          </p>
          <p>Por favor verifica el enlace o contacta con el administrador.</p>
        </div>
      </div>
    );
  }

  const onRegistrarNuevo = () => {
    setUsuario(newValidate?.user); // permite continuar al formulario
    const curso = courses?.find((c) => c.id === pagoExistente.courseId);
    setCursoActual(curso);
    setPagoExistente(null);
    setCertificadoPagado(true);
  };

  return (
    <div
      className="registro_container"
      style={{ backgroundImage: `url(/images/fondo_${code}.jpg)` }}
    >
      {isLoading && <IsLoading />}
      {isLoading3 && <IsLoading />}

      {pagoExistente && (
        <ModalPagoExistente
          pagos={resUpload}
          onRegistrarNuevo={onRegistrarNuevo}
          onClose={() => {
            setPagoExistente(null);
            setUsuario(null);
          }}
          inscrito={inscrito}
        />
      )}

      <div className="registro_wrapper medio_alto">
        <div className="registro_left animate_slide_left">
          {!usuario ? (
            <form
              className="formulario_registro"
              onSubmit={handleSubmit(buscarCedula)}
            >
              <div className="form_cedula">
                <div className="felicitacion_mensaje">
                  <h2>✅ ¿Ya culminaste tu curso?</h2>
                  <p>
                    Si la respuesta es sí... ¡entonces déjanos felicitarte! 🎓
                    Has demostrado disciplina, esfuerzo y determinación para
                    llegar hasta aquí.
                  </p>
                  <p>
                    👏 ¡Felicidades por completar con éxito tu formación! Este
                    logro representa mucho más que un certificado: es el reflejo
                    de tu crecimiento personal y académico.
                  </p>
                  <p>
                    Ahora estás listo para solicitar tu certificado oficial y,
                    si lo deseas, adquirir reconocimientos adicionales que
                    conmemoren este importante hito en tu camino profesional.
                    ¡Gracias por confiar en nosotros como parte de tu
                    aprendizaje!
                  </p>
                </div>

                <label className="label_cedula">
                  <span> Ingrese su cédula:</span>
                  <input
                    className="input_cedula"
                    required
                    {...register("cedula")}
                  />
                </label>
                <div className="form_button">
                  <button type="submit">🔍 Buscar</button>
                </div>
              </div>
            </form>
          ) : (
            <form className="doble_columna" onSubmit={handleSubmit(submit)}>
              <div className="datos_usuario">
                {cursoActual && <h2>🎓 {cursoActual.nombre}</h2>}
                <p>
                  <strong>Nombres:</strong> {usuario.firstName}
                </p>
                <p>
                  <strong>Apellidos:</strong> {usuario.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {usuario.email}
                </p>
                <p>
                  <strong>Celular:</strong> {usuario.cellular}
                </p>
                <p>
                  <strong>Cédula:</strong> {usuario.cI}
                </p>
              </div>

              <div className="inputs_pago">
                <div className="form_group">
                  <label>
                    <span>Moneda conmemorativa (+$15)</span>
                    <input type="checkbox" {...register("moneda")} />
                  </label>
                  <label>
                    <span>Distintivo (+$10)</span>
                    <input type="checkbox" {...register("distintivo")} />
                  </label>
                  <p className="total_pagar"> Total a pagar: ${total}</p>

                  <label>
                    <span> Suba su comprobante (PDF o imagen):</span>
                    <input type="file" required {...register("archivo")} />
                  </label>
                </div>

                <label>
                  <span> Valor depositado:</span>{" "}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("valorDepositado", {
                      required: "Debes ingresar el valor depositado.",
                    })}
                  />
                </label>
                {errors.valorDepositado && (
                  <p className="form_error">{errors.valorDepositado.message}</p>
                )}

                <div className="form_check_container">
                  <label className="form_check_label">
                    Confirmo que la información mostrada es verídica y autorizo
                    su uso para la emisión del certificado. En caso de requerir
                    correcciones, contactar al equipo de soporte.
                    <input
                      type="checkbox"
                      {...register("confirmacion", {
                        validate: (value) =>
                          value === true || "Debes aceptar para continuar.",
                      })}
                    />
                  </label>
                  {errors.confirmacion && (
                    <p className="form_error">{errors.confirmacion.message}</p>
                  )}
                </div>

                <div className="form_button">
                  <button type="submit">Confirmar</button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="registro_right animate_slide_right">
          <h3>INFORMACIÓN DE PAGO</h3>
          <div>
            <img
              className="curso_fondo_pago"
              src="/images/pago_accv_n.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroPagos;
