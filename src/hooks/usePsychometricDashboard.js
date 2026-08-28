import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import getConfigToken from "../services/getConfigToken";

const API_URL = import.meta.env.VITE_API_URL;

const EMPTY_FILTERS = {
  fechaDesde: "",
  fechaHasta: "",
  empresaId: "",
  seccionId: "",
  testId: "",
  estado: "",
  tipoParticipante: "",
  animodo: "",
  comunicacion: "",
  cerebro: "",
  negociacion: "",
  vak: "",
  persistencia: "",
  productividad: "",
  personalidad: "",
};

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

const apiGet = async (path, params = {}) => {
  const qs = cleanParams(params);
  const url = `${API_URL}${path}${qs ? `?${qs}` : ""}`;

  const response = await axios.get(url, getConfigToken());
  return response.data;
};

const usePsychometricDashboard = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [organizations, setOrganizations] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [participantDetail, setParticipantDetail] = useState(null);

  const [participantPage, setParticipantPage] = useState(1);
  const [participantLimit, setParticipantLimit] = useState(20);
  const [participantSearch, setParticipantSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  const baseParams = useMemo(
    () => ({
      ...filters,
    }),
    [filters],
  );

  const loadFilters = useCallback(async () => {
    try {
      const data = await apiGet(
        "/psychometric/dashboard/filters",
        baseParams,
      );
      setFilterOptions(data);
    } catch (err) {
      console.error("Error cargando filtros psicométricos:", err);
    }
  }, [baseParams]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryData, analyticsData, organizationsData, participantsData] =
        await Promise.all([
          apiGet("/psychometric/dashboard/summary", baseParams),
          apiGet("/psychometric/dashboard/analytics", baseParams),
          apiGet("/psychometric/dashboard/organizations", baseParams),
          apiGet("/psychometric/dashboard/participants", {
            ...baseParams,
            page: participantPage,
            limit: participantLimit,
            search: participantSearch,
          }),
        ]);

      setSummary(summaryData);
      setAnalytics(analyticsData);
      setOrganizations(organizationsData);
      setParticipants(participantsData);
    } catch (err) {
      console.error("Error cargando dashboard psicométrico:", err);
      setError(
        err?.response?.data?.message ||
          "No fue posible cargar el dashboard psicométrico.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    baseParams,
    participantPage,
    participantLimit,
    participantSearch,
  ]);

  const loadParticipantDetail = useCallback(async (evaluationId) => {
    if (!evaluationId) return;

    setLoadingDetail(true);
    setParticipantDetail(null);

    try {
      const data = await apiGet(
        `/psychometric/dashboard/participants/${evaluationId}`,
      );
      setParticipantDetail(data);
    } catch (err) {
      console.error("Error cargando detalle psicométrico:", err);
      setError(
        err?.response?.data?.message ||
          "No fue posible cargar el detalle del participante.",
      );
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeParticipantDetail = useCallback(() => {
    setParticipantDetail(null);
  }, []);

  const updateFilter = useCallback((name, value) => {
    setParticipantPage(1);
    setFilters((prev) => ({
      ...prev,
      [name]: prev[name] === value ? "" : value,
      ...(name === "empresaId" ? { seccionId: "" } : {}),
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setParticipantPage(1);
    setParticipantSearch("");
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadDashboard();
    }, 120);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  return {
    filters,
    summary,
    analytics,
    filterOptions,
    organizations,
    participants,
    participantDetail,
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
    clearFilters,
    loadDashboard,
    loadParticipantDetail,
    closeParticipantDetail,
  };
};

export default usePsychometricDashboard;
