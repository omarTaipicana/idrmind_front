import React, { useState, useRef, useEffect } from "react";
import "./styles/LandingPage.css";
import { Link, useNavigate } from "react-router-dom";

import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
  FaBars,
  FaTimes,
  FaTiktok,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import useCrud from "../hooks/useCrud";
import IsLoading from "../components/shared/isLoading";
import { useDispatch } from "react-redux";
import { showAlert } from "../store/states/alert.slice";
import useAuth from "../hooks/useAuth";

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");

  const PATH_CONTACTANOS = "/contactanos";
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;

      const success = await loggedUser();

      if (!success) {
        console.log("❌ Token inválido, removido");
        localStorage.removeItem("token");
        setUserLogged(null);
      }
    };
    checkToken();
  }, [token]);

  const [
    response,
    getApi,
    postApi,
    deleteApi,
    updateApi,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
  ] = useCrud();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const submit = (data) => {
    postApi(PATH_CONTACTANOS, data);
    reset();
  };

  useEffect(() => {
    if (newReg) {
      dispatch(
        showAlert({
          message: `⚠️ Estimad@ ${newReg?.nombres}, recibimos tu mensaje exitosamente`,
          alertType: 2,
        })
      );
    }
  }, [newReg]);

  const [menuOpen, setMenuOpen] = useState(false);

  const inicioRef = useRef(null);
  const cursosRef = useRef(null);
  const nosotrosRef = useRef(null);
  const contactoRef = useRef(null);

  const handleRegisterClick = () => {
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  return (
    <div className="app">
      {isLoading && <IsLoading />}

      <nav className="navbar">
        <img
          src="/images/idrmind_sf.png"
          alt="Logo iDr.Mind."
          className="logo_navbar"
        />
        <div className="menu_icon" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`navbar_links ${menuOpen ? "open" : ""}`}>
          <button onClick={() => scrollToSection(inicioRef)}>Inicio</button>
          <button onClick={() => scrollToSection(cursosRef)}>Cursos</button>
          <button onClick={() => scrollToSection(nosotrosRef)}>Nosotros</button>
          <button onClick={() => scrollToSection(contactoRef)}>Contacto</button>
          {!token ? (
            <button onClick={handleRegisterClick}>Login</button>
          ) : (
            <img
              className="user__icon"
              src="../../../user.png"
              alt="User Icon"
              onClick={handleRegisterClick}
            />
          )}
        </div>
      </nav>

      <header className="header" ref={inicioRef}>
        <motion.img
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src="/images/eduka_sf.png"
          alt="Logo Eduka"
          className="logo"
        />
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Tu camino al conocimiento empieza aquí
        </motion.h1>
        <p>Aprende, crece, y mejora con nuestros cursos.</p>
        <a onClick={() => scrollToSection(contactoRef)} className="cta_button">
          Contáctanos
        </a>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cursos"
        ref={cursosRef}
      >
        <h2>Nuestros Cursos</h2>
        <div className="curso_lista">
          <Link to="/giscopensc">
            <div className="curso_card giscopnsc">
              <div className="curso_card_overlay">
                <h3 className="curso_title">
                  Gestión Integral de la Seguridad Ciudadana y el Orden Público
                  con enfoque en Negociación en Situación de Crisis
                </h3>
                <p className="curso_description">
                  Capacitar a los servidores policiales en la gestión integral
                  de la seguridad ciudadana y el orden público, dotándolos de
                  conocimientos teóricos, herramientas técnicas y habilidades
                  prácticas para diseñar, implementar y evaluar políticas y
                  estrategias efectivas que contribuyan a la prevención,
                  investigación del delito, la reducción de la violencia y la
                  construcción de entornos seguros y pacíficos para la
                  ciudadanía.
                </p>
                <button className="curso_btn">Ver mas</button>
              </div>
            </div>
          </Link>
          <Link to="/accv">
            <div className="curso_card accv">
              <div className="curso_card_overlay">
                <h3 className="curso_title">
                  ANALISIS EN CONDUCTA CRIMINAL Y VICTIMOLOGÍA
                </h3>
                <p className="curso_description">
                  Brindar a los funcionarios de las fuerzas del orden y
                  seguridad una formación integral en victimología y
                  criminología mediante el análisis e intervención profesional a
                  los fenómenos delictivos, sus causas, consecuencias y las
                  dinámicas de victimización, promoviendo una atención ética,
                  interdisciplinaria y centrada en los derechos de las víctimas.
                </p>
                <button className="curso_btn">Ver mas</button>
              </div>
            </div>
          </Link>
        </div>
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="nosotros"
        ref={nosotrosRef}
      >
        <h2>Nosotros</h2>
        <p>
          <strong>Eduka</strong> es una plataforma de formación en línea
          comprometida con el fortalecimiento de las capacidades profesionales
          de los servidores policiales del Ecuador. Nuestra misión es
          proporcionar programas educativos actualizados y de alta calidad que
          respondan a los desafíos actuales en materia de seguridad ciudadana,
          derechos humanos, y gestión del orden público.
        </p>
        <p>
          Contamos con la colaboración de un equipo docente internacional
          conformado por expertos y académicos de reconocidas instituciones en
          América Latina y Europa. Esta cooperación multinacional nos permite
          ofrecer una perspectiva comparada, moderna y práctica, adaptada a la
          realidad operativa de la Policía Nacional del Ecuador.
        </p>
        <p>
          A través de nuestras aulas virtuales, los participantes acceden a
          contenidos interactivos, estudios de caso, simulaciones y recursos
          actualizados, diseñados para fortalecer sus conocimientos en áreas
          estratégicas como inteligencia policial, liderazgo operativo,
          mediación de conflictos, uso progresivo de la fuerza, ciberseguridad y
          gestión de crisis.
        </p>
        <p>
          En <strong>Eduka</strong>, creemos firmemente que una policía mejor
          preparada es clave para construir comunidades más seguras, justas y
          resilientes. Por ello, seguimos innovando en nuestras metodologías y
          expandiendo alianzas académicas con el fin de contribuir de forma
          sostenible al desarrollo profesional de quienes protegen y sirven a
          nuestra sociedad.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="contacto"
        ref={contactoRef}
      >
        <form onSubmit={handleSubmit(submit)} className="formulario_landing">
          <h2 className="formulario_titulo">Contáctanos</h2>
          <input
            type="text"
            placeholder="Nombre completo"
            required
            {...register("nombres")}
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            required
            {...register("email")}
          />
          <textarea
            rows="4"
            placeholder="¿Cómo podemos ayudarte?"
            required
            {...register("mensaje")}
          ></textarea>
          <button type="submit">📩 Enviar mensaje</button>
        </form>
      </motion.section>

      <footer className="footer">
        <p>Síguenos en redes sociales</p>
        <div className="redes_sociales">
          <a
            href="https://www.facebook.com/share/19srLS1HBi/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.tiktok.com/@eduka397?_t=ZM-8xGVPfqbdOK&_r=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTiktok />
          </a>
          <a
            href="https://www.instagram.com/eduka_ce?igsh=cDR2dnM5ejZnZnc4"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>
        <div className="btn_acceso">
          <a
            className="whatsapp_button"
            href="https://wa.me/593980773229"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contáctanos por WhatsApp
          </a>

          <a
            className="plataforma_button"
            href="https://acadexeduc.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Accede a nuestra Plataforma Educativa MOODLE ACADEX
          </a>
        </div>

        <p>&copy; 2025 Eduka. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
