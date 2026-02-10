import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./Styles/Giscopnsc.css";
import IsLoading from "../shared/isLoading";

pdfjs.GlobalWorkerOptions.workerSrc = `../../../files/pdf.worker.min.js`;

const Giscopnsc = () => {
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

      <div className="giscopnsc_header">
        <div className="giscopnsc_pdf_container" ref={containerRef}>
          {loadingPdf && <IsLoading />}

          <Document
            file="/files/giscopensc_c.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page
              pageNumber={pageNumber}
              width={pdfWidth}
              className="giscopnsc_pdf"
            />
          </Document>

          <div className="pagination_controls">
            <button onClick={goToPrevPage} disabled={pageNumber <= 1}>Anterior</button>
            <span>Página {pageNumber} de {numPages}</span>
            <button onClick={goToNextPage} disabled={pageNumber >= numPages}>Siguiente</button>
          </div>
        </div>

        {/* --- TEXTO A LA DERECHA --- */}
        <div className="giscopnsc_info">
          <img src="/giscopensc.png" alt="icon" className="giscopnsc_icon" />

          <h3 className="giscopnsc_title">
            Gestión integral de la Seguridad Ciudadana y el Orden Público con
            enfoque en Negociación en Situación de Crisis
          </h3>

          <p className="giscopnsc_description">
            Objetivo: Capacitar a los servidores policiales en la gestión integral
            de la seguridad ciudadana y el orden público, dotándolos de
            conocimientos teóricos, herramientas técnicas y habilidades prácticas
            para diseñar, implementar y evaluar políticas y estrategias efectivas
            que contribuyan a la prevención, investigación del delito, la reducción
            de la violencia y la construcción de entornos seguros y pacíficos para
            la ciudadanía.
          </p>
          {/* --- BOTONES INFERIORES --- */}
          <div className="button_group">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLScU-wtNwU8Nb1qSPIUURQc3ov9Yh4-xc_vqxWZH7gB6VQF-cg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="btn_primary"
            >
              Inscribirse ➜
            </a>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeDNkytJEU_IlbXlj3SQN60YYcJFiC7jpzwxStdqaMjFULj8Q/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="btn_primary"
            >
              Registrar pago ➜
            </a>

            <a
              href="/files/giscopensc_c.pdf"
              download="Brochure-Giscopensc.pdf"
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

export default Giscopnsc;
