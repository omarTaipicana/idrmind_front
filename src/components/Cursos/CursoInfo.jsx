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
          <img src="/images/idrmind_logo_sf.png" alt="iDr.Mind" />
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

            <div className="button_group">
              <a href={urlRegister} className="curso_btn curso_btn_primary">
                Inscribirse
              </a>

              <a href={urlPago} className="curso_btn curso_btn_secondary">
                Registrar pago
              </a>

              <a
                href={pdfFile}
                download={`${course.nombre}.pdf`}
                className="curso_btn curso_btn_outline"
              >
                Descargar PDF
              </a>
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
      </section>
    </main>
  );
};

export default CursoInfo;