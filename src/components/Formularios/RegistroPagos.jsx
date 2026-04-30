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
  const [fileName, setFileName] = useState("");

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

      <div className="pagos_shell">
        <div className="pagos_brand">
          <img src="/images/idrmind_logo_sf.png" alt="iDr.Mind" />
          <span>Registro de pago</span>
        </div>

        <div className="pagos_layout">
          <section className="pagos_form_card pagos_animate_left">
            {!usuario ? (
              <form className="pagos_form_buscar" onSubmit={handleSubmit(buscarCedula)}>
                <div className="pagos_intro">
                  <span className="pagos_badge">Certificación iDr.Mind</span>
                  <h1>Solicita tu certificado oficial</h1>
                  <p>
                    Ingresa tu cédula para verificar tu información y continuar
                    con el registro del comprobante de pago.
                  </p>
                </div>

                <label className="pagos_label">
                  <span>Cédula</span>
                  <input
                    className="pagos_input_cedula"
                    placeholder="Ej: 0500000000"
                    required
                    {...register("cedula")}
                  />
                </label>

                <button className="pagos_btn pagos_btn_full" type="submit">
                  Buscar inscripción
                </button>
              </form>
            ) : (
              <form className="pagos_form_dos" onSubmit={handleSubmit(submit)}>
                <div className="pagos_col">
                  <div className="pagos_datos_usuario">
                    <span className="pagos_badge">Datos encontrados</span>
                    {cursoActual && <h2>{cursoActual.nombre}</h2>}

                    <p><strong>Nombres:</strong> {usuario.firstName}</p>
                    <p><strong>Apellidos:</strong> {usuario.lastName}</p>
                    <p><strong>Email:</strong> {usuario.email}</p>
                    <p><strong>Cédula:</strong> {usuario.cI}</p>
                  </div>

                  <div className="pagos_box">
                    <h3>Tipo de certificado</h3>

                    <label className="pagos_check_row">
                      <span>Certificado por el Ministerio</span>
                      <input
                        type="checkbox"
                        {...register("sPolicial")}
                        onChange={(e) => {
                          setValue("sPolicial", e.target.checked);
                          if (e.target.checked) setValue("oProfesionales", false);
                        }}
                      />
                    </label>

                    <label className="pagos_check_row">
                      <span>Certificado exterior</span>
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

                  <div className="pagos_box">
                    <h3>Adicionales</h3>

                    <label className="pagos_check_row">
                      <span>Moneda conmemorativa (+$15)</span>
                      <input type="checkbox" {...register("moneda")} />
                    </label>

                    <label className="pagos_check_row">
                      <span>Distintivo (+$10)</span>
                      <input type="checkbox" {...register("distintivo")} />
                    </label>
                  </div>
                </div>

                <div className="pagos_col pagos_col_pago">
                  <div className="pagos_total">
                    <span>Total a pagar</span>
                    <strong>${total}</strong>
                  </div>

                  <label className="pagos_label">
                    <span>Comprobante de pago</span>


                    <div className="pagos_file_wrapper">
                      <label className="pagos_file_label">
                        <span>Seleccionar comprobante</span>

                        <input
                          type="file"
                          required
                          {...register("archivo")}
                          onChange={(e) => {
                            setFileName(e.target.files[0]?.name || "");
                          }}
                        />
                      </label>

                      {fileName && (
                        <p className="pagos_file_name">{fileName}</p>
                      )}
                    </div>

                  </label>

                  <label className="pagos_label">
                    <span>Valor depositado</span>
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
                    <p className="pagos_error">{errors.valorDepositado.message}</p>
                  )}

                  <label className="pagos_check_legal">
                    <span>
                      Confirmo que la información mostrada es verídica y autorizo
                      su uso para la emisión del certificado.
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

                  <button className="pagos_btn pagos_btn_full" type="submit">
                    Confirmar pago
                  </button>
                </div>
              </form>
            )}
          </section>

          <aside className="pagos_visual pagos_animate_right">
            <img src="/images/pago_info.png" alt="Información de pago" />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RegistroPagos;
