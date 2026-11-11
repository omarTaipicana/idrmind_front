import React, { useEffect, useRef, useState } from "react";
import { getDocument, PDFWorker } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

const pdfUrl = import.meta.env.BASE_URL + "guias/IDRMIND_Red_de_Afiliados.pdf";

export default function AffiliateGuide() {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(1);
  const [renderedPage, setRenderedPage] = useState(0);
  const [error, setError] = useState(false);
  const pages = pdf?.numPages ?? 0;

  useEffect(() => {
    let active = true;
    let port, worker, loading;
    try {
      port = new Worker(workerUrl, { type: "module" });
      worker = new PDFWorker({ port });
      loading = getDocument({ url: pdfUrl, worker });
      loading.promise.then(
        (doc) => { if (active) setPdf(doc); },
        () => { if (active) setError(true); },
      );
    } catch {
      setError(true);
    }
    return () => {
      active = false;
      Promise.resolve(loading?.destroy()).catch(() => {}).finally(() => {
        worker?.destroy();
        port?.terminate();
      });
    };
  }, []);

  useEffect(() => {
    if (!pdf) return;
    let active = true;
    let render;
    async function draw() {
      try {
        const sheet = await pdf.getPage(page);
        if (!active) return;
        const canvas = canvasRef.current;
        const viewport = sheet.getViewport({ scale: 1600 / sheet.getViewport({ scale: 1 }).width });
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        render = sheet.render({ canvasContext: canvas.getContext("2d"), viewport });
        await render.promise;
        if (active) setRenderedPage(page);
      } catch {
        if (active) setError(true);
      }
    }
    draw();
    return () => { active = false; render?.cancel(); };
  }, [pdf, page]);

  const ready = !error && renderedPage === page;

  return (
    <section className="af-welcome__presentation" aria-labelledby="af-presentation-title">
      <div className="af-welcome__presentation-header">
        <div>
          <span className="af-welcome__tag">GUÍA DEL PROGRAMA · {pages || 12} DIAPOSITIVAS</span>
          <h2 id="af-presentation-title">Cómo funciona la red</h2>
        </div>
        <a className="af-welcome__link af-welcome__link--secondary" href={pdfUrl} download>Descargar PDF</a>
      </div>
      <div className="af-welcome__sheet" aria-busy={!error && !ready}>
        <canvas ref={canvasRef} hidden={!ready} role="img" aria-label={`Página ${page} de la guía de afiliados`} />
        {!ready && (
          <p role="status">
            {error ? <>No se pudo mostrar la guía. <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Abrir el PDF</a></> : "Cargando página…"}
          </p>
        )}
      </div>
      <nav className="af-welcome__pagination" aria-label="Páginas de la guía">
        <button className="af-welcome__link af-welcome__link--secondary" type="button" disabled={error || page <= 1} onClick={() => setPage((n) => Math.max(1, n - 1))}>Anterior</button>
        <span aria-live="polite">Página {page} de {pages || "—"}</span>
        <button className="af-welcome__link af-welcome__link--primary" type="button" disabled={error || !pages || page >= pages} onClick={() => setPage((n) => Math.min(pages, n + 1))}>Siguiente</button>
      </nav>
    </section>
  );
}
