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

    if (!course) return <p>Cargando información del curso...</p>;

    const urlRegister = `${location.protocol}//${location.host}/#/register_discente/${course.sigla}`;
    const urlPago = `${location.protocol}//${location.host}/#/register_pago/${course.sigla}`;
    const pdfFile = course.pdfUrl || `/files/${course.sigla}.pdf`;

    return (
        <div className="curso_info_wrapper">
            {loadingPdf && <IsLoading />}
            <div className="curso_info_container">
                {/* Sección Izquierda */}
                <div className="curso_info_left">
                    <h3 className="curso_info_title">{course.nombre}</h3>
                    <p className="curso_info_section">{course.objetivo}</p>

                    <div className="button_group">
                        <a href={urlRegister} className="btn_inscribirse">
                            Inscribirse
                        </a>
                        <a href={urlPago} className="btn_registrar_pago">
                            Registrar pago
                        </a>
                        <a href={pdfFile} download={`${course.nombre}.pdf`} className="btn_descargar_pdf">
                            Descargar PDF
                        </a>
                    </div>
                </div>

                {/* Sección Derecha */}
                <div className="curso_info_right">
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
                            />            </Document>
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
        </div>
    );
};

export default CursoInfo;
