import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Link, } from "react-router-dom";
import "./Styles/Ciccenic.css";
import IsLoading from "../shared/isLoading";

pdfjs.GlobalWorkerOptions.workerSrc = `../../../files/pdf.worker.min.js`;

const Ciccenic = () => {
    const urlRegister = `${location.protocol}//${location.host}/#/register_discente/ciccenic`;
    const urlPago = `${location.protocol}//${location.host}/#/register_pago/ciccenic`;


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
        <div className="ciccenic_page">
            {loadingPdf && <IsLoading />}

            {/* ====== SECCIÓN SUPERIOR: PDF + TEXTO ====== */}
            <div className="ciccenic_header">
                {/* PDF A LA IZQUIERDA */}
                <div className="ciccenic_pdf_container" ref={containerRef}>
                    <Document
                        file="/files/ciccenic_c.pdf"
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading="Cargando PDF..."
                    >
                        <Page
                            pageNumber={pageNumber}
                            width={pdfWidth}
                            className="ciccenic_pdf"
                        />
                    </Document>

                    {/* Controles debajo del PDF */}
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

                {/* INFORMACIÓN A LA DERECHA */}
                <div className="ciccenic_info">
                    <img src="/ciccenic.png" alt="ícono CICENIC" className="ciccenic_icon" />

                    <h3 className="ciccenic_title">
                        Curso Internacional en Operaciones Psicológicas y Confiabilidad en Técnicas de Entrevista.
                    </h3>

                    <p className="ciccenic_description">
                        Objetivo: Formar líderes capaces de resolver incidentes críticos con negociación táctica y comunicación estratégica,minimizando la fuerza y garantizando la seguridad y los derechos humanos.

                    </p>
                    {/* ====== BOTONES INFERIORES ====== */}
                    <div className="button_group">
                        <a href={urlRegister} rel="noopener noreferrer" className="btn_primary">
                            Inscribirse ➜
                        </a>

                        <a href={urlPago} rel="noopener noreferrer" className="btn_primary">
                            Registrar pago ➜
                        </a>

                        <a
                            href="/files/ciccenic_c.pdf"
                            download="Brochure-Ciccenic.pdf"
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
export default Ciccenic