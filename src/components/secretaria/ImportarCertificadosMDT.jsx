import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ImportarCertificadosMDT.css";

const BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const ROOT = `${BASE}/secretaria/certificados`;
const END = new Set(["completed", "done", "failed", "admin_email_failed", "finished", "error"]);
const phaseNames = {
  queued: "En cola", processing: "Validando y registrando certificados",
  admin_email: "Enviando reporte al administrador", admin_notification: "Enviando reporte al administrador", admin_email_failed: "Falló el correo administrativo",
  notifying: "Enviando notificaciones", completed: "Finalizado", done: "Finalizado",
  failed: "Error", finished: "Finalizado",
};
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem("token") || ""}` });
const percent = (done, total) => total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;

export default function ImportarCertificadosMDT({ courses = [], onImported }) {
  const [tipo, setTipo] = useState("cert_mdt");
  const mountedRef = useRef(true);
  useEffect(()=>{mountedRef.current=true;return()=>{mountedRef.current=false}},[]);
  const [courseId, setCourseId] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [job, setJob] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [error, setError] = useState("");
  const notifiedJobRef = useRef(null);

  // Seguimiento secuencial: nunca acumula intervalos ni peticiones concurrentes.
  // La limpieza cancela las consultas al finalizar, cambiar de trabajo o desmontar.
  useEffect(() => {
    if (!activeJobId) return undefined;
    let cancelled = false;
    let timeoutId;
    let controller;

    const check = async () => {
      controller = new AbortController();
      try {
        const { data } = await axios.get(
          `${ROOT}/importaciones/${encodeURIComponent(activeJobId)}`,
          { headers: auth(), signal: controller.signal, timeout: 20000 }
        );
        if (cancelled) return;
        setJob(data);
        if (END.has(data.phase)) {
          setActiveJobId(null);
          if (["completed", "done", "finished"].includes(data.phase) && notifiedJobRef.current !== activeJobId) {
            notifiedJobRef.current = activeJobId;
            onImported?.();
          }
          return;
        }
        timeoutId = setTimeout(check, 1500);
      } catch (e) {
        if (cancelled || axios.isCancel(e)) return;
        setError(e.response?.data?.message || "No se pudo consultar el progreso de la importación.");
        setActiveJobId(null);
      }
    };
    check();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller?.abort();
    };
  }, [activeJobId]);

  const start = async (e) => {
    e.preventDefault();
    if (!courseId || !file || uploading || (job && !END.has(job.phase))) return;
    if (!/\.zip$/i.test(file.name)) { setError("Seleccione un archivo ZIP."); return; }
    setError(""); setJob(null); setActiveJobId(null); setUploadPercent(0); setUploading(true);
    const form = new FormData();
    form.append("tipo", tipo);
    form.append("courseId", courseId);
    form.append("zip", file);
    try {
      const { data } = await axios.post(`${ROOT}/importar`, form, {
        headers: auth(),
        onUploadProgress: (ev) => {
          if (ev.total) setUploadPercent(percent(ev.loaded, ev.total));
        },
      });
      setUploadPercent(100);
      setJob(data);
      if (!data?.id) throw new Error("El backend no devolvió el identificador de importación.");
      setActiveJobId(data.id);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "No se pudo iniciar la importación de certificados.");
    } finally { if (mountedRef.current) setUploading(false); }
  };

  const processing = !!activeJobId && (!job || !END.has(job.phase));
  const results = Array.isArray(job?.results) ? job.results : [];
  const registered = results.filter(r => r.estado === "registrado").length;
  const duplicates = results.filter(r => r.estado === "duplicado").length;
  const rejected = results.filter(r => r.estado === "rechazado").length;
  const total = Number(job?.total) || 0;
  const processed = Number(job?.processed) || 0;
  const notified = Number(job?.notified) || 0;
  const toNotify = Number(job?.toNotify) || 0;

  return (
    <section className="mdtImporter" aria-label="Importación de certificados">
      <div className="mdtImporter__heading">
        <h3>Importar certificados</h3>
        <p>Seleccione Ministerio o Internacional, el curso y un ZIP con los PDF. Se verifican matrícula, aprobación académica y pago validado o cupón para el tipo elegido. Un descuento parcial requiere validar el pago del saldo.</p>
      </div>
      <form onSubmit={start} className="mdtImporter__form">
        <label>Tipo de certificado
          <select value={tipo} onChange={e=>{setTipo(e.target.value);setCourseId("");setFile(null);setJob(null);setError("");}} disabled={uploading || processing} required>
            <option value="cert_mdt">Ministerio de Trabajo</option><option value="cert_int">Internacional</option>
          </select>
        </label>
        <label>Curso
          <select value={courseId} onChange={e => {setCourseId(e.target.value);setFile(null);}} disabled={uploading || processing} required>
            <option value="">Seleccione un curso</option>
            {courses.filter(c => c.tipo !== "test_psicotecnico").map(c => (
              <option key={c.id} value={c.id}>{c.nombre || c.fullname || c.sigla} {c.sigla ? `(${c.sigla})` : ""}</option>
            ))}
          </select>
        </label>
        <label>Archivo comprimido (.zip)
          <input key={`${tipo}-${courseId}`} type="file" accept=".zip,application/zip,application/x-zip-compressed" onChange={e => setFile(e.target.files?.[0] || null)} disabled={!courseId || uploading || processing} required />
        </label>
        <button type="submit" disabled={!courseId || !file || uploading || processing}>{uploading ? "Subiendo ZIP…" : processing ? "Procesando…" : "Importar certificados"}</button>
      </form>
      {(uploading || job) && (
        <div className="mdtImporter__progress" aria-live="polite">
          <Progress label="Transferencia del ZIP" value={uploadPercent} />
          {job && <>
            <p><strong>Estado:</strong> {phaseNames[job.phase] || job.phase}</p>
            <Progress label={`Validación y registro (${processed}/${total})`} value={percent(processed, total)} />
            <Progress label={`Correos a participantes (${notified}/${toNotify})`} value={percent(notified, toNotify)} />
            <p>Registrados: <strong>{registered}</strong> · Duplicados: <strong>{duplicates}</strong> · Rechazados: <strong>{rejected}</strong></p>
            {job.adminEmailSent && <p>✓ Reporte enviado al administrador.</p>}
            {job.adminEmailError && <p className="mdtImporter__error">Error de correo administrativo: {job.adminEmailError}. No se iniciarán las notificaciones.</p>}
            {job.error && <p className="mdtImporter__error">{job.error}</p>}
            {results.length > 0 && <div className="mdtImporter__tableWrap"><table><thead><tr><th>Archivo</th><th>Cédula</th><th>Participante</th><th>Resultado</th><th>Motivo</th></tr></thead><tbody>
              {results.map((r, i) => <tr key={`${r.archivo}-${i}`}><td>{r.archivo}</td><td>{r.cedula || "—"}</td><td>{r.participante || "—"}</td><td>{r.estado}</td><td>{r.motivo || "—"}</td></tr>)}
            </tbody></table></div>}
          </>}
        </div>
      )}
      {error && <p role="alert" className="mdtImporter__error">{error}</p>}
    </section>
  );
}
function Progress({ label, value }) {
  return <div className="mdtImporter__meter"><div className="mdtImporter__meterTitle"><span>{label}</span><strong>{value}%</strong></div><progress max="100" value={value} /></div>;
}
