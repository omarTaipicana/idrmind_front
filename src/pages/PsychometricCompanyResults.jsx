import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import "./styles/PsychometricCompanyResults.css";

const API_URL =
  import.meta.env.VITE_API_URL;

/* =========================================================
   PALETA SEMÁNTICA
   Igual criterio visual que el dashboard administrativo.
========================================================= */

const FALLBACK_COLORS = [
  "#173a8a",
  "#28a7e8",
  "#f2b705",
  "#16a36d",
  "#8b5cf6",
  "#ef6c57",
  "#667085",
  "#d946ef",
];

const DIMENSION_COLORS = {
  genero: {
    MASCULINO: "#175cd3",
    HOMBRE: "#175cd3",
    M: "#175cd3",
    FEMENINO: "#d946ef",
    MUJER: "#d946ef",
    F: "#d946ef",
  },

  rangoEtario: {
    GEN_0: "#28a7e8",
    GEN_1: "#173a8a",
    GEN_2: "#8b5cf6",
    GEN_3: "#667085",
  },

  animodo: {
    CAMALEON: "#16a36d",
    "CAMALEÓN": "#16a36d",
    DELFIN: "#28a7e8",
    "DELFÍN": "#28a7e8",
    CASTOR: "#9a6700",
    BUHO: "#6c5ce7",
    "BÚHO": "#6c5ce7",
    ABEJA: "#f2b705",
  },

  comunicacion: {
    AMARILLO: "#f2b705",
    ROJO: "#d92d20",
    AZUL: "#175cd3",
    VERDE: "#079455",
  },

  cerebro: {
    IZQUIERDO: "#f2b705",
    CENTRAL: "#d92d20",
    DERECHO: "#175cd3",
  },

  negociacion: {
    BAJO: "#d92d20",
    MEDIO: "#f79009",
    ALTO: "#079455",
  },

  vak: {
    VISUAL: "#175cd3",
    AUDITIVO: "#d92d20",
    KINESTESICO: "#079455",
    "KINESTÉSICO": "#079455",
  },

  persistencia: {
    SI: "#079455",
    "SÍ": "#079455",
    NO: "#667085",
    ALERTA: "#f79009",
  },

  productividad: {
    A: "#067647",
    B: "#079455",
    C: "#175cd3",
    D: "#f79009",
    E: "#d92d20",
    F: "#912018",
  },
};

const FILTER_LABELS = {
  seccionId: "Sección",
  genero: "Género",
  rangoEtario: "Rango etario",
  animodo: "Animodo",
  comunicacion: "Comunicación",
  cerebro: "Cerebro",
  negociacion: "Negociación",
  vak: "VAK",
  persistencia: "Persistencia",
  productividad: "Productividad",
  personalidad: "Personalidad",
};

const AGE_GROUP_LABELS = {
  GEN_0: "Menor de 18",
  GEN_1: "18 - 35",
  GEN_2: "36 - 45",
  GEN_3: "46 en adelante",
};

const EMPTY_FILTERS = {
  seccionId: "",
  genero: "",
  rangoEtario: "",
  animodo: "",
  comunicacion: "",
  cerebro: "",
  negociacion: "",
  vak: "",
  persistencia: "",
  productividad: "",
  personalidad: "",
};

const normalizeKey = (
  value,
) =>
  String(
    value || "",
  )
    .trim()
    .toUpperCase();

const shortenAxisLabel = (
  value,
  maxLength = 18,
) => {
  const text = String(
    value || "",
  );

  if (
    text.length <=
    maxLength
  ) {
    return text;
  }

  return `${text.slice(
    0,
    maxLength - 1,
  )}…`;
};

const getDisplayValue = (
  dimension,
  value,
  label = null,
) => {
  if (label) {
    return label;
  }

  if (
    dimension ===
    "rangoEtario"
  ) {
    return (
      AGE_GROUP_LABELS[
        value
      ] ||
      value
    );
  }

  return value;
};

const getDimensionColor = (
  dimension,
  value,
  fallbackIndex = 0,
) => {
  const normalized =
    normalizeKey(
      value,
    );

  /*
   * Si llega un Animodo intermedio por compatibilidad,
   * usa el verde de Camaleón. El backend actual
   * ya agrupa "ENTRE ..." como CAMALEON.
   */
  if (
    dimension ===
      "animodo" &&
    normalized.startsWith(
      "ENTRE ",
    )
  ) {
    return "#16a36d";
  }

  return (
    DIMENSION_COLORS[
      dimension
    ]?.[
      normalized
    ] ||
    FALLBACK_COLORS[
      fallbackIndex %
        FALLBACK_COLORS.length
    ]
  );
};

const formatDate = (
  value,
) => {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "es-EC",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).format(
      new Date(
        value,
      ),
    );
  } catch {
    return value;
  }
};

const DistributionTooltip = ({
  active,
  payload,
}) => {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const item =
    payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div className="companyResultsTooltip">
      <strong>
        {item.displayKey ||
          item.label ||
          item.key}
      </strong>

      <span>
        Personas:{" "}
        {item.cantidad}
      </span>

      <span>
        Porcentaje:{" "}
        {item.porcentaje ??
          0}
        %
      </span>
    </div>
  );
};

const DistributionChart = ({
  title,
  dimension,
  data = [],
  activeValue,
  onSelect,
  type = "bar",
  subtitle = null,
}) => {
  const chartData =
    (data || []).map(
      (
        item,
      ) => ({
        ...item,
        displayKey:
          getDisplayValue(
            dimension,
            item.key,
            item.label,
          ),
      }),
    );

  const activeLabel =
    chartData.find(
      (item) =>
        String(
          item.key,
        ) ===
        String(
          activeValue,
        ),
    )?.displayKey ||
    getDisplayValue(
      dimension,
      activeValue,
    );

  return (
    <article className="companyResultsPanel">
      <header className="companyResultsPanel__header">
        <div>
          <span>
            Filtro interactivo
          </span>

          <h3>
            {title}
          </h3>

          {subtitle && (
            <p>
              {subtitle}
            </p>
          )}
        </div>

        {activeValue && (
          <button
            type="button"
            className="companyResultsMiniClear"
            onClick={() =>
              onSelect(
                dimension,
                activeValue,
              )
            }
          >
            {activeLabel} ×
          </button>
        )}
      </header>

      {!chartData.length ? (
        <div className="companyResultsEmpty">
          Sin datos para los
          filtros actuales.
        </div>
      ) : (
        <div className="companyResultsChart">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            {type ===
            "pie" ? (
              <PieChart>
                <Pie
                  data={
                    chartData
                  }
                  dataKey="cantidad"
                  nameKey="displayKey"
                  innerRadius={50}
                  outerRadius={86}
                  paddingAngle={3}
                  stroke="#fff"
                  strokeWidth={2}
                  labelLine={false}
                  label={({
                    payload,
                  }) =>
                    payload?.cantidad ??
                    ""
                  }
                  onClick={(
                    entry,
                  ) =>
                    onSelect(
                      dimension,
                      entry?.key,
                    )
                  }
                  style={{
                    cursor:
                      "pointer",
                  }}
                >
                  {chartData.map(
                    (
                      item,
                      index,
                    ) => (
                      <Cell
                        key={`${dimension}-${item.key}`}
                        fill={getDimensionColor(
                          dimension,
                          item.key,
                          index,
                        )}
                        opacity={
                          !activeValue ||
                          String(
                            activeValue,
                          ) ===
                            String(
                              item.key,
                            )
                            ? 1
                            : 0.24
                        }
                        cursor="pointer"
                      />
                    ),
                  )}
                </Pie>

                <Tooltip
                  content={
                    <DistributionTooltip />
                  }
                />

                <Legend />
              </PieChart>
            ) : (
              <BarChart
                data={
                  chartData
                }
                margin={{
                  top: 12,
                  right: 12,
                  left: 0,
                  bottom:
                    chartData.length >
                    4
                      ? 48
                      : 12,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={
                    false
                  }
                />

                <XAxis
                  dataKey="displayKey"
                  interval={0}
                  angle={
                    chartData.length >
                    2
                      ? -28
                      : 0
                  }
                  textAnchor={
                    chartData.length >
                    2
                      ? "end"
                      : "middle"
                  }
                  height={
                    chartData.length >
                    2
                      ? 88
                      : 42
                  }
                  tickFormatter={(
                    value,
                  ) =>
                    shortenAxisLabel(
                      value,
                    )
                  }
                />

                <YAxis
                  allowDecimals={
                    false
                  }
                />

                <Tooltip
                  content={
                    <DistributionTooltip />
                  }
                />

                <Bar
                  dataKey="cantidad"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                >
                  <LabelList
                    dataKey="cantidad"
                    position="top"
                    fill="#344054"
                    fontSize={12}
                    fontWeight={800}
                  />

                  {chartData.map(
                    (
                      item,
                      index,
                    ) => (
                      <Cell
                        key={`${dimension}-${item.key}`}
                        fill={getDimensionColor(
                          dimension,
                          item.key,
                          index,
                        )}
                        opacity={
                          !activeValue ||
                          String(
                            activeValue,
                          ) ===
                            String(
                              item.key,
                            )
                            ? 1
                            : 0.24
                        }
                        cursor="pointer"
                        onClick={() =>
                          onSelect(
                            dimension,
                            item.key,
                          )
                        }
                      />
                    ),
                  )}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
};

const PsychometricCompanyResults =
  () => {
    const {
      token,
    } =
      useParams();

    const navigate =
      useNavigate();

    const [
      data,
      setData,
    ] =
      useState(null);

    const [
      loading,
      setLoading,
    ] =
      useState(true);

    const [
      error,
      setError,
    ] =
      useState("");

    const [
      page,
      setPage,
    ] =
      useState(1);

    const [
      search,
      setSearch,
    ] =
      useState("");

    const [
      searchInput,
      setSearchInput,
    ] =
      useState("");

    const [
      filters,
      setFilters,
    ] =
      useState(
        EMPTY_FILTERS,
      );

    useEffect(
      () => {
        if (!token) {
          return;
        }

        let cancelled =
          false;

        const load =
          async () => {
            setLoading(
              true,
            );

            setError(
              "",
            );

            try {
              const response =
                await axios.get(
                  `${API_URL}/psychometric/company-results/${token}`,
                  {
                    params: {
                      page,
                      limit: 20,
                      search,
                      ...filters,
                    },
                  },
                );

              if (
                !cancelled
              ) {
                setData(
                  response.data,
                );
              }
            } catch (
              err
            ) {
              if (
                cancelled
              ) {
                return;
              }

              setError(
                err?.response
                  ?.data
                  ?.message ||
                  "No fue posible cargar los resultados de la empresa.",
              );
            } finally {
              if (
                !cancelled
              ) {
                setLoading(
                  false,
                );
              }
            }
          };

        load();

        return () => {
          cancelled =
            true;
        };
      },
      [
        token,
        page,
        search,
        filters,
      ],
    );

    const company =
      data?.empresa ||
      {};

    const summary =
      data?.summary ||
      {};

    const analytics =
      data?.analytics ||
      {};

    const participants =
      data?.participants ||
      {};

    const sections =
      data?.secciones ||
      [];

    const activeFilters =
      useMemo(
        () =>
          Object.entries(
            filters,
          ).filter(
            ([
              ,
              value,
            ]) =>
              Boolean(
                value,
              ),
          ),
        [
          filters,
        ],
      );

    const getFilterDisplay =
      (
        key,
        value,
      ) => {
        if (
          key ===
          "seccionId"
        ) {
          return (
            sections.find(
              (
                section,
              ) =>
                String(
                  section.id,
                ) ===
                String(
                  value,
                ),
            )?.nombre ||
            value
          );
        }

        if (
          key ===
          "rangoEtario"
        ) {
          return (
            AGE_GROUP_LABELS[
              value
            ] ||
            value
          );
        }

        return value;
      };

    const updateFilter =
      (
        key,
        value,
      ) => {
        if (
          !key
        ) {
          return;
        }

        setPage(
          1,
        );

        setFilters(
          (
            current,
          ) => ({
            ...current,

            [key]:
              String(
                current[
                  key
                ] ||
                  "",
              ) ===
              String(
                value ||
                  "",
              )
                ? ""
                : value,
          }),
        );
      };

    const clearFilters =
      () => {
        setPage(
          1,
        );

        setFilters(
          EMPTY_FILTERS,
        );
      };

    const handleSearch =
      (
        event,
      ) => {
        event.preventDefault();

        setPage(
          1,
        );

        setSearch(
          searchInput.trim(),
        );
      };

    const clearAll =
      () => {
        clearFilters();

        setSearch(
          "",
        );

        setSearchInput(
          "",
        );
      };


    const handleOpenCompanyPdf =
      () => {
        const params =
          new URLSearchParams();

        Object.entries(
          filters,
        ).forEach(
          ([
            key,
            value,
          ]) => {
            if (
              value
            ) {
              params.set(
                key,
                value,
              );
            }
          },
        );

        const query =
          params.toString();

        const url =
          `${API_URL}/psychometric/company-results/${token}/pdf${
            query
              ? `?${query}`
              : ""
          }`;

        window.open(
          url,
          "_blank",
          "noopener,noreferrer",
        );
      };

    if (
      loading &&
      !data
    ) {
      return (
        <section className="companyResultsState">
          <div className="companyResultsSpinner" />

          <h2>
            Cargando resultados
            empresariales...
          </h2>

          <p>
            Estamos preparando la
            información psicométrica
            de la organización.
          </p>
        </section>
      );
    }

    if (
      error &&
      !data
    ) {
      return (
        <section className="companyResultsState companyResultsState--error">
          <h2>
            Acceso no disponible
          </h2>

          <p>
            {error}
          </p>
        </section>
      );
    }

    return (
      <section className="companyResults">
        <header className="companyResultsHero">
          <div className="companyResultsHero__brand">
            {company.logoUrl ? (
              <img
                src={
                  company.logoUrl
                }
                alt={
                  company.nombre ||
                  "Empresa"
                }
              />
            ) : (
              <div className="companyResultsHero__logoFallback">
                iDr.Mind
              </div>
            )}
          </div>

          <div className="companyResultsHero__content">
            <span className="companyResultsEyebrow">
              Proyecto Pensar ·
              Resultados empresariales
            </span>

            <h1>
              {company.nombre ||
                "Empresa"}
            </h1>

            <p>
              Dashboard psicométrico
              exclusivo de la empresa.
              Todos los gráficos,
              indicadores y participantes
              responden a los filtros
              seleccionados.
            </p>

            <div className="companyResultsHero__meta">
              {company.sector && (
                <span>
                  {company.sector}
                </span>
              )}

              {company.subSector && (
                <span>
                  {company.subSector}
                </span>
              )}
            </div>
          </div>

          <div className="companyResultsHero__actions">
            <button
              type="button"
              className="companyResultsHero__pdf"
              onClick={
                handleOpenCompanyPdf
              }
            >
              Generar informe PDF
            </button>

            <button
              type="button"
              className="companyResultsHero__clear"
              disabled={
                !activeFilters.length &&
                !search
              }
              onClick={
                clearAll
              }
            >
              Limpiar filtros
            </button>
          </div>
        </header>

        {error && (
          <div className="companyResultsAlert">
            {error}
          </div>
        )}

        {(activeFilters.length >
          0 ||
          search) && (
          <section className="companyResultsActiveFilters">
            <span className="companyResultsActiveFilters__title">
              Filtros activos:
            </span>

            {activeFilters.map(
              ([
                key,
                value,
              ]) => (
                <button
                  key={
                    key
                  }
                  type="button"
                  onClick={() =>
                    updateFilter(
                      key,
                      value,
                    )
                  }
                >
                  <strong>
                    {FILTER_LABELS[
                      key
                    ] ||
                      key}
                  </strong>
                  :{" "}
                  {getFilterDisplay(
                    key,
                    value,
                  )}{" "}
                  ×
                </button>
              ),
            )}

            {search && (
              <button
                type="button"
                onClick={() => {
                  setPage(
                    1,
                  );

                  setSearch(
                    "",
                  );

                  setSearchInput(
                    "",
                  );
                }}
              >
                <strong>
                  Búsqueda
                </strong>
                : {search} ×
              </button>
            )}
          </section>
        )}

        <section className="companyResultsKpis">
          <article>
            <span>
              Resultados
            </span>

            <strong>
              {summary.totalResultados ??
                0}
            </strong>

            <small>
              según filtros activos
            </small>
          </article>

          <article>
            <span>
              Secciones
            </span>

            <strong>
              {summary.totalSecciones ??
                0}
            </strong>

            <small>
              áreas de la empresa
            </small>
          </article>

          <article>
            <span>
              Productividad
            </span>

            <strong>
              {summary.productividadPromedio ??
                0}
              %
            </strong>

            <small>
              promedio filtrado
            </small>
          </article>

          <article>
            <span>
              Negociación
            </span>

            <strong>
              {summary.negociacionPromedio ??
                0}
            </strong>

            <small>
              puntaje promedio
            </small>
          </article>

          <article>
            <span>
              Persistencia
            </span>

            <strong>
              {summary.persistenciaPromedio ??
                0}
            </strong>

            <small>
              promedio filtrado
            </small>
          </article>
        </section>

        <section className="companyResultsSectionBlock">
          <div className="companyResultsSectionTitle">
            <div>
              <span className="companyResultsEyebrow">
                Perfil de la organización
              </span>

              <h2>
                Resultados dinámicos
              </h2>

              <p>
                Haz clic en cualquier
                barra o segmento para
                filtrar todos los demás
                resultados.
              </p>
            </div>
          </div>

          <div className="companyResultsCharts">
            <DistributionChart
              title="Secciones"
              dimension="seccionId"
              data={
                analytics.secciones
                  ?.distribution
              }
              activeValue={
                filters.seccionId
              }
              onSelect={
                updateFilter
              }
              subtitle="También funciona como filtro del dashboard."
            />

            <DistributionChart
              title="Género"
              dimension="genero"
              data={
                analytics.genero
                  ?.distribution
              }
              activeValue={
                filters.genero
              }
              onSelect={
                updateFilter
              }
              type="pie"
            />

            <DistributionChart
              title="Rango etario"
              dimension="rangoEtario"
              data={
                analytics.rangoEtario
                  ?.distribution
              }
              activeValue={
                filters.rangoEtario
              }
              onSelect={
                updateFilter
              }
            />

            <DistributionChart
              title="Animodo"
              dimension="animodo"
              data={
                analytics.animodo
                  ?.distribution
              }
              activeValue={
                filters.animodo
              }
              onSelect={
                updateFilter
              }
            />

            <DistributionChart
              title="Colores de la comunicación"
              dimension="comunicacion"
              data={
                analytics.comunicacion
                  ?.distribution
              }
              activeValue={
                filters.comunicacion
              }
              onSelect={
                updateFilter
              }
              type="pie"
            />

            <DistributionChart
              title="Tipos de cerebro"
              dimension="cerebro"
              data={
                analytics.cerebro
                  ?.distribution
              }
              activeValue={
                filters.cerebro
              }
              onSelect={
                updateFilter
              }
            />

            <DistributionChart
              title="Negociación"
              dimension="negociacion"
              data={
                analytics.negociacion
                  ?.distribution
              }
              activeValue={
                filters.negociacion
              }
              onSelect={
                updateFilter
              }
              type="pie"
            />

            <DistributionChart
              title="VAK"
              dimension="vak"
              data={
                analytics.vak
                  ?.distribution
              }
              activeValue={
                filters.vak
              }
              onSelect={
                updateFilter
              }
            />

            <DistributionChart
              title="Persistencia"
              dimension="persistencia"
              data={
                analytics.persistencia
                  ?.distribution
              }
              activeValue={
                filters.persistencia
              }
              onSelect={
                updateFilter
              }
              type="pie"
            />

            <DistributionChart
              title="Productividad"
              dimension="productividad"
              data={
                analytics.productividad
                  ?.distribution
              }
              activeValue={
                filters.productividad
              }
              onSelect={
                updateFilter
              }
            />

            <DistributionChart
              title="Personalidad"
              dimension="personalidad"
              data={
                analytics.personalidad
                  ?.distribution
              }
              activeValue={
                filters.personalidad
              }
              onSelect={
                updateFilter
              }
            />
          </div>
        </section>

        <section className="companyResultsSectionBlock">
          <div className="companyResultsSectionTitle">
            <div>
              <span className="companyResultsEyebrow">
                Estructura interna
              </span>

              <h2>
                Todas las secciones
              </h2>

              <p>
                Este catálogo permanece
                visible aunque filtres el
                dashboard.
              </p>
            </div>
          </div>

          {!sections.length ? (
            <div className="companyResultsEmpty companyResultsEmpty--block">
              No existen secciones con
              resultados.
            </div>
          ) : (
            <div className="companyResultsSections">
              {sections.map(
                (
                  section,
                ) => (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    className={
                      String(
                        filters.seccionId,
                      ) ===
                      String(
                        section.id,
                      )
                        ? "companyResultsSectionCard active"
                        : "companyResultsSectionCard"
                    }
                    onClick={() =>
                      updateFilter(
                        "seccionId",
                        section.id,
                      )
                    }
                  >
                    <span>
                      {section.nombre}
                    </span>

                    <strong>
                      {section.totalResultados}
                    </strong>

                    <small>
                      resultados totales
                    </small>
                  </button>
                ),
              )}
            </div>
          )}
        </section>

        <section className="companyResultsParticipants">
          <header className="companyResultsParticipants__header">
            <div>
              <span className="companyResultsEyebrow">
                Resultados individuales
              </span>

              <h2>
                Participantes
              </h2>

              <p>
                El listado responde a los
                mismos filtros de los
                gráficos.
              </p>
            </div>

            <form
              className="companyResultsSearch"
              onSubmit={
                handleSearch
              }
            >
              <input
                type="search"
                value={
                  searchInput
                }
                placeholder="Buscar nombre, cédula o correo..."
                onChange={(
                  event,
                ) =>
                  setSearchInput(
                    event.target.value,
                  )
                }
              />

              <button
                type="submit"
              >
                Buscar
              </button>
            </form>
          </header>

          <div className="companyResultsTableWrap">
            <table className="companyResultsTable">
              <thead>
                <tr>
                  <th>
                    Participante
                  </th>
                  <th>
                    Sección
                  </th>
                  <th>
                    Género
                  </th>
                  <th>
                    Rango etario
                  </th>
                  <th>
                    Animodo
                  </th>
                  <th>
                    Comunicación
                  </th>
                  <th>
                    Cerebro
                  </th>
                  <th>
                    VAK
                  </th>
                  <th>
                    Productividad
                  </th>
                  <th>
                    Finalización
                  </th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {(participants.data ||
                  []).map(
                    (
                      row,
                    ) => (
                      <tr
                        key={
                          row.evaluationId
                        }
                      >
                        <td>
                          <strong>
                            {row.participante
                              ?.nombreCompleto ||
                              "—"}
                          </strong>

                          <small>
                            {row.participante
                              ?.email ||
                              "—"}
                          </small>
                        </td>

                        <td>
                          {row.seccion
                            ?.nombre ||
                            "—"}
                        </td>

                        <td>
                          {row.participante
                            ?.genre ||
                            "—"}
                        </td>

                        <td>
                          <strong>
                            {row.participante
                              ?.rangoEtarioLabel ||
                              "—"}
                          </strong>

                          {row.participante
                            ?.edad !==
                            null &&
                            row.participante
                              ?.edad !==
                              undefined && (
                              <small>
                                {row.participante
                                  .edad}{" "}
                                años
                              </small>
                            )}
                        </td>

                        <td>
                          {row.resultado
                            ?.animodo ||
                            row.resultado
                              ?.animodoCategoria ||
                            "—"}
                        </td>

                        <td>
                          <span
                            className="companyResultsValueDot"
                            style={{
                              "--value-color":
                                getDimensionColor(
                                  "comunicacion",
                                  row.resultado
                                    ?.comunicacion,
                                ),
                            }}
                          >
                            {row.resultado
                              ?.comunicacion ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className="companyResultsValueDot"
                            style={{
                              "--value-color":
                                getDimensionColor(
                                  "cerebro",
                                  row.resultado
                                    ?.cerebro,
                                ),
                            }}
                          >
                            {row.resultado
                              ?.cerebro ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          <span
                            className="companyResultsValueDot"
                            style={{
                              "--value-color":
                                getDimensionColor(
                                  "vak",
                                  row.resultado
                                    ?.vak,
                                ),
                            }}
                          >
                            {row.resultado
                              ?.vak ||
                              "—"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {row.resultado
                              ?.productividad ||
                              "—"}
                          </strong>

                          <small>
                            {row.resultado
                              ?.productividadPorcentaje ??
                              0}
                            %
                          </small>
                        </td>

                        <td>
                          {formatDate(
                            row.fechaFinalizacion,
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="companyResultsViewBtn"
                            onClick={() =>
                              navigate(
                                `/resultados-empresa/${token}/participante/${row.evaluationId}`,
                              )
                            }
                          >
                            Ver resultado
                          </button>
                        </td>
                      </tr>
                    ),
                  )}

                {!participants.data
                  ?.length && (
                  <tr>
                    <td
                      colSpan={
                        11
                      }
                    >
                      <div className="companyResultsEmpty companyResultsEmpty--block">
                        No existen
                        participantes para
                        los filtros actuales.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer className="companyResultsPagination">
            <span>
              {participants
                ?.pagination
                ?.total ??
                0}{" "}
              resultados · página{" "}
              {participants
                ?.pagination
                ?.page ??
                1}{" "}
              de{" "}
              {participants
                ?.pagination
                ?.totalPages ??
                1}
            </span>

            <div>
              <button
                type="button"
                disabled={
                  !participants
                    ?.pagination
                    ?.hasPrevious
                }
                onClick={() =>
                  setPage(
                    (
                      current,
                    ) =>
                      Math.max(
                        1,
                        current -
                          1,
                      ),
                  )
                }
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={
                  !participants
                    ?.pagination
                    ?.hasNext
                }
                onClick={() =>
                  setPage(
                    (
                      current,
                    ) =>
                      current +
                      1,
                  )
                }
              >
                Siguiente
              </button>
            </div>
          </footer>
        </section>

        <footer className="companyResultsFooter">
          <strong>
            iDr.Mind
          </strong>

          <span>
            Proyecto Pensar ·
            Información psicométrica de
            uso organizacional.
          </span>
        </footer>
      </section>
    );
  };

export default PsychometricCompanyResults;
