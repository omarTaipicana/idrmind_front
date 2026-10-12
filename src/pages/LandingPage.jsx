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

const ALIANZAS_LOGOS = {
  aliados: [
    {
      src: "/alianzas/aliados/geb seguridad.png",
      name: "Geb Seguridad",
    },
    {
      src: "/alianzas/aliados/idr crop.png",
      name: "Idr Crop",
    },
    {
      src: "/alianzas/aliados/invok.me.png",
      name: "Invok.Me",
    },
    {
      src: "/alianzas/aliados/joint.jpg",
      name: "Joint",
    },
    {
      src: "/alianzas/aliados/karbon verde.jpg",
      name: "Karbon Verde",
    },
    {
      src: "/alianzas/aliados/nask.jpg",
      name: "Nask",
    },
    {
      src: "/alianzas/aliados/neuro academy.jpeg",
      name: "Neuro Academy",
    },
    {
      src: "/alianzas/aliados/papel cero.jpeg",
      name: "Papel Cero",
    },
  ],
  trayectoria: [
    {
      src: "/alianzas/trayectoria/abkrea.jfif",
      name: "Abkrea",
    },
    {
      src: "/alianzas/trayectoria/agros.png",
      name: "Agros",
    },
    {
      src: "/alianzas/trayectoria/agrtic.jfif",
      name: "Agrtic",
    },
    {
      src: "/alianzas/trayectoria/arista.jfif",
      name: "Arista",
    },
    {
      src: "/alianzas/trayectoria/bqc.png",
      name: "Bqc",
    },
    {
      src: "/alianzas/trayectoria/cam machachi.jpeg",
      name: "Cam Machachi",
    },
    {
      src: "/alianzas/trayectoria/ccpe.png",
      name: "Ccpe",
    },
    {
      src: "/alianzas/trayectoria/coored.jfif",
      name: "Coored",
    },
    {
      src: "/alianzas/trayectoria/criadero el carmen.jpeg",
      name: "Criadero El Carmen",
    },
    {
      src: "/alianzas/trayectoria/espoch.jfif",
      name: "Espoch",
    },
    {
      src: "/alianzas/trayectoria/iecap.jfif",
      name: "Iecap",
    },
    {
      src: "/alianzas/trayectoria/ingecap2.jfif",
      name: "Ingecap2",
    },
    {
      src: "/alianzas/trayectoria/inplass.png",
      name: "Inplass",
    },
    {
      src: "/alianzas/trayectoria/la Meca.jfif",
      name: "La Meca",
    },
    {
      src: "/alianzas/trayectoria/la concepcion.jpeg",
      name: "La Concepcions",
    },
    {
      src: "/alianzas/trayectoria/la francey.jfif",
      name: "La Francey",
    },
    {
      src: "/alianzas/trayectoria/las acacias.jpeg",
      name: "Las Acacias",
    },
    {
      src: "/alianzas/trayectoria/logo la rioja.jpg.jpeg",
      name: "Logo La Rioja.Jpg",
    },
    {
      src: "/alianzas/trayectoria/maquisemillas.webp",
      name: "Maquisemillas",
    },
    {
      src: "/alianzas/trayectoria/plastiseed.png",
      name: "Plastiseed",
    },
    {
      src: "/alianzas/trayectoria/policia nacional.jfif",
      name: "Policia Nacional",
    },
    {
      src: "/alianzas/trayectoria/provida.png",
      name: "Provida",
    },
    {
      src: "/alianzas/trayectoria/san esteban.jpeg",
      name: "San Esteban",
    },
    {
      src: "/alianzas/trayectoria/santel.jfif",
      name: "Santel",
    },
    {
      src: "/alianzas/trayectoria/sri.jfif",
      name: "Sri",
    },
    {
      src: "/alianzas/trayectoria/terrasemilla.jfif",
      name: "Terrasemilla",
    },
    {
      src: "/alianzas/trayectoria/utc.png",
      name: "Utc",
    },
    {
      src: "/alianzas/trayectoria/vitahora.jpeg",
      name: "Vitahora",
    },
  ],
};

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
  const pensarRef = useRef(null);
  const aliadosRef = useRef(null);
  const trayectoriaRef = useRef(null);
  const avalRef = useRef(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [collab, setCollab] = useState({
    nombres: "",
    email: "",
    organizacion: "",
    telefono: "",
    tipo: "",
    mensaje: "",
    website: "",
  });
  const [collabState, setCollabState] = useState({
    loading: false,
    message: "",
    error: false,
  });
  const nosotrosRef = useRef(null);
  const contactoRef = useRef(null);
  const serviciosRef = useRef(null);

  // Prepara las imágenes de Alianzas y Trayectoria desde que abre la portada.
  // La decodificación gradual evita concentrar el trabajo durante el scroll.
  useEffect(() => {
    let cancelled = false;
    let idleId = null;
    let timeoutId = null;
    const images = [];
    const sources = [
      ...ALIANZAS_LOGOS.aliados,
      ...ALIANZAS_LOGOS.trayectoria,
    ].map((logo) => encodeURI(logo.src));
    let nextIndex = 0;

    const prepareNext = async () => {
      while (!cancelled && nextIndex < sources.length) {
        const src = sources[nextIndex++];
        const image = new Image();
        images.push(image);
        image.decoding = "async";
        image.src = src;

        try {
          if (typeof image.decode === "function") {
            await image.decode();
          } else if (!image.complete) {
            await new Promise((resolve) => {
              image.onload = resolve;
              image.onerror = resolve;
            });
          }
        } catch {
          // Una imagen fallida no impide preparar las demás.
        }
      }
    };

    const start = () => {
      if (cancelled) return;
      // Dos procesos en paralelo: precarga sin saturar el hilo principal.
      void prepareNext();
      void prepareNext();
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(start, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(start, 200);
    }

    return () => {
      cancelled = true;
      if (idleId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, []);

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
        }),
      );
    }
  }, [newReg, dispatch]);

  const submitCollaboration = async (event) => {
    event.preventDefault();
    if (collabState.loading) return;
    setCollabState({ loading: true, message: "", error: false });
    try {
      const api = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
      const response = await fetch(`${api}/alianzas/trabaja-con-nosotros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collab),
      });
      if (!response.ok)
        throw new Error(
          "No se pudo enviar la solicitud. Inténtalo nuevamente.",
        );
      setCollab({
        nombres: "",
        email: "",
        organizacion: "",
        telefono: "",
        tipo: "",
        mensaje: "",
        website: "",
      });
      setCollabState({
        loading: false,
        message: "Recibimos tu propuesta. Nos pondremos en contacto contigo.",
        error: false,
      });
    } catch (error) {
      setCollabState({
        loading: false,
        message: error.message || "Error de conexión",
        error: true,
      });
    }
  };

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

    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    setMenuOpen(false);
    setServicesOpen(false);
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

        <div className="navbar_links_lp">
          <button type="button" onClick={() => scrollToSection(inicioRef)}>
            Inicio
          </button>
          <div className="lp-nav-dropdown">
            <button
              type="button"
              className="lp-nav-dropdown__toggle"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((v) => !v)}
            >
              Servicios <span aria-hidden="true">▾</span>
            </button>
            {servicesOpen && (
              <div className="lp-nav-dropdown__menu">
                <button onClick={() => scrollToSection(pensarRef)}>
                  Proyecto Pensar
                </button>
                <button onClick={() => scrollToSection(cursosRef)}>
                  Cursos
                </button>
                <button onClick={() => scrollToSection(avalRef)}>
                  Aval Ministerial
                </button>
                <button onClick={() => scrollToSection(serviciosRef)}>
                  Servicios
                </button>
                <button
                  onClick={() => {
                    setServicesOpen(false);
                    window.open(
                      "https://www.invok.me/",
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  Empleos
                </button>
              </div>
            )}
          </div>
          <button type="button" onClick={() => scrollToSection(nosotrosRef)}>
            Nosotros
          </button>
          <button type="button" onClick={() => scrollToSection(aliadosRef)}>
            Alianzas
          </button>
          <button type="button" onClick={() => scrollToSection(trayectoriaRef)}>
            Trayectoria
          </button>
          <button type="button" onClick={() => scrollToSection(contactoRef)}>
            Contáctanos
          </button>
        </div>

        <div className="topbar-right">
          {!token ? (
            <>
              <button
                type="button"
                className="topbar-link"
                onClick={handleRegisterClick}
              >
                <img
                  className="user_icon"
                  src="../../../user.png"
                  alt="User Icon"
                  onClick={handleRegisterClick}
                />
                Registrarse
              </button>

              <span className="topbar-separator">|</span>

              <button
                type="button"
                className="topbar-link"
                onClick={handleLoginClick}
              >
                Ingresar
              </button>
            </>
          ) : (
            <button
              type="button"
              className="topbar-link"
              onClick={handleRegisterClick}
            >
              Mi cuenta
            </button>
          )}
        </div>
      </nav>

      <div
        className={`navbar_mobile_menu ${menuOpen ? "navbar_mobile_menu--open" : ""}`}
      >
        <button onClick={() => scrollToSection(inicioRef)}>Inicio</button>
        <button
          onClick={() => setServicesOpen((v) => !v)}
          aria-expanded={servicesOpen}
        >
          Servicios ▾
        </button>
        {servicesOpen && (
          <div className="lp-mobile-submenu">
            <button onClick={() => scrollToSection(pensarRef)}>
              Proyecto Pensar
            </button>
            <button onClick={() => scrollToSection(cursosRef)}>Cursos</button>
            <button onClick={() => scrollToSection(avalRef)}>
              Aval Ministerial
            </button>
            <button onClick={() => scrollToSection(serviciosRef)}>
              Servicios
            </button>
            <button
              onClick={() => {
                closeMenu();
                window.open(
                  "https://www.invok.me/",
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              Empleos
            </button>
          </div>
        )}
        <button onClick={() => scrollToSection(nosotrosRef)}>Nosotros</button>
        <button onClick={() => scrollToSection(aliadosRef)}>Alianzas</button>
        <button onClick={() => scrollToSection(trayectoriaRef)}>
          Trayectoria y confianza
        </button>
        <button onClick={() => scrollToSection(contactoRef)}>
          Contáctanos
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
              <button
                className="buttonMiCuenta"
                type="button"
                onClick={handleRegisterClick}
              >
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
            A través de <strong>Proyecto Pensar</strong>, ofrecemos evaluaciones
            psicotécnicas integrales que permiten identificar habilidades,
            competencias, estilos de comportamiento y oportunidades de mejora
            del talento humano. Transformamos los resultados en información
            estratégica para que las empresas puedan{" "}
            <strong>
              tomar decisiones fundamentadas, fortalecer sus equipos, optimizar
              el desempeño y mejorar la productividad organizacional
            </strong>
            , impulsando el crecimiento personal y empresarial.
          </p>

          <a
            onClick={() => scrollToSection(contactoRef)}
            className="cta_button"
          >
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

      <section className="pensar-section" ref={pensarRef} id="proyecto-pensar">
        <div className="pensar-section__heading">
          <span>Evaluación psicotécnica</span>
          <h2>Proyecto Pensar</h2>
          <p>
            Conoce tus habilidades, fortalezas y oportunidades de desarrollo.
          </p>
        </div>
        <div className="proyecto-pensar">
          <div className="proyecto-pensar__glow proyecto-pensar__glow--one" />
          <div className="proyecto-pensar__glow proyecto-pensar__glow--two" />

          <div className="proyecto-pensar__content">
            <motion.div
              className="proyecto-pensar__logo-container"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.85, 1, 0.95],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="proyecto-pensar__logo-ring" />

              <img
                src="/images/test_logo.png"
                alt="Proyecto Pensar"
                className="proyecto-pensar__logo"
              />
            </motion.div>

            <div className="proyecto-pensar__information">
              <span className="proyecto-pensar__badge">
                Evaluación de Habilidades Blandas
              </span>

              <h3 className="proyecto-pensar__title">
                Descubre cómo piensas,
                <span> aprendes y trabajas</span>
              </h3>

              <p className="proyecto-pensar__description">
                Realiza nuestro test de habilidades blandas y obtén una visión
                más clara de tus fortalezas, tu estilo de comunicación y tu
                forma de relacionarte con los demás.
              </p>

              <div className="proyecto-pensar__skills">
                <span>🎯 Persistencia</span>
                <span>💬 Comunicación</span>
                <span>🧠 Tipo de cerebro</span>
                <span>📚 Forma de aprendizaje</span>
                <span>🤝 Negociación</span>
                <span>👥 Trabajo en equipo</span>
                <span>📈 Índice de productividad</span>
              </div>

              <button
                type="button"
                className="proyecto-pensar__button"
                onClick={() => navigate("/proyectopensar")}
              >
                <span>Realizar test ahora</span>
                <strong>→</strong>
              </button>

              <p className="proyecto-pensar__notice">
                Una evaluación diseñada para conocerte mejor y potenciar tu
                desarrollo personal y profesional.
              </p>
            </div>
          </div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="cursos"
        ref={cursosRef}
      >
        <h2 className="nosotros-title">Nuestros Cursos</h2>

        <div className="curso_lista">
          {(courses || [])
            .filter((c) => c.vigente === true && c.tipo === "curso")
            .map((c, index) => (
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
              Somos especialistas en ofrecer capacitaciones integrales avaladas
              por el Ministerio de Trabajo, que impulsan el desarrollo de
              Habilidades Blandas, Técnicas y Emocionales. Nuestro método diseña
              soluciones a la medida para maximizar la productividad y fomentar
              la mejora continua con nuestras modalidades presencial,
              semipresencial y virtual. Somos reconocidos por nuestro compromiso
              con la excelencia, ayudamos a transformar el talento humano en el
              motor clave para el éxito empresarial. ¡Pensamos positivo y
              actuamos para avanzar juntos!
            </p>
            <br />
            <div ref={avalRef} className="lp-aval" id="aval-ministerial">
              <h3>Aval Ministerial</h3>
              <p>
                Conoce nuestro enfoque de formación y capacitaciones avaladas
                por el Ministerio del Trabajo.
              </p>
              <img
                className="img_mdt"
                src="/images/mdt.jpeg"
                alt="Aval del Ministerio del Trabajo"
              />
            </div>
          </div>
        </div>

        <div className="mvv-section">
          <div className="mvv-card">
            <h3 className="mvv-title">¡Empieza Tu Formación Hoy Mismo!</h3>
            <p className="mvv-text">
              No te pierdas la oportunidad de mejorar tus Habilidades Blandas y
              avanzar con nuestros cursos especializados. Regístrate ahora y
              accede a una formación de calidad que te ayudará a sobresalir en
              tu campo.
            </p>
          </div>
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
            Soluciones diseñadas para acompañar el crecimiento personal,
            empresarial y académico.
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
              Somos especialistas en detectar pérdidas invisibles de
              productividad relacionadas con el comportamiento personal que
              afecta la rentabilidad empresarial.
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
              Evalúa hábitos, conducta e inteligencia emocional para detectar
              fortalezas y oportunidades de mejora que impulsen la productividad
              y el desempeño personal.{" "}
            </p>
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
              Capacitaciones empresariales enfocadas en productividad,
              liderazgo, habilidades blandas e inteligencia emocional para
              fortalecer equipos y mejorar resultados.
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
              Descubre tus habilidades blandas, fortalezas y áreas de mejora
              mediante una evaluación estratégica diseñada para impulsar tu
              crecimiento personal y profesional.{" "}
            </p>
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
              Convierte tus contactos y conexiones estratégicas en nuevas
              oportunidades de crecimiento e ingresos, promoviendo soluciones
              empresariales de alto valor.
            </p>
            <span className="servicio_link">Ver más →</span>
          </div>

          <div
            onClick={() => navigate("/servicios/franquicias")}
            className="servicio_card"
            style={{ animationDelay: `${2 * 0.15}s` }}
          >
            <div className="servicio_logo">
              <img
                src={`/images/franquicias.jpeg`}
                alt={`Servicio MENTORIAS`}
              />
            </div>
            <h3>FRANQUICIAS </h3>
            <p>
              Representa la metodología de iDr. Mind. en tu país y lidera una
              nueva generación de soluciones enfocadas en productividad,
              análisis humano y transformación empresarial.
            </p>
            <span className="servicio_link">Ver más →</span>
          </div>
        </div>
      </motion.section>

      <section className="lp-logos-section" ref={aliadosRef} id="alianzas">
        <div className="lp-section-intro">
          <span>Construimos oportunidades juntos</span>
          <h2>Alianzas estratégicas</h2>
          <p>
            Organizaciones con las que construimos conexiones y oportunidades de
            colaboración.
          </p>
        </div>
        <div className="lp-logo-grid">
          {ALIANZAS_LOGOS.aliados.map((logo) => (
            <div className="lp-logo-card" key={logo.src}>
              <img src={encodeURI(logo.src)} alt={logo.name} loading="eager" decoding="async" />
            </div>
          ))}
        </div>
        <div className="lp-collaboration">
          <div className="lp-collaboration__intro">
            <span>Conectemos capacidades</span>
            <h3>Trabaja con nosotros</h3>
            <p>
              ¿Representas una empresa, institución o proyecto? Cuéntanos cómo
              podemos colaborar.
            </p>
          </div>
          <form
            className="lp-collaboration__form"
            onSubmit={submitCollaboration}
          >
            <div className="lp-form-pair">
              <label>
                Nombre completo *
                <input
                  required
                  maxLength={120}
                  value={collab.nombres}
                  onChange={(e) =>
                    setCollab({ ...collab, nombres: e.target.value })
                  }
                />
              </label>
              <label>
                Correo electrónico *
                <input
                  required
                  type="email"
                  maxLength={180}
                  value={collab.email}
                  onChange={(e) =>
                    setCollab({ ...collab, email: e.target.value })
                  }
                />
              </label>
            </div>
            <div className="lp-form-pair">
              <label>
                Empresa o institución *
                <input
                  required
                  maxLength={160}
                  value={collab.organizacion}
                  onChange={(e) =>
                    setCollab({ ...collab, organizacion: e.target.value })
                  }
                />
              </label>
              <label>
                Teléfono{" "}
                <input
                  type="tel"
                  maxLength={35}
                  value={collab.telefono}
                  onChange={(e) =>
                    setCollab({ ...collab, telefono: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Tipo de colaboración *
              <select
                required
                value={collab.tipo}
                onChange={(e) => setCollab({ ...collab, tipo: e.target.value })}
              >
                <option value="">Selecciona una opción</option>
                <option>Alianza estratégica</option>
                <option>Capacitación</option>
                <option>Servicios empresariales</option>
                <option>Propuesta institucional</option>
                <option>Otra colaboración</option>
              </select>
            </label>
            <label>
              Cuéntanos tu propuesta *
              <textarea
                required
                rows={4}
                maxLength={4000}
                value={collab.mensaje}
                onChange={(e) =>
                  setCollab({ ...collab, mensaje: e.target.value })
                }
              />
            </label>
            <input
              className="lp-honeypot"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={collab.website}
              onChange={(e) =>
                setCollab({ ...collab, website: e.target.value })
              }
            />
            <button disabled={collabState.loading} type="submit">
              {collabState.loading ? "Enviando..." : "Enviar propuesta →"}
            </button>
            {collabState.message && (
              <p
                role="status"
                className={
                  collabState.error ? "lp-form-error" : "lp-form-success"
                }
              >
                {collabState.message}
              </p>
            )}
          </form>
        </div>
      </section>
      <section
        className="lp-logos-section lp-logos-section--trust"
        ref={trayectoriaRef}
        id="trayectoria"
      >
        <div className="lp-section-intro">
          <span>Experiencia que genera confianza</span>
          <h2>Trayectoria y confianza</h2>
          <p>
            Instituciones y organizaciones que forman parte de nuestra
            trayectoria.
          </p>
        </div>
        <div className="lp-logo-grid">
          {ALIANZAS_LOGOS.trayectoria.map((logo) => (
            <div className="lp-logo-card" key={logo.src}>
              <img src={encodeURI(logo.src)} alt={logo.name} loading="eager" decoding="async" />
            </div>
          ))}
        </div>
      </section>

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
            Si tienes alguna consulta o necesitas información adicional sobre
            nuestros cursos y servicios, no dudes en escribirnos o llamarnos.
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
                <a
                  href="https://api.whatsapp.com/send?phone=593962799793&text=Hola%20quiero%20más%20información"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link_footer"
                >
                  <img
                    className="img_contctanos"
                    src="../../../whatsapp2.png"
                    alt="WhatsApp"
                  />
                  <span className="span_contactanos">+593 - 962799793</span>
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
          />

          <button type="submit">📩 Enviar mensaje</button>
        </form>
      </motion.section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <h4 className="footer-section-title">Menú</h4>
            <nav className="footer-menu">
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(inicioRef)}
              >
                Inicio
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(nosotrosRef)}
              >
                Nosotros
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(cursosRef)}
              >
                Cursos
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(contactoRef)}
              >
                Contactos
              </button>
              <button
                type="button"
                className="footer-link"
                onClick={() => scrollToSection(serviciosRef)}
              >
                Servicios
              </button>
            </nav>
          </div>

          <div className="footer-middle">
            <h4 className="footer-section-title footer-social-title mobile_none">
              ¡Síguenos!
            </h4>
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

            <a
              href="https://api.whatsapp.com/send?phone=593962799793&text=Hola%20quiero%20más%20información"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile_none"
            >
              <span className="span_contactanos">+593 - 962799793</span>
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
