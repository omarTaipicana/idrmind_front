import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import "./styles/ValidacionPago.css";
import useCrud from "../hooks/useCrud";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useAuth from "../hooks/useAuth";
import IsLoading from "../components/shared/isLoading";
import { useForm } from "react-hook-form";

const BASEURL = import.meta.env.VITE_API_URL;
const SUPERADMIN = import.meta.env.VITE_CI_SUPERADMIN;

const PATH_PAGOS = "/pagos";

const ValidacionPago = () => {
  const [activeSection, setActiveSection] = useState("resumen");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const hamburgerRef = useRef();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [, , , loggedUser, , , , , , , , , , user, setUserLogged] = useAuth();
  const [pagoDashboard, getPagoDashboard, , , , , isLoading3] = useCrud();
  const [inscripcion, getInscripcion] = useCrud();

  const [showDelete, setShowDelete] = useState(false);
  const [pagoIdDelete, setPagoIdDelete] = useState(null);

  const [showRestaurar, setShowRestaurar] = useState(false);
  const [pagoIdRestaurar, setPagoIdRestaurar] = useState(null);

  const [papelera, setPapelera] = useState(false);

  const [
    pago,
    getPago,
    postPago,
    deletePagPro,
    updatePago,
    error,
    isLoading,
    newReg,
    deleteReg,
    updateReg,
    PagoPdf,
    newPago,
  ] = useCrud();

  const [editPagoId, setEditPagoId] = useState(null);
  const [editValorDepositado, setEditValorDepositado] = useState("");
  const [observacion, setObservacion] = useState("");
  const [editVerificado, setEditVerificado] = useState(false);
  const [editMoneda, setEditMoneda] = useState(false);
  const [editDistintivo, setEditDistintivo] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [editingEntregaId, setEditingEntregaId] = useState(null);

  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroVerificado, setFiltroVerificado] = useState("");
  const [filtroMoneda, setFiltroMoneda] = useState("");
  const [filtroDistintivo, setFiltroDistintivo] = useState("");
  const [filtroGrado, setFiltroGrado] = useState("");
  const [filtroEntregado, setFiltroEntregado] = useState("");

  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  const [filtroCertificado, setFiltroCertificado] = useState("");

  const [ordenFechaDesc, setOrdenFechaDesc] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFiltroGrado(inputValue);
    }, 2000);

    return () => clearTimeout(handler);
  }, [inputValue, setFiltroGrado]);

  useEffect(() => {
    getPago(
      `/pagos?curso=${filtroCurso}&verificado=${filtroVerificado}&moneda=${filtroMoneda}&distintivo=${filtroDistintivo}&entregado=${filtroEntregado}&certificado=${filtroCertificado}&busqueda=${filtroGrado}&fechaInicio=${filtroFechaInicio}&fechaFin=${filtroFechaFin}`
    );
    const socket = io(BASEURL);

    socket.on("pagoActualizado", (pagoActualizado) => {
      getPago(PATH_PAGOS);
    });
    return () => {
      socket.disconnect();
    };
  }, [
    filtroCurso,
    filtroVerificado,
    filtroMoneda,
    filtroDistintivo,
    filtroGrado,
    filtroFechaInicio,
    filtroFechaFin,
    filtroEntregado,
    filtroCertificado,
  ]);

  const pagosActivos = [];
  const pagosEliminados = [];
  const pagosDistintivos = [];

  for (const pagoItem of pago) {
    if (pagoItem.confirmacion) {
      pagosActivos.push(pagoItem);
    } else {
      pagosEliminados.push(pagoItem);
    }
    if (pagoItem.confirmacion && (pagoItem.distintivo || pagoItem.moneda)) {
      pagosDistintivos.push(pagoItem);
    }
  }

  useEffect(() => {
    getPago(PATH_PAGOS);
    getInscripcion("/inscripcion");
    loggedUser();

    getPagoDashboard(`/pagos_dashboard`);
  }, []);

  const iniciarEdicion = (pago) => {
    setEditPagoId(pago.id);
    reset({
      valorDepositado: pago.valorDepositado || "",
      verificado: pago.verificado || false,
      moneda: pago.moneda || false,
      distintivo: pago.distintivo || false,
      observacion: pago.observacion || "",
    });
  };

  const cancelarEdicion = () => {
    setEditPagoId(null);
    setEditValorDepositado("");
    setObservacion("");
    setEditVerificado(false);
    setEditMoneda(false);
    setEditDistintivo(false);
  };

  const guardarEdicion = async (pagoId, data) => {
    try {
      await updatePago(PATH_PAGOS, pagoId, {
        ...data,
        valorDepositado: parseFloat(data.valorDepositado),
        usuarioEdicion: user.email,
      });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
    }
  };

  const deletePagoPr = async (pagoIdDelete) => {
    try {
      await updatePago(PATH_PAGOS, pagoIdDelete, {
        confirmacion: false,
      });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
      setShowDelete(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
    }
  };

  const restaurarPagoPr = async (pagoIdRestaurar) => {
    try {
      await updatePago(PATH_PAGOS, pagoIdRestaurar, {
        confirmacion: true,
      });
      await getPago(PATH_PAGOS);
      cancelarEdicion();
      setShowRestaurar(false);
    } catch (error) {
      alert("Error al guardar los cambios.");
    } finally {
    }
  };

  const getListaCursos = (pago) => {
    const cursosSet = new Set();
    pago.forEach((pago) => {
      if (pago.curso) cursosSet.add(pago.curso);
    });
    return Array.from(cursosSet);
  };
  const listaCursos = getListaCursos(pago);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const ordenarPorFecha = (array) => {
    return [...array].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return ordenFechaDesc ? dateB - dateA : dateA - dateB;
    });
  };
  const pagosOrdenados = ordenarPorFecha(pagosActivos);

  const descargarExcel = () => {
    const pagos = pagosActivos;

    // Preparar datos para Excel
    const datosExcel = pagos.map((p) => {
      return {
        Grado: p?.inscripcion?.user?.grado || "",
        Nombres: p?.inscripcion?.user?.firstName || "",
        Apellidos: p?.inscripcion?.user?.lastName || "",
        Cedula: p?.inscripcion?.user?.cI || "",
        Curso: p.curso || "",
        "Valor Depositado": p.valorDepositado?.toFixed(2) || "0.00",
        Comprobante: p.pagoUrl || "",
        Verificado: p.verificado ? "Sí" : "No",
        Fecha: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
      };
    });

    // Crear libro y hoja
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagos");

    // Generar archivo excel en formato blob
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    // Descargar archivo con nombre
    saveAs(blob, "pagos_filtrados.xlsx");
  };

  const descargarExcelInscripcion = () => {
    // Preparar datos para Excel
const datosExcel = [...inscripcion] // clonamos para no alterar el original
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // orden ascendente
  // .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // orden descendente
  .map((i) => {
    return {
      id: i?.id || "",
      grado: i?.user?.grado || "",
      nombres: i?.user?.firstName || "",
      apellidos: i?.user?.lastName || "",
      cedula: i?.user?.cI || "",
      email: i?.user?.email || "",
      aceptacion: i?.aceptacion || "",
      curso: i?.curso || "",
      userId: i?.userId || "",
      createdAt: i?.createdAt || "",
      updatedAt: i?.updatedAt || "",
      courseId: i?.courseId || "",
      observacion: i?.observacion || "",
      usuarioEdicion: i?.usuarioEdicion || "",
    };
  });


    // Crear libro y hoja
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "inscripcion");

    // Generar archivo excel en formato blob
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });

    // Descargar archivo con nombre
    saveAs(blob, "inscripciones.xlsx");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "resumen":
        if (!pagoDashboard) return <p>Cargando resumen...</p>;

        return (
          <div className="vp-resumen-container">
            <h2>📋 Resumen General</h2>

            {/* Total Pagos vs Total Verificados */}
            <div className="vp-resumen-item">
              <div className="vp-resumen-label">
                Total Pagos vs Total Validados
              </div>
              <div className="vp-resumen-values">
                <span className="vp-total">{pagoDashboard.totalPagosNum}</span>
                <span className="vp-separator">/</span>
                <span className="vp-validated">
                  {pagoDashboard.totalPagosVerificados}
                </span>
              </div>
            </div>

            {/* Total Monedas vs Entregadas */}
            <div className="vp-resumen-item">
              <div className="vp-resumen-label">
                Total Monedas vs Entregadas
              </div>
              <div className="vp-resumen-values">
                <span className="vp-total">
                  {pagoDashboard.conteoDistMoneda?.find(
                    (c) => c.name === "Moneda"
                  )?.value || 0}
                </span>
                <span className="vp-separator">/</span>
                <span className="vp-validated">
                  {pagoDashboard.conteoDistMoneda?.find(
                    (c) => c.name === "Moneda"
                  )?.entregado || 0}
                </span>
              </div>
            </div>

            {/* Total Distintivos vs Entregados */}
            <div className="vp-resumen-item">
              <div className="vp-resumen-label">
                Total Distintivos vs Entregados
              </div>
              <div className="vp-resumen-values">
                <span className="vp-total">
                  {pagoDashboard.conteoDistMoneda?.find(
                    (c) => c.name === "Distintivo"
                  )?.value || 0}
                </span>
                <span className="vp-separator">/</span>
                <span className="vp-validated">
                  {pagoDashboard.conteoDistMoneda?.find(
                    (c) => c.name === "Distintivo"
                  )?.entregado || 0}
                </span>
              </div>
            </div>

            {/* Total Pagos con Distintivo */}
            <div className="vp-resumen-item">
              <div className="vp-resumen-label">Certificados Pagados</div>
              <div className="vp-resumen-values">
                <span className="vp-total">
                  {pagoDashboard.totalPagosDinstint}
                </span>
              </div>
            </div>
          </div>
        );

      case "validarPagos":
        return (
          <div className="vp-validar-pagos-container">
            <div className="vp-filtros">
              <button
                className="vp-btn-clear"
                onClick={() => {
                  setFiltroCurso("");
                  setFiltroVerificado("");
                  setFiltroMoneda("");
                  setFiltroDistintivo("");
                  setFiltroGrado("");
                  setInputValue("");
                  setFiltroFechaInicio("");
                  setFiltroFechaFin("");
                }}
              >
                Eliminar Filtros
              </button>

              {/* Filtro Curso */}
              <div className="vp-filtro">
                <label>Curso:</label>
                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
                  <option value="">Todos</option>
                  {listaCursos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Verificado */}
              <div className="vp-filtro">
                <label>Verificado:</label>
                <select
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              {/* Filtro Moneda */}
              <div className="vp-filtro">
                <label>Moneda:</label>
                <select
                  value={filtroMoneda}
                  onChange={(e) => setFiltroMoneda(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Filtro Distintivo */}
              <div className="vp-filtro">
                <label>Distintivo:</label>
                <select
                  value={filtroDistintivo}
                  onChange={(e) => setFiltroDistintivo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Filtro Grado / Nombres / Apellidos / Cédula */}
              <div className="vp-filtro">
                <label>Grado / Nombres / Apellidos / Cédula:</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Buscar..."
                />
              </div>

              {/* Filtro Fecha Inicio */}
              <div className="vp-filtro">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
              </div>

              {/* Filtro Fecha Fin */}
              <div className="vp-filtro">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
              </div>

              <img
                className="papelera_btn"
                src={`../../../${papelera ? "atras" : "papelera"}.png`}
                alt="Eliminar"
                onClick={() => setPapelera(!papelera)}
              />
            </div>

            {papelera ? (
              <div
                style={{
                  marginBottom: "10px",
                  color: "#0053a0",
                  fontWeight: 600,
                }}
              >
                <p
                  style={{
                    marginBottom: "10px",
                    color: "#f91118ff",
                    fontWeight: 600,
                  }}
                >
                  Mostrando {pagosEliminados.length} registros eliminados
                </p>
              </div>
            ) : (
              <div
                style={{
                  marginBottom: "10px",
                  color: "#0053a0",
                  fontWeight: 600,
                }}
              >
                <p
                  style={{
                    marginBottom: "10px",
                    color: "#0053a0",
                    fontWeight: 600,
                  }}
                >
                  Mostrando {pagosActivos?.length} resultados /{" "}
                  <span style={{ color: "#198754", fontWeight: "bold" }}>
                    {pagosActivos.filter((p) => p.verificado).length} pagos
                    validados
                  </span>
                </p>
              </div>
            )}

            {pagosActivos && pagosActivos.length > 0 ? (
              <div className="vp-tabla-scroll">
                <table className="vp-pagos-table">
                  <thead>
                    <tr>
                      <th>Discente (Grado, Nombres, Apellidos)</th>
                      <th
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => setOrdenFechaDesc((prev) => !prev)}
                        title="Ordenar por fecha"
                      >
                        Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                      </th>
                      <th>Curso</th>
                      <th>Distintivo</th>
                      <th>Moneda</th>
                      <th>Valor Depositado</th>
                      <th>Pago (comprobante)</th>
                      <th>Verificado</th>
                      <th>Observacion</th>
                      <th>Editor</th>

                      <th colSpan={papelera ? 1 : 2}>
                        {papelera ? "Restaurar" : "Acción"}
                      </th>
                    </tr>
                  </thead>
                  {papelera ? (
                    <tbody>
                      {pagosEliminados.map((p) => {
                        const isEditing = editPagoId === p.id;
                        return (
                          <tr key={p.id}>
                            <td>
                              {p
                                ? `${p?.inscripcion?.user?.grado} ${p?.inscripcion?.user?.firstName} ${p?.inscripcion?.user?.lastName}`
                                : "Sin Inscripcion"}
                            </td>
                            <td>
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleDateString()
                                : "-"}
                            </td>
                            <td>{p.curso}</td>
                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editDistintivo}
                                  onChange={(e) =>
                                    setEditDistintivo(e.target.checked)
                                  }
                                />
                              ) : p.distintivo ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editMoneda}
                                  onChange={(e) =>
                                    setEditMoneda(e.target.checked)
                                  }
                                />
                              ) : p.moneda ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editValorDepositado}
                                  onChange={(e) =>
                                    setEditValorDepositado(e.target.value)
                                  }
                                />
                              ) : (
                                `$${p.valorDepositado?.toFixed(2) || "0.00"}`
                              )}
                            </td>
                            <td>
                              {p.pagoUrl ? (
                                <a
                                  href={p.pagoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Ver Comprobante
                                </a>
                              ) : (
                                "No disponible"
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  checked={editVerificado}
                                  onChange={(e) =>
                                    setEditVerificado(e.target.checked)
                                  }
                                />
                              ) : p.verificado ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>
                            <td>
                              {" "}
                              {isEditing ? (
                                <input
                                  value={observacion}
                                  type="text"
                                  onChange={(e) =>
                                    setObservacion(e.target.value)
                                  }
                                />
                              ) : p.observacion ? (
                                p.observacion
                              ) : (
                                "👍"
                              )}
                            </td>
                            <td>
                              {p.usuarioEdicion
                                ? p.usuarioEdicion
                                : "Sin editar"}
                            </td>
                            <td>
                              <img
                                className="restaurar_btn"
                                src="../../../restaurar.png"
                                alt="Eliminar"
                                onClick={() => {
                                  setShowRestaurar(true);
                                  setPagoIdRestaurar(p.id);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  ) : (
                    <tbody>
                      {pagosOrdenados.map((p) => {
                        const isEditing = editPagoId === p.id;
                        return (
                          <tr key={p.id}>
                            <td>
                              {p
                                ? `${p?.inscripcion?.user?.grado} ${p?.inscripcion?.user?.firstName} ${p?.inscripcion?.user?.lastName}`
                                : "Sin Inscripcion"}
                            </td>
                            <td>
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleDateString()
                                : "-"}
                            </td>
                            <td>{p.curso}</td>
                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  {...register("distintivo")}
                                />
                              ) : p.distintivo ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  {...register("moneda")}
                                />
                              ) : p.moneda ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>

                            <td>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  {...register("valorDepositado")}
                                />
                              ) : (
                                `$${p.valorDepositado?.toFixed(2) || "0.00"}`
                              )}
                            </td>
                            <td>
                              {p.pagoUrl ? (
                                <a
                                  href={p.pagoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Ver Comprobante
                                </a>
                              ) : (
                                "No disponible"
                              )}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              {isEditing ? (
                                <input
                                  type="checkbox"
                                  {...register("verificado")}
                                />
                              ) : p.verificado ? (
                                "✅"
                              ) : (
                                "❌"
                              )}
                            </td>
                            <td>
                              {" "}
                              {isEditing ? (
                                <input
                                  type="text"
                                  {...register("observacion")}
                                />
                              ) : p.observacion ? (
                                p.observacion
                              ) : (
                                "👍"
                              )}
                            </td>
                            <td>
                              {p.usuarioEdicion
                                ? p.usuarioEdicion
                                : "Sin editar"}
                            </td>

                            <td>
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleSubmit((data) =>
                                      guardarEdicion(p.id, data)
                                    )}
                                    className="vp-btn-save"
                                  >
                                    Guardar
                                  </button>

                                  <button
                                    onClick={cancelarEdicion}
                                    className="vp-btn-cancel"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => iniciarEdicion(p)}
                                  className="vp-btn-edit"
                                >
                                  Registrar Validación
                                </button>
                              )}
                            </td>

                            <td>
                              <img
                                className="user_icon_btn"
                                src="../../../delete_3.png"
                                alt="Eliminar"
                                onClick={() => {
                                  setShowDelete(true);
                                  setPagoIdDelete(p.id);
                                }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  )}
                </table>
              </div>
            ) : (
              <p>No hay pagos para mostrar.</p>
            )}
          </div>
        );

      case "registrarEntregas":
        return (
          <div className="vp-validar-pagos-container">
            {/* FILTROS */}
            <div className="vp-filtros">
              <button
                className="vp-btn-clear"
                onClick={() => {
                  setFiltroCurso("");
                  setFiltroVerificado("");
                  setFiltroMoneda("");
                  setFiltroDistintivo("");
                  setFiltroGrado("");
                  setInputValue("");
                  setFiltroEntregado("");
                  setFiltroFechaInicio("");
                  setFiltroFechaFin("");
                }}
              >
                Eliminar Filtros
              </button>
              {/* Filtro Curso */}
              <div className="vp-filtro">
                <label>Curso:</label>
                <select
                  value={filtroCurso}
                  onChange={(e) => setFiltroCurso(e.target.value)}
                >
                  <option value="">Todos</option>
                  {listaCursos.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Verificado */}
              <div className="vp-filtro">
                <label>Verificado:</label>
                <select
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              {/* Filtro Moneda */}
              <div className="vp-filtro">
                <label>Moneda:</label>
                <select
                  value={filtroMoneda}
                  onChange={(e) => setFiltroMoneda(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Filtro Distintivo */}
              <div className="vp-filtro">
                <label>Distintivo:</label>
                <select
                  value={filtroDistintivo}
                  onChange={(e) => setFiltroDistintivo(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Filtro Entrega */}

              <div className="vp-filtro">
                <label>Entregado:</label>
                <select
                  value={filtroEntregado}
                  onChange={(e) => setFiltroEntregado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Filtro Grado / Nombres / Apellidos / Cédula */}
              <div className="vp-filtro">
                <label>Grado / Nombres / Apellidos / Cédula:</label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Buscar..."
                />
              </div>

              {/* Filtro Fecha Inicio */}
              <div className="vp-filtro">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
              </div>

              {/* Filtro Fecha Fin */}
              <div className="vp-filtro">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
              </div>
            </div>

            {/* TABLA */}
            <p
              style={{
                marginBottom: "10px",
                color: "#0053a0",
                fontWeight: 600,
              }}
            >
              Mostrando {pagosDistintivos.length} resultados
            </p>

            <div className="vp-tabla-scroll">
              <table className="vp-pagos-table">
                <thead>
                  <tr>
                    <th>Discente</th>
                    <th
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setOrdenFechaDesc((prev) => !prev)}
                      title="Ordenar por fecha"
                    >
                      Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                    </th>
                    <th>Curso</th>
                    <th>Moneda</th>
                    <th>Distintivo</th>
                    <th>Valor Pagado</th>
                    <th>Verificado</th>
                    <th>Comprobante</th>
                    <th>Entregado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosDistintivos.map((p) => {
                    const startEditing = () => {
                      setEditingEntregaId(p.id);
                      // Inicializa formulario con los valores actuales del pago
                      reset({ entregado: p.entregado });
                    };

                    const guardarEntrega = handleSubmit(async (data) => {
                      try {
                        await updatePago(PATH_PAGOS, p.id, {
                          entregado: data.entregado,
                        });
                        await getPago(PATH_PAGOS);
                        setEditingEntregaId(null);
                      } catch (error) {
                        alert("Error al actualizar entrega.");
                      }
                    });

                    return (
                      <tr key={p.id}>
                        <td>
                          {p
                            ? `${p?.inscripcion?.user?.grado} ${p?.inscripcion?.user?.firstName} ${p?.inscripcion?.user?.lastName}`
                            : "Sin Inscripcion"}
                        </td>
                        <td>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{p.curso}</td>
                        <td style={{ textAlign: "center" }}>
                          {p.moneda ? "✅" : "❌"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {p.distintivo ? "✅" : "❌"}
                        </td>
                        <td>{`$${p.valorDepositado?.toFixed(2) || "0.00"}`}</td>
                        <td style={{ textAlign: "center" }}>
                          {p.verificado ? "✅" : "❌"}
                        </td>

                        <td>
                          {p.pagoUrl ? (
                            <a
                              href={p.pagoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver Comprobante
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          {editingEntregaId === p.id ? (
                            <input type="checkbox" {...register("entregado")} />
                          ) : p.entregado ? (
                            "✅"
                          ) : (
                            "❌"
                          )}
                        </td>
                        <td>
                          {editingEntregaId === p.id ? (
                            <>
                              <button
                                onClick={guardarEntrega}
                                className="vp-btn-save"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingEntregaId(null)}
                                className="vp-btn-cancel"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={startEditing}
                              className="vp-btn-edit"
                            >
                              Registrar Entrega
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "listaPagos":
        return (
          <div className="vp-validar-pagos-container">
            <div
              className="vp-filtros"
              style={{
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                display: "flex",
              }}
            >
              {/* Filtro Verificado */}
              <div className="vp-filtro">
                <label>Verificado:</label>
                <select
                  value={filtroVerificado}
                  onChange={(e) => setFiltroVerificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Verificados</option>
                  <option value="false">No Verificados</option>
                </select>
              </div>

              <div className="vp-filtro" style={{ flex: "1 1 150px" }}>
                <label>Certificado:</label>
                <select
                  value={filtroCertificado}
                  onChange={(e) => setFiltroCertificado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="true">Con Certificado</option>
                  <option value="false">Sin Certificado</option>
                </select>
              </div>

              {/* Filtro Fecha Inicio */}
              <div className="vp-filtro">
                <label>Fecha Inicio:</label>
                <input
                  type="date"
                  value={filtroFechaInicio}
                  onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
              </div>

              {/* Filtro Fecha Fin */}
              <div className="vp-filtro">
                <label>Fecha Fin:</label>
                <input
                  type="date"
                  value={filtroFechaFin}
                  onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  setFiltroCurso("");
                  setFiltroVerificado("");
                  setFiltroCertificado("");
                  setFiltroGrado("");
                  setInputValue("");
                  setFiltroFechaInicio("");
                  setFiltroFechaFin("");
                }}
                className="vp-btn-clear"
                style={{ height: "2.5rem", marginLeft: "auto" }}
              >
                Eliminar filtros
              </button>

              {SUPERADMIN === user?.cI && (
                <button
                  onClick={descargarExcel}
                  className="vp-btn-clear"
                  style={{ height: "2.5rem", marginLeft: "auto" }}
                >
                  Descragra Pagos
                </button>
              )}

              {SUPERADMIN === user?.cI && (
                <button
                  onClick={descargarExcelInscripcion}
                  className="vp-btn-clear"
                  style={{ height: "2.5rem", marginLeft: "auto" }}
                >
                  Descragra Inscripciones
                </button>
              )}
            </div>

            <div style={{ fontWeight: 600, margin: "10px 0" }}>
              Total: {pagosActivos.length}
            </div>

            <div className="vp-tabla-scroll">
              <table className="vp-pagos-table">
                <thead>
                  <tr>
                    <th>Grado</th>
                    <th>Nombres</th>
                    <th>Apellidos</th>
                    <th>Cédula</th>
                    <th
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => setOrdenFechaDesc((prev) => !prev)}
                      title="Ordenar por fecha"
                    >
                      Fecha {ordenFechaDesc ? "⬇️" : "⬆️"}
                    </th>
                    <th>Curso</th>
                    <th>Valor Depositado</th>
                    <th>Comprobante</th>
                    <th>Certificado</th>
                    <th>Verificado</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosActivos.map((p) => {
                    return (
                      <tr key={p.id}>
                        <td>{p?.inscripcion?.user?.grado || "-"}</td>
                        <td>{p?.inscripcion?.user?.firstName || "-"}</td>
                        <td>{p?.inscripcion?.user?.lastName || "-"}</td>
                        <td>{p?.inscripcion?.user?.cI || "-"}</td>
                        <td>
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        {/* Fecha */}
                        <td>{p.curso}</td>
                        <td>${p.valorDepositado?.toFixed(2) || "0.00"}</td>
                        <td>
                          {p.pagoUrl ? (
                            <a
                              href={p.pagoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver Comprobante
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>
                        <td>
                          {p?.urlCertificado ? (
                            <a
                              href={p?.urlCertificado}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver Certificado
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {p.verificado ? "✅" : "❌"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "listaInscritos":
        return <p>📋 Pronto tendrás la Lista de Inscritos.</p>;

      default:
        return null;
    }
  };

  return (
    <div>
      {isLoading && <IsLoading />}

      <div className="vp-container">
        <button
          ref={hamburgerRef}
          className="dashboard-hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div
            className={`dashboard-hamburger-inner ${menuOpen ? "open" : ""}`}
          >
            <span className="dashboard-hamburger-line" />
            <span className="dashboard-hamburger-line" />
            <span className="dashboard-hamburger-line" />
          </div>
        </button>

        <nav className={`vp-menu ${menuOpen ? "open" : ""}`} ref={menuRef}>
          <h3>📊 Menú Principal</h3>
          <button
            className={`vp-menu-btn ${
              activeSection === "resumen" ? "active" : ""
            }`}
            onClick={() => setActiveSection("resumen")}
          >
            📋 Resumen General
          </button>
          <button
            className={`vp-menu-btn ${
              activeSection === "validarPagos" ? "active" : ""
            }`}
            onClick={() => setActiveSection("validarPagos")}
          >
            ✅ Validar Pagos
          </button>
          <button
            className={`vp-menu-btn ${
              activeSection === "registrarEntregas" ? "active" : ""
            }`}
            onClick={() => setActiveSection("registrarEntregas")}
          >
            🎁 Registrar Entregas de Distintivos
          </button>
          <button
            className={`vp-menu-btn ${
              activeSection === "listaPagos" ? "active" : ""
            }`}
            onClick={() => setActiveSection("listaPagos")}
          >
            💳 Lista de Pagos
          </button>
          <button
            className={`vp-menu-btn ${
              activeSection === "listaInscritos" ? "active" : ""
            }`}
            onClick={() => setActiveSection("listaInscritos")}
          >
            📋 Lista de Inscritos
          </button>
        </nav>

        <main className="vp-content">{renderContent()}</main>
        {showDelete && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>¿Deseas eliminar el registro?</span>
              <section className="btn_content">
                <button
                  className="btn yes"
                  onClick={() => deletePagoPr(pagoIdDelete)}
                >
                  Sí
                </button>
                <button
                  className="btn no"
                  onClick={() => {
                    setShowDelete(false);
                    setPagoIdDelete();
                  }}
                >
                  No
                </button>
              </section>
            </article>
          </div>
        )}

        {showRestaurar && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>¿Deseas restaurar registro?</span>
              <section className="btn_content">
                <button
                  className="btn yes"
                  onClick={() => restaurarPagoPr(pagoIdRestaurar)}
                >
                  Sí
                </button>
                <button
                  className="btn no"
                  onClick={() => {
                    setShowRestaurar(false);
                    setPagoIdRestaurar();
                  }}
                >
                  No
                </button>
              </section>
            </article>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidacionPago;
