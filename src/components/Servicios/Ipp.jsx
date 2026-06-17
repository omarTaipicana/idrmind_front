import React from "react";
import "./styles/Ipp.css";

const Ipp = () => {
    return (
        <main className="ipp_page">
            <section className="ipp_hero" id="inicio">
                <div className="ipp_hero_overlay" />

                <nav className="ipp_nav">
                    <img src="/images/idrmind_logo_fa.png" alt="iDr.Mind." />
                    <a href="https://wa.me/593979002223">Solicitar evaluación IPP</a>
                </nav>

                <div className="ipp_hero_content">
                    <span className="ipp_badge">Índice de Productividad Personal</span>

                    <h2>
                        Conoce. Innova. Crece.

                    </h2>

                    <p>
                        IPP evalúa hábitos, conducta e inteligencia emocional para detectar
                        fortalezas y oportunidades de mejora que impulsen la productividad
                        y el desempeño.
                    </p>

                    <div className="ipp_hero_buttons">


                        <a href="https://wa.me/593979002223" className="ipp_btn ipp_btn_primary">
                            Solicitar evaluación IPP
                        </a>

                    </div>
                </div>
            </section>

            <section className="ipp_section ipp_problem">
                <div className="ipp_container ipp_two_cols">
                    <div>
                        <span className="ipp_section_tag">Problema empresarial</span>
                        <h2>
                            La baja productividad rara vez empieza en los procesos.
                            <br />
                            Empieza en las conductas.
                        </h2>
                    </div>

                    <div className="ipp_problem_card">
                        <p>
                            Muchas empresas pierden rendimiento por factores invisibles:
                            falta de enfoque, baja gestión emocional, poca disciplina,
                            comunicación deficiente, resistencia al cambio y desmotivación
                            silenciosa.
                        </p>
                        <strong>
                            El problema no siempre es falta de talento. Muchas veces es falta
                            de diagnóstico.
                        </strong>
                    </div>
                </div>
            </section>

            <section className="ipp_section">
                <div className="ipp_container">
                    <div className="ipp_section_header">
                        <span className="ipp_section_tag">Propuesta de valor</span>
                        <h2>¿Qué es el IPP?</h2>
                        <p>
                            El Índice de Productividad Personal es una evaluación
                            psicoproductiva diseñada por iDr. Mind. para medir el nivel de
                            productividad individual dentro de un entorno laboral.
                        </p>
                    </div>

                    <div className="ipp_grid">
                        <div className="ipp_card">Potencial productivo actual</div>
                        <div className="ipp_card">Riesgos de bajo rendimiento</div>
                        <div className="ipp_card">Nivel de enfoque y disciplina</div>
                        <div className="ipp_card">Adaptabilidad laboral</div>
                        <div className="ipp_card">Capacidad de mejora continua</div>
                        <div className="ipp_card">Compatibilidad con roles clave</div>
                    </div>
                </div>
            </section>

            <section className="ipp_statement">
                <div className="ipp_container">
                    <h2>No se puede mejorar lo que no se mide.</h2>
                    <p>
                        El IPP convierte información conductual en datos útiles para tomar
                        decisiones empresariales sobre capacitación, mentoría, reubicación o
                        desarrollo de habilidades blandas.
                    </p>
                </div>
            </section>

            <section className="ipp_section">
                <div className="ipp_container">
                    <div className="ipp_section_header">
                        <span className="ipp_section_tag">Áreas evaluadas</span>
                        <h2>¿Qué mide el IPP?</h2>
                    </div>

                    <div className="ipp_features">
                        {[
                            ["Enfoque y concentración", "Capacidad de sostener la atención y reducir distracciones."],
                            ["Disciplina personal", "Cumplimiento, constancia, responsabilidad y orden operativo."],
                            ["Gestión emocional", "Regulación de presión, frustración, conflictos y cambios."],
                            ["Comunicación laboral", "Claridad, escucha, cooperación y respuesta al feedback."],
                            ["Adaptabilidad", "Apertura al cambio, aprendizaje e innovación."],
                            ["Autogestión productiva", "Planificación, priorización y administración del tiempo."],
                            ["Riesgo de improductividad", "Señales de desgaste, bloqueo o bajo compromiso."],
                            ["Potencial de crecimiento", "Fortalezas que pueden convertirse en ventaja competitiva."]
                        ].map(([title, text], index) => (
                            <article className="ipp_feature_card" key={title}>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <h3>{title}</h3>
                                <p>{text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="ipp_section ipp_benefits">
                <div className="ipp_container ipp_two_cols">
                    <div className="ipp_benefit_box">
                        <h2>Beneficios para la empresa</h2>
                        <ul>
                            <li>Mejora la toma de decisiones sobre talento humano.</li>
                            <li>Reduce pérdidas por bajo rendimiento individual.</li>
                            <li>Detecta riesgos antes de que afecten al equipo.</li>
                            <li>Permite diseñar planes de mejora personalizados.</li>
                            <li>Alinea habilidades personales con objetivos empresariales.</li>
                        </ul>
                    </div>

                    <div className="ipp_benefit_box ipp_benefit_dark">
                        <h2>Beneficios para el evaluado</h2>
                        <p>
                            El IPP no busca juzgar a la persona. Busca revelar su punto de
                            partida para mejorar.
                        </p>
                        <ul>
                            <li>Fortalezas productivas.</li>
                            <li>Áreas de mejora.</li>
                            <li>Hábitos limitantes.</li>
                            <li>Estilo de trabajo.</li>
                            <li>Oportunidades de crecimiento profesional.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="ipp_section" id="metodologia">
                <div className="ipp_container">
                    <div className="ipp_section_header">
                        <span className="ipp_section_tag">Metodología iDr. Mind.</span>
                        <h2>Proceso IPP</h2>
                    </div>

                    <div className="ipp_steps">
                        <div>
                            <span>01</span>
                            <h3>Evaluación individual</h3>
                            <p>Aplicación del instrumento IPP.</p>
                        </div>
                        <div>
                            <span>02</span>
                            <h3>Análisis psicoproductivo</h3>
                            <p>Interpretación técnica con enfoque empresarial.</p>
                        </div>
                        <div>
                            <span>03</span>
                            <h3>Semáforo de productividad</h3>
                            <p>Clasificación del nivel de riesgo productivo.</p>
                        </div>
                        <div>
                            <span>04</span>
                            <h3>Informe gerencial</h3>
                            <p>Resultados, riesgos, recomendaciones y plan de mejora.</p>
                        </div>
                        <div>
                            <span>05</span>
                            <h3>Ruta de crecimiento</h3>
                            <p>Acciones sugeridas para elevar el rendimiento.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="ipp_section ipp_deliverables">
                <div className="ipp_container">
                    <div className="ipp_section_header">
                        <span className="ipp_section_tag">Entregables</span>
                        <h2>¿Qué recibe el cliente?</h2>
                    </div>

                    <div className="ipp_grid ipp_grid_small">
                        <div>Puntuación general IPP</div>
                        <div>Semáforo laboral de riesgo</div>
                        <div>Perfil productivo individual</div>
                        <div>Factores críticos de mejora</div>
                        <div>Recomendaciones generales</div>
                        <div>Plan de acción sugerido</div>
                    </div>
                </div>
            </section>

            <section className="ipp_cta" id="contacto">
                <div className="ipp_container">
                    <h2>Evalúa la productividad personal de tu equipo</h2>
                    <p>
                        Descubre qué factores personales están impulsando o limitando el
                        crecimiento de tu empresa.
                    </p>

                    <div className="ipp_hero_buttons">
                        <a href="https://wa.me/593979002223" className="ipp_btn ipp_btn_primary">
                            Solicitar información empresarial
                        </a>

                    </div>

                    <div className="ipp_footer_brand">
                        <strong>iDr.Mind.</strong>
                        <span>Evaluamos personas. Potenciamos equipos. Mejoramos empresas.</span>
                    </div>
                </div>
            </section>

                       <footer className="ipel_footer">
                <img src="/images/idrmind_logo_fa.png" alt="iDr.Mind" />

                <p>No es falta de talento. Es falta de diagnóstico.</p>

                <div>
                    <a href="https://www.idrmind.com" target="_blank" rel="noopener noreferrer">
                        www.idrmind.com
                    </a>
                    <a href="https://www.naskcorp.com" target="_blank" rel="noopener noreferrer">
                        www.naskcorp.com
                    </a>
                    <a href="mailto:idrmind@gmail.com">idrmind@gmail.com</a>
                    <a href="https://wa.me/593979002223" target="_blank" rel="noopener noreferrer">
                        +593 097 900 2223
                    </a>
                </div>

                <span>Presentado por iDr. Mind. by NASK Corp.</span>
            </footer>
        </main>
    );
};

export default Ipp;