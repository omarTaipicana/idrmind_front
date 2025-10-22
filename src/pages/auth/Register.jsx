import React, { useEffect, useState } from "react";
import "./styles/Register.css";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import IsLoading from "../../components/shared/isLoading";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hidePassword, setHidePassword] = useState(true);
  const [hidePasswordVerify, setHidePasswordVerify] = useState(true);
  const [
    registerUser,
    updateUser,
    loginUser,
    loggedUser,
    verifyUser,
    userRegister,
    isLoading,
    error,
    verified,
    sendEmail,
    userResetPassword,
    changePassword,
    userUpdate,
    userLogged,
    setUserLogged,
  ] = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    value,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (error) {
      dispatch(
        showAlert({
          message: `⚠️ ${error.response?.data?.message}` || "Error inesperado",
          alertType: 1,
        })
      );
    }
  }, [error]);

  useEffect(() => {
    if (userRegister) {
      dispatch(
        showAlert({
          message: `⚠️ Usuario Registrado, revise su correo electrónico`,
          alertType: 2,
        })
      );
      navigate("/login");
    }
  }, [userRegister]);

  const capitalizeWords = (str) => {
    return str
      .trim() // elimina espacios al inicio y fin
      .split(/\s+/) // separa por uno o más espacios
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const submit = (data) => {
    const frontBaseUrl = `${location.protocol}//${location.host}/#/verify`;
    const nombreFormateado = capitalizeWords(data.firstName);
    const apellidoFormateado = capitalizeWords(data.lastName);
    const emailFormateado = data.email.trim().toLowerCase();

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;

    if (!passwordRegex.test(data.password)) {
      return dispatch(
        showAlert({
          message:
            "⚠️ La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.",
          alertType: 1,
        })
      );
    }

    if (data.password !== data.confirmPassword) {
      return dispatch(
        showAlert({
          message: "⚠️ Las contraseñas no coinciden.",
          alertType: 1,
        })
      );
    }

    const body = {
      ...data,
      email: emailFormateado,
      firstName: nombreFormateado,
      lastName: apellidoFormateado,
      frontBaseUrl,
      dateBirth: null,
    };

    registerUser(body);
    reset({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div>
      {isLoading && <IsLoading />}
      <div className="contenedor_register">
        <form className="form__register" onSubmit={handleSubmit(submit)}>
          <h2 className="register__title">REGISTRATE</h2>
          <label className="label__form__register">
            <span className="span__form__register">Nombres: </span>
            <input
              required
              {...register("firstName")}
              className="input__form__register"
              type="text"
            />
          </label>
          <label className="label__form__register">
            <span className="span__form__register">Apellidos: </span>
            <input
              required
              {...register("lastName")}
              className="input__form__register"
              type="text"
            />
          </label>
          <label className="label__form__register">
            <span className="span__form__register">Email: </span>
            <input
              required
              {...register("email")}
              className="input__form__register"
              type="text"
            />
          </label>

          <label className="label__form__register">
            <span className="span__form__register">Contraseña: </span>
            <div className="input__form__register">
              <input
                className="input__password"
                required
                {...register("password")}
                type={hidePassword ? "password" : "text"}
              />{" "}
              <img
                className="img__show"
                onClick={() => setHidePassword(!hidePassword)}
                src={`../../../${hidePassword ? "show" : "hide"}.png`}
                alt=""
              />
            </div>
          </label>

          <label className="label__form__register">
            <span className="span__form__register">
              {" "}
              Verifica tu Contraseña:{" "}
            </span>
            <div className="input__form__register">
              <input
                className="input__password"
                required
                {...register("confirmPassword")}
                type={hidePasswordVerify ? "password" : "text"}
              />{" "}
              <img
                className="img__show"
                onClick={() => setHidePasswordVerify(!hidePasswordVerify)}
                src={`../../../${hidePasswordVerify ? "show" : "hide"}.png`}
                alt=""
              />
            </div>
          </label>

          <button className="btn__form__register">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
