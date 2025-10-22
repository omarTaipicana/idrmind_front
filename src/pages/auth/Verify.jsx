import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showAlert } from "../../store/states/alert.slice";
import "./styles/Verify.css";

const Verify = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { code: code } = useParams();
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
  ] = useAuth();

  useEffect(() => {
    verifyUser(code);
  }, [code]);

  useEffect(() => {
    localStorage.removeItem("token");
    // localStorage.removeItem("user");
  }, [code]);

  useEffect(() => {
    if (verified) {
      dispatch(
        showAlert({
          message: `⚠️ ${verified?.message}` || "Verificado",
          alertType: 2,
        })
      );
    } else {
      dispatch(
        showAlert({
          message: `⚠️ ${error?.response?.data?.message}` || "Error inesperado",
          alertType: 1,
        })
      );
    }
  }, [error, verified]);

  const handleBtn = () => {
    navigate("/login");
  };

  return (
    <div className="contenedor">
      {!verified ? (
        <section className="verify_content">
          <img
            className="verify_false"
            src={`../../../no_verificado.png`}
            alt=""
          />
          <h3 className="h3_verify_false">Su Código de Verificación es Incorrecto</h3>
        </section>
      ) : (
        <section className="verify_content">
          <img
            className="verify_true"
            src={`../../../verificado.png`}
            alt=""
          />
          <h3 className="h3_verify_true">Usuario Verificado Correctamente</h3>
          <button className="btn__form__verify" onClick={handleBtn}>
            Iniciar Sesión
          </button>
        </section>
      )}
    </div>
  );
};

export default Verify;
