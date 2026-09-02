import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import getConfigToken from "../services/getConfigToken";

const API_URL = import.meta.env.VITE_API_URL;

/* =========================================================
   FILTROS VACÍOS
========================================================= */

const EMPTY_FILTERS = {
  fechaDesde: "",
  fechaHasta: "",

  empresaId: "",
  seccionId: "",

  testId: "",
  estado: "",
  tipoParticipante: "",

  /* =====================================================
     DEMOGRAFÍA
  ===================================================== */

  genero: "",
  rangoEtario: "",

  /* =====================================================
     RESULTADOS PSICOMÉTRICOS
  ===================================================== */

  animodo: "",
  comunicacion: "",
  cerebro: "",
  negociacion: "",
  vak: "",
  persistencia: "",
  productividad: "",
  personalidad: "",
};

/* =========================================================
   LIMPIAR PARÁMETROS
========================================================= */

const cleanParams = (values = {}) => {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "todos"
    ) {
      params.set(key, value);
    }
  });

  return params.toString();
};

/* =========================================================
   GET API
========================================================= */

const apiGet = async (path, params = {}) => {
  const qs = cleanParams(params);

  const url =
    `${API_URL}${path}${qs ? `?${qs}` : ""}`;

  const response = await axios.get(
    url,
    getConfigToken(),
  );

  return response.data;
};

/* =========================================================
   HOOK
========================================================= */

const usePsychometricDashboard = () => {
  /* =====================================================
     FILTROS
  ===================================================== */

  const [filters, setFilters] =
    useState(EMPTY_FILTERS);

  /* =====================================================
     DATA
  ===================================================== */

  const [summary, setSummary] =
    useState(null);

  const [analytics, setAnalytics] =
    useState(null);

  const [filterOptions, setFilterOptions] =
    useState(null);

  const [organizations, setOrganizations] =
    useState(null);

  const [participants, setParticipants] =
    useState(null);

  const [
    participantDetail,
    setParticipantDetail,
  ] = useState(null);

  /* =====================================================
     ACCESO EMPRESARIAL
  ===================================================== */

  const [
    companyAccess,
    setCompanyAccess,
  ] = useState({});

  const [
    loadingCompanyAccess,
    setLoadingCompanyAccess,
  ] = useState(false);

  const [
    companyAccessAction,
    setCompanyAccessAction,
  ] = useState("");

  const [
    companyAccessMessage,
    setCompanyAccessMessage,
  ] = useState("");

  const [
    companyAccessError,
    setCompanyAccessError,
  ] = useState("");

  /* =====================================================
     PAGINACIÓN PARTICIPANTES
  ===================================================== */

  const [
    participantPage,
    setParticipantPage,
  ] = useState(1);

  const [
    participantLimit,
    setParticipantLimit,
  ] = useState(20);

  const [
    participantSearch,
    setParticipantSearch,
  ] = useState("");

  /* =====================================================
     ESTADOS DE CARGA
  ===================================================== */

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingDetail,
    setLoadingDetail,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  /* =====================================================
     PARÁMETROS GENERALES

     Estos filtros sí afectan:
     - resumen
     - resultados
     - participantes
  ===================================================== */

  const baseParams = useMemo(
    () => ({
      ...filters,
    }),
    [filters],
  );

  /* =====================================================
     PARÁMETROS PARA CATÁLOGO DE FILTROS

     IMPORTANTE:
     El endpoint /filters debe conservar
     el catálogo completo de opciones.

     Se mandan filtros estructurales,
     pero no filtros psicométricos ni
     demográficos cruzados.
  ===================================================== */

  const filterCatalogParams = useMemo(
    () => ({
      fechaDesde:
        filters.fechaDesde,

      fechaHasta:
        filters.fechaHasta,

      empresaId:
        filters.empresaId,

      testId:
        filters.testId,

      tipoParticipante:
        filters.tipoParticipante,
    }),
    [
      filters.fechaDesde,
      filters.fechaHasta,
      filters.empresaId,
      filters.testId,
      filters.tipoParticipante,
    ],
  );

  /* =====================================================
     PARÁMETROS PARA LISTADO DE EMPRESAS

     IMPORTANTE:
     NO enviamos empresaId ni seccionId.

     Esto garantiza que:
     - al seleccionar una empresa
       no desaparezcan las demás;
     - el listado empresarial permanezca
       completo.

     Sí enviamos:
     - fecha
     - test
     - filtros demográficos
     - filtros psicométricos

     Así las estadísticas de cada empresa
     pueden responder al contexto general.
  ===================================================== */

  const organizationParams = useMemo(
    () => ({
      fechaDesde:
        filters.fechaDesde,

      fechaHasta:
        filters.fechaHasta,

      testId:
        filters.testId,

      tipoParticipante:
        filters.tipoParticipante,

      genero:
        filters.genero,

      rangoEtario:
        filters.rangoEtario,

      animodo:
        filters.animodo,

      comunicacion:
        filters.comunicacion,

      cerebro:
        filters.cerebro,

      negociacion:
        filters.negociacion,

      vak:
        filters.vak,

      persistencia:
        filters.persistencia,

      productividad:
        filters.productividad,

      personalidad:
        filters.personalidad,
    }),
    [
      filters.fechaDesde,
      filters.fechaHasta,
      filters.testId,
      filters.tipoParticipante,
      filters.genero,
      filters.rangoEtario,
      filters.animodo,
      filters.comunicacion,
      filters.cerebro,
      filters.negociacion,
      filters.vak,
      filters.persistencia,
      filters.productividad,
      filters.personalidad,
    ],
  );

  /* =====================================================
     CARGAR OPCIONES DE FILTROS
  ===================================================== */

  const loadFilters = useCallback(async () => {
    try {
      const data = await apiGet(
        "/psychometric/dashboard/filters",
        filterCatalogParams,
      );

      setFilterOptions(data);
    } catch (err) {
      console.error(
        "Error cargando filtros psicométricos:",
        err,
      );
    }
  }, [filterCatalogParams]);

  /* =====================================================
     CARGAR DASHBOARD
  ===================================================== */

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        summaryData,
        analyticsData,
        organizationsData,
        participantsData,
      ] = await Promise.all([
        apiGet(
          "/psychometric/dashboard/summary",
          baseParams,
        ),

        apiGet(
          "/psychometric/dashboard/analytics",
          baseParams,
        ),

        apiGet(
          "/psychometric/dashboard/organizations",
          organizationParams,
        ),

        apiGet(
          "/psychometric/dashboard/participants",
          {
            ...baseParams,

            page:
              participantPage,

            limit:
              participantLimit,

            search:
              participantSearch,
          },
        ),
      ]);

      setSummary(
        summaryData,
      );

      setAnalytics(
        analyticsData,
      );

      setOrganizations(
        organizationsData,
      );

      setParticipants(
        participantsData,
      );
    } catch (err) {
      console.error(
        "Error cargando dashboard psicométrico:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          "No fue posible cargar el dashboard psicométrico.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    baseParams,
    organizationParams,
    participantPage,
    participantLimit,
    participantSearch,
  ]);

  /* =====================================================
     CARGAR DETALLE PARTICIPANTE
  ===================================================== */

  const loadParticipantDetail =
    useCallback(
      async (
        evaluationId,
      ) => {
        if (
          !evaluationId
        ) {
          return;
        }

        setLoadingDetail(
          true,
        );

        setParticipantDetail(
          null,
        );

        setError("");

        try {
          const data =
            await apiGet(
              `/psychometric/dashboard/participants/${evaluationId}`,
            );

          setParticipantDetail(
            data,
          );
        } catch (err) {
          console.error(
            "Error cargando detalle psicométrico:",
            err,
          );

          setError(
            err?.response
              ?.data
              ?.message ||
              "No fue posible cargar el detalle del participante.",
          );
        } finally {
          setLoadingDetail(
            false,
          );
        }
      },
      [],
    );

  /* =====================================================
     CERRAR DETALLE
  ===================================================== */

  const closeParticipantDetail =
    useCallback(
      () => {
        setParticipantDetail(
          null,
        );
      },
      [],
    );

  /* =====================================================
     CONSULTAR ESTADO DE ACCESO EMPRESARIAL
  ===================================================== */

  const loadCompanyAccessStatus =
    useCallback(
      async (
        empresaId,
      ) => {
        if (!empresaId) {
          return null;
        }

        setLoadingCompanyAccess(
          true,
        );

        setCompanyAccessError(
          "",
        );

        try {
          const data =
            await apiGet(
              `/psychometric/dashboard/organizations/${empresaId}/access`,
            );

          setCompanyAccess(
            (
              prev,
            ) => ({
              ...prev,
              [empresaId]:
                data,
            }),
          );

          return data;
        } catch (err) {
          console.error(
            "Error consultando acceso empresarial:",
            err,
          );

          const message =
            err?.response
              ?.data
              ?.message ||
            "No fue posible consultar el acceso de la empresa.";

          setCompanyAccessError(
            message,
          );

          throw err;
        } finally {
          setLoadingCompanyAccess(
            false,
          );
        }
      },
      [],
    );

  /* =====================================================
     ENVIAR ACCESO EMPRESARIAL POR CORREO

     El backend:
     - revoca accesos anteriores;
     - genera token nuevo;
     - guarda solo el hash;
     - envía el enlace a la empresa.
  ===================================================== */

  const sendCompanyAccess =
    useCallback(
      async (
        empresaId,
      ) => {
        if (!empresaId) {
          return null;
        }

        setCompanyAccessAction(
          `send:${empresaId}`,
        );

        setCompanyAccessMessage(
          "",
        );

        setCompanyAccessError(
          "",
        );

        try {
          const response =
            await axios.post(
              `${API_URL}/psychometric/dashboard/organizations/${empresaId}/access/send`,
              {},
              getConfigToken(),
            );

          const data =
            response.data;

          setCompanyAccess(
            (
              prev,
            ) => ({
              ...prev,
              [empresaId]:
                data,
            }),
          );

          setCompanyAccessMessage(
            data?.message ||
              "Acceso enviado correctamente.",
          );

          return data;
        } catch (err) {
          console.error(
            "Error enviando acceso empresarial:",
            err,
          );

          const message =
            err?.response
              ?.data
              ?.message ||
            "No fue posible enviar el acceso empresarial.";

          setCompanyAccessError(
            message,
          );

          throw err;
        } finally {
          setCompanyAccessAction(
            "",
          );
        }
      },
      [],
    );

  /* =====================================================
     ACTIVAR / DESACTIVAR ACCESO EMPRESARIAL
  ===================================================== */

  const setCompanyAccessActive =
    useCallback(
      async (
        empresaId,
        activo,
      ) => {
        if (
          !empresaId ||
          typeof activo !==
            "boolean"
        ) {
          return null;
        }

        setCompanyAccessAction(
          `${
            activo
              ? "activate"
              : "deactivate"
          }:${empresaId}`,
        );

        setCompanyAccessMessage(
          "",
        );

        setCompanyAccessError(
          "",
        );

        try {
          const response =
            await axios.patch(
              `${API_URL}/psychometric/dashboard/organizations/${empresaId}/access`,
              {
                activo,
              },
              getConfigToken(),
            );

          const data =
            response.data;

          setCompanyAccess(
            (
              prev,
            ) => {
              const previous =
                prev[
                  empresaId
                ] || {};

              return {
                ...prev,

                [empresaId]: {
                  ...previous,

                  access:
                    data?.access ||
                    previous.access,
                },
              };
            },
          );

          setCompanyAccessMessage(
            data?.message ||
              (
                activo
                  ? "Acceso activado."
                  : "Acceso desactivado."
              ),
          );

          return data;
        } catch (err) {
          console.error(
            "Error modificando acceso empresarial:",
            err,
          );

          const message =
            err?.response
              ?.data
              ?.message ||
            "No fue posible modificar el acceso empresarial.";

          setCompanyAccessError(
            message,
          );

          throw err;
        } finally {
          setCompanyAccessAction(
            "",
          );
        }
      },
      [],
    );

  /* =====================================================
     LIMPIAR MENSAJES DE ACCESO EMPRESARIAL
  ===================================================== */

  const clearCompanyAccessFeedback =
    useCallback(
      () => {
        setCompanyAccessMessage(
          "",
        );

        setCompanyAccessError(
          "",
        );
      },
      [],
    );

  /* =====================================================
     ACTUALIZAR FILTRO

     REGLAS:
     - Si se pulsa el mismo valor,
       se elimina.
     - Cambiar empresa limpia sección.
     - El resto de filtros se conserva.
     - Todos los gráficos pueden cruzarse.
  ===================================================== */

  const updateFilter =
    useCallback(
      (
        name,
        value,
      ) => {
        setParticipantPage(
          1,
        );

        setFilters(
          (
            prev,
          ) => {
            const nextValue =
              prev[name] ===
              value
                ? ""
                : value;

            const next = {
              ...prev,
              [name]:
                nextValue,
            };

            /*
             * Una sección pertenece
             * a una empresa concreta.
             */
            if (
              name ===
              "empresaId"
            ) {
              next.seccionId =
                "";
            }

            return next;
          },
        );
      },
      [],
    );

  /* =====================================================
     ESTABLECER FILTRO DIRECTAMENTE

     Útil cuando el componente necesita
     asignar un valor sin comportamiento
     toggle.

     Ejemplo:
     empresa + sección desde una tarjeta.
  ===================================================== */

  const setFilterValue =
    useCallback(
      (
        name,
        value,
      ) => {
        setParticipantPage(
          1,
        );

        setFilters(
          (
            prev,
          ) => ({
            ...prev,

            [name]:
              value || "",

            ...(name ===
            "empresaId"
              ? {
                  seccionId:
                    "",
                }
              : {}),
          }),
        );
      },
      [],
    );

  /* =====================================================
     ESTABLECER EMPRESA + SECCIÓN

     Evita setTimeout y dos recargas
     consecutivas desde el componente.
  ===================================================== */

  const selectCompanySection =
    useCallback(
      (
        companyId,
        sectionId,
      ) => {
        setParticipantPage(
          1,
        );

        setFilters(
          (
            prev,
          ) => ({
            ...prev,

            empresaId:
              companyId ||
              "",

            seccionId:
              sectionId ||
              "",
          }),
        );
      },
      [],
    );

  /* =====================================================
     LIMPIAR FILTROS
  ===================================================== */

  const clearFilters =
    useCallback(
      () => {
        setFilters({
          ...EMPTY_FILTERS,
        });

        setParticipantPage(
          1,
        );

        setParticipantSearch(
          "",
        );

        setParticipantDetail(
          null,
        );
      },
      [],
    );

  /* =====================================================
     CARGAR CATÁLOGOS
  ===================================================== */

  useEffect(
    () => {
      loadFilters();
    },
    [
      loadFilters,
    ],
  );

  /* =====================================================
     CARGAR DASHBOARD AUTOMÁTICAMENTE
  ===================================================== */

  useEffect(
    () => {
      const timer =
        window.setTimeout(
          () => {
            loadDashboard();
          },
          120,
        );

      return () =>
        window.clearTimeout(
          timer,
        );
    },
    [
      loadDashboard,
    ],
  );

  /* =====================================================
     RETURN
  ===================================================== */

  return {
    filters,

    summary,
    analytics,
    filterOptions,
    organizations,
    participants,
    participantDetail,

    companyAccess,
    loadingCompanyAccess,
    companyAccessAction,
    companyAccessMessage,
    companyAccessError,

    participantPage,
    participantLimit,
    participantSearch,

    loading,
    loadingDetail,
    error,

    setParticipantPage,
    setParticipantLimit,
    setParticipantSearch,

    updateFilter,
    setFilterValue,
    selectCompanySection,

    clearFilters,

    loadFilters,
    loadDashboard,
    loadParticipantDetail,
    closeParticipantDetail,

    loadCompanyAccessStatus,
    sendCompanyAccess,
    setCompanyAccessActive,
    clearCompanyAccessFeedback,
  };
};

export default usePsychometricDashboard;
