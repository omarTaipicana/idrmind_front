import React, { useEffect, useState } from "react";
import useCrud from "../../hooks/useCrud";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import { useParams } from "react-router-dom";
import "./styles/RegistroAlumnos.css";
import IsLoading from "../shared/isLoading";

const RegistroAlumnos = () => {
  const PATH_COURSES = "/courses";
  const PATH_VARIABLES = "/variables";
  const PATH_VALIDATE = "/validate";
  const PATH_INSCRIPCIONES = "/inscripcion";

  const dispatch = useDispatch();
  const { code } = useParams();

  const [idCourse, setIdCourse] = useState();
  const [course, getCourse, , , , , isLoading, , , ,] = useCrud();
  const [variables, getVariables] = useCrud();
  const [, , postValidate, , , , , validate] = useCrud();

  const [, , postInscripcion, , , error, isLoading2, newInscripcion] =
    useCrud();
  const [inscripcionExistente, setInscripcionExistente] = useState(null);
  const [userValidacion, setUserValidacion] = useState(null);
  const [userRegister, setUserRegister] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getCourse(PATH_COURSES);
    getVariables(PATH_VARIABLES);
  }, []);

  useEffect(() => {
    if (error) {
      const message = error.response?.data?.message ?? "Error inesperado";
      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        })
      );
    }
  }, [error]);

  useEffect(() => {
    if (newInscripcion) {
      dispatch(
        showAlert({
          message: `⚠️ Estimad@ ${newInscripcion.user.firstName} ${newInscripcion.user.lastName}, se realizo tu inscripción correctamente`,
          alertType: 2,
        })
      );
    }
  }, [newInscripcion]);

  useEffect(() => {
    if (course.length && code) {
      const foundCourse = course.find((c) => c.sigla === code);
      if (foundCourse) setIdCourse(foundCourse.id);
    }
  }, [course, code]);

  const validarCedula = (cedula) => {
    // Eliminar todos los caracteres que no sean dígitos
    cedula = cedula?.replace(/\D/g, ""); // \D = todo lo que NO sea dígito

    // Verificar que tenga exactamente 10 dígitos
    if (!/^\d{10}$/.test(cedula)) return false;

    const digitos = cedula.split("").map(Number);
    const digitoVerificador = digitos.pop();
    let suma = 0;

    for (let i = 0; i < digitos.length; i++) {
      let valor = digitos[i];
      if (i % 2 === 0) {
        valor *= 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    return decenaSuperior - suma === digitoVerificador;
  };

  const capitalizeWords = (str) => {
    return str
      .trim() // elimina espacios al inicio y fin
      .split(/\s+/) // separa por uno o más espacios
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const submitVal = (data) => {
    const body = { ...data, code };
    postValidate(PATH_VALIDATE, body);
  };

  useEffect(() => {
    if (validate) {
      setUserValidacion(validate);
      setUserRegister(validate.user);
    }
  }, [validate]);

  useEffect(() => {
    if (validate?.enrolled) {
      setInscripcionExistente(validate.user);
      setUserValidacion(null);
      dispatch(
        showAlert({
          message: "⚠️ Ya estás inscrito en este curso.",
          alertType: 2,
        })
      );
    }
  }, [validate, dispatch]);

  const submit = (data) => {
    // Ajustar nombres y apellidos
    const nombreFormateado = data.nombres ? capitalizeWords(data.nombres) : "";
    const apellidoFormateado = data.apellidos
      ? capitalizeWords(data.apellidos)
      : "";

    // Ajustar email a minúsculas y quitar espacios al inicio/final
    const emailFormateado = data.email ? data.email?.trim().toLowerCase() : "";
    const confirmEmailFormateado = data.confirmEmail
      ? data.confirmEmail.trim().toLowerCase()
      : "";

    // Validaciones con datos formateados

    const cedulaLimpia = data.cedula?.trim().replace(/\D/g, "");
    const isValidCedula = validarCedula(cedulaLimpia);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailFormateado);
    const celularLimpio = data.celular?.replace(/\D/g, ""); // Elimina todo lo que no sea dígito
    const isValidCellular = /^09\d{8}$/.test(celularLimpio);

    if (!isValidCedula)
      return dispatch(
        showAlert({
          message: "⚠️ La cédula ingresada es incorrecta.",
          alertType: 1,
        })
      );

    if (!isValidEmail)
      return dispatch(
        showAlert({ message: "⚠️ El email es incorrecto.", alertType: 1 })
      );

    if (!userRegister && emailFormateado !== confirmEmailFormateado) {
      return dispatch(
        showAlert({
          message: "⚠️ Su correo no coincide con el correo de validación.",
          alertType: 1,
        })
      );
    }

    if (!isValidCellular)
      return dispatch(
        showAlert({
          message:
            "⚠️ Celular inválido. Debe empezar con 09 y tener 10 dígitos.",
          alertType: 1,
        })
      );

    const body = {
      ...data,
      cedula: userRegister?.cI ? userRegister.cI : cedulaLimpia,
      nombres: userRegister?.firstName
        ? userRegister.firstName
        : nombreFormateado,
      apellidos: userRegister?.lastName
        ? userRegister.lastName
        : apellidoFormateado,
      email: userRegister?.email ? userRegister.email : emailFormateado,
      grado: userRegister?.grado ? userRegister.grado : data.grado,
      subsistema: userRegister?.subsistema
        ? userRegister.subsistema
        : data.subsistema,

      confirmEmail: confirmEmailFormateado,
      curso: code,
      courseId: idCourse,
    };
    postInscripcion(PATH_INSCRIPCIONES, body);
    setUserValidacion();
    reset();
  };

  const cursoActivo = course.find((c) => c.sigla === code);

  const missing = {
    cedula: !userRegister?.cI?.trim(),
    grado: !userRegister?.grado?.trim(),
    subsistema: !userRegister?.subsistema?.trim(),
    celular: !userRegister?.cellular?.trim(),
    email: !userRegister?.email?.trim(),
    nombres: !userRegister?.firstName?.trim(),
    apellidos: !userRegister?.lastName?.trim(),
  };

  const showFullForm = !userRegister; // si no existe usuario -> formulario completo
  const showConfirmEmail = showFullForm; // confirmación SOLO cuando no existe usuario


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
            La oferta académica del <strong>{cursoActivo?.nombre}</strong>{" "}
            ha finalizado.
          </p>
          <p>
            Si necesitas información, por favor contacta con el administrador o
            revisa nuestros cursos disponibles.
          </p>

          <div className="mensaje_acciones">
            <a className="mensaje_btn" href="/#/" >
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


  return (
    <div className="registro_container">
      {isLoading2 && <IsLoading />}

      {/* ========= VISTA 1: VERIFICAR INSCRIPCIÓN ========= */}
      {!userValidacion ? (
        <div className="registro_wrapper registro_wrapper--verifica">
          {/* Marca de agua + texto principal */}
          <div className="registro_intro">

            <h2 className="registro_intro_title">Inicia tu formación</h2>
            <p className="registro_intro_text">
              Ingresa tu correo electrónico para comprobar si ya te encuentras
              inscrito en este curso o si deseas registrarte para iniciar tu
              formación.
            </p>

            <ul className="registro_intro_list">
              <li>
                Si ya tienes una inscripción, te mostraremos tus datos y el
                estado de tu participación.
              </li>
              <li>
                Si aún no te has inscrito, podrás hacerlo fácilmente y comenzar
                tu aprendizaje con nosotros.
              </li>
            </ul>

            <p className="registro_intro_highlight">
              ¡El primer paso para avanzar en tu capacitación está aquí!
            </p>
          </div>

          {/* Formulario de verificación */}
          <form
            className="formulario_registro_val"
            onSubmit={handleSubmit(submitVal)}
          >
            <div className="registro_val_field">
              <label htmlFor="email" className="registro_label">
                Email
              </label>

              <div className="registro_val_row">
                <input
                  id="email"
                  type="email"
                  required
                  {...register("email")}
                />
                <button className="btn_inscripcion" type="submit">
                  Continuar
                </button>
              </div>
            </div>
          </form>

          {/* Mensaje cuando ya está inscrito */}
          {inscripcionExistente && (
            <div className="usuario_existente">
              <h3>Ya estás registrado en este curso:</h3>
              <p>
                <strong>Nombres:</strong> {inscripcionExistente.firstName}{" "}
                {inscripcionExistente.lastName}
              </p>
              <p>
                <strong>Email:</strong> {inscripcionExistente.email}
              </p>

              <button
                className="btn_cerrar_existente"
                onClick={() => {
                  setInscripcionExistente(null);
                  setUserValidacion(null);
                  setUserRegister(null);
                }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ========= VISTA 2: FORMULARIO DE INSCRIPCIÓN ========= */
        <div className="registro_wrapper registro_wrapper--form">
          {/* Columna izquierda: formulario */}
          <div className="registro_left animate_slide_left">
            <form
              className="formulario_registro"
              onSubmit={handleSubmit(submit)}
            >
              {/* Columna 1 del formulario */}
              <div className="form_column">

                {userRegister && (
                  <div className="incripcion_existente">
                    <h3>✅ Información encontrada</h3>

                    <p><strong>Nombres:</strong> {userRegister.firstName || <em>Falta completar</em>}</p>
                    <p><strong>Apellidos:</strong> {userRegister.lastName || <em>Falta completar</em>}</p>
                    <p><strong>Cédula:</strong> {userRegister.cI || <em>Falta completar</em>}</p>
                    <p><strong>Email:</strong> {userRegister.email || <em>Falta completar</em>}</p>

                    {(missing.cedula || missing.grado || missing.subsistema || missing.celular) && (
                      <p className="mensaje_inscripcion">
                        Tu perfil está incompleto. Completa los campos faltantes para continuar con la inscripción.
                      </p>
                    )}
                  </div>
                )}


                {userRegister && (
                  <>
                    {missing.nombres && (
                      <label className="registro_label">
                        Nombres
                        <input
                          placeholder="Nombres completos"
                          required
                          {...register("nombres")}
                          defaultValue=""
                        />
                      </label>
                    )}

                    {missing.apellidos && (
                      <label className="registro_label">
                        Apellidos
                        <input
                          placeholder="Apellidos completos"
                          required
                          {...register("apellidos")}
                          defaultValue=""
                        />
                      </label>
                    )}

                    {missing.cedula && (
                      <label className="registro_label">
                        Cédula
                        <input
                          required
                          {...register("cedula")}
                          defaultValue=""
                        />
                      </label>
                    )}


                  </>
                )}

                {userRegister && (
                  <>
                    {!missing.cedula && (
                      <input type="hidden" value={userRegister.cI} {...register("cedula")} />
                    )}
                    {!missing.nombres && (
                      <input type="hidden" value={userRegister.firstName} {...register("nombres")} />
                    )}
                    {!missing.apellidos && (
                      <input type="hidden" value={userRegister.lastName} {...register("apellidos")} />
                    )}
                    {!missing.email && (
                      <input type="hidden" value={userRegister.email} {...register("email")} />
                    )}
                    {!missing.celular && (
                      <input type="hidden" value={userRegister.cellular} {...register("celular")} />
                    )}




                  </>
                )}

                {!userRegister && (
                  <>
                    <label className="registro_label">
                      Confirmar Email
                      <input
                        type="email"
                        required
                        {...register("confirmEmail")}
                      />
                    </label>

                    <label className="registro_label">
                      Nombres
                      <input
                        placeholder="Nombres completos (tildes y ñ si aplica)"
                        required
                        {...register("nombres")}
                      />
                    </label>

                    <label className="registro_label">
                      Apellidos
                      <input
                        placeholder="Apellidos completos (tildes y ñ si aplica)"
                        required
                        {...register("apellidos")}
                      />
                    </label>


                    <label className="registro_label">
                      Cédula
                      <input
                        required
                        {...register("cedula")}
                        defaultValue={userRegister?.cI || ""}
                      />
                    </label>
                  </>
                )}



              </div>

              {/* Columna 2 del formulario */}

              <div className="form_column">
                {userRegister && (
                  <>
                    {missing.celular && (
                      <label className="registro_label">
                        Celular
                        <input required {...register("celular")} defaultValue="" />
                      </label>
                    )}



                  </>
                )}

                {!userRegister && (
                  <>
                    <label className="registro_label">
                      Celular
                      <input required {...register("celular")} />
                    </label>


                  </>
                )}


                <div className="form_check_container">
                  <label className="form_check_label">
                    Acepto recibir correos electrónicos con información sobre
                    los cursos y otros contenidos relacionados. Entiendo que mis
                    datos serán tratados de acuerdo con la política de
                    privacidad y que puedo dejar de recibirlos en cualquier
                    momento.
                    <input
                      type="checkbox"
                      {...register("aceptacion", {
                        validate: (value) =>
                          value === true ||
                          "Debes aceptar la política para continuar.",
                      })}
                    />
                  </label>
                  {errors.aceptacion && (
                    <p className="form_error">{errors.aceptacion.message}</p>
                  )}
                </div>

                <div className="form_button_inscripcion">
                  <button className="btn_inscripcion" type="submit">
                    Inscribirme <span>➜</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Columna derecha: info del curso con imagen de fondo */}
          <div className="registro_right animate_slide_right">
            {cursoActivo && (
              <div className="curso_fondo">
                <div className="curso_overlay">
                  <h2>{cursoActivo.nombre}</h2>
                  <p>{cursoActivo.objetivo}</p>
                </div>
                <div
                  className="curso_imagen"
                  style={{
                    backgroundImage: `url(/images/${code}.jpg)`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default RegistroAlumnos;
