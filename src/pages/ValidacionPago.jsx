import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

import "./styles/ValidacionPago.css";

import useCrud from "../hooks/useCrud";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import useAuth from "../hooks/useAuth";

import IsLoading from "../components/shared/isLoading";

import { useForm } from "react-hook-form";

import { useDispatch } from "react-redux";

import { showAlert } from "../store/states/alert.slice";

import axios from "axios";

import getConfigToken from "../services/getConfigToken";

const urlBase =
  import.meta.env.VITE_API_URL;

const BASEURL =
  import.meta.env.VITE_API_URL;

const SUPERADMIN =
  import.meta.env.VITE_CI_SUPERADMIN;

const PATH_PAGOS = "/pagos";
const PATH_VARIABLES = "/variables";

const ValidacionPago = () => {
  /* =========================================================
     NAVEGACIÓN
  ========================================================= */

  const [
    activeSection,
    setActiveSection,
  ] = useState("resumen");

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);




  const menuRef = useRef();

  const contentRef = useRef(null);

  const scrollPosRef =
    useRef(0);

  const lastClickedRef =
    useRef(null);

  const hamburgerRef =
    useRef();

  /* =========================================================
     REDUX / FORM
  ========================================================= */

  const dispatch =
    useDispatch();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  /* =========================================================
     AUTH
  ========================================================= */

  const [
    ,
    ,
    ,
    loggedUser,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    user,
  ] = useAuth();

  /* =========================================================
     CRUD
  ========================================================= */

  const [
    pagoDashboard,
    getPagoDashboard,
  ] = useCrud();

  const [
    inscripcion,
    getInscripcion,
  ] = useCrud();

  const [
    variables,
    getVariables,
  ] = useCrud();

  const [
    pago,
    getPago,
    ,
    ,
    updatePago,
    error,
    isLoading,
  ] = useCrud();

  /* =========================================================
     MODALES
  ========================================================= */

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);

  const [
    pagoIdDelete,
    setPagoIdDelete,
  ] = useState(null);

  const [
    showRestaurar,
    setShowRestaurar,
  ] = useState(false);

  const [
    pagoIdRestaurar,
    setPagoIdRestaurar,
  ] = useState(null);



  /* =========================================================
     FACTURACIÓN
  ========================================================= */

  const [
    isEmitiendoFactura,
    setIsEmitiendoFactura,
  ] = useState(false);

  const [
    facturandoPagoId,
    setFacturandoPagoId,
  ] = useState(null);

  const [
    generaFactura,
    setGeneraFactura,
  ] = useState();

  /* =========================================================
     RESULTADO PSICOMÉTRICO
  ========================================================= */

  const [
    generandoResultadoId,
    setGenerandoResultadoId,
  ] = useState(null);

  /* =========================================================
   MODAL RESULTADO PSICOMÉTRICO
========================================================= */

  const [
    showResultadoModal,
    setShowResultadoModal,
  ] = useState(false);

  const [
    resultadoModalPago,
    setResultadoModalPago,
  ] = useState(null);

  const [
    resultadoModalStatus,
    setResultadoModalStatus,
  ] = useState("confirm");

  /*
   * confirm
   * success
   * error
   * alreadySent
   */

  const [
    resultadoModalMessage,
    setResultadoModalMessage,
  ] = useState("");

  const [
    resultadoModalFecha,
    setResultadoModalFecha,
  ] = useState(null);

  /* =========================================================
     PAGO / EDICIÓN
  ========================================================= */

  const [
    papelera,
    setPapelera,
  ] = useState(false);

  const [
    editPagoId,
    setEditPagoId,
  ] = useState(null);

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    editVerificado,
    setEditVerificado,
  ] = useState(false);

  const [
    verificadoOriginal,
    setVerificadoOriginal,
  ] = useState(false);

  const [
    inputValue,
    setInputValue,
  ] = useState("");

  const [
    editingEntregaId,
    setEditingEntregaId,
  ] = useState(null);

  /* =========================================================
     FILTROS
  ========================================================= */

  const [
    filtroCurso,
    setFiltroCurso,
  ] = useState("");

  const [
    filtroVerificado,
    setFiltroVerificado,
  ] = useState("");

  const [
    filtroMoneda,
    setFiltroMoneda,
  ] = useState("");

  const [
    filtroDistintivo,
    setFiltroDistintivo,
  ] = useState("");

  const [
    filtroGrado,
    setFiltroGrado,
  ] = useState("");

  const [
    filtroEntregado,
    setFiltroEntregado,
  ] = useState("");

  const [
    filtroFechaInicio,
    setFiltroFechaInicio,
  ] = useState("");

  const [
    filtroFechaFin,
    setFiltroFechaFin,
  ] = useState("");

  const [
    filtroCertificado,
    setFiltroCertificado,
  ] = useState("");

  const [
    ordenFechaDesc,
    setOrdenFechaDesc,
  ] = useState(true);

  /* =========================================================
     SCROLL
  ========================================================= */

  const getScroller = () => {
    const el =
      contentRef.current;

    if (!el) {
      return window;
    }

    const st =
      getComputedStyle(el);

    const overflowY =
      st.overflowY;

    const canScroll =
      (
        overflowY === "auto" ||
        overflowY === "scroll"
      ) &&
      el.scrollHeight >
      el.clientHeight + 2;

    return canScroll
      ? el
      : window;
  };

  const saveScroll = () => {
    const scroller =
      getScroller();

    scrollPosRef.current =
      scroller === window
        ? window.scrollY
        : scroller.scrollTop;
  };

  const SCROLL_OFFSET =
    -100;

  const restoreScroll = () => {
    const scroller =
      getScroller();

    const top = Math.max(
      0,
      scrollPosRef.current -
      SCROLL_OFFSET,
    );

    if (
      scroller === window
    ) {
      window.scrollTo(
        0,
        top,
      );
    } else {
      scroller.scrollTop =
        top;
    }
  };

  /* =========================================================
     ALERTA FACTURACIÓN
  ========================================================= */

  useEffect(() => {
    if (generaFactura) {
      const message =
        generaFactura.message ??
        "Error inesperado";

      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 2,
        }),
      );
    }
  }, [
    generaFactura,
    dispatch,
  ]);

  /* =========================================================
     ALERTA CRUD
  ========================================================= */

  useEffect(() => {
    if (error) {
      const message =
        error.response?.data
          ?.message ??
        "Error inesperado";

      dispatch(
        showAlert({
          message: `⚠️ ${message}`,
          alertType: 1,
        }),
      );
    }
  }, [
    error,
    dispatch,
  ]);

  /* =========================================================
     DEBOUNCE BÚSQUEDA
  ========================================================= */

  useEffect(() => {
    const handler =
      setTimeout(
        () =>
          setFiltroGrado(
            inputValue,
          ),
        2000,
      );

    return () =>
      clearTimeout(
        handler,
      );
  }, [inputValue]);

  /* =========================================================
     RESTAURAR SCROLL AL EDITAR
  ========================================================= */

  useLayoutEffect(() => {
    if (
      editPagoId == null
    ) {
      return;
    }

    requestAnimationFrame(
      () => {
        requestAnimationFrame(
          () => {
            restoreScroll();

            if (
              lastClickedRef
                .current?.focus
            ) {
              try {
                lastClickedRef.current.focus(
                  {
                    preventScroll:
                      true,
                  },
                );
              } catch {
                lastClickedRef.current.focus();
              }
            }
          },
        );
      },
    );
  }, [editPagoId]);

  /* =========================================================
     CARGA PAGOS + SOCKET
  ========================================================= */

  useEffect(() => {
    getPago(
      `/pagos?curso=${filtroCurso}` +
      `&verificado=${filtroVerificado}` +
      `&moneda=${filtroMoneda}` +
      `&distintivo=${filtroDistintivo}` +
      `&entregado=${filtroEntregado}` +
      `&certificado=${filtroCertificado}` +
      `&busqueda=${filtroGrado}` +
      `&fechaInicio=${filtroFechaInicio}` +
      `&fechaFin=${filtroFechaFin}`,
    );

    const socket =
      io(BASEURL);

    socket.on(
      "pagoActualizado",
      () =>
        getPago(PATH_PAGOS),
    );

    socket.on(
      "resultadoPsicometricoGenerado",
      () =>
        getPago(PATH_PAGOS),
    );

    return () =>
      socket.disconnect();
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

  /* =========================================================
     CLASIFICAR PAGOS
  ========================================================= */

  const pagosActivos = [];
  const pagosEliminados = [];
  const pagosDistintivos = [];

  for (
    const pagoItem
    of Array.isArray(pago)
      ? pago
      : []
  ) {
    if (
      pagoItem.confirmacion
    ) {
      pagosActivos.push(
        pagoItem,
      );
    } else {
      pagosEliminados.push(
        pagoItem,
      );
    }

    if (
      pagoItem.confirmacion &&
      (
        pagoItem.distintivo ||
        pagoItem.moneda
      )
    ) {
      pagosDistintivos.push(
        pagoItem,
      );
    }
  }

  /* =========================================================
     CARGA INICIAL
  ========================================================= */

  useEffect(() => {
    getPago(PATH_PAGOS);

    getVariables(
      PATH_VARIABLES,
    );

    getInscripcion(
      "/inscripcion",
    );

    loggedUser();

    getPagoDashboard(
      "/pagos_dashboard",
    );
  }, []);

  /* =========================================================
     INICIAR EDICIÓN
  ========================================================= */

  const iniciarEdicion = (
    p,
    e,
  ) => {
    lastClickedRef.current =
      e?.currentTarget ||
      null;

    saveScroll();

    setEditPagoId(p.id);

    setVerificadoOriginal(
      !!p.verificado,
    );

    reset({
      valorDepositado:
        p.valorDepositado ||
        "",

      entidad:
        p.entidad || "",

      idDeposito:
        p.idDeposito || "",

      verificado:
        !!p.verificado,

      moneda:
        !!p.moneda,

      distintivo:
        !!p.distintivo,

      observacion:
        p.observacion || "",
    });
  };

  const cancelarEdicion = () => {
    setEditPagoId(null);
    setObservacion("");
    setEditVerificado(
      false,
    );
  };

  /* =========================================================
     GUARDAR EDICIÓN
  ========================================================= */

  const guardarEdicion = async (pagoId, data) => {
    try {
      const entidad = String(
        data.entidad || ""
      ).trim();

      const idDeposito = String(
        data.idDeposito || ""
      ).trim();

      /*
       * Si se intenta VALIDAR el pago,
       * Entidad e Id Pago son obligatorios.
       */
      if (data.verificado) {
        if (!entidad) {
          dispatch(
            showAlert({
              message:
                "⚠️ Debes seleccionar la entidad antes de validar el pago.",
              alertType: 1,
            })
          );

          return;
        }

        if (!idDeposito) {
          dispatch(
            showAlert({
              message:
                "⚠️ Debes ingresar el Id Pago antes de validar el pago.",
              alertType: 1,
            })
          );

          return;
        }
      }

      await updatePago(
        PATH_PAGOS,
        pagoId,
        {
          ...data,

          entidad,
          idDeposito,

          valorDepositado:
            parseFloat(
              data.valorDepositado
            ),

          usuarioEdicion:
            user?.email || "",
        }
      );

      await getPago(
        PATH_PAGOS
      );

      cancelarEdicion();
    } catch (error) {
      console.error(
        "Error al guardar pago:",
        error
      );

      dispatch(
        showAlert({
          message:
            "❌ Error al guardar los cambios.",
          alertType: 1,
        })
      );
    }
  };

  /* =========================================================
     ELIMINAR
  ========================================================= */

  const deletePagoPr =
    async (id) => {
      try {
        await updatePago(
          PATH_PAGOS,
          id,
          {
            confirmacion:
              false,
          },
        );

        await getPago(
          PATH_PAGOS,
        );

        cancelarEdicion();

        setShowDelete(
          false,
        );
      } catch (error) {
        alert(
          "Error al guardar los cambios.",
        );
      }
    };

  /* =========================================================
     RESTAURAR
  ========================================================= */

  const restaurarPagoPr =
    async (id) => {
      try {
        await updatePago(
          PATH_PAGOS,
          id,
          {
            confirmacion:
              true,
          },
        );

        await getPago(
          PATH_PAGOS,
        );

        cancelarEdicion();

        setShowRestaurar(
          false,
        );
      } catch (error) {
        alert(
          "Error al guardar los cambios.",
        );
      }
    };

  /* =========================================================
     LISTA CURSOS
  ========================================================= */

  const getListaCursos = (
    arr,
  ) => {
    const cursosSet =
      new Set();

    arr.forEach((p) => {
      if (p.curso) {
        cursosSet.add(
          p.curso,
        );
      }
    });

    return Array.from(
      cursosSet,
    );
  };

  const listaCursos =
    getListaCursos(
      Array.isArray(pago)
        ? pago
        : [],
    );

  /* =========================================================
     CERRAR MENU MOBILE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside =
      (event) => {
        if (
          menuOpen &&
          menuRef.current &&
          !menuRef.current.contains(
            event.target,
          ) &&
          hamburgerRef.current &&
          !hamburgerRef.current.contains(
            event.target,
          )
        ) {
          setMenuOpen(
            false,
          );
        }
      };

    if (menuOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside,
      );
    }

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, [menuOpen]);

  /* =========================================================
     ORDENAR FECHA
  ========================================================= */

  const ordenarPorFecha = (
    array,
  ) => {
    return [...array].sort(
      (a, b) => {
        const dateA =
          new Date(
            a.createdAt,
          );

        const dateB =
          new Date(
            b.createdAt,
          );

        return ordenFechaDesc
          ? dateB - dateA
          : dateA - dateB;
      },
    );
  };

  const pagosOrdenados =
    ordenarPorFecha(
      pagosActivos,
    );

  /* =========================================================
     EXCEL PAGOS
  ========================================================= */

  const descargarExcel =
    () => {
      const datosExcel =
        pagosActivos.map(
          (p) => ({
            Grado:
              p?.inscripcion
                ?.user
                ?.grado || "",

            Nombres:
              p?.inscripcion
                ?.user
                ?.firstName ||
              "",

            Apellidos:
              p?.inscripcion
                ?.user
                ?.lastName ||
              "",

            Cedula:
              p?.inscripcion
                ?.user?.cI ||
              "",

            Curso:
              p.curso || "",

            "Valor Depositado":
              p.valorDepositado ||
              "0.00",

            Comprobante:
              p.pagoUrl || "",

            Verificado:
              p.verificado
                ? "Sí"
                : "No",

            Fecha:
              p.createdAt
                ? new Date(
                  p.createdAt,
                ).toLocaleDateString()
                : "",

            Email:
              p?.inscripcion
                ?.user?.email ||
              "",

            Celular:
              p?.inscripcion
                ?.user
                ?.cellular ||
              "",
          }),
        );

      const ws =
        XLSX.utils.json_to_sheet(
          datosExcel,
        );

      const wb =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "Pagos",
      );

      const wbout =
        XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
        });

      const blob =
        new Blob(
          [wbout],
          {
            type:
              "application/octet-stream",
          },
        );

      saveAs(
        blob,
        "pagos_filtrados.xlsx",
      );
    };

  /* =========================================================
     EXCEL INSCRIPCIONES
  ========================================================= */

  const descargarExcelInscripcion =
    () => {
      const datosExcel = [
        ...inscripcion,
      ]
        .sort(
          (a, b) =>
            new Date(
              a.createdAt,
            ) -
            new Date(
              b.createdAt,
            ),
        )
        .map((i) => ({
          id: i?.id || "",

          grado:
            i?.user?.grado ||
            "",

          nombres:
            i?.user
              ?.firstName ||
            "",

          apellidos:
            i?.user
              ?.lastName ||
            "",

          cedula:
            i?.user?.cI ||
            "",

          email:
            i?.user?.email ||
            "",

          aceptacion:
            i?.aceptacion ||
            "",

          curso:
            i?.curso || "",

          userId:
            i?.userId || "",

          createdAt:
            i?.createdAt ||
            "",

          updatedAt:
            i?.updatedAt ||
            "",

          courseId:
            i?.courseId ||
            "",

          observacion:
            i?.observacion ||
            "",

          usuarioEdicion:
            i?.usuarioEdicion ||
            "",
        }));

      const ws =
        XLSX.utils.json_to_sheet(
          datosExcel,
        );

      const wb =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        "inscripcion",
      );

      const wbout =
        XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
        });

      const blob =
        new Blob(
          [wbout],
          {
            type:
              "application/octet-stream",
          },
        );

      saveAs(
        blob,
        "inscripciones.xlsx",
      );
    };

  /* =========================================================
     FACTURACIÓN
  ========================================================= */

  const emitirFacturaManual =
    async (pagoId) => {
      try {
        if (
          isEmitiendoFactura
        ) {
          return;
        }

        setIsEmitiendoFactura(
          true,
        );

        setFacturandoPagoId(
          pagoId,
        );

        const { data } =
          await axios.post(
            `${urlBase}/contifico/factura/emitir-manual`,
            {
              pagoId,
            },
          );

        setGeneraFactura(
          data,
        );

        getPago(
          PATH_PAGOS,
        );
      } catch (e) {
        console.error(
          "Error emitir factura:",
          e.response?.data ||
          e.message,
        );
      } finally {
        setIsEmitiendoFactura(
          false,
        );

        setFacturandoPagoId(
          null,
        );
      }
    };

  const getFacturaUI = (
    p,
  ) => {
    if (
      !p.contificoDocumentoId
    ) {
      return {
        type: "emitir",
        label:
          "Emitir factura",
      };
    }

    if (
      p.contificoAutorizacion
    ) {
      return {
        type: "ver",

        label:
          "Ver factura",

        href:
          p.contificoUrlRide ||
          p.contificoUrlXml,
      };
    }

    return {
      type: "pendiente",
      label: "Pendiente SRI",
    };
  };

  /* =========================================================
     LIMPIAR FILTROS
  ========================================================= */

  const limpiarFiltrosBase =
    () => {
      setFiltroCurso("");
      setFiltroVerificado("");
      setFiltroMoneda("");
      setFiltroDistintivo("");
      setFiltroGrado("");
      setInputValue("");
      setFiltroEntregado("");
      setFiltroFechaInicio("");
      setFiltroFechaFin("");
      setFiltroCertificado("");
    };

  /* =========================================================
     CERTIFICAR
  ========================================================= */

  const handleCertificar =
    async (id) => {
      if (!id) {
        dispatch(
          showAlert({
            message:
              "❌ No se pudo obtener el ID del pago",

            alertType: 1,
          }),
        );

        return;
      }

      const ok =
        window.confirm(
          "🎓 Estás a punto de generar el certificado oficial de este participante.\n\n" +
          "Una vez emitido, el certificado quedará registrado en el sistema y será enviado al usuario.\n\n" +
          "¿Deseas continuar?",
        );

      if (!ok) {
        return;
      }

      try {
        await axios.post(
          `${urlBase}/pagos/${id}/certificado`,
          {},
          getConfigToken(),
        );

        dispatch(
          showAlert({
            message:
              "✅ Certificado generado y enviado correctamente",

            alertType: 2,
          }),
        );

        getPago(
          PATH_PAGOS,
        );
      } catch (error) {
        console.error(
          "Error certificando:",
          error,
        );

        console.error(
          "Respuesta backend:",
          error?.response?.data,
        );

        dispatch(
          showAlert({
            message:
              error?.response
                ?.data
                ?.message ||
              "❌ Error al generar certificado",

            alertType: 1,
          }),
        );
      }
    };

  /* =========================================================
     GENERAR RESULTADO PSICOMÉTRICO
  ========================================================= */

  /* =========================================================
     SOLICITAR GENERAR RESULTADO PSICOMÉTRICO
  ========================================================= */

  const handleGenerarResultado = (p) => {
    if (!p?.id) {
      setResultadoModalPago(null);

      setResultadoModalStatus(
        "error"
      );

      setResultadoModalMessage(
        "No se pudo obtener el ID del pago."
      );

      setShowResultadoModal(
        true
      );

      return;
    }

    if (
      p.tipoPago !==
      "test_psicometrico" ||
      !p.psychometricEvaluationId
    ) {
      setResultadoModalPago(
        p
      );

      setResultadoModalStatus(
        "error"
      );

      setResultadoModalMessage(
        "Este pago no corresponde a una evaluación psicométrica válida."
      );

      setShowResultadoModal(
        true
      );

      return;
    }

    if (!p.verificado) {
      setResultadoModalPago(
        p
      );

      setResultadoModalStatus(
        "error"
      );

      setResultadoModalMessage(
        "Primero debes validar el pago antes de generar el resultado."
      );

      setShowResultadoModal(
        true
      );

      return;
    }

    /*
     * Abrimos modal profesional
     * de confirmación.
     */
    setResultadoModalPago(
      p
    );

    setResultadoModalStatus(
      "confirm"
    );

    setResultadoModalMessage(
      ""
    );

    setResultadoModalFecha(
      null
    );

    setShowResultadoModal(
      true
    );
  };

  /* =========================================================
   CONFIRMAR GENERACIÓN DE RESULTADO
========================================================= */

  const confirmarGenerarResultado =
    async () => {
      const p =
        resultadoModalPago;

      if (!p?.id) {
        return;
      }

      try {
        setGenerandoResultadoId(
          p.id
        );

        setResultadoModalStatus(
          "processing"
        );

        setResultadoModalMessage(
          "Generando el resultado psicométrico..."
        );

        const { data } =
          await axios.post(
            `${urlBase}/pagos/${p.id}/resultado-psicometrico`,
            {},
            getConfigToken()
          );

        /* ===============================================
           ÉXITO
        =============================================== */

        setResultadoModalStatus(
          "success"
        );

        setResultadoModalMessage(
          data?.message ||
          "El resultado psicométrico fue generado y enviado correctamente."
        );

        /* ===============================================
           REFRESCAR LISTADO
        =============================================== */

        await getPago(
          `/pagos?curso=${filtroCurso}` +
          `&verificado=${filtroVerificado}` +
          `&moneda=${filtroMoneda}` +
          `&distintivo=${filtroDistintivo}` +
          `&entregado=${filtroEntregado}` +
          `&certificado=${filtroCertificado}` +
          `&busqueda=${filtroGrado}` +
          `&fechaInicio=${filtroFechaInicio}` +
          `&fechaFin=${filtroFechaFin}`
        );
      } catch (error) {
        console.error(
          "Error generando resultado psicométrico:",
          error?.response?.data ||
          error
        );

        const backendData =
          error?.response?.data;

        /* ===============================================
           YA ENVIADO
        =============================================== */

        if (
          backendData?.alreadySent
        ) {
          const fecha =
            backendData
              ?.resultadoEmailEnviadoAt
              ? new Date(
                backendData
                  .resultadoEmailEnviadoAt
              ).toLocaleString(
                "es-EC"
              )
              : null;

          setResultadoModalStatus(
            "alreadySent"
          );

          setResultadoModalFecha(
            fecha
          );

          setResultadoModalMessage(
            "El resultado psicométrico ya fue generado y enviado anteriormente."
          );

          return;
        }

        /* ===============================================
           ERROR
        =============================================== */

        setResultadoModalStatus(
          "error"
        );

        setResultadoModalMessage(
          backendData?.message ||
          "No se pudo generar el resultado psicométrico."
        );
      } finally {
        setGenerandoResultadoId(
          null
        );
      }
    };


  /* =========================================================
 CERRAR MODAL RESULTADO
========================================================= */

  const cerrarResultadoModal =
    () => {
      if (
        generandoResultadoId
      ) {
        return;
      }

      setShowResultadoModal(
        false
      );

      setResultadoModalPago(
        null
      );

      setResultadoModalStatus(
        "confirm"
      );

      setResultadoModalMessage(
        ""
      );

      setResultadoModalFecha(
        null
      );
    };

  /* =========================================================
     RENDER
  ========================================================= */

  const renderContent = () => {
    switch (
    activeSection
    ) {
      /* =====================================================
         RESUMEN
      ===================================================== */

      case "resumen":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">
                📋 Resumen General
              </h2>
            </div>

            {!pagoDashboard ? (
              <p className="secEmpty">
                Cargando resumen...
              </p>
            ) : (
              <div className="vpResumenGrid">
                <div className="vpStatCard">
                  <div className="vpStatLabel">
                    Total Pagos /
                    Validados
                  </div>

                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {
                        pagoDashboard.totalPagosNum
                      }
                    </span>

                    <span className="vpStatSep">
                      /
                    </span>

                    <span className="vpStatOk">
                      {
                        pagoDashboard.totalPagosVerificados
                      }
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">
                    Monedas /
                    Entregadas
                  </div>

                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) =>
                          c.name ===
                          "Moneda",
                      )?.value ||
                        0}
                    </span>

                    <span className="vpStatSep">
                      /
                    </span>

                    <span className="vpStatOk">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) =>
                          c.name ===
                          "Moneda",
                      )?.entregado ||
                        0}
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">
                    Distintivos /
                    Entregados
                  </div>

                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) =>
                          c.name ===
                          "Distintivo",
                      )?.value ||
                        0}
                    </span>

                    <span className="vpStatSep">
                      /
                    </span>

                    <span className="vpStatOk">
                      {pagoDashboard.conteoDistMoneda?.find(
                        (c) =>
                          c.name ===
                          "Distintivo",
                      )?.entregado ||
                        0}
                    </span>
                  </div>
                </div>

                <div className="vpStatCard">
                  <div className="vpStatLabel">
                    Certificados pagados
                  </div>

                  <div className="vpStatValue">
                    <span className="vpStatMain">
                      {
                        pagoDashboard.totalPagosDinstint
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        );

      /* =====================================================
         VALIDAR PAGOS
      ===================================================== */

      case "validarPagos":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">
                ✅ Validar Pagos
              </h2>
            </div>

            <div className="secFilters vpFiltersRow">
              <button
                className="secBtnDanger"
                onClick={
                  limpiarFiltrosBase
                }
                type="button"
              >
                ❌ Eliminar filtros
              </button>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Curso
                </label>

                <select
                  className="secInput"
                  value={
                    filtroCurso
                  }
                  onChange={(e) =>
                    setFiltroCurso(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  {listaCursos.map(
                    (c) => (
                      <option
                        key={c}
                        value={c}
                      >
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Verificado
                </label>

                <select
                  className="secInput"
                  value={
                    filtroVerificado
                  }
                  onChange={(e) =>
                    setFiltroVerificado(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Verificados
                  </option>

                  <option value="false">
                    No Verificados
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Moneda
                </label>

                <select
                  className="secInput"
                  value={
                    filtroMoneda
                  }
                  onChange={(e) =>
                    setFiltroMoneda(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Sí
                  </option>

                  <option value="false">
                    No
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Distintivo
                </label>

                <select
                  className="secInput"
                  value={
                    filtroDistintivo
                  }
                  onChange={(e) =>
                    setFiltroDistintivo(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Sí
                  </option>

                  <option value="false">
                    No
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Nombres /
                  Apellidos /
                  Cédula
                </label>

                <input
                  className="secInput"
                  type="text"
                  value={
                    inputValue
                  }
                  onChange={(e) =>
                    setInputValue(
                      e.target.value,
                    )
                  }
                  placeholder="Buscar..."
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Fecha inicio
                </label>

                <input
                  className="secInput"
                  type="date"
                  value={
                    filtroFechaInicio
                  }
                  onChange={(e) =>
                    setFiltroFechaInicio(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Fecha fin
                </label>

                <input
                  className="secInput"
                  type="date"
                  value={
                    filtroFechaFin
                  }
                  onChange={(e) =>
                    setFiltroFechaFin(
                      e.target.value,
                    )
                  }
                />
              </div>

              <button
                className="secBtnPrimary vpTrashBtn"
                type="button"
                onClick={() =>
                  setPapelera(
                    !papelera,
                  )
                }
                title={
                  papelera
                    ? "Volver a activos"
                    : "Ver eliminados"
                }
              >
                {papelera
                  ? "↩️ Activos"
                  : "🗑️ Papelera"}
              </button>
            </div>

            {papelera ? (
              <p className="vpInfoDanger">
                Mostrando{" "}
                {
                  pagosEliminados.length
                }{" "}
                registros eliminados
              </p>
            ) : (
              <p className="vpInfo">
                Mostrando{" "}
                {
                  pagosActivos.length
                }{" "}
                resultados /{" "}
                <span className="vpInfoOk">
                  {
                    pagosActivos.filter(
                      (p) =>
                        p.verificado,
                    ).length
                  }{" "}
                  pagos validados
                </span>
              </p>
            )}

            {(papelera
              ? pagosEliminados
              : pagosOrdenados
            )?.length ? (
              <div className="secTableWrap">
                <table className="secTable vpTable">
                  <thead>
                    <tr>
                      <th>
                        Discente
                      </th>

                      <th
                        className="vpThSortable"
                        onClick={() =>
                          setOrdenFechaDesc(
                            (prev) =>
                              !prev,
                          )
                        }
                        title="Ordenar por fecha"
                      >
                        Fecha{" "}
                        {ordenFechaDesc
                          ? "⬇️"
                          : "⬆️"}
                      </th>

                      <th>
                        Curso
                      </th>

                      <th>
                        Valor
                      </th>

                      <th>
                        Entidad
                      </th>

                      <th>
                        Id Pago
                      </th>

                      <th>
                        Comp
                      </th>

                      <th>
                        Emp
                      </th>

                      <th>
                        Mdt
                      </th>

                      <th>
                        Int
                      </th>

                      <th>
                        Calif
                      </th>

                      <th>
                        Tiemp. Act
                      </th>

                      <th>
                        Verif
                      </th>

                      <th>
                        Obser
                      </th>

                      <th>
                        Editor
                      </th>

                      <th>
                        {papelera
                          ? "Restaurar"
                          : "Acciones"}
                      </th>

                      {!papelera && (
                        <th>
                          Elim.
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {(papelera
                      ? pagosEliminados
                      : pagosOrdenados
                    ).map((p) => {
                      const isEditing =
                        editPagoId ===
                        p.id;

                      return (
                        <tr
                          key={p.id}
                        >
                          <td className="vpTdWrap">
                            {p
                              ? `${p?.inscripcion?.user?.firstName || ""} ${p
                                ?.inscripcion
                                ?.user
                                ?.lastName ||
                              ""
                              }`
                              : "Sin Inscripción"}
                          </td>

                          <td>
                            {p.createdAt
                              ? new Date(
                                p.createdAt,
                              ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="vpTdWrap">
                            {p.curso}
                          </td>

                          <td>
                            {papelera ? (
                              `$${p.valorDepositado || "0.00"}`
                            ) : isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                {...register(
                                  "valorDepositado",
                                )}
                                className="vpMiniInput"
                              />
                            ) : (
                              `$${p.valorDepositado || "0.00"}`
                            )}
                          </td>

                          <td className="vpTdWrap">
                            {papelera ? (
                              p.entidad ||
                              "---"
                            ) : isEditing ? (
                              <select
                                {...register(
                                  "entidad",
                                )}
                                className="secInput vpMiniSelect"
                                required
                              >
                                <option value="">
                                  Entidad
                                </option>

                                {[
                                  ...new Set(
                                    variables
                                      .map(
                                        (
                                          v,
                                        ) =>
                                          v.entidad,
                                      )
                                      .filter(
                                        Boolean,
                                      ),
                                  ),
                                ].map(
                                  (
                                    entidad,
                                    i,
                                  ) => (
                                    <option
                                      key={
                                        i
                                      }
                                      value={
                                        entidad
                                      }
                                    >
                                      {
                                        entidad
                                      }
                                    </option>
                                  ),
                                )}
                              </select>
                            ) : (
                              p.entidad ||
                              "---"
                            )}
                          </td>

                          <td>
                            {papelera ? (
                              p.idDeposito ||
                              "---"
                            ) : isEditing ? (
                              <input
                                type="text"
                                {...register(
                                  "idDeposito",
                                )}
                                className="vpMiniInput"
                              />
                            ) : (
                              p.idDeposito ||
                              "---"
                            )}
                          </td>

                          <td>
                            {p.pagoUrl ? (
                              <a
                                className="vpLink"
                                href={
                                  p.pagoUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver
                              </a>
                            ) : (
                              "No disponible"
                            )}
                          </td>

                          <td>
                            {p.cert_emp ===
                              "true" ? (
                              p.urlCertificadoEmp ? (
                                <a
                                  href={
                                    p.urlCertificadoEmp
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btnVerCertificado"
                                >
                                  📄 Ver
                                </a>
                              ) : (
                                "✅"
                              )
                            ) : (
                              "❌"
                            )}
                          </td>

                          <td>
                            {p.cert_mdt ===
                              "true" ? (
                              p.urlCertificadoMdt ? (
                                <a
                                  href={
                                    p.urlCertificadoMdt
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btnVerCertificado"
                                >
                                  📄 Ver
                                </a>
                              ) : (
                                "✅"
                              )
                            ) : (
                              "❌"
                            )}
                          </td>

                          <td>
                            {p.cert_int ===
                              "true" ? (
                              p.urlCertificadoInt ? (
                                <a
                                  href={
                                    p.urlCertificadoInt
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btnVerCertificado"
                                >
                                  📄 Ver
                                </a>
                              ) : (
                                "✅"
                              )
                            ) : (
                              "❌"
                            )}
                          </td>

                          <td className="vpTdWrap">
                            {p.notaFinal}
                          </td>

                          <td className="vpTdTiempo">
                            <div>
                              <strong>
                                Aula
                                virtual:
                              </strong>{" "}
                              {
                                p.tiempoActividadCurso
                              }
                            </div>

                            <div>
                              <strong>
                                Clase
                                Zoom:
                              </strong>{" "}
                              {
                                p.tiempoZoomCurso
                              }
                            </div>

                            <div>
                              <strong>
                                Total:
                              </strong>{" "}
                              {
                                p.tiempoTotalCurso
                              }
                            </div>
                          </td>

                          <td
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            {papelera ? (
                              p.verificado ? (
                                "✅"
                              ) : (
                                "❌"
                              )
                            ) : isEditing ? (
                              <input
                                type="checkbox"
                                {...register(
                                  "verificado",
                                )}
                              />
                            ) : p.verificado ? (
                              "✅"
                            ) : (
                              "❌"
                            )}
                          </td>

                          <td className="vpTdWrap">
                            {papelera ? (
                              p.observacion ||
                              "👍"
                            ) : isEditing ? (
                              <input
                                type="text"
                                {...register(
                                  "observacion",
                                )}
                                className="vpMiniInput"
                              />
                            ) : (
                              p.observacion ||
                              "👍"
                            )}
                          </td>

                          <td className="vpTdWrap">
                            {p.usuarioEdicion
                              ? p.usuarioEdicion
                              : "Sin editar"}
                          </td>

                          {papelera ? (
                            <td>
                              <button
                                className="vpActionBtn vpActionBtn--restore"
                                type="button"
                                title="Restaurar registro"
                                onClick={() => {
                                  setShowRestaurar(
                                    true,
                                  );

                                  setPagoIdRestaurar(
                                    p.id,
                                  );
                                }}
                              >
                                <span className="vpActionIcon">
                                  ↩️
                                </span>

                                <span className="vpActionText">
                                  Restaurar
                                </span>
                              </button>
                            </td>
                          ) : (
                            <>
                              <td className="vpActionsCell">
                                {isEditing ? (
                                  <div className="vpActions">
                                    <button
                                      onClick={handleSubmit(
                                        (
                                          data,
                                        ) =>
                                          guardarEdicion(
                                            p.id,
                                            data,
                                          ),
                                      )}
                                      className="vpActionBtn vpActionBtn--save"
                                      type="button"
                                      title="Guardar cambios"
                                    >
                                      <span className="vpActionIcon">
                                        💾
                                      </span>

                                      <span className="vpActionText">
                                        Guardar
                                      </span>
                                    </button>

                                    <button
                                      onClick={
                                        cancelarEdicion
                                      }
                                      className="vpActionBtn vpActionBtn--cancel"
                                      type="button"
                                      title="Cancelar edición"
                                    >
                                      <span className="vpActionIcon">
                                        ✕
                                      </span>

                                      <span className="vpActionText">
                                        Cancelar
                                      </span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="vpActions">
                                    {/* VALIDAR */}

                                    <button
                                      onClick={(
                                        e,
                                      ) =>
                                        iniciarEdicion(
                                          p,
                                          e,
                                        )
                                      }
                                      className="vpActionBtn vpActionBtn--edit"
                                      type="button"
                                      title="Registrar o editar validación"
                                    >
                                      <span className="vpActionIcon">
                                        ✏️
                                      </span>

                                      <span className="vpActionText">
                                        Validar
                                      </span>
                                    </button>

                                    {/* RESULTADO PSICOMÉTRICO */}

                                    {p.tipoPago === "test_psicometrico" &&
                                      p.psychometricEvaluationId && (
                                        <>
                                          {p.resultadoPsicometrico
                                            ?.resultadoGenerado ? (
                                            <a
                                              className="vpActionBtn vpActionBtn--view"
                                              href={`/#/resultado-psicometrico-admin/${p.psychometricEvaluationId}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              title="Ver resultado psicométrico"
                                            >
                                              <span className="vpActionIcon">
                                                👁️
                                              </span>

                                              <span className="vpActionText">
                                                Ver
                                              </span>
                                            </a>
                                          ) : (
                                            <button
                                              className="vpActionBtn vpActionBtn--result"
                                              type="button"
                                              disabled={
                                                !p.verificado ||
                                                generandoResultadoId === p.id
                                              }
                                              title={
                                                !p.verificado
                                                  ? "Primero debes validar el pago"
                                                  : "Generar y enviar resultado psicométrico"
                                              }
                                              onClick={() =>
                                                handleGenerarResultado(p)
                                              }
                                            >
                                              <span className="vpActionIcon">
                                                {generandoResultadoId ===
                                                  p.id
                                                  ? "⏳"
                                                  : "📊"}
                                              </span>

                                              <span className="vpActionText">
                                                {generandoResultadoId ===
                                                  p.id
                                                  ? "Generando"
                                                  : "Resultado"}
                                              </span>
                                            </button>
                                          )}
                                        </>
                                      )}

                                    {/* CERTIFICADO */}

                                    {p.verificado &&
                                      p.cert_emp ===
                                      "true" &&
                                      !p.certificadoEmp && (
                                        <button
                                          className="vpActionBtn vpActionBtn--certificate"
                                          type="button"
                                          title="Generar certificado"
                                          onClick={() =>
                                            handleCertificar(
                                              p.id,
                                            )
                                          }
                                        >
                                          <span className="vpActionIcon">
                                            🎓
                                          </span>

                                          <span className="vpActionText">
                                            Certificar
                                          </span>
                                        </button>
                                      )}

                                    {/* FACTURA */}

                                    {(() => {
                                      const f =
                                        getFacturaUI(
                                          p,
                                        );

                                      if (
                                        f.type ===
                                        "emitir"
                                      ) {
                                        return (
                                          <button
                                            className="vpActionBtn vpActionBtn--invoice"
                                            type="button"
                                            disabled={
                                              !p.verificado ||
                                              isEmitiendoFactura
                                            }
                                            title={
                                              !p.verificado
                                                ? "Primero verifica el pago"
                                                : "Emitir factura en Contífico"
                                            }
                                            onClick={() =>
                                              emitirFacturaManual(
                                                p.id,
                                              )
                                            }
                                          >
                                            <span className="vpActionIcon">
                                              {facturandoPagoId ===
                                                p.id
                                                ? "⏳"
                                                : "🧾"}
                                            </span>

                                            <span className="vpActionText">
                                              {facturandoPagoId ===
                                                p.id
                                                ? "Emitiendo"
                                                : "Facturar"}
                                            </span>
                                          </button>
                                        );
                                      }

                                      if (
                                        f.type ===
                                        "pendiente"
                                      ) {
                                        return (
                                          <span
                                            className="vpActionStatus vpActionStatus--pending"
                                            title="Documento pendiente de autorización del SRI"
                                          >
                                            <span>
                                              🟡
                                            </span>

                                            <span>
                                              SRI
                                            </span>
                                          </span>
                                        );
                                      }

                                      if (
                                        f.href
                                      ) {
                                        return (
                                          <a
                                            className="vpActionBtn vpActionBtn--view"
                                            href={
                                              f.href
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Ver factura"
                                          >
                                            <span className="vpActionIcon">
                                              📄
                                            </span>

                                            <span className="vpActionText">
                                              Factura
                                            </span>
                                          </a>
                                        );
                                      }

                                      return (
                                        <span
                                          className="vpActionStatus vpActionStatus--ok"
                                          title="Factura autorizada"
                                        >
                                          <span>
                                            🟢
                                          </span>

                                          <span>
                                            SRI
                                          </span>
                                        </span>
                                      );
                                    })()}
                                  </div>
                                )}
                              </td>

                              <td className="vpDeleteCell">
                                <button
                                  className="vpActionBtn vpActionBtn--delete vpActionBtn--iconOnly"
                                  type="button"
                                  title="Eliminar registro"
                                  aria-label="Eliminar registro"
                                  onClick={() => {
                                    setShowDelete(
                                      true,
                                    );

                                    setPagoIdDelete(
                                      p.id,
                                    );
                                  }}
                                >
                                  🗑️
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="secEmpty">
                No hay pagos para
                mostrar.
              </p>
            )}
          </section>
        );

      /* =====================================================
         ENTREGAS
      ===================================================== */

      case "registrarEntregas":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">
                🎁 Registrar Entregas
              </h2>
            </div>

            <div className="secFilters vpFiltersRow">
              <button
                className="secBtnDanger"
                onClick={
                  limpiarFiltrosBase
                }
                type="button"
              >
                ❌ Eliminar filtros
              </button>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Curso
                </label>

                <select
                  className="secInput"
                  value={
                    filtroCurso
                  }
                  onChange={(e) =>
                    setFiltroCurso(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  {listaCursos.map(
                    (c) => (
                      <option
                        key={c}
                        value={c}
                      >
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Verificado
                </label>

                <select
                  className="secInput"
                  value={
                    filtroVerificado
                  }
                  onChange={(e) =>
                    setFiltroVerificado(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Verificados
                  </option>

                  <option value="false">
                    No Verificados
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Moneda
                </label>

                <select
                  className="secInput"
                  value={
                    filtroMoneda
                  }
                  onChange={(e) =>
                    setFiltroMoneda(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Sí
                  </option>

                  <option value="false">
                    No
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Distintivo
                </label>

                <select
                  className="secInput"
                  value={
                    filtroDistintivo
                  }
                  onChange={(e) =>
                    setFiltroDistintivo(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Sí
                  </option>

                  <option value="false">
                    No
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Entregado
                </label>

                <select
                  className="secInput"
                  value={
                    filtroEntregado
                  }
                  onChange={(e) =>
                    setFiltroEntregado(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Sí
                  </option>

                  <option value="false">
                    No
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Nombres /
                  Apellidos /
                  Cédula
                </label>

                <input
                  className="secInput"
                  type="text"
                  value={
                    inputValue
                  }
                  onChange={(e) =>
                    setInputValue(
                      e.target.value,
                    )
                  }
                  placeholder="Buscar..."
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Fecha inicio
                </label>

                <input
                  className="secInput"
                  type="date"
                  value={
                    filtroFechaInicio
                  }
                  onChange={(e) =>
                    setFiltroFechaInicio(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Fecha fin
                </label>

                <input
                  className="secInput"
                  type="date"
                  value={
                    filtroFechaFin
                  }
                  onChange={(e) =>
                    setFiltroFechaFin(
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <p className="vpInfo">
              Mostrando{" "}
              {
                pagosDistintivos.length
              }{" "}
              resultados
            </p>

            <div className="secTableWrap">
              <table className="secTable vpTable">
                <thead>
                  <tr>
                    <th>
                      Discente
                    </th>

                    <th
                      className="vpThSortable"
                      onClick={() =>
                        setOrdenFechaDesc(
                          (prev) =>
                            !prev,
                        )
                      }
                      title="Ordenar por fecha"
                    >
                      Fecha{" "}
                      {ordenFechaDesc
                        ? "⬇️"
                        : "⬆️"}
                    </th>

                    <th>
                      Curso
                    </th>

                    <th>
                      Moneda
                    </th>

                    <th>
                      Distintivo
                    </th>

                    <th>
                      Valor
                    </th>

                    <th>
                      Verificado
                    </th>

                    <th>
                      Comprobante
                    </th>

                    <th>
                      Entregado
                    </th>

                    <th>
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagosDistintivos.map(
                    (p) => {
                      const startEditing =
                        () => {
                          setEditingEntregaId(
                            p.id,
                          );

                          reset({
                            entregado:
                              p.entregado,
                          });
                        };

                      const guardarEntrega =
                        handleSubmit(
                          async (
                            data,
                          ) => {
                            try {
                              await updatePago(
                                PATH_PAGOS,
                                p.id,
                                {
                                  entregado:
                                    data.entregado,
                                },
                              );

                              await getPago(
                                PATH_PAGOS,
                              );

                              setEditingEntregaId(
                                null,
                              );
                            } catch (error) {
                              alert(
                                "Error al actualizar entrega.",
                              );
                            }
                          },
                        );

                      return (
                        <tr
                          key={p.id}
                        >
                          <td className="vpTdWrap">
                            {p
                              ? `${p?.inscripcion?.user?.grado || ""} ${p?.inscripcion?.user?.firstName || ""} ${p?.inscripcion?.user?.lastName || ""}`
                              : "Sin Inscripción"}
                          </td>

                          <td>
                            {p.createdAt
                              ? new Date(
                                p.createdAt,
                              ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="vpTdWrap">
                            {p.curso}
                          </td>

                          <td
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            {p.moneda
                              ? "✅"
                              : "❌"}
                          </td>

                          <td
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            {p.distintivo
                              ? "✅"
                              : "❌"}
                          </td>

                          <td>
                            {`$${p.valorDepositado || "0.00"}`}
                          </td>

                          <td
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            {p.verificado
                              ? "✅"
                              : "❌"}
                          </td>

                          <td>
                            {p.pagoUrl ? (
                              <a
                                className="vpLink"
                                href={
                                  p.pagoUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver
                              </a>
                            ) : (
                              "No disponible"
                            )}
                          </td>

                          <td
                            style={{
                              textAlign:
                                "center",
                            }}
                          >
                            {editingEntregaId ===
                              p.id ? (
                              <input
                                type="checkbox"
                                {...register(
                                  "entregado",
                                )}
                              />
                            ) : p.entregado ? (
                              "✅"
                            ) : (
                              "❌"
                            )}
                          </td>

                          <td>
                            {editingEntregaId ===
                              p.id ? (
                              <div className="vpActions">
                                <button
                                  onClick={
                                    guardarEntrega
                                  }
                                  className="vpActionBtn vpActionBtn--save"
                                  type="button"
                                >
                                  <span className="vpActionIcon">
                                    💾
                                  </span>

                                  <span className="vpActionText">
                                    Guardar
                                  </span>
                                </button>

                                <button
                                  onClick={() =>
                                    setEditingEntregaId(
                                      null,
                                    )
                                  }
                                  className="vpActionBtn vpActionBtn--cancel"
                                  type="button"
                                >
                                  <span className="vpActionIcon">
                                    ✕
                                  </span>

                                  <span className="vpActionText">
                                    Cancelar
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={
                                  startEditing
                                }
                                className="vpActionBtn vpActionBtn--edit"
                                type="button"
                              >
                                <span className="vpActionIcon">
                                  🎁
                                </span>

                                <span className="vpActionText">
                                  Entrega
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );

      /* =====================================================
         LISTA PAGOS
      ===================================================== */

      case "listaPagos":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">
                💳 Lista de Pagos
              </h2>
            </div>

            <div className="secFilters vpFiltersRow">
              <div className="secInputGroup">
                <label className="vpLbl">
                  Verificado
                </label>

                <select
                  className="secInput"
                  value={
                    filtroVerificado
                  }
                  onChange={(e) =>
                    setFiltroVerificado(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Verificados
                  </option>

                  <option value="false">
                    No Verificados
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Certificado
                </label>

                <select
                  className="secInput"
                  value={
                    filtroCertificado
                  }
                  onChange={(e) =>
                    setFiltroCertificado(
                      e.target.value,
                    )
                  }
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="true">
                    Con Certificado
                  </option>

                  <option value="false">
                    Sin Certificado
                  </option>
                </select>
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Fecha inicio
                </label>

                <input
                  className="secInput"
                  type="date"
                  value={
                    filtroFechaInicio
                  }
                  onChange={(e) =>
                    setFiltroFechaInicio(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="secInputGroup">
                <label className="vpLbl">
                  Fecha fin
                </label>

                <input
                  className="secInput"
                  type="date"
                  value={
                    filtroFechaFin
                  }
                  onChange={(e) =>
                    setFiltroFechaFin(
                      e.target.value,
                    )
                  }
                />
              </div>

              <button
                className="secBtnDanger"
                onClick={
                  limpiarFiltrosBase
                }
                type="button"
              >
                ❌ Eliminar filtros
              </button>

              {SUPERADMIN ===
                user?.cI && (
                  <button
                    className="secBtnPrimary"
                    onClick={
                      descargarExcel
                    }
                    type="button"
                  >
                    📥 Descargar Pagos
                  </button>
                )}

              {SUPERADMIN ===
                user?.cI && (
                  <button
                    className="secBtnPrimary"
                    onClick={
                      descargarExcelInscripcion
                    }
                    type="button"
                  >
                    📥 Descargar
                    Inscripciones
                  </button>
                )}
            </div>

            <div className="secCount">
              Total:{" "}
              {
                pagosActivos.length
              }
            </div>

            <div className="secTableWrap">
              <table className="secTable vpTable">
                <thead>
                  <tr>
                    <th>
                      Nombres
                    </th>

                    <th>
                      Apellidos
                    </th>

                    <th>
                      Cédula
                    </th>

                    <th
                      className="vpThSortable"
                      onClick={() =>
                        setOrdenFechaDesc(
                          (prev) =>
                            !prev,
                        )
                      }
                      title="Ordenar por fecha"
                    >
                      Fecha{" "}
                      {ordenFechaDesc
                        ? "⬇️"
                        : "⬆️"}
                    </th>

                    <th>
                      Curso
                    </th>

                    <th>
                      Valor
                    </th>

                    <th>
                      Comprobante
                    </th>

                    <th>
                      Certificado
                    </th>

                    <th>
                      Verificado
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {pagosActivos.map(
                    (p) => (
                      <tr
                        key={p.id}
                      >
                        <td>
                          {p
                            ?.inscripcion
                            ?.user
                            ?.firstName ||
                            "-"}
                        </td>

                        <td>
                          {p
                            ?.inscripcion
                            ?.user
                            ?.lastName ||
                            "-"}
                        </td>

                        <td>
                          {p
                            ?.inscripcion
                            ?.user?.cI ||
                            "-"}
                        </td>

                        <td>
                          {p.createdAt
                            ? new Date(
                              p.createdAt,
                            ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="vpTdWrap">
                          {p.curso}
                        </td>

                        <td>
                          $
                          {p.valorDepositado ||
                            "0.00"}
                        </td>

                        <td>
                          {p.pagoUrl ? (
                            <a
                              className="vpLink"
                              href={
                                p.pagoUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>

                        <td>
                          {p?.urlCertificado ? (
                            <a
                              className="vpLink"
                              href={
                                p.urlCertificado
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver
                            </a>
                          ) : (
                            "No disponible"
                          )}
                        </td>

                        <td
                          style={{
                            textAlign:
                              "center",
                          }}
                        >
                          {p.verificado
                            ? "✅"
                            : "❌"}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );

      /* =====================================================
         INSCRITOS
      ===================================================== */

      case "listaInscritos":
        return (
          <section className="secCard">
            <div className="secCardHeader">
              <h2 className="secTitle">
                📋 Lista de Inscritos
              </h2>
            </div>

            <p className="secEmpty">
              📌 Próximamente…
            </p>
          </section>
        );

      default:
        return null;
    }
  };

  /* =========================================================
     RETURN PRINCIPAL
  ========================================================= */

  return (
    <div className="secPage">
      {isLoading && (
        <IsLoading />
      )}

      <div
        className={`secOverlay ${menuOpen
          ? "open"
          : ""
          }`}
        onClick={() =>
          setMenuOpen(false)
        }
        aria-hidden={
          !menuOpen
        }
      />

      <div className="secShell vpShell">

        {/* =================================================
    MODAL RESULTADO PSICOMÉTRICO
================================================= */}

        {showResultadoModal && (
          <div
            className="vpResultModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="vp-result-modal-title"
          >
            <div
              className="vpResultModal__backdrop"
              onClick={() => {
                if (
                  resultadoModalStatus !==
                  "processing"
                ) {
                  cerrarResultadoModal();
                }
              }}
            />

            <article
              className={`vpResultModal__card vpResultModal__card--${resultadoModalStatus}`}
            >
              {resultadoModalStatus !==
                "processing" && (
                  <button
                    type="button"
                    className="vpResultModal__close"
                    onClick={
                      cerrarResultadoModal
                    }
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                )}

              {/* =============================================
          LOGO
      ============================================= */}

              <div className="vpResultModal__brand">
                <img
                  src="/images/test_logo.png"
                  alt="Proyecto Pensar"
                />
              </div>

              {/* =============================================
          CONFIRMAR
      ============================================= */}

              {resultadoModalStatus ===
                "confirm" && (
                  <>
                    <div className="vpResultModal__icon vpResultModal__icon--confirm">
                      📊
                    </div>

                    <span className="vpResultModal__eyebrow">
                      PROYECTO PENSAR
                    </span>

                    <h2 id="vp-result-modal-title">
                      Generar resultado psicométrico
                    </h2>

                    <p className="vpResultModal__lead">
                      Estás a punto de liberar
                      el resultado de esta
                      evaluación y enviarlo al
                      participante.
                    </p>

                    <div className="vpResultModal__participant">
                      <div className="vpResultModal__avatar">
                        {resultadoModalPago
                          ?.inscripcion
                          ?.user
                          ?.firstName?.charAt(
                            0
                          )
                          ?.toUpperCase() ||
                          "P"}
                      </div>

                      <div>
                        <span>
                          Participante
                        </span>

                        <strong>
                          {[
                            resultadoModalPago
                              ?.inscripcion
                              ?.user
                              ?.firstName,

                            resultadoModalPago
                              ?.inscripcion
                              ?.user
                              ?.lastName,
                          ]
                            .filter(Boolean)
                            .join(" ") ||
                            "Participante"}
                        </strong>

                        {resultadoModalPago
                          ?.inscripcion
                          ?.user
                          ?.email && (
                            <small>
                              {
                                resultadoModalPago
                                  .inscripcion
                                  .user.email
                              }
                            </small>
                          )}
                      </div>
                    </div>

                    <div className="vpResultModal__summary">
                      <div>
                        <span>
                          Test
                        </span>

                        <strong>
                          {resultadoModalPago
                            ?.curso ||
                            "-"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Pago
                        </span>

                        <strong>
                          Validado
                        </strong>
                      </div>

                      <div>
                        <span>
                          Evaluación
                        </span>

                        <strong>
                          Disponible
                        </strong>
                      </div>
                    </div>

                    <div className="vpResultModal__notice">
                      <span>
                        ✉️
                      </span>

                      <div>
                        <strong>
                          Se enviará por correo
                        </strong>

                        <p>
                          El participante recibirá
                          un enlace personal para
                          consultar su informe de
                          resultados.
                        </p>
                      </div>
                    </div>

                    <div className="vpResultModal__actions">
                      <button
                        type="button"
                        className="vpResultModal__btn vpResultModal__btn--secondary"
                        onClick={
                          cerrarResultadoModal
                        }
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="vpResultModal__btn vpResultModal__btn--primary"
                        onClick={
                          confirmarGenerarResultado
                        }
                      >
                        Generar y enviar
                      </button>
                    </div>
                  </>
                )}

              {/* =============================================
          PROCESANDO
      ============================================= */}

              {resultadoModalStatus ===
                "processing" && (
                  <>
                    <div className="vpResultModal__loader">
                      <span />
                    </div>

                    <span className="vpResultModal__eyebrow">
                      PROCESANDO
                    </span>

                    <h2>
                      Generando resultado
                    </h2>

                    <p className="vpResultModal__lead">
                      Estamos preparando el
                      informe psicométrico y el
                      enlace personal del
                      participante.
                    </p>

                    <div className="vpResultModal__processingSteps">
                      <div>
                        <span>
                          ✓
                        </span>

                        <p>
                          Validando evaluación
                        </p>
                      </div>

                      <div>
                        <span>
                          ✓
                        </span>

                        <p>
                          Preparando resultados
                        </p>
                      </div>

                      <div>
                        <span className="vpResultModal__processingDot">
                          •
                        </span>

                        <p>
                          Generando acceso al
                          informe
                        </p>
                      </div>
                    </div>
                  </>
                )}

              {/* =============================================
          ÉXITO
      ============================================= */}

              {resultadoModalStatus ===
                "success" && (
                  <>
                    <div className="vpResultModal__successAnimation">
                      <span className="vpResultModal__successRing" />

                      <span className="vpResultModal__successCheck">
                        ✓
                      </span>
                    </div>

                    <span className="vpResultModal__eyebrow">
                      RESULTADO GENERADO
                    </span>

                    <h2>
                      Informe disponible
                    </h2>

                    <p className="vpResultModal__lead">
                      {resultadoModalMessage}
                    </p>

                    <div className="vpResultModal__successPanel">
                      <div>
                        ✉️
                      </div>

                      <section>
                        <strong>
                          Correo enviado
                        </strong>

                        <p>
                          El participante ya puede
                          acceder a su informe
                          mediante el enlace
                          personal enviado a su
                          correo electrónico.
                        </p>

                        {resultadoModalPago
                          ?.inscripcion
                          ?.user
                          ?.email && (
                            <span>
                              {
                                resultadoModalPago
                                  .inscripcion
                                  .user.email
                              }
                            </span>
                          )}
                      </section>
                    </div>

                    <div className="vpResultModal__actions vpResultModal__actions--single">
                      <button
                        type="button"
                        className="vpResultModal__btn vpResultModal__btn--primary"
                        onClick={
                          cerrarResultadoModal
                        }
                      >
                        Entendido
                      </button>
                    </div>
                  </>
                )}

              {/* =============================================
          YA ENVIADO
      ============================================= */}

              {resultadoModalStatus ===
                "alreadySent" && (
                  <>
                    <div className="vpResultModal__icon vpResultModal__icon--warning">
                      !
                    </div>

                    <span className="vpResultModal__eyebrow">
                      RESULTADO EXISTENTE
                    </span>

                    <h2>
                      Resultado ya enviado
                    </h2>

                    <p className="vpResultModal__lead">
                      {resultadoModalMessage}
                    </p>

                    {resultadoModalFecha && (
                      <div className="vpResultModal__date">
                        <span>
                          Último envío
                        </span>

                        <strong>
                          {
                            resultadoModalFecha
                          }
                        </strong>
                      </div>
                    )}

                    <div className="vpResultModal__actions vpResultModal__actions--single">
                      <button
                        type="button"
                        className="vpResultModal__btn vpResultModal__btn--primary"
                        onClick={
                          cerrarResultadoModal
                        }
                      >
                        Entendido
                      </button>
                    </div>
                  </>
                )}

              {/* =============================================
          ERROR
      ============================================= */}

              {resultadoModalStatus ===
                "error" && (
                  <>
                    <div className="vpResultModal__icon vpResultModal__icon--error">
                      !
                    </div>

                    <span className="vpResultModal__eyebrow vpResultModal__eyebrow--error">
                      NO FUE POSIBLE COMPLETAR EL PROCESO
                    </span>

                    <h2>
                      Error al generar resultado
                    </h2>

                    <p className="vpResultModal__lead">
                      {resultadoModalMessage}
                    </p>

                    <div className="vpResultModal__actions vpResultModal__actions--single">
                      <button
                        type="button"
                        className="vpResultModal__btn vpResultModal__btn--primary"
                        onClick={
                          cerrarResultadoModal
                        }
                      >
                        Cerrar
                      </button>
                    </div>
                  </>
                )}
            </article>
          </div>
        )}
        <button
          ref={hamburgerRef}
          className={`secHamburger ${menuOpen
            ? "is-open"
            : ""
            }`}
          onClick={() =>
            setMenuOpen(
              !menuOpen,
            )
          }
          aria-label="Toggle menu"
          aria-expanded={
            menuOpen
          }
          type="button"
        >
          <span className="secHamburgerLine" />
          <span className="secHamburgerLine" />
          <span className="secHamburgerLine" />
        </button>

        <nav
          className={`secMenu ${menuOpen
            ? "open"
            : ""
            }`}
          ref={menuRef}
        >
          <div className="secMenuHeader">
            <img
              src="/images/idrmind_sf.png"
              alt="iDr.Mind."
              className="secMenuLogo"
            />

            <p className="secMenuSubtitle">
              Validación de Pagos
            </p>
          </div>

          <button
            className={`secMenuBtn ${activeSection ===
              "resumen"
              ? "active"
              : ""
              }`}
            onClick={() =>
              setActiveSection(
                "resumen",
              )
            }
            type="button"
          >
            📋 Resumen
          </button>

          <button
            className={`secMenuBtn ${activeSection ===
              "validarPagos"
              ? "active"
              : ""
              }`}
            onClick={() =>
              setActiveSection(
                "validarPagos",
              )
            }
            type="button"
          >
            ✅ Validar Pagos
          </button>

          <button
            className={`secMenuBtn ${activeSection ===
              "registrarEntregas"
              ? "active"
              : ""
              }`}
            onClick={() =>
              setActiveSection(
                "registrarEntregas",
              )
            }
            type="button"
          >
            🎁 Entregas
          </button>

          <button
            className={`secMenuBtn ${activeSection ===
              "listaPagos"
              ? "active"
              : ""
              }`}
            onClick={() =>
              setActiveSection(
                "listaPagos",
              )
            }
            type="button"
          >
            💳 Lista Pagos
          </button>

          <button
            className={`secMenuBtn ${activeSection ===
              "listaInscritos"
              ? "active"
              : ""
              }`}
            onClick={() =>
              setActiveSection(
                "listaInscritos",
              )
            }
            type="button"
          >
            📋 Lista Inscritos
          </button>
        </nav>

        <main
          ref={contentRef}
          className="secContent vpContent"
        >
          {renderContent()}
        </main>

        {/* =================================================
            MODAL ELIMINAR
        ================================================= */}

        {showDelete && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>
                ¿Deseas eliminar
                el registro?
              </span>

              <section className="btn_content">
                <button
                  className="btn yes"
                  onClick={() =>
                    deletePagoPr(
                      pagoIdDelete,
                    )
                  }
                  type="button"
                >
                  Sí
                </button>

                <button
                  className="btn no"
                  onClick={() => {
                    setShowDelete(
                      false,
                    );

                    setPagoIdDelete(
                      null,
                    );
                  }}
                  type="button"
                >
                  No
                </button>
              </section>
            </article>
          </div>
        )}

        {/* =================================================
            MODAL RESTAURAR
        ================================================= */}

        {showRestaurar && (
          <div className="modal_overlay">
            <article className="user_delete_content">
              <span>
                ¿Deseas restaurar
                registro?
              </span>

              <section className="btn_content">
                <button
                  className="btn yes"
                  onClick={() =>
                    restaurarPagoPr(
                      pagoIdRestaurar,
                    )
                  }
                  type="button"
                >
                  Sí
                </button>

                <button
                  className="btn no"
                  onClick={() => {
                    setShowRestaurar(
                      false,
                    );

                    setPagoIdRestaurar(
                      null,
                    );
                  }}
                  type="button"
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