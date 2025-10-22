import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Link, useNavigate } from "react-router-dom";
import "./Styles/Accv.css";
import IsLoading from "../shared/isLoading";

pdfjs.GlobalWorkerOptions.workerSrc = `../../../files/pdf.worker.min.js`;

const Accv = () => {
  const navigate = useNavigate();
  const urlRegister = `${location.protocol}//${location.host}/#/register_discente/accv`;
  const urlPago = `${location.protocol}//${location.host}/#/register_pago/accv`;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingPdf, setLoadingPdf] = useState(true); // Nuevo estado

  const containerRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(740);

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

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoadingPdf(false); // PDF cargado
  }

  function goToPrevPage() {
    setPageNumber((prev) => (prev <= 1 ? 1 : prev - 1));
  }

  function goToNextPage() {
    setPageNumber((prev) => (prev >= numPages ? numPages : prev + 1));
  }

  return (
    <div className="giscopnsc_wrapper">
      {loadingPdf && <IsLoading />}
      <h3 className="giscopnsc_title">
        ANALISIS EN CONDUCTA CRIMINAL Y VICTIMOLOGÍA
      </h3>

      <section className="giscopnsc_section">
        Objetivo: Brindar a los funcionarios de las fuerzas del orden y
        seguridad una formación integral en victimología y criminología mediante
        el análisis e intervención profesional a los fenómenos delictivos, sus
        causas, consecuencias y las dinámicas de victimización, promoviendo una
        atención ética, interdisciplinaria y centrada en los derechos de las
        víctimas.
      </section>

      <div className="button_group">
        <a
          href={urlRegister}
          rel="noopener noreferrer"
          className="btn_inscribirse"
        >
          Inscribirse
        </a>
        <a
          href={urlPago}
          rel="noopener noreferrer"
          className="btn_registrar_pago"
        >
          Registrar pago
        </a>
        <a
          href="/files/accv_c.pdf"
          download="Brochure-Accv.pdf"
          className="btn_descargar_pdf"
        >
          Descargar PDF
        </a>
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

      <div className="giscopnsc_container" ref={containerRef}>
        <div className="pdf_container">
          {" "}
          <Document
            file="/files/accv_c.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading="Cargando PDF..."
          >
            <Page pageNumber={pageNumber} width={pdfWidth} />
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
      </div>
    </div>
  );
};

export default Accv;
