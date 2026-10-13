import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import useCrud from "../../hooks/useCrud";
import IsLoading from "../shared/isLoading";
import "./styles/CursoInfo.css";

pdfjs.GlobalWorkerOptions.workerSrc = `../../../files/pdf.worker.min.js`;

const CursoInfo = () => {
  const { code } = useParams();
  const [courses, getCourses] = useCrud();
  const [course, setCourse] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingPdf, setLoadingPdf] = useState(true);


  const containerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(740);

  useEffect(() => {
    getCourses("/courses");
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      const found = courses.find((c) => c.sigla === code);
      setCourse(found || null);
    }
  }, [courses, code]);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setPdfWidth(containerRef.current.offsetWidth - 35);
      }
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadingPdf(false);
  };

  const goToPrevPage = () =>
    setPageNumber((prev) => (prev <= 1 ? 1 : prev - 1));

  const goToNextPage = () =>
    setPageNumber((prev) => (prev >= numPages ? numPages : prev + 1));

  if (!course) {
    return (
      <div className="curso_info_loading">
        <p>Cargando información del curso...</p>
      </div>
    );
  }

  const urlRegister = `${location.protocol}//${location.host}/#/register_discente/${course.sigla}`;
  const urlPago = `${location.protocol}//${location.host}/#/register_pago/${course.sigla}`;
  const pdfFile = course.pdfUrl || `/files/${course.sigla}.pdf`;

  return (
    <main className="curso_info_wrapper">
      {loadingPdf && <IsLoading />}

      <section className="curso_info_hero">
        <div className="curso_info_brand">
          <div className="content_logo">
            <img src="/images/idrmind_logo_fa.png" alt="iDr.Mind" />
          </div>

          <span>Formación empresarial</span>
        </div>

        <div className="curso_info_container">
          {/* IZQUIERDA */}
          <aside className="curso_info_left">
            <span className="curso_info_badge">Curso disponible</span>

            <h1 className="curso_info_title">{course.nombre}</h1>

            <p className="curso_info_section">{course.objetivo}</p>

            <div className="curso_info_meta">
              <div>
                <strong>Código</strong>
                <span>{course.sigla}</span>
              </div>

              <div>
                <strong>Modalidad</strong>
                <span>Online</span>
              </div>
            </div>

            <div className="curso_info_plazo_aviso" role="note">
              <strong>Información sobre la duración del curso</strong>
              <p>
                Puedes realizar tu formación de 40 horas a tu propio ritmo,
                dentro de un plazo máximo de 3 o 6 meses, según las condiciones
                establecidas para el curso seleccionado.
              </p>
            </div>

          </aside>

          {/* DERECHA */}
          <section className="curso_info_right">
            <div className="pdf_card_header">
              <div>
                <span>Documento informativo</span>
                <h2>Vista previa del curso</h2>
              </div>

              <span className="pdf_page_badge">
                {pageNumber}/{numPages || "--"}
              </span>
            </div>

            <div className="pdf_frame" ref={containerRef}>
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                loading="Cargando PDF..."
              >
                <Page
                  pageNumber={pageNumber}
                  width={pdfWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            </div>

            <div className="pagination_controls">
              <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
                Anterior
              </button>

              <span>
                Página {pageNumber} de {numPages || "--"}
              </span>

              <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
                Siguiente
              </button>
            </div>
          </section>
        </div>

        <section className="curso_info_actions" aria-label="Acciones del curso">
          <div className="curso_info_actions_heading">
            <div>
              <span className="curso_info_actions_eyebrow">TU SIGUIENTE PASO</span>
              <h2>Accede a tu formación</h2>
              <p>Selecciona la opción que necesitas para continuar.</p>
            </div>
            <svg className="curso_info_actions_emblem" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path d="M4 17 24 8l20 9-20 9L4 17Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M12 21v10c7 7 17 7 24 0V21" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M44 18v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="44" cy="35" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div className="curso_info_actions_grid">
            <a href={urlRegister} className="curso_info_action curso_info_action_primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M19 8v8m-4-4h8"/></svg>
              <span>Inscribirse</span>
            </a>
            <a href={urlPago} className="curso_info_action curso_info_action_light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20m-15 5h4"/></svg>
              <span>Registrar pago</span>
            </a>
            <a href={pdfFile} download={`${course.nombre}.pdf`} className="curso_info_action curso_info_action_light">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
              <span>Descargar PDF</span>
            </a>
            <a href={`https://aulavirtual.idrmind.com/course/view.php?name=${course.sigla}`} target="_blank" rel="noopener noreferrer" className="curso_info_action curso_info_action_aula">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v6c4 4 8 4 12 0v-6M22 10v7"/></svg>
              <span>Aula Virtual</span>
            </a>
          </div>
        </section>
      </section>
    </main>
  );
};

export default CursoInfo;