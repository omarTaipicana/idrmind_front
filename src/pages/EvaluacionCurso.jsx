import { useEffect, useState } from "react";
import axios from "axios";
import getConfigToken from "../services/getConfigToken";
import { useParams, useLocation } from "react-router-dom";
import "./styles/EvaluacionDocente.css";

const API_URL = import.meta.env.VITE_API_URL;

const EvaluacionCurso = () => {

    const params = useParams();
    const token = params.token;
    const { state } = useLocation();

    const [accessData, setAccessData] = useState({
        userId: state?.userId || null,
        courseId: state?.courseId || null,
        courseName: state?.courseName || "",
        inscripcionId: state?.inscripcionId || params.inscripcionId || null,
    });

    const userId = accessData.userId;
    const courseId = accessData.courseId;
    const courseName = accessData.courseName;
    const inscripcionId = accessData.inscripcionId;



    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [comment, setComment] = useState("");
    const [evaluated, setEvaluated] = useState(false);
    const [loading, setLoading] = useState(false);

    const cargarPreguntas = async () => {
        const res = await axios.get(
            `${API_URL}/evaluation-questions?courseId=${courseId}`,
            getConfigToken()
        );

        setPreguntas(res.data || []);
    };

    const verificarTokenMoodle = async () => {
        if (!token) return;

        try {
            const res = await axios.get(
                `${API_URL}/evaluation-access/verify/${token}`,
                getConfigToken()
            );

            if (!res.data.valid) {
                alert(res.data.message || "Acceso inválido.");
                return;
            }

            setAccessData({
                userId: res.data.userId,
                courseId: res.data.courseId,
                inscripcionId: res.data.inscripcionId,
                courseName:
                    res.data.course?.fullname ||
                    res.data.course?.name ||
                    res.data.course?.nombre ||
                    res.data.course?.sigla ||
                    "",
            });
        } catch (error) {
            console.error(error);
            alert("Token inválido o expirado.");
        }
    };

    useEffect(() => {
        verificarTokenMoodle();
    }, [token]);



    const verificarEvaluacion = async () => {
        const res = await axios.get(
            `${API_URL}/evaluation-responses/check?inscripcionId=${inscripcionId}&target=course`,
            getConfigToken()
        );

        setEvaluated(res.data.evaluated);
    };

    useEffect(() => {
        if (courseId && inscripcionId) {
            cargarPreguntas();
            verificarEvaluacion();
        }
    }, [courseId, inscripcionId]);

    const handleRespuesta = (questionId, value) => {
        setRespuestas({
            ...respuestas,
            [questionId]: value,
        });
    };

    const enviarEvaluacion = async () => {
        const preguntasObligatorias = preguntas.filter((p) => p.isRequired);

        const faltantes = preguntasObligatorias.filter(
            (p) => !respuestas[p.id] || respuestas[p.id] === ""
        );

        if (faltantes.length > 0) {
            alert("Por favor responda todas las preguntas obligatorias.");
            return;
        }

        const answers = preguntas.map((p) => ({
            questionId: p.id,
            value: respuestas[p.id] || "",
        }));

        try {
            setLoading(true);

            await axios.post(
                `${API_URL}/evaluation-responses`,
                {
                    userId,
                    inscripcionId,
                    courseId,
                    target: "course",
                    answers,
                    comment,
                },
                getConfigToken()
            );

            alert("Evaluación enviada correctamente.");
            setEvaluated(true);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error al enviar la evaluación.");
        } finally {
            setLoading(false);
        }
    };

    if (evaluated) {
        return (
            <div className="evalCard">
                <div className="evalEmpty">
                    ✅ Usted ya completó la evaluación de este curso.
                </div>
            </div>
        );
    }


    if (!courseId || !inscripcionId || !userId) {
        return (
            <div className="evalCard">
                <div className="evalEmpty">
                    No se pudo cargar la información de la evaluación.
                </div>
            </div>
        );
    }

    if (preguntas.length === 0) {
        return (
            <div className="evalCard">
                <div className="evalEmpty">
                    No existen preguntas activas para esta evaluación.
                </div>
            </div>
        );
    }

    return (
        <div className="evalCard">
            <div className="evalCardHeader">
                <h1 className="evalTitle">Evaluación del curso</h1>
                {courseName && <p className="evalMuted">{courseName}</p>}
                <p className="evalMuted">
                    Su opinión nos ayuda a mejorar la calidad académica.
                </p>
            </div>

            <div className="evalForm">
                {preguntas.map((pregunta) => (
                    <div className="evalQuestion" key={pregunta.id}>
                        <h3>
                            {pregunta.order}. {pregunta.question}
                            {pregunta.isRequired && " *"}
                        </h3>

                        {pregunta.type === "scale" ? (
                            <div className="evalOptions">
                                {Object.entries(pregunta.scaleLabels || {}).map(([value, label]) => (
                                    <label key={value} className="evalOptionItem">
                                        <input
                                            type="radio"
                                            name={pregunta.id}
                                            value={value}
                                            checked={String(respuestas[pregunta.id]) === String(value)}
                                            onChange={(e) =>
                                                handleRespuesta(pregunta.id, e.target.value)
                                            }
                                        />
                                        <span>{value}</span><p></p>
                                        <small>{label}</small>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                className="evalTextarea"
                                value={respuestas[pregunta.id] || ""}
                                onChange={(e) =>
                                    handleRespuesta(pregunta.id, e.target.value)
                                }
                                placeholder="Escriba su respuesta"
                            />
                        )}
                    </div>
                ))}

                <div className="evalFormGroup">
                    <label>Comentario general opcional</label>
                    <textarea
                        className="evalTextarea"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Escriba un comentario adicional"
                    />
                </div>

                <button
                    type="button"
                    className="evalBtnPrimary"
                    onClick={enviarEvaluacion}
                    disabled={loading}
                >
                    {loading ? "Enviando..." : "Enviar evaluación"}
                </button>
            </div>
        </div>
    );
};

export default EvaluacionCurso;