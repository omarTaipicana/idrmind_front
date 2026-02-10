import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Link } from "react-router-dom";
import "./Styles/Accv.css";
import IsLoading from "../shared/isLoading";

pdfjs.GlobalWorkerOptions.workerSrc = `../../../files/pdf.worker.min.js`;

const Accv = () => {
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
    <div className="giscopnsc_page">
      {/* ====== SECCIÓN SUPERIOR: PDF + TEXTO ====== */}
      <div className="giscopnsc_header">
        {/* PDF A LA IZQUIERDA */}
        <div className="giscopnsc_pdf_container" ref={containerRef}>
          {loadingPdf && <IsLoading />}

          <Document
            file="/files/accv_c.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading="Cargando PDF..."
          >
            <Page
              pageNumber={pageNumber}
              width={pdfWidth}
              className="giscopnsc_pdf"
            />
          </Document>

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

        {/* TEXTO A LA DERECHA */}
        <div className="giscopnsc_info">
          <img src="/accv.png" alt="icono ACCV" className="giscopnsc_icon" />

          <h3 className="giscopnsc_title">
            Análisis en Conducta Criminal y Victimología
          </h3>

          <p className="giscopnsc_description">
            Objetivo: Brindar a los funcionarios de las fuerzas del orden y
            seguridad una formación integral en victimología y criminología
            mediante el análisis e intervención profesional a los fenómenos
            delictivos, sus causas, consecuencias y las dinámicas de
            victimización, promoviendo una atención ética, interdisciplinaria
            y centrada en los derechos de las víctimas.
          </p>
          {/* ====== BOTONES INFERIORES ====== */}
          <div className="button_group">
            <a
              href={urlRegister}
              rel="noopener noreferrer"
              className="btn_primary"
            >
              Inscribirse ➜
            </a>

            <a
              href={urlPago}
              rel="noopener noreferrer"
              className="btn_primary"
            >
              Registrar pago ➜
            </a>

            <a
              href="/files/accv_c.pdf"
              download="Brochure-Accv.pdf"
              className="btn_primary"
            >
              Descargar PDF ➜
            </a>
          </div>
        </div>
      </div>


    </div>
  );

};

export default Accv;
