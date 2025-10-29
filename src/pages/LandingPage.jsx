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
  const [courses, getCourses] = useCrud();


  const PATH_CONTACTANOS = "/contactanos";
  const PATH_COURSES = "/courses";

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

  useEffect(() => {
    getCourses(PATH_COURSES)
  }, [])

  return (
    <div className="app">
      {isLoading && <IsLoading />}

      <nav className="navbar">
        <img
          src="/images/idrmind_logo_sf.png"
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

        <div className="header_text">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Transformamos el Talento en Productividad
          </motion.h1>
          <p>Cursos diseñados para reconocer y potenciar tus Habilidades Blandas y las competencias del talento humano, preparado para personas y empresas que buscan la excelencia y el crecimiento continuo en su productividad laboral.</p>
          <a onClick={() => scrollToSection(contactoRef)} className="cta_button">
            Contáctanos
          </a>

        </div>
        <motion.img
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src="/images/IMG-20240801-WA0001.jpg"
          alt="Logo iDr.Mind."
          className="header_img"
        />

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

          {courses.map((c, index) => (
            <Link key={c.sigla} to={`/curso/${c.sigla}`} className="curso_item" style={{ animationDelay: `${index * 0.15}s` }}>
              <div className="curso_card">
                <img
                  src={`/cursos/${c.sigla}.jpg`}
                  alt={c.nombre}
                  className="curso_img"
                />
                <div className="curso_card_overlay">
                  <button className="curso_btn">VER CURSO</button>
                </div>
              </div>
            </Link>
          ))}



        </div>
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="nosotros"
        ref={nosotrosRef}
      >
        <motion.img
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
          src="/images/idrmind_sf.png"
          alt="Logo iDr.Mind."
          className="logo"
        />
        <p >
          Somos especialistas en ofrecer capacitaciones integrales que impulsan el desarrollo de Habilidades Blandas, Técnicas y Emocionales.
          Nuestro enfoque está en diseñar soluciones a medida para maximizar la productividad y fomentar la mejora continua con nuestras modalidades presencial y en línea.
          Somos reconocidos por nuestro compromiso con la excelencia, ayudando a transformar el talento humano en un motor clave para el éxito empresarial.

          «¡Pensamos positivo y actuamos para avanzar juntos!»
        </p>

      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="contacto"
        ref={contactoRef}
      >

        <section className="contacto_text">
          <h3>Contáctanos</h3>
          <p>Si tienes alguna consulta o necesitas información adicional sobre nuestros cursos y servicios, no dudes en escribirnos o llamarnos. Responderemos a la brevedad para atender todas tus necesidades. ¡Contáctanos hoy mismo!</p>
          <article>
            <ul className="ul_contactanos">
              <span>Contáctenos a través de</span>

              <li className="li_footer">
                <a
                  href="https://maps.app.goo.gl/hG4735yfLTV5MdVD8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link_footer"
                >
                  <img
                    className="img_contctanos"
                    src="../../../location.png"
                    alt="Ubicación"
                  />
                  <span className="span_contactanos">
                    Mitad del Mundo - Quito, Ecuador
                  </span>
                </a>
              </li>
              <li> <a
                href="https://api.whatsapp.com/send?phone=593979002223&text=Hola%20quiero%20más%20información"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="img_contctanos"
                  src="../../../whatsapp2.png"
                  alt="WhatsApp"
                />
                <span className="span_contactanos">
                  +593979002223
                </span>
              </a></li>
              <li className="li_footer">
                <a
                  href="mailto:info@idrmind.com"
                  className="link_footer"
                >
                  <img
                    className="img_contctanos"
                    src="../../../mensaje.png"
                    alt="Correo"
                  />
                  <span className="span_contactanos">
                    info@idrmind.com
                  </span>
                </a>
              </li>
            </ul>
          </article>

        </section>


        <form onSubmit={handleSubmit(submit)} className="formulario_landing">
          <h2 className="formulario_titulo">¡ Déjanos tu comentario !
          </h2>
          <input
            type="text"
            placeholder="Nombres"
            required
            {...register("nombres")}
          />
          <input
            type="email"
            placeholder="Email"
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
        <a
          className="plataforma_button"
          href="https://moodle.idrmind.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Accede a nuestra Plataforma Educativa MOODLE
        </a>
        <div className="btn_acceso">
          <a
            className="whatsapp_button"
            href="https://wa.me/593979002223"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contáctanos por WhatsApp
          </a>


        </div>
        <div className="redes_sociales">

          <a
            href="https://www.facebook.com/profile.php?id=100054880556231&mibextid=ZbWKwL"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://www.tiktok.com/@idr.mind?_t=8rXF11o0DPs&_r=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTiktok />
          </a>
          <a
            href="https://www.instagram.com/idr.mind/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>


        <p>&copy; 2024. iDr. Mind. by NASK-Corp. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
