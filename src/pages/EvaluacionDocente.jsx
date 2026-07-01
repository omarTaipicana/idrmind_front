import React, { useState } from "react";
import "./styles/EvaluacionDocente.css";

const EvaluacionDocente = () => {
    const [activeSection, setActiveSection] = useState("inicio");
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const renderContent = () => {
        switch (activeSection) {
            case "inicio":
                return (
                    <>
                        <div className="evalCardHeader">
                            <h1 className="evalTitle">Evaluación del curso docente</h1>
                            <p className="evalMuted">
                                Panel principal para gestionar la evaluación académica de los cursos docentes.
                            </p>
                        </div>

                        <div className="evalStatsGrid">
                            <div className="evalStatCard">
                                <span>📋</span>
                                <h3>Evaluaciones</h3>
                                <p>Resumen general</p>
                            </div>

                            <div className="evalStatCard">
                                <span>👨‍🏫</span>
                                <h3>Docentes</h3>
                                <p>Control por instructor</p>
                            </div>

                            <div className="evalStatCard">
                                <span>⭐</span>
                                <h3>Promedios</h3>
                                <p>Resultados consolidados</p>
                            </div>
                        </div>
                    </>
                );

            case "formulario":
                return (
                    <>
                        <div className="evalCardHeader">
                            <h1 className="evalTitle">Formulario de evaluación</h1>
                            <p className="evalMuted">
                                Complete la evaluación académica del curso docente.
                            </p>
                        </div>

                        <form className="evalForm">
                            <div className="evalFormGroup">
                                <label>Curso</label>
                                <select className="evalInput">
                                    <option value="">Seleccione un curso</option>
                                    <option value="inteligencia-emocional">
                                        Inteligencia emocional
                                    </option>
                                </select>
                            </div>

                            <div className="evalQuestion">
                                <h3>1. Dominio del tema por parte del docente</h3>
                                <div className="evalOptions">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <label key={num}>
                                            <input type="radio" name="p1" value={num} />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="evalQuestion">
                                <h3>2. Claridad en la explicación de los contenidos</h3>
                                <div className="evalOptions">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <label key={num}>
                                            <input type="radio" name="p2" value={num} />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="evalQuestion">
                                <h3>3. Uso adecuado de recursos y materiales</h3>
                                <div className="evalOptions">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <label key={num}>
                                            <input type="radio" name="p3" value={num} />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="evalQuestion">
                                <h3>4. Puntualidad y organización del curso</h3>
                                <div className="evalOptions">
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <label key={num}>
                                            <input type="radio" name="p4" value={num} />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="evalFormGroup">
                                <label>Observación o sugerencia</label>
                                <textarea
                                    className="evalTextarea"
                                    placeholder="Escriba una observación opcional..."
                                ></textarea>
                            </div>

                            <button type="button" className="evalBtnPrimary">
                                Guardar evaluación
                            </button>
                        </form>
                    </>
                );

            case "resultados":
                return (
                    <>
                        <div className="evalCardHeader">
                            <h1 className="evalTitle">Resultados</h1>
                            <p className="evalMuted">
                                Revisión de evaluaciones enviadas por curso, docente y estudiante.
                            </p>
                        </div>

                        <div className="evalEmpty">
                            📊 Resultados pendientes.
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="evalPage">
            <button
                className={`evalHamburger ${menuOpen ? "is-open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <span className="evalHamburgerLine"></span>
                <span className="evalHamburgerLine"></span>
                <span className="evalHamburgerLine"></span>
            </button>

            <div
                className={`evalOverlay ${menuOpen ? "open" : ""}`}
                onClick={closeMenu}
            ></div>

            <div className="evalShell">
                <aside className={`evalMenu ${menuOpen ? "open" : ""}`}>
                    <div className="evalMenuHeader">
                        <img
                            src="/images/idrmind_logo_sf.png"
                            alt="IDRMIND"
                            className="evalMenuLogo"
                        />
                        <p className="evalMenuSubtitle">Evaluación docente</p>
                    </div>

                    <button
                        className={`evalMenuBtn ${activeSection === "inicio" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("inicio");
                            closeMenu();
                        }}
                    >
                        Inicio
                    </button>

                    <button
                        className={`evalMenuBtn ${activeSection === "formulario" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("formulario");
                            closeMenu();
                        }}
                    >
                        Formulario
                    </button>

                    <button
                        className={`evalMenuBtn ${activeSection === "resultados" ? "active" : ""}`}
                        onClick={() => {
                            setActiveSection("resultados");
                            closeMenu();
                        }}
                    >
                        Resultados
                    </button>
                </aside>

                <main className="evalContent">
                    <section className="evalCard">{renderContent()}</section>
                </main>
            </div>
        </div>
    );
};

export default EvaluacionDocente;