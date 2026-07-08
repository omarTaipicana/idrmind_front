import React, { useEffect, useState } from "react";
import "./styles/EvaluacionDocente.css";
import useCrud from "../hooks/useCrud";
import axios from "axios";
import getConfigToken from "../services/getConfigToken";


const defaultScaleLabels = {
    1: "Muy malo",
    2: "Malo",
    3: "Regular",
    4: "Bueno",
    5: "Excelente",
};

const EvaluacionDocente = () => {
    const [activeSection, setActiveSection] = useState("inicio");
    const [menuOpen, setMenuOpen] = useState(false);

    const [cursos, getCursos] = useCrud();
    const [
        preguntasApi,
        getPreguntasApi,
        createPreguntaApi,
        deletePreguntaApi,
        updatePreguntaApi,
    ] = useCrud();

    const [editingId, setEditingId] = useState(null);

    const [resultados, setResultados] = useState(null);
    const [loadingResultados, setLoadingResultados] = useState(false);

    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const [cursoId, setCursoId] = useState("");
    const [cursoDestinoId, setCursoDestinoId] = useState("");

    const [preguntas, setPreguntas] = useState([]);

    const [question, setQuestion] = useState("");
    const [category, setCategory] = useState("General");
    const [target, setTarget] = useState("course");
    const [type, setType] = useState("scale");
    const [scaleLabels, setScaleLabels] = useState(defaultScaleLabels);
    const [weight, setWeight] = useState(1);
    const [order, setOrder] = useState(1);
    const [isRequired, setIsRequired] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [mostrarInactivas, setMostrarInactivas] = useState(false);
    const [archivoPreguntas, setArchivoPreguntas] = useState(null);

    const PATH_CURSOS = "/courses";
    const PATH_PREGUNTAS = "/evaluation-questions";

    useEffect(() => {
        getCursos(PATH_CURSOS);
        getPreguntasApi(`${PATH_PREGUNTAS}?includeInactive=${mostrarInactivas}`);
    }, []);

    useEffect(() => {
        getPreguntasApi(`${PATH_PREGUNTAS}?includeInactive=${mostrarInactivas}`);
    }, [mostrarInactivas]);

    const closeMenu = () => setMenuOpen(false);

    const getNombreCurso = (curso) =>
        curso?.fullname ||
        curso?.nombre ||
        curso?.name ||
        curso?.sigla ||
        "Curso sin nombre";


    const limpiarFormularioPregunta = () => {
        setEditingId(null);

        setCursoId("");
        setQuestion("");
        setCategory("General");
        setTarget("course");
        setType("scale");
        setScaleLabels(defaultScaleLabels);
        setWeight(1);
        setOrder(1);
        setIsRequired(true);
        setIsActive(true);
    };

    const crearPregunta = async () => {
        if (!question.trim()) {
            alert("Ingrese la pregunta.");
            return;
        }

        const dataPregunta = {
            courseId: cursoId || null,
            question: question.trim(),
            category,
            target,
            type,
            scaleLabels: type === "scale" ? scaleLabels : null,
            weight: Number(weight),
            order: Number(order),
            isRequired,
            isActive,
        };

        if (editingId) {
            updatePreguntaApi(PATH_PREGUNTAS, editingId, dataPregunta);
            alert("Pregunta actualizada correctamente.");
        } else {
            createPreguntaApi(PATH_PREGUNTAS, dataPregunta);
            alert("Pregunta guardada correctamente.");
        }

        setTimeout(() => {
            getPreguntasApi(PATH_PREGUNTAS);
            limpiarFormularioPregunta();
        }, 400);
    };


    const editarPregunta = (item) => {
        setEditingId(item.id);
        setCursoId(item.courseId || "");
        setQuestion(item.question || "");
        setCategory(item.category || "General");
        setTarget(item.target || "course");
        setType(item.type || "scale");
        setScaleLabels(item.scaleLabels || defaultScaleLabels);
        setWeight(item.weight || 1);
        setOrder(item.order || 1);
        setIsRequired(item.isRequired);
        setIsActive(item.isActive);

        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    const eliminarPregunta = (item) => {
        const confirmar = window.confirm(
            "¿Desea desactivar esta pregunta? No se eliminará definitivamente."
        );

        if (!confirmar) return;

        updatePreguntaApi(PATH_PREGUNTAS, item.id, {
            isActive: false,
        });

        setTimeout(() => {
            getPreguntasApi(
                `${PATH_PREGUNTAS}?includeInactive=${mostrarInactivas}`
            );
        }, 400);

        alert("Pregunta desactivada correctamente.");
    };


    const activarPregunta = (item) => {
        updatePreguntaApi(PATH_PREGUNTAS, item.id, {
            isActive: true,
        });

        setTimeout(() => {
            getPreguntasApi(
                `${PATH_PREGUNTAS}?includeInactive=${mostrarInactivas}`
            );
        }, 400);

        alert("Pregunta activada correctamente.");
    };


    const importarPreguntas = async () => {
        if (!archivoPreguntas) {
            alert("Seleccione un archivo Excel.");
            return;
        }

        const confirmar = cursoId
            ? true
            : window.confirm(
                "No seleccionó curso. Las preguntas se importarán como globales para todos los cursos. ¿Desea continuar?"
            );

        if (!confirmar) return;

        const formData = new FormData();
        formData.append("file", archivoPreguntas);
        formData.append("courseId", cursoId || "");

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}${PATH_PREGUNTAS}/import`,
                formData,
                {
                    headers: {
                        ...getConfigToken().headers,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Preguntas importadas correctamente.");
            setArchivoPreguntas(null);

            getPreguntasApi(`${PATH_PREGUNTAS}?includeInactive=${mostrarInactivas}`);
        } catch (error) {
            console.error(error);
            alert("Error al importar preguntas.");
        }
    };


    const exportarPreguntas = async () => {
        if (!cursoId) {
            alert("Seleccione un curso.");
            return;
        }

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}${PATH_PREGUNTAS}/export?courseId=${cursoId}`,
                {
                    ...getConfigToken(),
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "preguntas-evaluacion.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error(error);
            alert("Error al exportar preguntas.");
        }
    };


    const descargarPlantillaPreguntas = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}${PATH_PREGUNTAS}/template`,
                {
                    ...getConfigToken(),
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "plantilla-preguntas-evaluacion.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error(error);
            alert("Error al descargar la plantilla.");
        }
    };

    const cargarResultados = async () => {
        if (!cursoId) {
            alert("Seleccione un curso.");
            return;
        }

        try {
            setLoadingResultados(true);

            let url = `${import.meta.env.VITE_API_URL}/evaluation-responses/results?courseId=${cursoId}`;

            if (fechaInicio) {
                url += `&startDate=${fechaInicio}`;
            }

            if (fechaFin) {
                url += `&endDate=${fechaFin}`;
            }

            const res = await axios.get(url, getConfigToken());

            setResultados(res.data);
        } catch (error) {
            console.error(error);
            alert("Error al cargar resultados.");
        } finally {
            setLoadingResultados(false);
        }
    };

    const descargarReporteResultados = () => {
    if (!resultados) {
        alert("Primero consulte los resultados.");
        return;
    }

    const cursoSeleccionado = cursos?.find(
        (curso) => String(curso.id) === String(cursoId)
    );

    const nombreCurso = getNombreCurso(cursoSeleccionado);

    const limpiarCSV = (valor) => {
        if (valor === null || valor === undefined) return "";
        return `"${String(valor).replace(/"/g, '""')}"`;
    };

    const filas = [];

    filas.push(["REPORTE DE EVALUACIÓN"]);
    filas.push(["Curso", nombreCurso]);
    filas.push(["Desde", fechaInicio || "Todos"]);
    filas.push(["Hasta", fechaFin || "Todos"]);
    filas.push(["Total evaluaciones", resultados.totalResponses]);
    filas.push(["Promedio general sobre 5", resultados.averageScore || "N/A"]);
    filas.push(["Curso sobre 5", resultados.byTarget?.course || "N/A"]);
    filas.push(["Docente sobre 5", resultados.byTarget?.teacher || "N/A"]);
    filas.push(["Plataforma sobre 5", resultados.byTarget?.platform || "N/A"]);
    filas.push([]);

    filas.push(["PROMEDIO POR PREGUNTA"]);
    filas.push(["Pregunta", "Categoría", "Dirigido a", "Respuestas", "Promedio sobre 5"]);

    resultados.questions?.forEach((item) => {
        filas.push([
            item.question,
            item.category,
            item.target,
            item.totalAnswers,
            item.average || "N/A",
        ]);
    });

    filas.push([]);

    filas.push(["RESPUESTAS ABIERTAS"]);
    filas.push(["Pregunta", "Categoría", "Dirigido a", "Respuesta"]);

    resultados.textAnswers?.forEach((item) => {
        filas.push([
            item.question,
            item.category,
            item.target,
            item.value,
        ]);
    });

    const csv = filas
        .map((fila) => fila.map(limpiarCSV).join(";"))
        .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
    });

    const fecha = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `reporte-evaluacion-${fecha}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(link.href);
};



    const preguntasFiltradas = preguntasApi
        ?.filter((p) => {
            if (!mostrarInactivas && !p.isActive) return false;

            if (!cursoId) {
                return p.courseId === null;
            }

            return p.courseId === null || String(p.courseId) === String(cursoId);
        })
        .sort((a, b) => Number(a.order) - Number(b.order));


    const renderContent = () => {
        switch (activeSection) {
            case "inicio":
                return (
                    <>
                        <div className="evalCardHeader">
                            <h1 className="evalTitle">Evaluación del curso docente</h1>
                            <p className="evalMuted">
                                Panel administrativo para gestionar preguntas, resultados y
                                reportes de evaluación.
                            </p>
                        </div>

                        <div className="evalStatsGrid">
                            <div className="evalStatCard">
                                <span>📋</span>
                                <h3>{preguntasApi?.length || 0}</h3>                                <p>Preguntas creadas</p>
                            </div>

                            <div className="evalStatCard">
                                <span>👨‍🏫</span>
                                <h3>Curso / Docente</h3>
                                <p>Evaluación por objetivo</p>
                            </div>

                            <div className="evalStatCard">
                                <span>📊</span>
                                <h3>Resultados</h3>
                                <p>Reportes consolidados</p>
                            </div>
                        </div>
                    </>
                );

            case "preguntas":
                return (
                    <>
                        <div className="evalCardHeader">
                            <h1 className="evalTitle">Banco de preguntas</h1>
                            <p className="evalMuted">
                                Crea preguntas generales o específicas para un curso.
                            </p>
                        </div>

                        <div className="evalForm">
                            <div className="evalFormGroup">
                                <label>Curso</label>
                                <select
                                    className="evalInput"
                                    value={cursoId}
                                    onChange={(e) => setCursoId(e.target.value)}
                                >
                                    <option value="">
                                        Pregunta general para todos los cursos
                                    </option>

                                    {cursos?.map((curso) => (
                                        <option key={curso.id} value={curso.id}>
                                            {getNombreCurso(curso)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="evalGrid3">
                                <div className="evalFormGroup">
                                    <label>Categoría</label>
                                    <input
                                        className="evalInput"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="General, Docente, Plataforma..."
                                    />
                                </div>

                                <div className="evalFormGroup">
                                    <label>Evaluar</label>
                                    <select
                                        className="evalInput"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                    >
                                        <option value="course">Curso</option>
                                        <option value="teacher">Docente</option>
                                        <option value="platform">Plataforma</option>
                                    </select>
                                </div>

                                <div className="evalFormGroup">
                                    <label>Tipo</label>
                                    <select
                                        className="evalInput"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="scale">Escala 1 a 5</option>
                                        <option value="text">Texto abierto</option>
                                    </select>
                                </div>
                            </div>

                            <div className="evalGrid2">
                                <div className="evalFormGroup">
                                    <label>Orden</label>
                                    <input
                                        className="evalInput"
                                        type="number"
                                        min="1"
                                        value={order}
                                        onChange={(e) => setOrder(e.target.value)}
                                    />
                                </div>

                                <div className="evalFormGroup">
                                    <label>Peso</label>
                                    <input
                                        className="evalInput"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="evalFormGroup">
                                <label>Pregunta</label>
                                <textarea
                                    className="evalTextarea"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Ej: El docente demostró dominio del tema..."
                                />
                            </div>

                            {type === "scale" && (
                                <div className="evalScaleBox">
                                    <h3>Etiquetas de escala</h3>

                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <div className="evalScaleRow" key={num}>
                                            <strong>{num}</strong>
                                            <input
                                                className="evalInput"
                                                value={scaleLabels[num]}
                                                onChange={(e) =>
                                                    setScaleLabels((prev) => ({
                                                        ...prev,
                                                        [num]: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="evalCheckRow">
                                <label className="evalCheck">
                                    <input
                                        type="checkbox"
                                        checked={isRequired}
                                        onChange={(e) => setIsRequired(e.target.checked)}
                                    />
                                    Obligatoria
                                </label>

                                <label className="evalCheck">
                                    <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    Activa
                                </label>
                            </div>

                            <button
                                type="button"
                                className="evalBtnPrimary"
                                onClick={crearPregunta}
                            >
                                {editingId ? "Actualizar pregunta" : "Guardar pregunta"}
                            </button>

                            <div className="evalTableWrap">

                                <label className="evalCheck">
                                    <input
                                        type="checkbox"
                                        checked={mostrarInactivas}
                                        onChange={(e) => setMostrarInactivas(e.target.checked)}
                                    />
                                    Mostrar preguntas inactivas
                                </label>
                                <table className="evalTable">
                                    <thead>
                                        <tr>
                                            <th>Orden</th>
                                            <th>Pregunta</th>
                                            <th>Categoría</th>
                                            <th>Tipo</th>
                                            <th>Dirigido a</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {preguntasFiltradas.map((item) => (

                                            <tr key={item.id}>

                                                <td>{item.order}</td>

                                                <td>{item.question}</td>

                                                <td>{item.category}</td>

                                                <td>
                                                    {item.type === "scale"
                                                        ? "Escala"
                                                        : "Texto"}
                                                </td>

                                                <td>{item.target}</td>

                                                <td>

                                                    {item.isActive
                                                        ? "🟢 Activa"
                                                        : "🔴 Inactiva"}

                                                </td>
                                                <td className="evalActions">
                                                    <button
                                                        type="button"
                                                        className="evalIconBtn edit"
                                                        onClick={() => editarPregunta(item)}
                                                    >
                                                        ✏️
                                                    </button>

                                                    {item.isActive ? (
                                                        <button
                                                            type="button"
                                                            className="evalIconBtn delete"
                                                            onClick={() => eliminarPregunta(item)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="evalIconBtn restore"
                                                            onClick={() => activarPregunta(item)}
                                                        >
                                                            ♻️
                                                        </button>
                                                    )}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                );

            case "importar":
                return (
                    <>
                        <div className="evalCardHeader">
                            <h1 className="evalTitle">Importar / Exportar</h1>
                            <p className="evalMuted">
                                Descarga una plantilla, importa preguntas desde Excel o exporta las
                                preguntas del curso seleccionado.
                            </p>
                        </div>

                        <div className="evalForm">
                            <div className="evalFormGroup">
                                <label>Curso</label>
                                <select
                                    className="evalInput"
                                    value={cursoId}
                                    onChange={(e) => setCursoId(e.target.value)}
                                >
                                    <option value="">Seleccione un curso</option>
                                    {cursos?.map((curso) => (
                                        <option key={curso.id} value={curso.id}>
                                            {getNombreCurso(curso)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="evalImportBox">
                                <h3>📄 Descargar plantilla</h3>
                                <p>
                                    Descarga el formato oficial para cargar preguntas de evaluación.
                                </p>

                                <button
                                    type="button"
                                    className="evalBtnSecondary"
                                    onClick={descargarPlantillaPreguntas}
                                >
                                    Descargar plantilla Excel
                                </button>
                            </div>

                            <div className="evalImportBox">
                                <h3>📥 Importar preguntas desde Excel</h3>
                                <p>
                                    Puede subir un archivo con las columnas: question, category, target,
                                    type, weight, order, isRequired, isActive.
                                </p>

                                <input
                                    className="evalInput"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => setArchivoPreguntas(e.target.files[0])}
                                />

                                <button
                                    type="button"
                                    className="evalBtnPrimary"
                                    onClick={importarPreguntas}
                                >
                                    Importar archivo
                                </button>
                            </div>

                            <div className="evalImportBox">
                                <h3>📤 Exportar preguntas</h3>
                                <p>Descarga las preguntas del curso seleccionado.</p>

                                <button
                                    type="button"
                                    className="evalBtnSecondary"
                                    onClick={exportarPreguntas}
                                >
                                    Exportar Excel
                                </button>
                            </div>
                        </div>
                    </>
                );
            case "resultados":
                return (
                    <>
                        <div className="evalCardHeader">
                            <h1 className="evalTitle">Resultados de evaluación</h1>
                            <p className="evalMuted">
                                Consulte los promedios y respuestas del curso seleccionado.
                            </p>
                        </div>

                        <div className="evalForm">
                            <div className="evalGrid3">
                                <div className="evalFormGroup">
                                    <label>Curso</label>
                                    <select
                                        className="evalInput"
                                        value={cursoId}
                                        onChange={(e) => {
                                            setCursoId(e.target.value);
                                            setResultados(null);
                                        }}
                                    >
                                        <option value="">Seleccione un curso</option>
                                        {cursos?.map((curso) => (
                                            <option key={curso.id} value={curso.id}>
                                                {getNombreCurso(curso)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="evalFormGroup">
                                    <label>Desde</label>
                                    <input
                                        type="date"
                                        className="evalInput"
                                        value={fechaInicio}
                                        onChange={(e) => {
                                            setFechaInicio(e.target.value);
                                            setResultados(null);
                                        }}
                                    />
                                </div>

                                <div className="evalFormGroup">
                                    <label>Hasta</label>
                                    <input
                                        type="date"
                                        className="evalInput"
                                        value={fechaFin}
                                        onChange={(e) => {
                                            setFechaFin(e.target.value);
                                            setResultados(null);
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="button"
                                className="evalBtnPrimary"
                                onClick={cargarResultados}
                                disabled={loadingResultados}
                            >
                                {loadingResultados ? "Cargando..." : "Ver resultados"}
                            </button>

                            {resultados && (
    <button
        type="button"
        className="evalBtnSecondary"
        onClick={descargarReporteResultados}
    >
        Descargar reporte CSV
    </button>
)}

                            

                            {resultados && (
                                <>
                                    <div className="evalStatsGrid">
                                        <div className="evalStatCard">
                                            <span>📝</span>
                                            <h3>{resultados.totalResponses}</h3>
                                            <p>Evaluaciones recibidas</p>
                                        </div>

                                        <div className="evalStatCard">
                                            <span>⭐</span>
                                            <h3>{resultados.averageScore || "N/A"}</h3>
                                            <p>Promedio general</p>
                                        </div>

                                        <div className="evalStatCard">
                                            <span>📚</span>
                                            <h3>{resultados.byTarget?.course || "N/A"}</h3>
                                            <p>Curso</p>
                                        </div>

                                        <div className="evalStatCard">
                                            <span>👨‍🏫</span>
                                            <h3>{resultados.byTarget?.teacher || "N/A"}</h3>
                                            <p>Docente</p>
                                        </div>

                                        <div className="evalStatCard">
                                            <span>💻</span>
                                            <h3>{resultados.byTarget?.platform || "N/A"}</h3>
                                            <p>Plataforma</p>
                                        </div>
                                    </div>

                                    <div className="evalTableWrap">
                                        <h3 className="evalSubtitle">Promedio por pregunta</h3>

                                        <table className="evalTable">
                                            <thead>
                                                <tr>
                                                    <th>Pregunta</th>
                                                    <th>Categoría</th>
                                                    <th>Dirigido a</th>
                                                    <th>Respuestas</th>
                                                    <th>Promedio</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {resultados.questions?.map((item) => (
                                                    <tr key={item.questionId}>
                                                        <td>{item.question}</td>
                                                        <td>{item.category}</td>
                                                        <td>{item.target}</td>
                                                        <td>{item.totalAnswers}</td>
                                                        <td>
                                                            <strong>{item.average || "N/A"}</strong>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {resultados.textAnswers?.length > 0 && (
                                        <div className="evalTableWrap">
                                            <h3 className="evalSubtitle">Respuestas abiertas</h3>

                                            <table className="evalTable">
                                                <thead>
                                                    <tr>
                                                        <th>Pregunta</th>
                                                        <th>Categoría</th>
                                                        <th>Dirigido a</th>
                                                        <th>Respuesta</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {resultados.textAnswers.map((item, index) => (
                                                        <tr key={`${item.questionId}-${index}`}>
                                                            <td>{item.question}</td>
                                                            <td>{item.category}</td>
                                                            <td>{item.target}</td>
                                                            <td>{item.value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="evalPage">
            <button
                className={`evalHamburger ${menuOpen ? "is-open" : ""}`}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <span className="evalHamburgerLine"></span>
                <span className="evalHamburgerLine"></span>
                <span className="evalHamburgerLine"></span>
            </button>

            <div
                className={`evalOverlay ${menuOpen ? "open" : ""}`}
                onClick={closeMenu}
            ></div>

            <div className="evalShell">
                <aside className={`evalMenu ${menuOpen ? "open" : ""}`}>
                    <div className="evalMenuHeader">
                        <img
                            src="/images/idrmind_logo_sf.png"
                            alt="IDRMIND"
                            className="evalMenuLogo"
                        />
                        <p className="evalMenuSubtitle">Evaluación docente</p>
                    </div>

                    {[
                        ["inicio", "Inicio"],
                        ["preguntas", "Banco de preguntas"],
                        ["importar", "Importar / Exportar"],
                        ["resultados", "Resultados"],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            className={`evalMenuBtn ${activeSection === key ? "active" : ""
                                }`}
                            onClick={() => {
                                setActiveSection(key);
                                closeMenu();
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </aside>

                <main className="evalContent">
                    <section className="evalCard">{renderContent()}</section>
                </main>
            </div>
        </div>
    );
};

export default EvaluacionDocente;