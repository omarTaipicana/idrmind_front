import React from "react";
import "./styles/Ipel.css";

const Ipel = () => {
    return (
        <main className="ipel_page">
            {/* HERO */}
            <section className="ipel_hero">
                <div className="ipel_hero_overlay" />

                <nav className="ipel_nav">
                    <img src="/images/idrmind_logo_sf.png" alt="iDr.Mind" />

                    <a href="https://wa.me/593979002223" target="_blank" rel="noopener noreferrer">
                        Haz tu diagnóstico ahora
                    </a>
                </nav>

                <div className="ipel_hero_content">
                    <div className="ipel_hero_text">
                        <span className="ipel_badge claro">
                            Sistema de Auditoría Conductual Empresarial
                        </span>

                        <h2>
                            Liderar sin datos hoy,
                     
                            es dirigir a ciegas.
                        </h2>

                        <p>
                            IPEL transforma la información humana y operativa en decisiones
                            empresariales claras, medibles y estratégicas para empresas que
                            necesitan ordenar su productividad.
                        </p>

                        <div className="ipel_hero_buttons">
                            <a href="https://wa.me/593979002223" className="ipel_btn ipel_btn_primary">
                                Haz tu diagnóstico ahora
                            </a>
                        </div>
                    </div>

                    <div className="ipel_hero_video">
                        <iframe
                            src="https://www.youtube.com/embed/hCFVME_Ex_Y"
                            title="Video IPEL"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>

            {/* PROBLEMA */}
            <section className="ipel_problem" id="diagnostico">
                <div className="ipel_section_head">
                    <span >Diagnóstico empresarial</span>

                    <h2>
                        Evaluamos fugas invisibles de productividad que están drenando la
                        rentabilidad de su empresa.
                    </h2>

                    <p className="oscuro">
                        Durante años vimos el mismo patrón repetirse en empresas de todos los
                        tamaños: gerentes brillantes, equipos comprometidos y resultados que
                        no reflejaban el esfuerzo invertido. No era falta de talento. Era
                        falta de información clara.
                    </p>
                </div>

                <div className="ipel_cards">
                    <article>
                        <h3>01</h3>
                        <h4>Decisiones por intuición</h4>
                        <p>
                            Empresas tomando decisiones por percepción, urgencia o experiencia,
                            sin indicadores claros.
                        </p>
                    </article>

                    <article>
                        <h3>02</h3>
                        <h4>Fugas de productividad</h4>
                        <p>
                            Procesos invisibles que consumen tiempo, energía y rentabilidad
                            sin ser detectados.
                        </p>
                    </article>

                    <article>
                        <h3>03</h3>
                        <h4>Desgaste directivo</h4>
                        <p>
                            Gerentes y equipos clave operando constantemente bajo presión,
                            reuniones largas y poca claridad.
                        </p>
                    </article>

                    <article>
                        <h3>04</h3>
                        <h4>Falta de diagnóstico</h4>
                        <p>
                            No siempre falta talento. Muchas veces falta medir lo que realmente
                            afecta los resultados.
                        </p>
                    </article>
                </div>
            </section>

            {/* VIDEO 1 */}
            <section className="ipel_video_dark" id="video">
                <div className="ipel_section_head ipel_section_head_dark">
                    <span className="claro">Presentación IPEL</span>
                    <h2>Conoce cómo funciona el sistema</h2>
                    <p>
                        Evaluamos gerentes, equipos clave y colaboradores para convertir
                        datos humanos en decisiones estratégicas.
                    </p>
                </div>

                <div className="ipel_video_frame">
                    <iframe
                        src="https://www.youtube.com/embed/oqVJO86yTKM"
                        title="Video IPEL"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </section>

            {/* QUÉ ES */}
            <section className="ipel_method">
                <div className="ipel_method_text">
                    <span className="ipel_badge">¿Qué es IPEL?</span>

                    <h2>
                        iDr.Mind. crea IPEL para convertir lo invisible en datos, y los datos
                        en decisiones.
                    </h2>

                    <p>
                        IPEL es el Índice de Productividad Empresarial y Liderazgo. Un
                        sistema de evaluación de la productividad gerencial, organizacional y
                        personal.
                    </p>

                    <ul>
                        <li>Productividad operativa.</li>
                        <li>Liderazgo.</li>
                        <li>Cultura organizacional.</li>
                        <li>Habilidades blandas estratégicas.</li>
                        <li>Información útil para dirección y gerencia.</li>
                    </ul>
                </div>

                <div className="ipel_method_box">
                    <h3>El Índice IPEL permite:</h3>

                    <ul>
                        <li>Comparar áreas.</li>
                        <li>Detectar brechas.</li>
                        <li>Priorizar decisiones.</li>
                        <li>Medir evolución en el tiempo.</li>
                    </ul>

                    <p>Sin suposiciones. Sin discursos. Con datos claros.</p>
                </div>
            </section>

            {/* PROCESO */}
            <section className="ipel_process">
                <div className="ipel_section_head">
                    <span>Proceso simple</span>
                    <h2>Resultado contundente</h2>
                    <p>
                        Medimos lo que normalmente no se mide y lo traducimos en información
                        útil para la dirección.
                    </p>
                </div>

                <div className="ipel_process_grid">
                    <div>
                        <strong>01</strong>
                        <h3>Evaluamos</h3>
                        <p>Gerentes, equipos clave y colaboradores.</p>
                    </div>

                    <div>
                        <strong>02</strong>
                        <h3>Analizamos</h3>
                        <p>Productividad, enfoque y gestión real.</p>
                    </div>

                    <div>
                        <strong>03</strong>
                        <h3>Calculamos</h3>
                        <p>El Índice IPEL con indicadores cuantificables.</p>
                    </div>

                    <div>
                        <strong>04</strong>
                        <h3>Entregamos</h3>
                        <p>Un informe ejecutivo claro y aplicable.</p>
                    </div>
                </div>
            </section>

            {/* QUÉ RECIBE */}
            <section className="ipel_receive">
                <div className="ipel_receive_card">
                    <span className="ipel_badge claro">¿Qué recibe su empresa?</span>

                    <h2>Información lista para decidir</h2>

                    <div className="ipel_receive_list">
                        <p>Reporte ejecutivo de productividad.</p>
                        <p>Índices claros y comparables.</p>
                        <p>Diagnóstico de brechas críticas.</p>
                        <p>Hoja de estrategias.</p>
                        <p>Recomendaciones aplicables desde el día uno.</p>
                        <p>Información útil para comité, directorio o planificación estratégica.</p>
                    </div>
                </div>
            </section>

            {/* BENEFICIOS */}
            <section className="ipel_benefits">
                <div className="ipel_section_head">
                    <span>Beneficios empresariales</span>

                    <h2>Menos improvisación. Más dirección.</h2>

                    <p>
                        IPEL ayuda a ordenar la gestión, reducir desgaste y enfocar mejor los
                        recursos humanos y operativos.
                    </p>
                </div>

                <div className="ipel_benefits_grid">
                    <div>Menor improvisación.</div>
                    <div>Mayor claridad gerencial.</div>
                    <div>Mejor uso del talento existente.</div>
                    <div>Minimizar desgaste directivo.</div>
                    <div>Reducir rotación del personal.</div>
                    <div>Aumentar enfoque organizacional.</div>
                    <div>Liderar de forma asertiva.</div>
                    <div>Incrementar productividad.</div>
                </div>
            </section>

            {/* PARA QUIÉN */}
            <section className="ipel_target">
                <div className="ipel_target_card ipel_target_yes">
                    <h2>Para quién es</h2>
                    <p>
                        Para empresas que necesitan orden, claridad, control y una forma más
                        estratégica de tomar decisiones.
                    </p>
                </div>

                <div className="ipel_target_card ipel_target_no">
                    <h2>Para quién no es</h2>
                    <p>
                        No es para organizaciones que prefieren seguir gestionando por
                        intuición, percepción o urgencia.
                    </p>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="ipel_cta" id="contacto">
                <div>
                    <span className="ipel_badge claro">Empieza ahora</span>

                    <h2>
                        Si tu empresa ya no puede gestionarse como antes, necesitas otra
                        forma de decidir.
                    </h2>

                    <p>
                        iDr. Mind. no inspira ni motiva. iDr. Mind. mide, ordena y guía.
                        Solicita una evaluación inicial y empieza a decidir con datos reales.
                    </p>

                    <div className="ipel_cta_stats">
                        <div>
                            <strong>24h</strong>
                            <span>Resultados empresariales</span>
                        </div>

                        <div>
                            <strong>30 min</strong>
                            <span>Tiempo estimado del diagnóstico</span>
                        </div>

                        <div>
                            <strong>Datos</strong>
                            <span>Decisiones claras</span>
                        </div>
                    </div>
                </div>

                <a
                    href="https://wa.me/593979002223"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ipel_btn ipel_btn_primary"
                >
                    Haz el diagnóstico ahora
                </a>
            </section>

            {/* FOOTER */}
            <footer className="ipel_footer">
                <img src="/images/idrmind_logo_sf.png" alt="iDr.Mind" />

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

export default Ipel;