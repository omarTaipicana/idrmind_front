import React, { useEffect, useState } from "react";
import "./styles/ChangePassword.css";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import useAuth from "../../hooks/useAuth";
import IsLoading from "../../components/shared/isLoading";

const ChangePassword = () => {
  const { code: code } = useParams();
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();
  const [hidePassword_1, setHidePassword_1] = useState(true);
  const [hidePassword_2, setHidePassword_2] = useState(true);
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
  ] = useAuth();
  useEffect(() => {
    localStorage.removeItem("token");
  }, [code]);

  const submit = (data) => {
    if (data.password === data.confirmPassword) {
      const body = {
        password: data.password,
      };
      changePassword(body, code);
      dispatch(
        showAlert({
          message: "⚠️ Su Contraseña se cambio Correctamente",
          alertType: 2,
        })
      );
    } else {
      dispatch(
        showAlert({
          message: "⚠️ Sus contraseñas no Coinciden",
          alertType: 1,
        })
      );
    }
    reset({
      password: "",
      confirmPassword: "",
    });
  };

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

  return (
    <div>
      {isLoading && <IsLoading />}
      <div className="contenedor">
        <section className="reset_password_form__content">
          <h2 className="title__user__change__password">
            Cambie su Contraseña
          </h2>
          <form className="form__login" onSubmit={handleSubmit(submit)}>
            <label className="label__form__login">
              <span className="span__form__change__password">
                Escriba su nueva Contraseña
              </span>

              <div className="input__form__login__password">
                <input
                  className="input__form__reset__password"
                  type={hidePassword_1 ? "password" : "text"}
                  required
                  {...register("password")}
                />
                <div>
                  <img
                    className="img__show"
                    onClick={() => setHidePassword_1(!hidePassword_1)}
                    src={`../../../${
                      hidePassword_1 ? "show" : "hide"
                    }.png`}
                    alt=""
                  />
                </div>
              </div>
            </label>

            <label className="label__form__login">
              <span className="span__form__change__password">
                Valide su Contraseña
              </span>

              <div className="input__form__login__password">
                <input
                  className="input__form__reset__password"
                  type={hidePassword_2 ? "password" : "text"}
                  required
                  {...register("confirmPassword")}
                />
                <div>
                  <img
                    className="img__show"
                    onClick={() => setHidePassword_2(!hidePassword_2)}
                    src={`../../../${
                      hidePassword_2 ? "show" : "hide"
                    }.png`}
                    alt=""
                  />
                </div>
              </div>
            </label>

            <button className="btn__form__login">Enviar</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ChangePassword;
