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
  FaMapMarkerAlt,
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
  const PATH_COURSES = "/courses";

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [courses, getCourses] = useCrud();
  const [, , postApi, , , , isLoading, newReg, , ,] = useCrud();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);


  const inicioRef = useRef(null);
  const cursosRef = useRef(null);
  const nosotrosRef = useRef(null);
  const contactoRef = useRef(null);
  const serviciosRef = useRef(null);

  // Cargar cursos
  useEffect(() => {
    getCourses(PATH_COURSES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validar token
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
  }, [newReg, dispatch]);

  // Cerrar menú si se agranda a desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  // Scroll con offset real (navbar fija)
  const scrollToSection = (ref) => {
    const element = ref.current;
    if (!element) return;

    const navbar = document.querySelector(".navbar");
    const navH = navbar ? navbar.offsetHeight : 0;
    const extra = 16; // separación visual
    const offset = navH + extra;

    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  const handleLoginClick = () => navigate("/login");
  const handleRegisterClick = () => navigate("/register");

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <div className="app">
      {isLoading && <IsLoading />}

      <nav className="navbar">
        <img
          src="/images/idrmind_logo_sf.png"
          alt="Logo iDr.Mind"
          className="logo_navbar"
          onClick={() => scrollToSection(inicioRef)}
        />

        <div className="menu_icon" onClick={toggleMenu} aria-label="Abrir menú">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className="navbar_links">
          <button type="button" onClick={() => scrollToSection(inicioRef)}>
            Inicio
          </button>
          <button type="button" onClick={() => scrollToSection(nosotrosRef)}>
            Nosotros
          </button>
          <button type="button" onClick={() => scrollToSection(cursosRef)}>
            Cursos
          </button>
          <button type="button" onClick={() => scrollToSection(contactoRef)}>
            Contactos
          </button>
          <button type="button" onClick={() => scrollToSection(serviciosRef)}>
            Servicios
          </button>
          <button
            type="button"
            onClick={() => window.open("https://www.invok.me/", "_blank")}
          >
            Empleos
          </button>
        </div>

        <div className="topbar-right">
          {!token ? (
            <>
              <button type="button" className="topbar-link" onClick={handleRegisterClick}>
                <img
                  className="user_icon"
                  src="../../../user.png"
                  alt="User Icon"
                  onClick={handleRegisterClick}
                />
                Registrarse
              </button>

              <span className="topbar-separator">|</span>

              <button type="button" className="topbar-link" onClick={handleLoginClick}>
                Ingresar
              </button>
            </>
          ) : (
            <button type="button" className="topbar-link" onClick={handleRegisterClick}>
              Mi cuenta
            </button>
          )}
        </div>
      </nav>

      <div className={`navbar_mobile_menu ${menuOpen ? "navbar_mobile_menu--open" : ""}`}>
        <button type="button" onClick={() => scrollToSection(inicioRef)}>
          Inicio
        </button>
        <button type="button" onClick={() => scrollToSection(nosotrosRef)}>
          Nosotros
        </button>
        <button type="button" onClick={() => scrollToSection(cursosRef)}>
          Cursos
        </button>
        <button type="button" onClick={() => scrollToSection(contactoRef)}>
          Contactos
        </button>
        <button type="button" onClick={() => scrollToSection(serviciosRef)}>
          Servicios
        </button>
        <button
          type="button"
          onClick={() => window.open("https://www.invok.me/", "_blank")}
        >
          Empleos
        </button>

        <div className="navbar_mobile_auth">
          {!token ? (
            <>
              <button type="button" onClick={handleRegisterClick}>
                Registrarse
              </button>
              <button type="button" onClick={handleLoginClick}>
                Ingresar
              </button>
            </>
          ) : (
            <>
              <button className="buttonMiCuenta" type="button" onClick={handleRegisterClick}>
                Mi cuenta
              </button>
              <button
                type="button"
                className="logout__button"
                onClick={() => {
                  closeMenu();
                }}
              >
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>

      <header className="header" ref={inicioRef}>
        <div className="header_text">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Transformamos el Talento en Productividad
          </motion.h1>

          <p>
            Cursos diseñados para identificar y fortalecer tus Habilidades Blandas, enfocándose en el desarrollo continuo
            del talento humano. Perfectos para individuos y empresas que aspiran la excelencia
            y un crecimiento continuo en la productividad laboral y personal.
          </p>

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
        <h2 className="nosotros-title">Nuestros Cursos</h2>

        <div className="curso_lista">
          {(courses || []).map((c, index) => (
            <Link
              key={c.sigla}
              to={`/curso/${c.sigla}`}
              className="curso_item"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="curso_card">
                <img
                  src={`/cursos/${c.sigla}.png`}
                  alt={c.nombre}
                  className="curso_img"
                />
                <div className="curso_card_overlay">
                  <button type="button" className="curso_btn">
                    VER CURSO
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>


      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="servicios"
        ref={serviciosRef}
      >
        <div className="servicios_header">
          <h2 className="servicios-title">Servicios iDr. Mind.</h2>
          <p>
            Soluciones diseñadas para acompañar

            crecimiento personal, empresarial y académico.
          </p>
        </div>
        <div className="servicios_lista">



          <div
            onClick={() => navigate("/servicios/ipel")}
            className="servicio_card"
            style={{ animationDelay: `${2 * 0.15}s` }}
          >
            <div className="servicio_logo">
              <img src={`/images/ipel.jpeg`} alt="Servicio IPEL" />
            </div>

            <h3>IPEL</h3>

            <p>
              Somos especialistas en detectar pérdidas invisibles de productividad
              relacionadas con el comportamiento personal que afecta la rentabilidad
              empresarial.
            </p>

            <span className="servicio_link">Ver más →</span>
          </div>



          <div
            onClick={() => navigate("/servicios/ipp")}
            className="servicio_card"
            style={{ animationDelay: `${2 * 0.15}s` }}
          >
            <div className="servicio_logo">
              <img src={`/images/ipp.jpeg`} alt={`Servicio IPP`} />
            </div>
            <h3>IPP </h3>
            <p>
              Evalúa hábitos, conducta e inteligencia emocional para detectar fortalezas y oportunidades de mejora que impulsen la productividad y el desempeño personal.   </p>
            <span className="servicio_link">Ver más →</span>
          </div>




          <div
            onClick={() => navigate("/servicios/capacitaciones")}
            className="servicio_card"
            style={{ animationDelay: `${2 * 0.15}s` }}
          >
            <div className="servicio_logo">
              <img src={`/images/cap.jpeg`} alt={`Servicio Capacitaciones`} />
            </div>
            <h3>CAPACITACIONES</h3>
            <p>
              Capacitaciones empresariales enfocadas en productividad, liderazgo, habilidades blandas e inteligencia emocional para fortalecer equipos y mejorar resultados.
            </p>
            <span className="servicio_link">Ver más →</span>
          </div>



          <div
            onClick={() => navigate("/servicios/sistema_evaluación")}
            className="servicio_card"
            style={{ animationDelay: `${2 * 0.15}s` }}
          >
            <div className="servicio_logo">
              <img src={`/images/sis_ev.jpeg`} alt={`sistema_evaluación`} />
            </div>
            <h3>SISTEMA DE EVALUACIÓN </h3>
            <p>
              Descubre tus habilidades blandas, fortalezas y áreas de mejora mediante una evaluación estratégica diseñada para impulsar tu crecimiento personal y profesional.            </p>
            <span className="servicio_link">Ver más →</span>
          </div>





          <div
            onClick={() => navigate("/servicios/membresias")}
            className="servicio_card"
            style={{ animationDelay: `${2 * 0.15}s` }}
          >
            <div className="servicio_logo">
              <img src={`/images/membr.jpeg`} alt={`Servicio Coach`} />
            </div>
            <h3>MEMBRESÍAS </h3>
            <p>
              Convierte tus contactos y conexiones estratégicas en nuevas oportunidades de crecimiento e ingresos, promoviendo soluciones empresariales de alto valor.
            </p>
            <span className="servicio_link">Ver más →</span>
          </div>


          <div
            onClick={() => navigate("/servicios/franquicias")}
            className="servicio_card"
            style={{ animationDelay: `${2 * 0.15}s` }}
          >
            <div className="servicio_logo">
              <img src={`/images/franquicias.jpeg`} alt={`Servicio MENTORIAS`} />
            </div>
            <h3>FRANQUICIAS </h3>
            <p>
              Representa la metodología de iDr. Mind. en tu país y lidera una nueva generación de soluciones enfocadas en productividad, análisis humano y transformación empresarial.
            </p>
            <span className="servicio_link">Ver más →</span>
          </div>

        </div>
      </motion.section>




      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8 }}
        className="nosotros"
        ref={nosotrosRef}
      >
        <div className="nosotros-inner">
          <div className="nosotros-header">
            <h2 className="nosotros-title">¿Por qué elegir a iDr. Mind.?</h2>
          </div>

          <div className="nosotros-content">
            <p>
              Somos especialistas en ofrecer capacitaciones
              integrales que impulsan el desarrollo de Habilidades Blandas, Técnicas y
              Emocionales. Nuestro método diseña soluciones a la medida para
              maximizar la productividad y fomentar la mejora continua con nuestras
              modalidades presencial on line. Somos reconocidos por nuestro
              compromiso con la excelencia, ayudamos a transformar el talento humano
              en el motor clave para el éxito empresarial. " ¡Pensamos positivo y
              actuamos para avanzar juntos! "
            </p>
          </div>
        </div>

        <div className="mvv-section">
          <div className="mvv-card">
            <h3 className="mvv-title">¡Empieza Tu Formación Hoy Mismo!</h3>
            <p className="mvv-text">
              No te pierdas la oportunidad de mejorar tus Habilidades Blandas y avanzar
              con nuestros cursos especializados.
              Regístrate ahora y accede a una formación de calidad que te ayudará a
              sobresalir en tu campo.
            </p>
          </div>
        </div>
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
          <p>
            Si tienes alguna consulta o necesitas información adicional sobre nuestros
            cursos y servicios, no dudes en escribirnos o llamarnos.
          </p>

          <article>
            <ul className="ul_contactanos">

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

              <li className="li_footer">
                <a
                  href="https://api.whatsapp.com/send?phone=593979002223&text=Hola%20quiero%20más%20información"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link_footer"

                >
                  <img
                    className="img_contctanos"
                    src="../../../whatsapp2.png"
                    alt="WhatsApp"
                  />
                  <span className="span_contactanos">+593 - 979002223</span>
                </a>
              </li>

              <li className="li_footer">
                <a href="mailto:info@idrmind.com" className="link_footer">
                  <img
                    className="img_contctanos"
                    src="../../../mensaje.png"
                    alt="Correo"
                  />
                  <span className="span_contactanos">info@idrmind.com</span>
                </a>
              </li>
            </ul>
          </article>
        </section>

        <form onSubmit={handleSubmit(submit)} className="formulario_landing">
          <h2 className="formulario_titulo">¡ Déjanos tu comentario !</h2>

          <input type="text" placeholder="Nombres" required {...register("nombres")} />

          <input type="email" placeholder="Email" required {...register("email")} />

          <textarea
            rows="4"
            placeholder="¿Cómo podemos ayudarte?"
            required
            {...register("mensaje")}
          />

          <button type="submit">📩 Enviar mensaje</button>
        </form>
      </motion.section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <h4 className="footer-section-title">Menú</h4>
            <nav className="footer-menu">
              <button type="button" className="footer-link" onClick={() => scrollToSection(inicioRef)}>
                Inicio
              </button>
              <button type="button" className="footer-link" onClick={() => scrollToSection(nosotrosRef)}>
                Nosotros
              </button>
              <button type="button" className="footer-link" onClick={() => scrollToSection(cursosRef)}>
                Cursos
              </button>
              <button type="button" className="footer-link" onClick={() => scrollToSection(contactoRef)}>
                Contactos
              </button>
              <button type="button" className="footer-link" onClick={() => scrollToSection(serviciosRef)}>
                Servicios
              </button>
            </nav>
          </div>

          <div className="footer-middle">
            <h4 className="footer-section-title footer-social-title mobile_none">¡Síguenos!</h4>
            <div className="footer-social mobile_none">
              <a
                href="https://www.facebook.com/profile.php?id=100054880556231&mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.instagram.com/idr.mind/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://www.tiktok.com/@idr.mind?_t=8rXF11o0DPs&_r=1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok />
              </a>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-block mobile_none">
              <h4 className="footer-section-title">¡Escríbenos!</h4>
            </div>

            <a
              href="https://api.whatsapp.com/send?phone=593979002223&text=Hola%20quiero%20más%20información"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile_none"
            >

              <span className="span_contactanos">+593 - 979002223</span>
            </a>
            <div className="footer-block">
              <h4 className="footer-section-title">Plataforma educativa</h4>
              <a
                href="https://aulavirtual.idrmind.com/my/courses.php"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-text-link"
              >
                Accede a nuestra plataforma educativa
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom mobile_none">
          <p>2020. iDr.Mind. by NASK-Corp. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
