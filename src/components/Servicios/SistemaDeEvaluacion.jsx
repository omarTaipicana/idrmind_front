import React from "react";
import "./styles/SistemaDeEvaluacion.css";

const SistemaDeEvaluacion = () => {
    return (
        <main className="eval_page">
            <section className="eval_hero">
                <div className="eval_overlay" />

                <nav className="eval_nav">
                    <img src="/images/idrmind_logo_sf.png" alt="iDr.Mind." />
                    <a href="https://wa.me/593979002223">Comenzar evaluación</a>
                </nav>

                <div className="eval_hero_content">
                    <span className="eval_badge">Proyecto Pensar</span>

                    <h2>
                        Descubre el potencial oculto
                        <br />
                        de tus habilidades blandas.
                    </h2>

                    <p>
                        Evalúa tu perfil personal, profesional y cognitivo para identificar
                        fortalezas, áreas de mejora y capacidades con alto potencial de
                        desarrollo.
                    </p>

                    <div className="eval_buttons">
                        <a href="https://wa.me/593979002223" className="eval_btn eval_primary">
                            Quiero descubrir mi perfil
                        </a>

                    </div>
                </div>
            </section>

            <section className="eval_section eval_problem">
                <div className="eval_container eval_two_cols">
                    <div>
                        <span className="eval_tag">Impacto personal</span>
                        <h2>
                            ¿Por qué algunas personas
                            <br />
                            avanzan más rápido que otras?
                        </h2>
                    </div>

                    <div className="eval_problem_card">
                        <p>
                            No siempre es por conocimientos técnicos. Muchas veces la
                            diferencia está en la persistencia, comunicación, inteligencia
                            emocional, toma de decisiones, liderazgo y productividad personal.
                        </p>
                        <strong>
                            Proyecto Pensar identifica esos factores invisibles que pueden
                            impulsar o limitar tu crecimiento.
                        </strong>
                    </div>
                </div>
            </section>

            <section className="eval_section">
                <div className="eval_container">
                    <div className="eval_header">
                        <span className="eval_tag">Propuesta de valor</span>
                        <h2>Una evaluación que revela lo que pasa desapercibido</h2>
                        <p>
                            Integramos análisis conductual, habilidades blandas y métricas de
                            productividad para generar un perfil claro, profundo y accionable.
                        </p>
                    </div>

                    <div className="eval_grid">
                        <div className="eval_card">
                            <h3>Respaldo conductual</h3>
                            <p>Enfoque basado en comportamiento humano y mejora continua.</p>
                        </div>
                        <div className="eval_card">
                            <h3>Evaluación estratégica</h3>
                            <p>Analiza patrones que impactan productividad y desempeño.</p>
                        </div>
                        <div className="eval_card">
                            <h3>Resultados claros</h3>
                            <p>Obtén un reporte personalizado al finalizar la evaluación.</p>
                        </div>
                        <div className="eval_card">
                            <h3>Enfoque profesional</h3>
                            <p>Ideal para personas, empresas, emprendedores y equipos.</p>
                        </div>
                        <div className="eval_card">
                            <h3>Crecimiento personal</h3>
                            <p>Identifica fortalezas y áreas que puedes desarrollar.</p>
                        </div>
                        <div className="eval_card">
                            <h3>Productividad real</h3>
                            <p>Detecta hábitos que afectan tu rendimiento diario.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="eval_statement">
                <div className="eval_container">
                    <h2>Conocerte mejor puede cambiar tu futuro profesional.</h2>
                    <p>
                        Las habilidades blandas son claves para crecer, liderar equipos,
                        comunicar mejor y generar mejores resultados.
                    </p>
                </div>
            </section>

            <section className="eval_section">
                <div className="eval_container">
                    <div className="eval_header">
                        <span className="eval_tag">Beneficios</span>
                        <h2>¿Cómo puede ayudarte Proyecto Pensar?</h2>
                    </div>

                    <div className="eval_features">
                        <article className="eval_feature">
                            <span>01</span>
                            <h3>Liderazgo competitivo</h3>
                            <p>Desarrolla habilidades para destacar profesionalmente.</p>
                        </article>
                        <article className="eval_feature">
                            <span>02</span>
                            <h3>Mayor claridad mental</h3>
                            <p>Toma decisiones con más lógica, enfoque y seguridad.</p>
                        </article>
                        <article className="eval_feature">
                            <span>03</span>
                            <h3>Crecimiento profesional</h3>
                            <p>Identifica fortalezas que abren nuevas oportunidades.</p>
                        </article>
                        <article className="eval_feature">
                            <span>04</span>
                            <h3>Confianza personal</h3>
                            <p>Comprende tus capacidades y trabaja tus áreas de mejora.</p>
                        </article>
                    </div>
                </div>
            </section>

            <section className="eval_section eval_report" id="reporte">
                <div className="eval_container">
                    <div className="eval_header">
                        <span className="eval_tag">Reporte personalizado</span>
                        <h2>Áreas evaluadas</h2>
                    </div>

                    <div className="eval_services_grid">
                        <div>Nivel de Persistencia</div>
                        <div>Test VAK</div>
                        <div>Pensamiento Analítico</div>
                        <div>Trabajo en Equipo</div>
                        <div>Comunicación Efectiva</div>
                        <div>Ventas y Negociación</div>
                        <div>Productividad Personal</div>
                        <div>Potencial de Liderazgo</div>
                        <div>Adaptabilidad al Cambio</div>
                        <div>Resolución de Problemas</div>
                    </div>
                </div>
            </section>

            <section className="eval_section">
                <div className="eval_container">
                    <div className="eval_header">
                        <span className="eval_tag">Preguntas frecuentes</span>
                        <h2>Antes de comenzar</h2>
                    </div>

                    <div className="eval_faq">
                        <div>
                            <h3>¿Cuánto tiempo toma?</h3>
                            <p>El tiempo promedio es corto y los resultados son inmediatos.</p>
                        </div>
                        <div>
                            <h3>¿Puedo acceder desde cualquier dispositivo?</h3>
                            <p>Sí, desde celular, tablet, laptop o computadora.</p>
                        </div>
                        <div>
                            <h3>¿Recibiré soporte?</h3>
                            <p>Sí, contamos con soporte especializado para usuarios.</p>
                        </div>
                        <div>
                            <h3>¿Sirve para empresas?</h3>
                            <p>Sí, también puede utilizarse para evaluación de talento humano.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="eval_cta" id="contacto">
                <div className="eval_container">
                    <h2>Tu potencial puede estar esperando ser descubierto</h2>
                    <p>
                        Empieza hoy a entender cómo funcionan tus habilidades blandas y cómo
                        pueden ayudarte a crecer profesionalmente.
                    </p>

                    <div className="eval_buttons">
                        <a href="https://wa.me/593979002223" className="eval_btn eval_primary">
                            Comenzar evaluación ahora
                        </a>

                    </div>

                    <div className="eval_footer">
                        <strong>Proyecto Pensar</strong>
                        <span>Evaluación Estratégica de Habilidades Blandas por iDr. Mind.</span>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default SistemaDeEvaluacion;