import React, { useEffect, useState, useRef } from "react";
import "./styles/Home.css";
import useAuth from "../hooks/useAuth";
import IsLoading from "../components/shared/isLoading";

const Home = () => {
  const token = localStorage.getItem("token");
  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();

  const [activeSection, setActiveSection] = useState("datos-personales");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cursoAbiertoIndex, setCursoAbiertoIndex] = useState(null);
  const menuRef = useRef();
  const hamburgerRef = useRef();

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

  // Cerrar menú si clic fuera de menú y fuera del botón hamburguesa
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleSelect = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      const ultimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      dias += ultimoMes.getDate();
    }

    if (meses < 0) {
      años--;
      meses += 12;
    }

    return `${años} años ${meses} meses ${dias} días`;
  };

  return (
    <div className="home-container">
      {/* Botón hamburguesa para mobile */}
      <button
        ref={hamburgerRef}
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
        <span className={`hamburger-line ${menuOpen ? "open" : ""}`}></span>
      </button>

      {/* Menú lateral */}
      <nav
        className={`home-menu ${menuOpen ? "open" : ""}`}
        ref={menuRef}
        aria-hidden={!menuOpen && window.innerWidth <= 768}
      >
        <button
          className={`menu-btn ${
            activeSection === "datos-personales" ? "active" : ""
          }`}
          onClick={() => handleSelect("datos-personales")}
        >
          📄 Datos Personales
        </button>
        <button
          className={`menu-btn ${activeSection === "cursos" ? "active" : ""}`}
          onClick={() => handleSelect("cursos")}
        >
          📚 Cursos y Certificados
        </button>
        <button
          className={`menu-btn ${
            activeSection === "calificaciones" ? "active" : ""
          }`}
          onClick={() => handleSelect("calificaciones")}
        >
          📝 Calificaciones
        </button>
        <button
          className={`menu-btn ${activeSection === "pagos" ? "active" : ""}`}
          onClick={() => handleSelect("pagos")}
        >
          💳 Pagos
        </button>
        <button
          className={`menu-btn ${
            activeSection === "advertencia" ? "active" : ""
          }`}
          onClick={() => handleSelect("advertencia")}
        >
          ⚠️ Importante
        </button>
      </nav>

      <main className="home-content" tabIndex="-1">
        {activeSection === "datos-personales" && (
          <section className="section datos-personales">
            <h2>📄 Datos personales</h2>
            {user ? (
              <ul className="data-list">
                <li>
                  <strong>Nombre:</strong>{" "}
                  {user.firstName && user.lastName ? (
                    `${user.firstName} ${user.lastName}`
                  ) : (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Cédula:</strong>{" "}
                  {user.cI || (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Email:</strong>{" "}
                  {user.email || (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Celular:</strong>{" "}
                  {user.cellular || (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Edad:</strong>{" "}
                  {user.dateBirth ? (
                    calcularEdad(user.dateBirth)
                  ) : (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Provincia:</strong>{" "}
                  {user.province || (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Ciudad:</strong>{" "}
                  {user.city || (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Grado:</strong>{" "}
                  {user.grado || (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
                <li>
                  <strong>Eje Policial:</strong>{" "}
                  {user.subsistema || (
                    <span style={{ color: "red" }}>Complete información</span>
                  )}
                </li>
              </ul>
            ) : (
              <IsLoading />
            )}
          </section>
        )}

        {activeSection === "cursos" && (
          <section className="section cursos">
            <h2>📚 Cursos y Certificados</h2>
            {user?.courses?.length > 0 ? (
              <ul className="curso-list">
                {user.courses.map((curso, i) => (
                  <li key={i} className="curso-item">
                    <span className="curso-icon">🔹</span>{" "}
                    <a
                      href={`https://acadexeduc.com/course/view.php?name=${curso.curso}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: "none",
                        color: "#007bff",
                        fontWeight: "bold",
                      }}
                    >
                      {curso.fullname}
                    </a>
                    <div style={{ marginTop: "0.5rem", marginLeft: "1.5rem" }}>
                      {curso.certificado?.url ? (
                        <a
                          href={curso.certificado.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "green",
                            textDecoration: "underline",
                            fontWeight: "500",
                          }}
                        >
                          Ver certificado
                        </a>
                      ) : (
                        <span style={{ color: "#888", fontStyle: "italic" }}>
                          No hay certificado disponible
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay cursos registrados.</p>
            )}
          </section>
        )}

        {activeSection === "calificaciones" && (
          <section className="section calificaciones">
            <h2>📝 Calificaciones</h2>
            {user?.courses?.length > 0 ? (
              <ul className="curso-list">
                {user.courses.map((curso, index) => {
                  const calificaciones = curso.grades || {};
                  const estaAbierto = cursoAbiertoIndex === index;

                  return (
                    <li key={index} className="curso-item">
                      <button
                        onClick={() =>
                          setCursoAbiertoIndex(estaAbierto ? null : index)
                        }
                        className="curso-toggle"
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#0053a0",
                          cursor: "pointer",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {estaAbierto ? "▼" : "▶"} {curso.fullname}
                      </button>

                      {estaAbierto && !curso.inscripcion && (
                        <p style={{ marginLeft: "1rem", color: "red" }}>
                          ❌ No tiene inscripción en este curso.
                        </p>
                      )}

                      {estaAbierto &&
                        curso.inscripcion &&
                        !curso.matriculado && (
                          <p style={{ marginLeft: "1rem", color: "orange" }}>
                            ⚠️ Está inscrito pero no matriculado. Solicite a
                            soporte su matriculación.
                          </p>
                        )}

                      {estaAbierto &&
                        curso.inscripcion &&
                        curso.matriculado && (
                          <>
                            {Object.keys(calificaciones).length > 0 ? (
                              <ul
                                className="nota-list"
                                style={{ marginLeft: "1rem" }}
                              >
                                {Object.entries(calificaciones).map(
                                  ([actividad, nota]) => (
                                    <li key={actividad}>
                                      <strong>{actividad}:</strong> {nota}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p style={{ marginLeft: "1rem", color: "gray" }}>
                                No hay calificaciones registradas.
                              </p>
                            )}
                          </>
                        )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No hay cursos registrados.</p>
            )}
          </section>
        )}

        {activeSection === "pagos" && (
          <section className="section pagos">
            <h2>💳 Pagos</h2>
            {user?.courses?.some((c) => c.pagos?.length > 0) ? (
              user.courses.map((curso, i) => {
                if (!curso.pagos || curso.pagos.length === 0) return null;
                return (
                  <div
                    key={i}
                    className="pago_item"
                    style={{ marginBottom: "1.5rem" }}
                  >
                    <p>
                      <strong>Curso:</strong> {curso.fullname}
                    </p>
                    {curso.pagos.map((pago, j) => {
                      const extras = [];
                      if (pago.moneda) extras.push("moneda");
                      if (pago.distintivo) extras.push("distintivo");
                      return (
                        <div key={j} style={{ marginBottom: "1rem" }}>
                          <p>
                            <strong>Pago #{j + 1}</strong>{" "}
                            {j === 0
                              ? `por el certificado${
                                  extras.length > 0
                                    ? ", incluyendo " + extras.join(" y ")
                                    : ""
                                }`
                              : extras.length > 0
                              ? `por ${extras.join(" y ")}`
                              : ""}
                            .
                          </p>
                          <p>
                            <strong>Estado:</strong>{" "}
                            {pago.verificado
                              ? "✅ Verificado"
                              : "⏳ Por verificar"}
                          </p>
                          <p>
                            <strong>Monto:</strong> ${pago.valorDepositado}
                          </p>
                          <a
                            href={pago.pagoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              padding: "10px 20px",
                              backgroundColor: "#007bff",
                              color: "#fff",
                              fontWeight: "bold",
                              borderRadius: "8px",
                              textDecoration: "none",
                              textAlign: "center",
                              marginTop: "10px",
                            }}
                          >
                            Ver comprobante de pago
                          </a>
                          <hr />
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <p>No se encontraron pagos registrados.</p>
            )}
          </section>
        )}

        {activeSection === "advertencia" && (
          <section className="section advertencia">
            <h2>⚠️ Importante</h2>
            <p>
              Verifica que tus datos personales estén correctos, ya que los
              nombres y la información que ingreses aquí se reflejarán en tus
              certificados. Puedes modificar tu información desde tu perfil,
              asegurándote de usar tildes y caracteres especiales correctamente.{" "}
              <br />
              <br />
              Si detectas que tu correo registrado en Moodle es diferente al de
              tu perfil, es posible que no veas tu información de cursos y
              calificaciones. En ese caso, solicita al administrador la
              corrección correspondiente.
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
