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

  const [courses, getCourse, , , , , isLoading3] = useCrud();
  const [, , postVlidate, , , , , newValidate] = useCrud();

  const [usuario, setUsuario] = useState(null);
  const [cursoActual, setCursoActual] = useState(null);
  const [inscrito, setInscrito] = useState(null);
  const [pagoExistente, setPagoExistente] = useState(null);
  const [certificadoPagado, setCertificadoPagado] = useState(false);
  const [total, setTotal] = useState(0);

  const [resUploads, getUpload, , , , , isLoading, , , , uploadPdf, newUpload] =
    useCrud();

  const resUpload = resUploads.filter((p) => p.confirmacion === true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  const watchAll = watch([
    "moneda",
    "distintivo",
    "sPolicial",
    "oProfesionales",
  ]);
  const [moneda, distintivo, sPolicial, oProfesionales] = watchAll;

  useEffect(() => {
    getCourse(PATH_COURSES);
    getUpload(PATH_PAGOS);
  }, [inscrito]);

  useEffect(() => {
    // Extras en centavos
    let extrasCentavos = 0;
    if (moneda) extrasCentavos += 1500;
    if (distintivo) extrasCentavos += 1000;

    // Base en centavos
    let baseCentavos = 0;

    if (!certificadoPagado) {
      // si NO es pagado, depende del tipo
      if (oProfesionales) baseCentavos = 3200; // $32.00
      else baseCentavos = 1999; // $19.99 (default y también si sPolicial)
    } else {
      baseCentavos = 0; // certificado ya pagado
    }

    setTotal((baseCentavos + extrasCentavos) / 100);
  }, [moneda, distintivo, sPolicial, oProfesionales, certificadoPagado]);

  const cursoActivo = courses.find((c) => c.sigla === code);

  useEffect(() => {
    if (newValidate) {
      setUsuario(newValidate?.user);
      setInscrito(newValidate?.inscripcion);

      if (newValidate?.pagos?.length > 0) {
        setPagoExistente(newValidate?.pagos);
      }

      if (newValidate?.message) {
        dispatch(
          showAlert({
            message: newValidate?.message,
            alertType: 1,
          })
        );
      }
    }
  }, [newValidate]);

  const buscarCedula = (data) => {
    const cedula = data?.cedula.trim();
    const body = { cedula, code };
    const curso = courses?.find((c) => c.sigla === code);
    setCursoActual(curso);
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
          message: `✅ Estimado/a ${usuario?.firstName} ${usuario?.lastName}, se registró tu pago de $${newUpload.valorDepositado} por el certificado${extrasTexto}.`,
          alertType: 2,
        })
      );

      setUsuario(null);
      setInscrito(null);
    }
  }, [newUpload]);

  useEffect(() => {
    if (total > 0) {
      setValue("valorDepositado", total);
    }
  }, [total, setValue]);

  // 1) No existe curso
  if (!cursoActivo) {
    return (
      <div className="registro_container curso_no_encontrado">
        {isLoading && <IsLoading />}

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

  // 2) Existe pero NO está vigente
  if (cursoActivo?.vigente === false) {
    return (
      <div className="registro_container curso_no_encontrado">
        {isLoading && <IsLoading />}

        <div className="mensaje_curso_caja mensaje_curso_caja--finalizado">
          <h2>⏳ Oferta académica finalizada</h2>
          <p>
            La oferta académica del <strong>{cursoActivo?.nombre}</strong> ha
            finalizado.
          </p>
          <p>
            Si necesitas información, por favor contacta con el administrador o
            revisa nuestros cursos disponibles.
          </p>

          <div className="mensaje_acciones">
            <a className="mensaje_btn" href="/#/">
              Ir al inicio
            </a>
            <a
              className="mensaje_btn mensaje_btn--whatsapp"
              href="https://wa.me/593980773229"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3) Existe y está vigente -> sigue normal

  const onRegistrarNuevo = () => {
    setUsuario(newValidate?.user);
    const curso = courses?.find((c) => c.sigla === pagoExistente[0]?.curso);
    setCursoActual(curso);
    setPagoExistente(null);
    setCertificadoPagado(true);
  };

  return (
    <div className="pagos_container">
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

      <div className="pagos_wrapper pagos_medio_alto">
        {/* ===== Left ===== */}
        <div className="pagos_left pagos_animate_left">
          {!usuario ? (
            <form
              className="pagos_form_buscar"
              onSubmit={handleSubmit(buscarCedula)}
            >
              <div className="pagos_felicitacion">
                <h2>✅ ¿Ya culminaste tu curso?</h2>
                <p>
                  Si la respuesta es sí... ¡entonces déjanos felicitarte! 🎓 Has
                  demostrado disciplina, esfuerzo y determinación para llegar
                  hasta aquí.
                </p>
                <p>
                  👏 ¡Felicidades por completar con éxito tu formación! Este
                  logro representa mucho más que un certificado: es el reflejo
                  de tu crecimiento personal y académico.
                </p>
                <p>
                  Ahora estás listo para solicitar tu certificado oficial y, si
                  lo deseas, adquirir reconocimientos adicionales. ¡Gracias por
                  confiar en nosotros!
                </p>
              </div>

              <label className="pagos_label">
                <div className="pagos_btn_row">
                  <span>Ingrese su cédula:</span>
                  <input
                    className="pagos_input_cedula"
                    required
                    {...register("cedula")}
                  />
                  <button className="pagos_btn" type="submit">
                    🔍 Buscar
                  </button>
                </div>
              </label>
            </form>
          ) : (
            <form className="pagos_form_dos" onSubmit={handleSubmit(submit)}>
              <div>
                <div className="pagos_datos_usuario">
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
                    <strong>Cédula:</strong> {usuario.cI}
                  </p>

                  <div className="pagos_box_1">
                    <label className="pagos_check_row">
                      <span>Servidor Policial</span>
                      <input
                        type="checkbox"
                        {...register("sPolicial")}
                        onChange={(e) => {
                          setValue("sPolicial", e.target.checked);
                          if (e.target.checked)
                            setValue("oProfesionales", false);
                        }}
                      />
                    </label>

                    <label className="pagos_check_row">
                      <span>Otros Profesionales</span>
                      <input
                        type="checkbox"
                        {...register("oProfesionales")}
                        onChange={(e) => {
                          setValue("oProfesionales", e.target.checked);
                          if (e.target.checked) setValue("sPolicial", false);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="pagos_box">
                  <label className="pagos_check_row">
                    <span>Moneda conmemorativa (+$15)</span>
                    <input type="checkbox" {...register("moneda")} />
                  </label>
                  <label className="pagos_check_row">
                    <span>Distintivo (+$10)</span>
                    <input type="checkbox" {...register("distintivo")} />
                  </label>

                  <label className="pagos_label">
                    <span>Suba su comprobante (PDF o imagen):</span>
                    <input type="file" required {...register("archivo")} />
                  </label>
                </div>
              </div>

              <div className="pagos_inputs_pago">
                <p className="pagos_total">Total a pagar: ${total}</p>

                <label className="pagos_label">
                  <span>Valor depositado:</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    {...register("valorDepositado", {
                      required: "Debes ingresar el valor depositado.",
                    })}
                  />
                </label>

                {errors.valorDepositado && (
                  <p className="pagos_error">
                    {errors.valorDepositado.message}
                  </p>
                )}

                <div className="pagos_check_container">
                  <label className="pagos_check_legal">
                    <span>
                      Confirmo que la información mostrada es verídica y
                      autorizo su uso para la emisión del certificado. En caso
                      de requerir correcciones, contactar al equipo de soporte.
                    </span>
                    <input
                      type="checkbox"
                      {...register("confirmacion", {
                        validate: (value) =>
                          value === true || "Debes aceptar para continuar.",
                      })}
                    />
                  </label>
                  {errors.confirmacion && (
                    <p className="pagos_error">{errors.confirmacion.message}</p>
                  )}
                </div>

                <div className="pagos_btn_row">
                  <button className="pagos_btn" type="submit">
                    Confirmar
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* ===== Right ===== */}
        <div className="pagos_right pagos_animate_right">
          <div className="pagos_panel solo_imagen">
            <img
              src="/images/pago_accv_n.png"
              alt="Información de pago"
              className="pagos_img_full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroPagos;
