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
  const [total, setTotal] = useState(0);
  const [fileName, setFileName] = useState("");

  const [certificadosPagados, setCertificadosPagados] = useState({
    cert_emp: false,
    cert_mdt: false,
    cert_int: false,
  });

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

  const [cert_emp, cert_mdt, cert_int] = watch([
    "cert_emp",
    "cert_mdt",
    "cert_int",
  ]);

  const archivoWatch = watch("archivo");

  useEffect(() => {
    setFileName(archivoWatch?.[0]?.name || "");
  }, [archivoWatch]);

  const toCents = (value) => Math.round(Number(value || 0) * 100);

  const tieneCertificado = (pago, campoNuevo, campoViejo = null) => {
    return (
      pago?.[campoNuevo] === true ||
      pago?.[campoNuevo] === "true" ||
      pago?.[campoNuevo] === 1 ||
      pago?.[campoNuevo] === "1" ||
      (campoViejo &&
        (pago?.[campoViejo] === true ||
          pago?.[campoViejo] === "true" ||
          pago?.[campoViejo] === 1 ||
          pago?.[campoViejo] === "1"))
    );
  };

const obtenerCertificadosPagados = (pagos = []) => ({
  cert_emp: pagos.some(
    (p) =>
      p.confirmacion === true &&
      tieneCertificado(p, "cert_emp", "empresarial")
  ),

  cert_mdt: pagos.some(
    (p) =>
      p.confirmacion === true &&
      tieneCertificado(p, "cert_mdt", "sPolicial")
  ),

  cert_int: pagos.some(
    (p) =>
      p.confirmacion === true &&
      tieneCertificado(p, "cert_int", "oProfesionales")
  ),
});

  const resetCertificados = () => {
    setValue("cert_emp", false);
    setValue("cert_mdt", false);
    setValue("cert_int", false);
    setTotal(0);
  };

  useEffect(() => {
    getCourse(PATH_COURSES);
    getUpload(PATH_PAGOS);
  }, [inscrito]);

  const cursoActivo = courses.find((c) => c.sigla === code);

  useEffect(() => {
    let totalCentavos = 0;

    if (cert_emp && !certificadosPagados.cert_emp) {
      totalCentavos += toCents(cursoActual?.precio_emp);
    }

    if (cert_mdt && !certificadosPagados.cert_mdt) {
      totalCentavos += toCents(cursoActual?.precio_mdt);
    }

    if (cert_int && !certificadosPagados.cert_int) {
      totalCentavos += toCents(cursoActual?.precio_int);
    }

    setTotal(totalCentavos / 100);
  }, [cert_emp, cert_mdt, cert_int, cursoActual, certificadosPagados]);

  useEffect(() => {
    if (total > 0) {
      setValue("valorDepositado", total.toFixed(2));
    } else {
      setValue("valorDepositado", "");
    }
  }, [total, setValue]);

  useEffect(() => {
    if (newValidate) {
      setUsuario(newValidate?.user);
      setInscrito(newValidate?.inscripcion);

    

      const certificados = obtenerCertificadosPagados(newValidate?.pagos || []);
      setCertificadosPagados(certificados);
      resetCertificados();


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
    const cedula = data?.cedula?.trim();
    const body = { cedula, code };
    const curso = courses?.find((c) => c.sigla === code);

    setCursoActual(curso);
    postVlidate(PATH_PAGOSVALIDATE, body);
  };

  const submit = (data) => {
    if (!data.cert_emp && !data.cert_mdt && !data.cert_int) {
      dispatch(
        showAlert({
          message: "Selecciona al menos un tipo de certificado.",
          alertType: 1,
        })
      );
      return;
    }

    if (total <= 0) {
      dispatch(
        showAlert({
          message: "No hay valor pendiente para los certificados seleccionados.",
          alertType: 1,
        })
      );
      return;
    }

    const body = {
      ...data,
      curso: code,
      inscripcionId: inscrito.id,

      cert_emp: !!data.cert_emp,
      cert_mdt: !!data.cert_mdt,
      cert_int: !!data.cert_int,

      sPolicial: !!data.cert_mdt,
      oProfesionales: !!data.cert_int,

      valorCalculado: total,
    };

    const file = data.archivo[0];
    uploadPdf(PATH_PAGOS, body, file);

    reset();
    setCursoActual(null);
    setTotal(0);
    setFileName("");
  };

  useEffect(() => {
    if (newUpload) {
      const seleccionados = [];

      if (newUpload.cert_emp) seleccionados.push("certificado empresarial");
      if (newUpload.cert_mdt || newUpload.sPolicial) {
        seleccionados.push("certificado por el Ministerio");
      }
      if (newUpload.cert_int || newUpload.oProfesionales) {
        seleccionados.push("certificado internacional");
      }

      dispatch(
        showAlert({
          message: `✅ Estimado/a ${usuario?.firstName} ${
            usuario?.lastName
          }, se registró tu pago de $${
            newUpload.valorDepositado
          } por ${seleccionados.join(", ")}.`,
          alertType: 2,
        })
      );

      setUsuario(null);
      setInscrito(null);
      setCertificadosPagados({
        cert_emp: false,
        cert_mdt: false,
        cert_int: false,
      });
    }
  }, [newUpload]);

  const onRegistrarNuevo = () => {
    setUsuario(newValidate?.user);

    const curso =
      courses?.find((c) => c.sigla === pagoExistente?.[0]?.curso) ||
      cursoActivo;

    setCursoActual(curso);
    setCertificadosPagados(obtenerCertificadosPagados(pagoExistente || []));
    resetCertificados();
    setPagoExistente(null);
  };

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


  const certificados = [
    {
      name: "cert_emp",
      title: "Certificado Empresarial iDr.Mind.",
      price: cursoActual?.precio_emp,
      disabled: certificadosPagados.cert_emp,
    },
    {
      name: "cert_mdt",
      title: "Certificado por el Ministerio de Trabajo",
      price: cursoActual?.precio_mdt,
      disabled: certificadosPagados.cert_mdt,
    },
    {
      name: "cert_int",
      title: "Certificado Internacional",
      price: cursoActual?.precio_int,
      disabled: certificadosPagados.cert_int,
    },
  ];

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
              <form
                className="pagos_form_buscar"
                onSubmit={handleSubmit(buscarCedula)}
              >
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

                    <p>
                      <strong>Nombres:</strong> {usuario?.firstName}
                    </p>
                    <p>
                      <strong>Apellidos:</strong> {usuario?.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {usuario?.email}
                    </p>
                    <p>
                      <strong>Cédula:</strong> {usuario?.cI}
                    </p>
                  </div>

                  <div className="pagos_box">
                    <h3>Selecciona tus certificados</h3>

                    {certificados.map((cert) => (
                      <label
                        key={cert.name}
                        className={`pagos_cert_card ${
                          cert.disabled ? "pagos_cert_card--disabled" : ""
                        }`}
                      >
                        <div className="pagos_cert_info">
                          <strong>{cert.title}</strong>
                     
                          <span>
                            {cert.disabled
                              ? "Ya registrado"
                              : `$${Number(cert.price || 0).toFixed(2)}`}
                          </span>
                        </div>

                        <input
                        className="check_price"
                          type="checkbox"
                          disabled={cert.disabled}
                          {...register(cert.name)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pagos_col pagos_col_pago">
                  <div className="pagos_total">
                    <span>Total a pagar</span>
                    <strong>${Number(total || 0).toFixed(2)}</strong>
                  </div>

                  <label className="pagos_label">
                    <span>Comprobante de pago</span>

                    <div className="pagos_file_wrapper">
                      <label className="pagos_file_label">
                        <span>Seleccionar comprobante</span>

                        <input
                          type="file"
                          {...register("archivo", {
                            required: "Debes subir el comprobante de pago.",
                          })}
                        />
                      </label>

                      {fileName && (
                        <p className="pagos_file_name">✔ {fileName}</p>
                      )}
                    </div>
                  </label>

                  {errors.archivo && (
                    <p className="pagos_error">{errors.archivo.message}</p>
                  )}

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
                    <p className="pagos_error">
                      {errors.valorDepositado.message}
                    </p>
                  )}

                  <label className="pagos_check_legal">
                    <span>
                      Confirmo que la información mostrada es verídica y
                      autorizo su uso para la emisión del certificado.
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
                    <p className="pagos_error">
                      {errors.confirmacion.message}
                    </p>
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