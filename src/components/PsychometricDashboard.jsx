import { useMemo, useState } from "react";

import axios from "axios";

import getConfigToken from "../services/getConfigToken";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import usePsychometricDashboard from "../hooks/usePsychometricDashboard";

import "./styles/PsychometricDashboard.css";

const API_URL =
    import.meta.env.VITE_API_URL;

/* =========================================================
   PALETA GENERAL DE RESPALDO
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

/* =========================================================
   COLORES SEMÁNTICOS

   IMPORTANTE:
   Estos colores NO dependen de la posición del dato.

   ROJO siempre será rojo.
   AZUL siempre será azul.
   VERDE siempre será verde.
   AMARILLO siempre será amarillo.
========================================================= */

const DIMENSION_COLORS = {
    /* =========================
       ANIMODO
    ========================= */

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

    /* =========================
       COMUNICACIÓN
    ========================= */

    comunicacion: {
        AMARILLO: "#f2b705",
        ROJO: "#d92d20",
        AZUL: "#175cd3",
        VERDE: "#079455",
    },

    /* =========================
       CEREBRO
  
       Coincide con la lógica visual
       utilizada en el resultado:
       Izquierdo = amarillo
       Central   = rojo
       Derecho   = azul
    ========================= */

    cerebro: {
        IZQUIERDO: "#f2b705",
        CENTRAL: "#d92d20",
        DERECHO: "#175cd3",
    },

    /* =========================
       NEGOCIACIÓN
    ========================= */

    negociacion: {
        BAJO: "#d92d20",
        MEDIO: "#f79009",
        ALTO: "#079455",
    },

    /* =========================
       VAK
    ========================= */

    vak: {
        VISUAL: "#175cd3",
        AUDITIVO: "#d92d20",
        KINESTESICO: "#079455",
        "KINESTÉSICO": "#079455",
    },

    /* =========================
       PERSISTENCIA
    ========================= */

    persistencia: {
        SI: "#079455",
        "SÍ": "#079455",

        NO: "#667085",

        ALERTA: "#f79009",
    },

    /* =========================
       GÉNERO
    ========================= */

    genero: {
        MASCULINO: "#175cd3",
        HOMBRE: "#175cd3",
        M: "#175cd3",
        FEMENINO: "#d946ef",
        MUJER: "#d946ef",
        F: "#d946ef",
    },

    /* =========================
       RANGO ETARIO
    ========================= */

    rangoEtario: {
        GEN_0: "#28a7e8",
        GEN_1: "#173a8a",
        GEN_2: "#8b5cf6",
        GEN_3: "#667085",
    },

    /* =========================
       PRODUCTIVIDAD
    ========================= */

    productividad: {
        A: "#067647",
        B: "#079455",
        C: "#175cd3",
        D: "#f79009",
        E: "#d92d20",
        F: "#912018",
    },
};

/* =========================================================
   ETIQUETAS
========================================================= */

const LABELS = {
    genero: "Género",

    rangoEtario:
        "Rango etario",

    animodo: "Animodo",

    comunicacion:
        "Comunicación",

    cerebro:
        "Tipo de cerebro",

    negociacion:
        "Forma negociadora",

    vak:
        "VAK",

    persistencia:
        "Persistencia",

    productividad:
        "Productividad",

    personalidad:
        "Personalidad",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeKey = (
    value,
) => {
    return String(
        value || "",
    )
        .trim()
        .toUpperCase();
};

const AGE_GROUP_LABELS = {
    GEN_0: "Menor de 18",
    GEN_1: "18 - 35",
    GEN_2: "36 - 45",
    GEN_3: "46 en adelante",
};

const getDisplayValue = (
    dimension,
    value,
) => {
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
        normalizeKey(value);

    const semanticColor =
        DIMENSION_COLORS[
        dimension
        ]?.[normalized];

    if (
        semanticColor
    ) {
        return semanticColor;
    }

    return FALLBACK_COLORS[
        fallbackIndex %
        FALLBACK_COLORS.length
    ];
};

const formatMoney = (
    value,
) => {
    return new Intl.NumberFormat(
        "es-EC",
        {
            style:
                "currency",

            currency:
                "USD",

            minimumFractionDigits:
                2,
        },
    ).format(
        Number(
            value || 0,
        ),
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
                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",
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

/* =========================================================
   TOOLTIP DISTRIBUCIÓN
========================================================= */

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
        <div className="psyDashTooltip">
            <strong>
                {item.label || item.key}
            </strong>

            <span>
                Personas:{" "}
                {item.cantidad}
            </span>

            <span>
                Porcentaje:{" "}
                {item.porcentaje}%
            </span>
        </div>
    );
};

/* =========================================================
   GRÁFICO DE DISTRIBUCIÓN
========================================================= */

const DistributionChart = ({
    title,

    filterKey,

    distribution = [],

    activeValue,

    onSelect,

    type = "bar",

    subtitle = null,
}) => {
    const chartData =
        (distribution || []).map(
            (item) => ({
                ...item,
                displayKey:
                    item.label ||
                    getDisplayValue(
                        filterKey,
                        item.key,
                    ),
            }),
        );

    const handleSelect = (
        value,
    ) => {
        if (!value) {
            return;
        }

        onSelect(
            filterKey,
            value,
        );
    };

    return (
        <article className="psyDashPanel">
            <div className="psyDashPanel__header">

                <div>
                    <span className="psyDashEyebrow">
                        Filtro interactivo
                    </span>

                    <h3>
                        {title}
                    </h3>

                    {subtitle && (
                        <p className="psyDashPanel__subtitle">
                            {subtitle}
                        </p>
                    )}
                </div>

                {activeValue && (
                    <button
                        type="button"
                        className="psyDashMiniClear"
                        onClick={() =>
                            onSelect(
                                filterKey,
                                activeValue,
                            )
                        }
                        title="Quitar filtro"
                    >
                        {getDisplayValue(
                            filterKey,
                            activeValue,
                        )}
                        {" ×"}
                    </button>
                )}
            </div>

            {!distribution?.length ? (
                <div className="psyDashEmpty">
                    Sin datos para los
                    filtros actuales.
                </div>
            ) : (
                <div className="psyDashChart">

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
                                    innerRadius={52}
                                    outerRadius={88}
                                    paddingAngle={3}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    onClick={(
                                        entry,
                                    ) =>
                                        handleSelect(
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
                                                key={`${filterKey}-${item.key}`}
                                                fill={getDimensionColor(
                                                    filterKey,
                                                    item.key,
                                                    index,
                                                )}
                                                opacity={
                                                    !activeValue ||
                                                        activeValue ===
                                                        item.key
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
                                            ? 40
                                            : 10,
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
                                            4
                                            ? -18
                                            : 0
                                    }
                                    textAnchor={
                                        chartData.length >
                                            4
                                            ? "end"
                                            : "middle"
                                    }
                                    height={
                                        chartData.length >
                                            4
                                            ? 65
                                            : 35
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
                                    isAnimationActive
                                >
                                    {chartData.map(
                                        (
                                            item,
                                            index,
                                        ) => (
                                            <Cell
                                                key={`${filterKey}-${item.key}`}
                                                fill={getDimensionColor(
                                                    filterKey,
                                                    item.key,
                                                    index,
                                                )}
                                                opacity={
                                                    !activeValue ||
                                                        activeValue ===
                                                        item.key
                                                        ? 1
                                                        : 0.24
                                                }
                                                cursor="pointer"
                                                onClick={() =>
                                                    handleSelect(
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

/* =========================================================
   GRÁFICO PROMEDIOS
========================================================= */

const AverageValuesChart = ({
    title,

    dimension,

    values = {},

    suffix = "%",
}) => {
    const data =
        Object.entries(
            values || {},
        ).map(
            ([
                key,
                value,
            ]) => ({
                key,
                value:
                    Number(
                        value || 0,
                    ),
            }),
        );

    if (
        !data.length
    ) {
        return null;
    }

    return (
        <article className="psyDashPanel">

            <div className="psyDashPanel__header">
                <div>
                    <span className="psyDashEyebrow">
                        Promedio del grupo
                    </span>

                    <h3>
                        {title}
                    </h3>
                </div>
            </div>

            <div className="psyDashChart">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={data}
                        margin={{
                            top: 12,
                            right: 12,
                            left: 0,
                            bottom: 10,
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={
                                false
                            }
                        />

                        <XAxis
                            dataKey="key"
                            interval={0}
                        />

                        <YAxis />

                        <Tooltip
                            formatter={(
                                value,
                            ) => [
                                    `${value}${suffix}`,
                                    "Promedio",
                                ]}
                        />

                        <Bar
                            dataKey="value"
                            radius={[
                                8,
                                8,
                                0,
                                0,
                            ]}
                        >
                            {data.map(
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
                                    />
                                ),
                            )}
                        </Bar>

                    </BarChart>
                </ResponsiveContainer>
            </div>

        </article>
    );
};

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

const PsychometricDashboard = () => {
    const {
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

        companyAccess,
        loadingCompanyAccess,
        companyAccessAction,
        companyAccessMessage,
        companyAccessError,

        setParticipantPage,

        setParticipantLimit,

        setParticipantSearch,

        updateFilter,

        setFilterValue,

        selectCompanySection,

        clearFilters,

        loadDashboard,

        loadParticipantDetail,

        closeParticipantDetail,

        loadCompanyAccessStatus,
        sendCompanyAccess,
        setCompanyAccessActive,
        clearCompanyAccessFeedback,
    } =
        usePsychometricDashboard();

    const [
        view,
        setView,
    ] =
        useState(
            "general",
        );

    const [
        selectedCompanyId,
        setSelectedCompanyId,
    ] = useState("");


    const [
        generatingCompanyPdfId,
        setGeneratingCompanyPdfId,
    ] = useState("");

    /* =====================================================
       DATA
    ===================================================== */

    const kpis =
        summary?.kpis ||
        {};

    const analytical =
        analytics?.analytics ||
        {};

    /* =====================================================
       SECCIONES SEGÚN EMPRESA
    ===================================================== */

    const availableSections =
        useMemo(
            () => {
                const rows =
                    filterOptions
                        ?.secciones ||
                    [];

                if (
                    !filters.empresaId
                ) {
                    return rows;
                }

                return rows.filter(
                    (
                        item,
                    ) =>
                        String(
                            item.empresaId ||
                            "",
                        ) ===
                        String(
                            filters.empresaId,
                        ),
                );
            },
            [
                filterOptions,
                filters.empresaId,
            ],
        );

    /* =====================================================
       FILTROS CRUZADOS ACTIVOS
    ===================================================== */

    const activeCrossFilters =
        useMemo(
            () =>
                [
                    "genero",
                    "rangoEtario",
                    "animodo",
                    "comunicacion",
                    "cerebro",
                    "negociacion",
                    "vak",
                    "persistencia",
                    "productividad",
                    "personalidad",
                ].filter(
                    (key) =>
                        Boolean(
                            filters[
                            key
                            ],
                        ),
                ),

            [
                filters,
            ],
        );

    const evaluationTimeline =
        summary?.timeline
            ?.evaluaciones ||
        [];

    const paymentTimeline =
        summary?.timeline
            ?.pagos ||
        [];

    /* =====================================================
       CAMBIAR VISTA AL FILTRAR EMPRESA
    ===================================================== */

    const handleCompanyFilter = (
        companyId,
    ) => {
        setFilterValue(
            "empresaId",
            companyId,
        );

        setSelectedCompanyId(
            companyId,
        );

        setView(
            "resultados",
        );
    };

    const handleCompanyOpen = async (
        companyId,
    ) => {
        setSelectedCompanyId(
            companyId,
        );

        clearCompanyAccessFeedback();

        try {
            await loadCompanyAccessStatus(
                companyId,
            );
        } catch {
            // El hook ya administra el mensaje de error.
        }
    };

    const handleCompanyClose = () => {
        setSelectedCompanyId(
            "",
        );

        clearCompanyAccessFeedback();
    };

    const handleSendCompanyAccess = async (
        companyId,
    ) => {
        if (!companyId) {
            return;
        }

        const confirmed =
            window.confirm(
                "Se generará un nuevo enlace de acceso y se enviará al correo registrado de la empresa. Los enlaces anteriores quedarán deshabilitados. ¿Deseas continuar?",
            );

        if (!confirmed) {
            return;
        }

        try {
            await sendCompanyAccess(
                companyId,
            );
        } catch {
            // El hook ya administra el mensaje de error.
        }
    };

    const handleToggleCompanyAccess = async (
        companyId,
    ) => {
        if (!companyId) {
            return;
        }

        const accessData =
            companyAccess[
                companyId
            ]?.access;

        if (!accessData?.exists) {
            window.alert(
                "La empresa todavía no tiene un enlace generado. Primero utiliza Enviar acceso.",
            );

            return;
        }

        const nextActive =
            !accessData.activo;

        const confirmed =
            window.confirm(
                nextActive
                    ? "¿Deseas activar nuevamente el acceso de esta empresa?"
                    : "¿Deseas desactivar el acceso de esta empresa? El enlace dejará de funcionar inmediatamente.",
            );

        if (!confirmed) {
            return;
        }

        try {
            await setCompanyAccessActive(
                companyId,
                nextActive,
            );
        } catch {
            // El hook ya administra el mensaje de error.
        }
    };

    /* =====================================================
       GENERAR INFORME EMPRESARIAL PDF

       Utiliza exactamente el mismo generador empresarial
       conectado en el backend administrativo:

       GET /psychometric/dashboard/organizations/:empresaId/pdf
    ===================================================== */

    const handleGenerateCompanyPdf = async (
        companyId,
    ) => {
        if (!companyId) {
            return;
        }

        if (
            generatingCompanyPdfId
        ) {
            return;
        }

        setGeneratingCompanyPdfId(
            companyId,
        );

        try {
            const response =
                await axios.get(
                    `${API_URL}/psychometric/dashboard/organizations/${companyId}/pdf`,
                    {
                        ...getConfigToken(),

                        responseType:
                            "blob",
                    },
                );

            const pdfBlob =
                new Blob(
                    [
                        response.data,
                    ],
                    {
                        type:
                            "application/pdf",
                    },
                );

            const pdfUrl =
                window.URL.createObjectURL(
                    pdfBlob,
                );

            const pdfWindow =
                window.open(
                    pdfUrl,
                    "_blank",
                    "noopener,noreferrer",
                );

            /*
             * Algunos navegadores pueden bloquear window.open
             * si la respuesta tardó. En ese caso se descarga
             * directamente el mismo PDF.
             */
            if (!pdfWindow) {
                const link =
                    document.createElement(
                        "a",
                    );

                link.href =
                    pdfUrl;

                link.download =
                    `informe-empresarial-${companyId}.pdf`;

                document.body.appendChild(
                    link,
                );

                link.click();

                link.remove();
            }

            window.setTimeout(
                () => {
                    window.URL.revokeObjectURL(
                        pdfUrl,
                    );
                },
                60000,
            );
        } catch (error) {
            console.error(
                "Error generando informe empresarial:",
                error,
            );

            const message =
                error?.response?.data
                    ?.message ||
                "No fue posible generar el informe empresarial.";

            window.alert(
                message,
            );
        } finally {
            setGeneratingCompanyPdfId(
                "",
            );
        }
    };

    /* =====================================================
       FILTRAR SECCIÓN
    ===================================================== */

    const handleSectionFilter = (
        companyId,
        sectionId,
    ) => {
        selectCompanySection(
            companyId,
            sectionId,
        );

        setSelectedCompanyId(
            companyId,
        );

        setView(
            "resultados",
        );
    };

    const selectedCompany =
        useMemo(
            () =>
                (
                    organizations
                        ?.companies ||
                    []
                ).find(
                    (company) =>
                        String(
                            company.id,
                        ) ===
                        String(
                            selectedCompanyId,
                        ),
                ) ||
                null,
            [
                organizations,
                selectedCompanyId,
            ],
        );


    const selectedCompanyAccess =
        selectedCompanyId
            ? companyAccess[
                selectedCompanyId
            ]?.access
            : null;

    const selectedCompanyActionBusy =
        Boolean(
            selectedCompanyId &&
            companyAccessAction?.endsWith(
                `:${selectedCompanyId}`,
            ),
        );

    return (
        <section className="psyDash">

            {/* ===================================================
          HERO
      =================================================== */}

            <header className="psyDashHero">

                <div>
                    <span className="psyDashHero__eyebrow">
                        Proyecto Pensar
                        {" · "}
                        iDr.Mind
                    </span>

                    <h1>
                        Dashboard
                        psicométrico
                    </h1>

                    <p>
                        Resultados individuales
                        y organizacionales con
                        filtros cruzados por
                        empresa, sección,
                        período y dimensión
                        psicométrica.
                    </p>
                </div>

                <div className="psyDashHero__actions">

                    <button
                        type="button"
                        className="psyDashBtn psyDashBtn--ghost"
                        onClick={
                            clearFilters
                        }
                    >
                        Limpiar filtros
                    </button>

                    <button
                        type="button"
                        className="psyDashBtn"
                        onClick={
                            loadDashboard
                        }
                        disabled={
                            loading
                        }
                    >
                        {loading
                            ? "Actualizando..."
                            : "Actualizar"}
                    </button>

                </div>
            </header>

            {/* ===================================================
          VISTAS
      =================================================== */}

            <nav
                className="psyDashViews"
                aria-label="Vistas del dashboard"
            >
                {[
                    [
                        "general",
                        "Resumen",
                    ],

                    [
                        "resultados",
                        "Resultados",
                    ],

                    [
                        "organizaciones",
                        "Empresas y secciones",
                    ],

                    [
                        "personas",
                        "Participantes",
                    ],
                ].map(
                    ([
                        key,
                        label,
                    ]) => (
                        <button
                            key={
                                key
                            }
                            type="button"
                            className={
                                view ===
                                    key
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setView(
                                    key,
                                )
                            }
                        >
                            {label}
                        </button>
                    ),
                )}
            </nav>

            {/* ===================================================
          FILTROS ESTRUCTURALES
      =================================================== */}

            <section className="psyDashFilters">

                <div className="psyDashFilter">
                    <label>
                        Desde
                    </label>

                    <input
                        type="date"
                        value={
                            filters.fechaDesde
                        }
                        onChange={(
                            event,
                        ) =>
                            updateFilter(
                                "fechaDesde",
                                event
                                    .target
                                    .value,
                            )
                        }
                    />
                </div>

                <div className="psyDashFilter">
                    <label>
                        Hasta
                    </label>

                    <input
                        type="date"
                        value={
                            filters.fechaHasta
                        }
                        onChange={(
                            event,
                        ) =>
                            updateFilter(
                                "fechaHasta",
                                event
                                    .target
                                    .value,
                            )
                        }
                    />
                </div>

                <div className="psyDashFilter">
                    <label>
                        Empresa
                    </label>

                    <select
                        value={
                            filters.empresaId
                        }
                        onChange={(
                            event,
                        ) =>
                            updateFilter(
                                "empresaId",
                                event
                                    .target
                                    .value,
                            )
                        }
                    >
                        <option value="">
                            Todas
                        </option>

                        {(
                            filterOptions
                                ?.empresas ||
                            []
                        ).map(
                            (
                                item,
                            ) => (
                                <option
                                    key={
                                        item.id
                                    }
                                    value={
                                        item.id
                                    }
                                >
                                    {
                                        item.nombre
                                    }
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div className="psyDashFilter">
                    <label>
                        Sección
                    </label>

                    <select
                        value={
                            filters.seccionId
                        }
                        disabled={
                            filters.empresaId &&
                            !availableSections.length
                        }
                        onChange={(
                            event,
                        ) =>
                            updateFilter(
                                "seccionId",
                                event
                                    .target
                                    .value,
                            )
                        }
                    >
                        <option value="">
                            Todas
                        </option>

                        {availableSections.map(
                            (
                                item,
                            ) => (
                                <option
                                    key={
                                        item.id
                                    }
                                    value={
                                        item.id
                                    }
                                >
                                    {
                                        item.nombre
                                    }
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div className="psyDashFilter">
                    <label>
                        Test
                    </label>

                    <select
                        value={
                            filters.testId
                        }
                        onChange={(
                            event,
                        ) =>
                            updateFilter(
                                "testId",
                                event
                                    .target
                                    .value,
                            )
                        }
                    >
                        <option value="">
                            Todos
                        </option>

                        {(
                            filterOptions
                                ?.tests ||
                            []
                        ).map(
                            (
                                item,
                            ) => (
                                <option
                                    key={
                                        item.id
                                    }
                                    value={
                                        item.id
                                    }
                                >
                                    {
                                        item.nombre
                                    }

                                    {item.version
                                        ? ` v${item.version}`
                                        : ""}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div className="psyDashFilter">
                    <label>
                        Tipo participante
                    </label>

                    <select
                        value={
                            filters.tipoParticipante
                        }
                        onChange={(
                            event,
                        ) =>
                            updateFilter(
                                "tipoParticipante",
                                event
                                    .target
                                    .value,
                            )
                        }
                    >
                        <option value="">
                            Todos
                        </option>

                        <option value="empresa">
                            Empresa
                        </option>

                        <option value="individual">
                            Individual
                        </option>
                    </select>
                </div>

            </section>

            {/* ===================================================
          FILTROS CRUZADOS
      =================================================== */}

            {activeCrossFilters.length >
                0 && (
                    <div className="psyDashChips">

                        <span>
                            Filtros de resultado:
                        </span>

                        {activeCrossFilters.map(
                            (
                                key,
                            ) => (
                                <button
                                    key={
                                        key
                                    }
                                    type="button"
                                    onClick={() =>
                                        updateFilter(
                                            key,
                                            filters[
                                            key
                                            ],
                                        )
                                    }
                                >
                                    {
                                        LABELS[
                                        key
                                        ]
                                    }
                                    :
                                    {" "}

                                    <strong>
                                        {
                                            getDisplayValue(
                                                key,
                                                filters[
                                                key
                                                ],
                                            )
                                        }
                                    </strong>

                                    {" ×"}
                                </button>
                            ),
                        )}

                    </div>
                )}

            {/* ===================================================
          ERROR
      =================================================== */}

            {error && (
                <div className="psyDashError">
                    {error}
                </div>
            )}

            {/* ===================================================
          LOADING INICIAL
      =================================================== */}

            {loading &&
                !summary ? (
                <div className="psyDashLoading">

                    <div className="psyDashSpinner" />

                    <p>
                        Cargando información
                        psicométrica...
                    </p>

                </div>
            ) : (
                <>

                    {/* =================================================
              RESUMEN
          ================================================= */}

                    {view ===
                        "general" && (
                            <>

                                {/* =============================================
                  KPIs
              ============================================= */}

                                <section className="psyDashKpis">

                                    <article>
                                        <span>
                                            Evaluaciones
                                        </span>

                                        <strong>
                                            {
                                                kpis.evaluaciones ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            {
                                                kpis.completadas ??
                                                0
                                            }{" "}
                                            completadas
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Inscripciones
                                        </span>

                                        <strong>
                                            {
                                                kpis.inscripciones ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            {
                                                kpis.tasaFinalizacion ??
                                                0
                                            }
                                            % finalización
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Empresariales
                                        </span>

                                        <strong>
                                            {
                                                kpis.empresariales ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            {
                                                kpis.empresas ??
                                                0
                                            }{" "}
                                            empresas
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Individuales
                                        </span>

                                        <strong>
                                            {
                                                kpis.individuales ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            {
                                                kpis.secciones ??
                                                0
                                            }{" "}
                                            secciones
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Pagos verificados
                                        </span>

                                        <strong>
                                            {
                                                kpis.pagosVerificados ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            {
                                                kpis.tasaPagoVerificado ??
                                                0
                                            }
                                            % verificados
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Recaudado
                                        </span>

                                        <strong>
                                            {formatMoney(
                                                kpis.recaudado,
                                            )}
                                        </strong>

                                        <small>
                                            {formatMoney(
                                                kpis.valorRegistrado,
                                            )}{" "}
                                            registrado
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            En progreso
                                        </span>

                                        <strong>
                                            {
                                                kpis.enProgreso ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            {
                                                kpis.habilitadas ??
                                                0
                                            }{" "}
                                            habilitadas
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Resultados liberados
                                        </span>

                                        <strong>
                                            {
                                                kpis.resultadosLiberados ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            {
                                                kpis.pagosPendientes ??
                                                0
                                            }{" "}
                                            pagos pendientes
                                        </small>
                                    </article>

                                </section>

                                {/* =============================================
                  EVOLUTIVOS
              ============================================= */}

                                <section className="psyDashTwoCols">

                                    <article className="psyDashPanel">

                                        <div className="psyDashPanel__header">
                                            <div>
                                                <span className="psyDashEyebrow">
                                                    Tendencia
                                                </span>

                                                <h3>
                                                    Evaluaciones
                                                    por día
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="psyDashChart psyDashChart--large">

                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <LineChart
                                                    data={
                                                        evaluationTimeline
                                                    }
                                                >

                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={
                                                            false
                                                        }
                                                    />

                                                    <XAxis
                                                        dataKey="fecha"
                                                    />

                                                    <YAxis
                                                        allowDecimals={
                                                            false
                                                        }
                                                    />

                                                    <Tooltip />

                                                    <Legend />

                                                    <Line
                                                        type="monotone"
                                                        dataKey="evaluaciones"
                                                        name="Evaluaciones"
                                                        stroke="#173a8a"
                                                        strokeWidth={
                                                            3
                                                        }
                                                        dot={{
                                                            r: 4,
                                                        }}
                                                    />

                                                    <Line
                                                        type="monotone"
                                                        dataKey="completadas"
                                                        name="Completadas"
                                                        stroke="#079455"
                                                        strokeWidth={
                                                            2
                                                        }
                                                        dot={{
                                                            r: 3,
                                                        }}
                                                    />

                                                </LineChart>
                                            </ResponsiveContainer>

                                        </div>
                                    </article>

                                    <article className="psyDashPanel">

                                        <div className="psyDashPanel__header">
                                            <div>
                                                <span className="psyDashEyebrow">
                                                    Recaudación
                                                </span>

                                                <h3>
                                                    Pagos por día
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="psyDashChart psyDashChart--large">

                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={
                                                        paymentTimeline
                                                    }
                                                >

                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={
                                                            false
                                                        }
                                                    />

                                                    <XAxis
                                                        dataKey="fecha"
                                                    />

                                                    <YAxis />

                                                    <Tooltip
                                                        formatter={(
                                                            value,
                                                            name,
                                                        ) =>
                                                            name.includes(
                                                                "Valor",
                                                            )
                                                                ? formatMoney(
                                                                    value,
                                                                )
                                                                : value
                                                        }
                                                    />

                                                    <Legend />

                                                    <Bar
                                                        dataKey="valorRegistrado"
                                                        name="Valor registrado"
                                                        fill="#9bb4df"
                                                        radius={[
                                                            6,
                                                            6,
                                                            0,
                                                            0,
                                                        ]}
                                                    />

                                                    <Bar
                                                        dataKey="valorVerificado"
                                                        name="Valor verificado"
                                                        fill="#173a8a"
                                                        radius={[
                                                            6,
                                                            6,
                                                            0,
                                                            0,
                                                        ]}
                                                    />

                                                </BarChart>
                                            </ResponsiveContainer>

                                        </div>
                                    </article>

                                </section>

                                {/* =============================================
                  PRINCIPALES DISTRIBUCIONES
              ============================================= */}

                                <section className="psyDashThreeCols">

                                    <DistributionChart
                                        title="Comunicación"
                                        filterKey="comunicacion"
                                        distribution={
                                            analytical
                                                .comunicacion
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
                                        title="Tipo de cerebro"
                                        filterKey="cerebro"
                                        distribution={
                                            analytical
                                                .cerebro
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
                                        title="Productividad"
                                        filterKey="productividad"
                                        distribution={
                                            analytical
                                                .productividad
                                                ?.distribution
                                        }
                                        activeValue={
                                            filters.productividad
                                        }
                                        onSelect={
                                            updateFilter
                                        }
                                    />

                                </section>

                            </>
                        )}

                    {/* =================================================
              RESULTADOS
          ================================================= */}

                    {view ===
                        "resultados" && (
                            <>

                                <section className="psyDashResultsGrid psyDashResultsGrid--demographic">

                                    <DistributionChart
                                        title="Género"
                                        subtitle="Distribución de participantes por género."
                                        filterKey="genero"
                                        distribution={
                                            analytical
                                                .genero
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
                                        subtitle="Edad calculada a la fecha de finalización de la evaluación."
                                        filterKey="rangoEtario"
                                        distribution={
                                            analytical
                                                .rangoEtario
                                                ?.distribution
                                        }
                                        activeValue={
                                            filters.rangoEtario
                                        }
                                        onSelect={
                                            updateFilter
                                        }
                                    />

                                </section>

                                <section className="psyDashResultsGrid">

                                    <DistributionChart
                                        title="Animodo"
                                        subtitle="Los resultados intermedios se agrupan como CAMALEON."
                                        filterKey="animodo"
                                        distribution={
                                            analytical
                                                .animodo
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
                                        filterKey="comunicacion"
                                        distribution={
                                            analytical
                                                .comunicacion
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
                                        filterKey="cerebro"
                                        distribution={
                                            analytical
                                                .cerebro
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
                                        title="Forma negociadora"
                                        filterKey="negociacion"
                                        distribution={
                                            analytical
                                                .negociacion
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
                                        filterKey="vak"
                                        distribution={
                                            analytical
                                                .vak
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
                                        filterKey="persistencia"
                                        distribution={
                                            analytical
                                                .persistencia
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
                                        title="Índice de productividad personal"
                                        filterKey="productividad"
                                        distribution={
                                            analytical
                                                .productividad
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
                                        filterKey="personalidad"
                                        distribution={
                                            analytical
                                                .personalidad
                                                ?.distribution
                                        }
                                        activeValue={
                                            filters.personalidad
                                        }
                                        onSelect={
                                            updateFilter
                                        }
                                    />

                                </section>

                                {/* =============================================
                  PROMEDIOS NUMÉRICOS
              ============================================= */}

                                <section className="psyDashResultsGrid psyDashResultsGrid--averages">

                                    <AverageValuesChart
                                        title="Promedio de comunicación"
                                        dimension="comunicacion"
                                        values={
                                            analytical
                                                .comunicacion
                                                ?.averagePercentages
                                        }
                                        suffix="%"
                                    />

                                    <AverageValuesChart
                                        title="Promedio de tipos de cerebro"
                                        dimension="cerebro"
                                        values={
                                            analytical
                                                .cerebro
                                                ?.averagePercentages
                                        }
                                        suffix="%"
                                    />

                                    <AverageValuesChart
                                        title="Promedio VAK"
                                        dimension="vak"
                                        values={
                                            analytical
                                                .vak
                                                ?.averagePercentages
                                        }
                                        suffix="%"
                                    />

                                </section>

                                {/* =============================================
                  PROMEDIOS SIMPLES
              ============================================= */}

                                <section className="psyDashMetricStrip">

                                    <article>
                                        <span>
                                            Negociación promedio
                                        </span>

                                        <strong>
                                            {
                                                analytical
                                                    .negociacion
                                                    ?.promedioPuntaje ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            puntos
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Persistencia promedio
                                        </span>

                                        <strong>
                                            {
                                                analytical
                                                    .persistencia
                                                    ?.promedioPuntaje ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            de 4
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Productividad promedio
                                        </span>

                                        <strong>
                                            {
                                                analytical
                                                    .productividad
                                                    ?.promedioPorcentaje ??
                                                0
                                            }
                                            %
                                        </strong>

                                        <small>
                                            índice general
                                        </small>
                                    </article>

                                    <article>
                                        <span>
                                            Resultados analizados
                                        </span>

                                        <strong>
                                            {
                                                analytical
                                                    .totalResultados ??
                                                0
                                            }
                                        </strong>

                                        <small>
                                            personas
                                        </small>
                                    </article>

                                </section>

                            </>
                        )}

                    {/* =================================================
              ORGANIZACIONES
          ================================================= */}

                    {view ===
                        "organizaciones" && (
                            <section className="psyDashOrganizations">

                                {(companyAccessMessage ||
                                    companyAccessError) && (
                                        <div
                                            className={
                                                companyAccessError
                                                    ? "psyDashCompanyFeedback psyDashCompanyFeedback--error"
                                                    : "psyDashCompanyFeedback psyDashCompanyFeedback--success"
                                            }
                                        >
                                            {companyAccessError ||
                                                companyAccessMessage}
                                        </div>
                                    )}

                                {selectedCompany && (
                                    <article className="psyDashCompany psyDashCompany--selected">
                                        <header>
                                            <div>
                                                <span className="psyDashEyebrow">
                                                    Vista empresarial
                                                </span>

                                                <h3>
                                                    {selectedCompany.nombre}
                                                </h3>

                                                <p>
                                                    {selectedCompany.totalResultados} resultados
                                                    {" · "}
                                                    {selectedCompany.secciones?.length || 0} secciones
                                                </p>

                                                <div className="psyDashAccessMeta">
                                                    {loadingCompanyAccess ? (
                                                        <span className="psyDashAccessBadge psyDashAccessBadge--loading">
                                                            Consultando acceso...
                                                        </span>
                                                    ) : selectedCompanyAccess?.exists ? (
                                                        <>
                                                            <span
                                                                className={
                                                                    selectedCompanyAccess.activo
                                                                        ? "psyDashAccessBadge psyDashAccessBadge--active"
                                                                        : "psyDashAccessBadge psyDashAccessBadge--inactive"
                                                                }
                                                            >
                                                                {selectedCompanyAccess.activo
                                                                    ? "ACCESO ACTIVO"
                                                                    : "ACCESO INACTIVO"}
                                                            </span>

                                                            {selectedCompanyAccess.ultimoEnvioAt && (
                                                                <small>
                                                                    Último envío:{" "}
                                                                    {formatDate(
                                                                        selectedCompanyAccess.ultimoEnvioAt,
                                                                    )}
                                                                </small>
                                                            )}

                                                            <small>
                                                                Accesos:{" "}
                                                                {selectedCompanyAccess.accessCount || 0}
                                                            </small>
                                                        </>
                                                    ) : (
                                                        <span className="psyDashAccessBadge psyDashAccessBadge--none">
                                                            SIN ACCESO GENERADO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="psyDashCompanyActions">
                                                <button
                                                    type="button"
                                                    className="psyDashBtn psyDashBtn--small"
                                                    onClick={() =>
                                                        handleCompanyFilter(
                                                            selectedCompany.id,
                                                        )
                                                    }
                                                >
                                                    Ver resultados
                                                </button>

                                                <button
                                                    type="button"
                                                    className="psyDashBtn psyDashBtn--outline psyDashBtn--small"
                                                    disabled={
                                                        selectedCompanyActionBusy
                                                    }
                                                    onClick={() =>
                                                        handleSendCompanyAccess(
                                                            selectedCompany.id,
                                                        )
                                                    }
                                                    title="Generar un nuevo enlace y enviarlo al correo registrado de la empresa."
                                                >
                                                    {companyAccessAction ===
                                                        `send:${selectedCompany.id}`
                                                        ? "Enviando..."
                                                        : selectedCompanyAccess?.exists
                                                            ? "Reenviar acceso"
                                                            : "Enviar acceso"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        selectedCompanyAccess?.activo
                                                            ? "psyDashBtn psyDashBtn--dangerOutline psyDashBtn--small"
                                                            : "psyDashBtn psyDashBtn--successOutline psyDashBtn--small"
                                                    }
                                                    disabled={
                                                        selectedCompanyActionBusy ||
                                                        loadingCompanyAccess ||
                                                        !selectedCompanyAccess?.exists
                                                    }
                                                    onClick={() =>
                                                        handleToggleCompanyAccess(
                                                            selectedCompany.id,
                                                        )
                                                    }
                                                    title={
                                                        selectedCompanyAccess?.exists
                                                            ? selectedCompanyAccess.activo
                                                                ? "Desactivar inmediatamente el enlace de la empresa."
                                                                : "Reactivar el enlace empresarial."
                                                            : "Primero debes generar y enviar un acceso."
                                                    }
                                                >
                                                    {companyAccessAction ===
                                                        `deactivate:${selectedCompany.id}`
                                                        ? "Desactivando..."
                                                        : companyAccessAction ===
                                                            `activate:${selectedCompany.id}`
                                                            ? "Activando..."
                                                            : selectedCompanyAccess?.activo
                                                                ? "Desactivar acceso"
                                                                : "Activar acceso"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="psyDashBtn psyDashBtn--outline psyDashBtn--small"
                                                    disabled={
                                                        generatingCompanyPdfId ===
                                                        selectedCompany.id
                                                    }
                                                    onClick={() =>
                                                        handleGenerateCompanyPdf(
                                                            selectedCompany.id,
                                                        )
                                                    }
                                                    title="Generar el informe empresarial completo en PDF."
                                                >
                                                    {generatingCompanyPdfId ===
                                                        selectedCompany.id
                                                        ? "Generando PDF..."
                                                        : "Generar informe"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="psyDashCompanyClose"
                                                    onClick={
                                                        handleCompanyClose
                                                    }
                                                >
                                                    Cerrar
                                                </button>
                                            </div>
                                        </header>

                                        <section className="psyDashCompanyResults">
                                            <DistributionChart
                                                title="Género"
                                                filterKey="genero"
                                                distribution={
                                                    selectedCompany
                                                        .analytics
                                                        ?.genero
                                                        ?.distribution
                                                }
                                                activeValue=""
                                                onSelect={() => { }}
                                                type="pie"
                                            />

                                            <DistributionChart
                                                title="Rango etario"
                                                filterKey="rangoEtario"
                                                distribution={
                                                    selectedCompany
                                                        .analytics
                                                        ?.rangoEtario
                                                        ?.distribution
                                                }
                                                activeValue=""
                                                onSelect={() => { }}
                                            />

                                            <DistributionChart
                                                title="Comunicación"
                                                filterKey="comunicacion"
                                                distribution={
                                                    selectedCompany
                                                        .analytics
                                                        ?.comunicacion
                                                        ?.distribution
                                                }
                                                activeValue=""
                                                onSelect={() => { }}
                                                type="pie"
                                            />

                                            <DistributionChart
                                                title="Productividad"
                                                filterKey="productividad"
                                                distribution={
                                                    selectedCompany
                                                        .analytics
                                                        ?.productividad
                                                        ?.distribution
                                                }
                                                activeValue=""
                                                onSelect={() => { }}
                                            />
                                        </section>
                                    </article>
                                )}

                                {(
                                    organizations
                                        ?.companies ||
                                    []
                                ).length ===
                                    0 ? (
                                    <div className="psyDashEmpty">
                                        No existen resultados
                                        empresariales para los
                                        filtros actuales.
                                    </div>
                                ) : (
                                    (
                                        organizations
                                            ?.companies ||
                                        []
                                    ).map(
                                        (
                                            company,
                                        ) => (
                                            <article
                                                key={
                                                    company.id
                                                }
                                                className="psyDashCompany"
                                            >

                                                <header>

                                                    <div>
                                                        <span className="psyDashEyebrow">
                                                            {
                                                                company.sector ||
                                                                "Empresa"
                                                            }
                                                        </span>

                                                        <h3>
                                                            {
                                                                company.nombre
                                                            }
                                                        </h3>

                                                        <p>
                                                            {
                                                                company.totalResultados
                                                            }{" "}
                                                            resultados
                                                            {" · "}
                                                            {
                                                                company
                                                                    .secciones
                                                                    ?.length ||
                                                                0
                                                            }{" "}
                                                            secciones
                                                        </p>
                                                    </div>

                                                    <div className="psyDashCompanyActions">
                                                        <button
                                                            type="button"
                                                            className="psyDashBtn psyDashBtn--small"
                                                            onClick={() =>
                                                                handleCompanyOpen(
                                                                    company.id,
                                                                )
                                                            }
                                                        >
                                                            Ver empresa
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="psyDashCompanyIconBtn"
                                                            disabled={
                                                                Boolean(
                                                                    companyAccessAction?.endsWith(
                                                                        `:${company.id}`,
                                                                    ),
                                                                )
                                                            }
                                                            onClick={() =>
                                                                handleSendCompanyAccess(
                                                                    company.id,
                                                                )
                                                            }
                                                            title="Generar un nuevo enlace y enviarlo al correo de la empresa."
                                                            aria-label="Enviar acceso por correo"
                                                        >
                                                            ✉
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="psyDashCompanyIconBtn"
                                                            onClick={() =>
                                                                handleCompanyOpen(
                                                                    company.id,
                                                                )
                                                            }
                                                            title="Abrir empresa para consultar, activar o desactivar su acceso."
                                                            aria-label="Consultar estado del acceso"
                                                        >
                                                            ◉
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="psyDashCompanyIconBtn"
                                                            disabled={
                                                                generatingCompanyPdfId ===
                                                                company.id
                                                            }
                                                            onClick={() =>
                                                                handleGenerateCompanyPdf(
                                                                    company.id,
                                                                )
                                                            }
                                                            title="Generar el mismo informe empresarial completo en PDF."
                                                            aria-label="Generar informe empresarial"
                                                        >
                                                            {generatingCompanyPdfId ===
                                                                company.id
                                                                ? "..."
                                                                : "PDF"}
                                                        </button>
                                                    </div>

                                                </header>

                                                <div className="psyDashCompany__stats">

                                                    <div>
                                                        <span>
                                                            Comunicación
                                                            dominante
                                                        </span>

                                                        <strong>
                                                            {
                                                                company
                                                                    .analytics
                                                                    ?.comunicacion
                                                                    ?.distribution
                                                                    ?.[0]
                                                                    ?.key ||
                                                                "—"
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Cerebro
                                                            dominante
                                                        </span>

                                                        <strong>
                                                            {
                                                                company
                                                                    .analytics
                                                                    ?.cerebro
                                                                    ?.distribution
                                                                    ?.[0]
                                                                    ?.key ||
                                                                "—"
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            VAK dominante
                                                        </span>

                                                        <strong>
                                                            {
                                                                company
                                                                    .analytics
                                                                    ?.vak
                                                                    ?.distribution
                                                                    ?.[0]
                                                                    ?.key ||
                                                                "—"
                                                            }
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>
                                                            Productividad
                                                            promedio
                                                        </span>

                                                        <strong>
                                                            {
                                                                company
                                                                    .analytics
                                                                    ?.productividad
                                                                    ?.promedioPorcentaje ??
                                                                0
                                                            }
                                                            %
                                                        </strong>
                                                    </div>

                                                </div>

                                                <div className="psyDashSectionGrid">

                                                    {(
                                                        company.secciones ||
                                                        []
                                                    ).map(
                                                        (
                                                            section,
                                                        ) => (
                                                            <button
                                                                key={
                                                                    section.id
                                                                }
                                                                type="button"
                                                                className="psyDashSectionCard"
                                                                onClick={() =>
                                                                    handleSectionFilter(
                                                                        company.id,
                                                                        section.id,
                                                                    )
                                                                }
                                                            >
                                                                <span>
                                                                    {
                                                                        section.nombre
                                                                    }
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        section.totalResultados
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    resultados
                                                                </small>
                                                            </button>
                                                        ),
                                                    )}

                                                </div>

                                            </article>
                                        ),
                                    )
                                )}

                            </section>
                        )}

                    {/* =================================================
              PARTICIPANTES
          ================================================= */}

                    {view ===
                        "personas" && (
                            <section className="psyDashParticipants">

                                <div className="psyDashParticipants__toolbar">

                                    <div>
                                        <span className="psyDashEyebrow">
                                            Detalle individual
                                        </span>

                                        <h3>
                                            Participantes
                                        </h3>
                                    </div>

                                    <div className="psyDashParticipantControls">

                                        <input
                                            type="search"
                                            placeholder="Buscar nombre, cédula, correo..."
                                            value={
                                                participantSearch
                                            }
                                            onChange={(
                                                event,
                                            ) => {
                                                setParticipantPage(
                                                    1,
                                                );

                                                setParticipantSearch(
                                                    event
                                                        .target
                                                        .value,
                                                );
                                            }}
                                        />

                                        <select
                                            value={
                                                participantLimit
                                            }
                                            onChange={(
                                                event,
                                            ) => {
                                                setParticipantPage(
                                                    1,
                                                );

                                                setParticipantLimit(
                                                    Number(
                                                        event
                                                            .target
                                                            .value,
                                                    ),
                                                );
                                            }}
                                        >
                                            <option value={10}>
                                                10 filas
                                            </option>

                                            <option value={20}>
                                                20 filas
                                            </option>

                                            <option value={50}>
                                                50 filas
                                            </option>

                                            <option value={100}>
                                                100 filas
                                            </option>
                                        </select>

                                    </div>
                                </div>

                                <div className="psyDashTableWrap">

                                    <table className="psyDashTable">

                                        <thead>
                                            <tr>
                                                <th>
                                                    Participante
                                                </th>

                                                <th>
                                                    Empresa /
                                                    sección
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
                                                    Negociación
                                                </th>

                                                <th>
                                                    VAK
                                                </th>

                                                <th>
                                                    Persistencia
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

                                            {(
                                                participants
                                                    ?.data ||
                                                []
                                            ).map(
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
                                                                {
                                                                    row
                                                                        .participante
                                                                        ?.nombreCompleto ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    row
                                                                        .participante
                                                                        ?.email ||
                                                                    "—"
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {row
                                                                    .empresa
                                                                    ?.nombreComercial ||
                                                                    row
                                                                        .empresa
                                                                        ?.razonSocial ||
                                                                    (
                                                                        row.tipoParticipante ===
                                                                            "individual"
                                                                            ? "Individual"
                                                                            : "—"
                                                                    )}
                                                            </strong>

                                                            <small>
                                                                {
                                                                    row
                                                                        .seccion
                                                                        ?.nombre ||
                                                                    "—"
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    row
                                                                        .participante
                                                                        ?.genre ||
                                                                    "—"
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    row
                                                                        .participante
                                                                        ?.rangoEtarioLabel ||
                                                                    getDisplayValue(
                                                                        "rangoEtario",
                                                                        row
                                                                            .participante
                                                                            ?.rangoEtario,
                                                                    ) ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            {row
                                                                .participante
                                                                ?.edad !==
                                                                null &&
                                                                row
                                                                    .participante
                                                                    ?.edad !==
                                                                undefined && (
                                                                    <small>
                                                                        {
                                                                            row
                                                                                .participante
                                                                                ?.edad
                                                                        }{" "}
                                                                        años
                                                                    </small>
                                                                )}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.animodoCategoria ||
                                                                    row
                                                                        .resultado
                                                                        ?.animodo ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            {row
                                                                .resultado
                                                                ?.animodo &&
                                                                row
                                                                    .resultado
                                                                    ?.animodoCategoria &&
                                                                row
                                                                    .resultado
                                                                    ?.animodo !==
                                                                row
                                                                    .resultado
                                                                    ?.animodoCategoria && (
                                                                    <small>
                                                                        {
                                                                            row
                                                                                .resultado
                                                                                ?.animodo
                                                                        }
                                                                    </small>
                                                                )}
                                                        </td>

                                                        <td>
                                                            {
                                                                row
                                                                    .resultado
                                                                    ?.comunicacion ||
                                                                "—"
                                                            }
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.cerebro ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.cerebroTipo ||
                                                                    ""
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            {
                                                                row
                                                                    .resultado
                                                                    ?.negociacion ||
                                                                "—"
                                                            }

                                                            <small>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.negociacionPuntaje ??
                                                                    "—"
                                                                }{" "}
                                                                pts
                                                            </small>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.vak ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            {row
                                                                .resultado
                                                                ?.vakEmpate && (
                                                                    <small>
                                                                        Empate:{" "}
                                                                        {(
                                                                            row
                                                                                .resultado
                                                                                ?.vakEmpates ||
                                                                            []
                                                                        ).join(
                                                                            " / ",
                                                                        )}
                                                                    </small>
                                                                )}
                                                        </td>

                                                        <td>
                                                            {
                                                                row
                                                                    .resultado
                                                                    ?.persistencia ||
                                                                "—"
                                                            }

                                                            <small>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.persistenciaPuntaje ??
                                                                    "—"
                                                                }
                                                                /4
                                                            </small>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.productividad ||
                                                                    "—"
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    row
                                                                        .resultado
                                                                        ?.productividadPorcentaje ??
                                                                    0
                                                                }
                                                                %
                                                            </small>
                                                        </td>

                                                        <td>
                                                            {formatDate(
                                                                row.fechaFinalizacion,
                                                            )}
                                                        </td>

                                                        <td>
                                                            <div className="psyDashRowActions">

                                                                <button
                                                                    type="button"
                                                                    className="psyDashDetailBtn"
                                                                    onClick={() =>
                                                                        loadParticipantDetail(
                                                                            row.evaluationId,
                                                                        )
                                                                    }
                                                                >
                                                                    Detalle
                                                                </button>

                                                                <a
                                                                    href={`#/resultado-psicometrico-admin/${row.evaluationId}`}
                                                                    className="psyDashResultBtn"
                                                                    title="Ver resultado completo"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Ver resultado
                                                                </a>

                                                            </div>
                                                        </td>

                                                    </tr>
                                                ),
                                            )}

                                            {(
                                                participants
                                                    ?.data ||
                                                []
                                            ).length ===
                                                0 && (
                                                    <tr>
                                                        <td
                                                            colSpan={
                                                                13
                                                            }
                                                        >
                                                            <div className="psyDashEmpty">
                                                                No existen
                                                                participantes
                                                                para los filtros
                                                                actuales.
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}

                                        </tbody>
                                    </table>

                                </div>

                                {/* =============================================
                  PAGINACIÓN
              ============================================= */}

                                <footer className="psyDashPagination">

                                    <span>
                                        {
                                            participants
                                                ?.pagination
                                                ?.total ??
                                            0
                                        }{" "}
                                        resultados
                                        {" · "}
                                        página{" "}
                                        {
                                            participants
                                                ?.pagination
                                                ?.page ??
                                            1
                                        }{" "}
                                        de{" "}
                                        {
                                            participants
                                                ?.pagination
                                                ?.totalPages ??
                                            1
                                        }
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
                                                setParticipantPage(
                                                    (
                                                        page,
                                                    ) =>
                                                        Math.max(
                                                            1,
                                                            page -
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
                                                setParticipantPage(
                                                    (
                                                        page,
                                                    ) =>
                                                        page +
                                                        1,
                                                )
                                            }
                                        >
                                            Siguiente
                                        </button>

                                    </div>
                                </footer>

                            </section>
                        )}

                </>
            )}

            {/* ===================================================
          MODAL DETALLE
      =================================================== */}

            {(loadingDetail ||
                participantDetail) && (
                    <div
                        className="psyDashModalBackdrop"
                        onMouseDown={(
                            event,
                        ) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeParticipantDetail();
                            }
                        }}
                    >

                        <section className="psyDashModal">

                            <header className="psyDashModal__header">

                                <div>
                                    <span className="psyDashEyebrow">
                                        Resultado
                                        individual
                                    </span>

                                    <h2>
                                        {participantDetail
                                            ?.participant
                                            ?.user
                                            ? `${participantDetail
                                                .participant
                                                .user
                                                .firstName ||
                                                ""
                                                } ${participantDetail
                                                    .participant
                                                    .user
                                                    .lastName ||
                                                ""
                                                }`.trim()
                                            : "Detalle psicométrico"}
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    className="psyDashModalClose"
                                    onClick={
                                        closeParticipantDetail
                                    }
                                    aria-label="Cerrar"
                                >
                                    ×
                                </button>

                            </header>

                            {loadingDetail ? (
                                <div className="psyDashLoading">

                                    <div className="psyDashSpinner" />

                                    <p>
                                        Cargando detalle...
                                    </p>

                                </div>
                            ) : (
                                <div className="psyDashModal__body">

                                    {/* =========================================
                    RESUMEN PARTICIPANTE
                ========================================= */}

                                    <div className="psyDashDetailSummary">

                                        <div>
                                            <span>
                                                Tipo
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.participant
                                                    ?.tipoParticipante ===
                                                    "empresa"
                                                    ? "Empresa"
                                                    : "Individual"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Empresa
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.participant
                                                    ?.empresa
                                                    ?.nombreComercial ||
                                                    participantDetail
                                                        ?.participant
                                                        ?.empresa
                                                        ?.razonSocial ||
                                                    "Individual"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Sección
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.participant
                                                    ?.seccion
                                                    ?.nombre ||
                                                    "—"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Género
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.participant
                                                    ?.demografia
                                                    ?.genero ||
                                                    participantDetail
                                                        ?.participant
                                                        ?.user
                                                        ?.genre ||
                                                    "—"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Rango etario
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.participant
                                                    ?.demografia
                                                    ?.rangoEtarioLabel ||
                                                    getDisplayValue(
                                                        "rangoEtario",
                                                        participantDetail
                                                            ?.participant
                                                            ?.demografia
                                                            ?.rangoEtario,
                                                    ) ||
                                                    "—"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>
                                                Finalización
                                            </span>

                                            <strong>
                                                {formatDate(
                                                    participantDetail
                                                        ?.evaluation
                                                        ?.fechaFinalizacion,
                                                )}
                                            </strong>
                                        </div>

                                    </div>

                                    {/* =========================================
                    RESULTADOS PRINCIPALES
                ========================================= */}

                                    <div className="psyDashResultCards">

                                        <article>
                                            <span>
                                                Animodo
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.animodoCategoria ||
                                                    participantDetail
                                                        ?.result
                                                        ?.animodo
                                                        ?.personalityAnimal ||
                                                    participantDetail
                                                        ?.result
                                                        ?.animodo
                                                        ?.animal ||
                                                    "—"}
                                            </strong>

                                            {participantDetail
                                                ?.result
                                                ?.animodo
                                                ?.animal && (
                                                    <small>
                                                        {
                                                            participantDetail
                                                                .result
                                                                .animodo
                                                                .animal
                                                        }
                                                    </small>
                                                )}
                                        </article>

                                        <article
                                            style={{
                                                background:
                                                    getDimensionColor(
                                                        "comunicacion",
                                                        participantDetail
                                                            ?.result
                                                            ?.communication
                                                            ?.dominantColor,
                                                        0,
                                                    ),
                                            }}
                                        >
                                            <span>
                                                Comunicación
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.communication
                                                    ?.dominantColor ||
                                                    "—"}
                                            </strong>

                                            <small>
                                                {participantDetail
                                                    ?.result
                                                    ?.communication
                                                    ?.communicationType ||
                                                    ""}
                                            </small>
                                        </article>

                                        <article
                                            style={{
                                                background:
                                                    getDimensionColor(
                                                        "cerebro",
                                                        participantDetail
                                                            ?.result
                                                            ?.brain
                                                            ?.brainCategory,
                                                        0,
                                                    ),
                                            }}
                                        >
                                            <span>
                                                Cerebro
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.brain
                                                    ?.brainCategory ||
                                                    "—"}
                                            </strong>

                                            <small>
                                                {participantDetail
                                                    ?.result
                                                    ?.brain
                                                    ?.brainType ||
                                                    ""}
                                            </small>
                                        </article>

                                        <article
                                            style={{
                                                background:
                                                    getDimensionColor(
                                                        "negociacion",
                                                        participantDetail
                                                            ?.result
                                                            ?.negotiation
                                                            ?.classification,
                                                        0,
                                                    ),
                                            }}
                                        >
                                            <span>
                                                Negociación
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.negotiation
                                                    ?.classification ||
                                                    "—"}
                                            </strong>

                                            <small>
                                                {participantDetail
                                                    ?.result
                                                    ?.negotiation
                                                    ?.totalScore ??
                                                    0}{" "}
                                                puntos
                                            </small>
                                        </article>

                                        <article
                                            style={{
                                                background:
                                                    getDimensionColor(
                                                        "vak",
                                                        participantDetail
                                                            ?.result
                                                            ?.vak
                                                            ?.dominantStyle,
                                                        0,
                                                    ),
                                            }}
                                        >
                                            <span>
                                                VAK
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.vak
                                                    ?.dominantStyle ||
                                                    "—"}
                                            </strong>

                                            {participantDetail
                                                ?.result
                                                ?.vak
                                                ?.tied && (
                                                    <small>
                                                        Empate:{" "}
                                                        {(
                                                            participantDetail
                                                                ?.result
                                                                ?.vak
                                                                ?.tiedCategories ||
                                                            []
                                                        ).join(
                                                            " / ",
                                                        )}
                                                    </small>
                                                )}
                                        </article>

                                        <article
                                            style={{
                                                background:
                                                    getDimensionColor(
                                                        "persistencia",
                                                        participantDetail
                                                            ?.result
                                                            ?.persistence
                                                            ?.level,
                                                        0,
                                                    ),
                                            }}
                                        >
                                            <span>
                                                Persistencia
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.persistence
                                                    ?.level ||
                                                    "—"}
                                            </strong>

                                            <small>
                                                {participantDetail
                                                    ?.result
                                                    ?.persistence
                                                    ?.score ??
                                                    0}
                                                /4
                                            </small>
                                        </article>

                                        <article
                                            style={{
                                                background:
                                                    getDimensionColor(
                                                        "productividad",
                                                        participantDetail
                                                            ?.result
                                                            ?.productivityIndex
                                                            ?.classification,
                                                        0,
                                                    ),
                                            }}
                                        >
                                            <span>
                                                Productividad
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.productivityIndex
                                                    ?.classification ||
                                                    "—"}
                                            </strong>

                                            <small>
                                                {participantDetail
                                                    ?.result
                                                    ?.productivityIndex
                                                    ?.percentage ??
                                                    0}
                                                %
                                            </small>
                                        </article>

                                        <article>
                                            <span>
                                                Personalidad
                                            </span>

                                            <strong>
                                                {participantDetail
                                                    ?.result
                                                    ?.personality
                                                    ?.nombre ||
                                                    participantDetail
                                                        ?.result
                                                        ?.personality
                                                        ?.codigo ||
                                                    "—"}
                                            </strong>
                                        </article>

                                    </div>

                                    {/* =========================================
                    INFORMACIÓN NUMÉRICA
                ========================================= */}

                                    <div className="psyDashNumericGrid">

                                        <article>
                                            <h4>
                                                Comunicación
                                            </h4>

                                            {Object.entries(
                                                participantDetail
                                                    ?.result
                                                    ?.communication
                                                    ?.percentages ||
                                                {},
                                            ).map(
                                                ([
                                                    key,
                                                    value,
                                                ]) => (
                                                    <div
                                                        key={
                                                            key
                                                        }
                                                    >
                                                        <span
                                                            style={{
                                                                color:
                                                                    getDimensionColor(
                                                                        "comunicacion",
                                                                        key,
                                                                        0,
                                                                    ),
                                                                fontWeight:
                                                                    800,
                                                            }}
                                                        >
                                                            {key}
                                                        </span>

                                                        <strong>
                                                            {
                                                                value
                                                            }
                                                            %
                                                        </strong>
                                                    </div>
                                                ),
                                            )}
                                        </article>

                                        <article>
                                            <h4>
                                                Cerebro
                                            </h4>

                                            {Object.entries(
                                                participantDetail
                                                    ?.result
                                                    ?.brain
                                                    ?.percentages ||
                                                {},
                                            ).map(
                                                ([
                                                    key,
                                                    value,
                                                ]) => (
                                                    <div
                                                        key={
                                                            key
                                                        }
                                                    >
                                                        <span
                                                            style={{
                                                                color:
                                                                    getDimensionColor(
                                                                        "cerebro",
                                                                        key,
                                                                        0,
                                                                    ),
                                                                fontWeight:
                                                                    800,
                                                            }}
                                                        >
                                                            {key}
                                                        </span>

                                                        <strong>
                                                            {
                                                                value
                                                            }
                                                            %
                                                        </strong>
                                                    </div>
                                                ),
                                            )}
                                        </article>

                                        <article>
                                            <h4>
                                                VAK
                                            </h4>

                                            {Object.entries(
                                                participantDetail
                                                    ?.result
                                                    ?.vak
                                                    ?.percentages ||
                                                {},
                                            ).map(
                                                ([
                                                    key,
                                                    value,
                                                ]) => (
                                                    <div
                                                        key={
                                                            key
                                                        }
                                                    >
                                                        <span
                                                            style={{
                                                                color:
                                                                    getDimensionColor(
                                                                        "vak",
                                                                        key,
                                                                        0,
                                                                    ),
                                                                fontWeight:
                                                                    800,
                                                            }}
                                                        >
                                                            {key}
                                                        </span>

                                                        <strong>
                                                            {
                                                                value
                                                            }
                                                            %
                                                        </strong>
                                                    </div>
                                                ),
                                            )}
                                        </article>

                                        <article>
                                            <h4>
                                                Productividad
                                            </h4>

                                            <div>
                                                <span>
                                                    Puntaje
                                                </span>

                                                <strong>
                                                    {participantDetail
                                                        ?.result
                                                        ?.productivityIndex
                                                        ?.score ??
                                                        "—"}
                                                    /
                                                    {participantDetail
                                                        ?.result
                                                        ?.productivityIndex
                                                        ?.maxScore ??
                                                        6}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Porcentaje
                                                </span>

                                                <strong>
                                                    {participantDetail
                                                        ?.result
                                                        ?.productivityIndex
                                                        ?.percentage ??
                                                        0}
                                                    %
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Clasificación
                                                </span>

                                                <strong>
                                                    {participantDetail
                                                        ?.result
                                                        ?.productivityIndex
                                                        ?.classification ||
                                                        "—"}
                                                </strong>
                                            </div>
                                        </article>

                                    </div>

                                    {/* =========================================
                    PERSONALIDAD
                ========================================= */}

                                    {participantDetail
                                        ?.result
                                        ?.personality && (
                                            <article className="psyDashPersonalityDetail">

                                                <div>
                                                    <span className="psyDashEyebrow">
                                                        Personalidad
                                                    </span>

                                                    <h3>
                                                        {
                                                            participantDetail
                                                                .result
                                                                .personality
                                                                .nombre
                                                        }
                                                    </h3>

                                                    <p>
                                                        Código:{" "}
                                                        <strong>
                                                            {
                                                                participantDetail
                                                                    .result
                                                                    .personality
                                                                    .codigo
                                                            }
                                                        </strong>
                                                    </p>
                                                </div>

                                                <div className="psyDashPersonalityColors">

                                                    <span
                                                        style={{
                                                            background:
                                                                getDimensionColor(
                                                                    "cerebro",
                                                                    participantDetail
                                                                        .result
                                                                        .brain
                                                                        ?.brainCategory,
                                                                    0,
                                                                ),
                                                        }}
                                                    >
                                                        Cabeza:{" "}
                                                        {
                                                            participantDetail
                                                                .result
                                                                .personality
                                                                .colorCabeza
                                                        }
                                                    </span>

                                                    <span
                                                        style={{
                                                            background:
                                                                getDimensionColor(
                                                                    "comunicacion",
                                                                    participantDetail
                                                                        .result
                                                                        .personality
                                                                        .colorPecho,
                                                                    0,
                                                                ),
                                                        }}
                                                    >
                                                        Pecho:{" "}
                                                        {
                                                            participantDetail
                                                                .result
                                                                .personality
                                                                .colorPecho
                                                        }
                                                    </span>

                                                </div>

                                            </article>
                                        )}

                                </div>
                            )}

                        </section>

                    </div>
                )}

        </section>
    );
};

export default PsychometricDashboard;