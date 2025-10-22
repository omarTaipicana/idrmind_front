import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import "./styles/ResetPasswordSendEmail.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import IsLoading from "../../components/shared/isLoading";

const ResetPasswordSendEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();
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
  ] = useAuth();

  const submit = (data) => {
    const frontBaseUrl = `${location.protocol}//${location.host}/#/reset_password`;
    const body = { ...data, frontBaseUrl };
    sendEmail(body);
    console.log(frontBaseUrl);
    reset({
      email: "",
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

  useEffect(() => {
    if (userResetPassword) {
      dispatch(
        showAlert({
          message: `⚠️ Estimado ${userResetPassword?.firstName} ${userResetPassword?.lastName}, revisa tu correo ${userResetPassword?.email} para reestablecer tu contraseña`,
          alertType: 2,
        })
      );
      navigate("/login");
    }
  }, [userResetPassword]);

  return (
    <div>
      {isLoading && <IsLoading />}
      <div className="contenedor">
        <section className="reset_password_form__content">
          <h2 className="reset__title">Resetea tu Contraseña</h2>
          <form className="form__login" onSubmit={handleSubmit(submit)}>
            <label className="label__form__reset">
              <span className="span__form__reset">Email</span>
              <input
                className="input__form__reset"
                {...register("email")}
                type="email"
              />
            </label>
            <button className="btn__form__login">Enviar</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ResetPasswordSendEmail;
