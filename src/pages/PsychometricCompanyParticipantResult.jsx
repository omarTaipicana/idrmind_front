import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import "./styles/PsychometricCompanyParticipantResult.css";

const API_URL =
  import.meta.env.VITE_API_URL;

const RESULT_COLORS = {
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
};

const normalizeResultKey = (
  value,
) =>
  String(
    value || "",
  )
    .trim()
    .toUpperCase();

const getResultColor = (
  dimension,
  value,
) => {
  const key =
    normalizeResultKey(
      value,
    );

  if (
    dimension ===
      "animodo" &&
    key.startsWith(
      "ENTRE ",
    )
  ) {
    return "#16a36d";
  }

  return (
    RESULT_COLORS[
      dimension
    ]?.[
      key
    ] ||
    "#173a8a"
  );
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "es-EC",
      {
        year: "numeric",
        month: "long",
        day: "2-digit",
      },
    ).format(
      new Date(value),
    );
  } catch {
    return value;
  }
};

const ResultCard = ({
  label,
  value,
  detail,
  color = "#173a8a",
}) => (
  <article
    className="companyParticipantCard"
    style={{
      "--result-color":
        color,
    }}
  >
    <span>
      {label}
    </span>

    <strong>
      {value || "—"}
    </strong>

    {detail && (
      <small>
        {detail}
      </small>
    )}
  </article>
);

const PercentageBlock = ({
  title,
  values = {},
}) => {
  const entries =
    Object.entries(
      values || {},
    );

  if (
    !entries.length
  ) {
    return null;
  }

  return (
    <article className="companyParticipantPercentages">
      <h3>
        {title}
      </h3>

      {entries.map(
        ([
          key,
          value,
        ]) => (
          <div
            key={
              key
            }
          >
            <span>
              {key}
            </span>

            <strong>
              {value}%
            </strong>
          </div>
        ),
      )}
    </article>
  );
};

const PsychometricCompanyParticipantResult = () => {
  const {
    token,
    evaluationId,
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

  useEffect(() => {
    if (
      !token ||
      !evaluationId
    ) {
      return;
    }

    let cancelled =
      false;

    const load = async () => {
      setLoading(
        true,
      );

      setError(
        "",
      );

      try {
        const response =
          await axios.get(
            `${API_URL}/psychometric/company-results/${token}/participants/${evaluationId}`,
          );

        if (
          !cancelled
        ) {
          setData(
            response.data,
          );
        }
      } catch (err) {
        if (
          cancelled
        ) {
          return;
        }

        setError(
          err?.response?.data
            ?.message ||
            "No fue posible cargar el resultado individual.",
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
  }, [
    token,
    evaluationId,
  ]);

  const company =
    data?.empresa ||
    {};

  const user =
    data?.user ||
    {};

  const evaluation =
    data?.evaluation ||
    {};

  const result =
    data?.result ||
    {};

  const participantName =
    useMemo(
      () =>
        [
          user.firstName,
          user.lastName,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        "Participante",
      [
        user.firstName,
        user.lastName,
      ],
    );

  if (
    loading
  ) {
    return (
      <section className="companyParticipantState">
        <div className="companyParticipantSpinner" />

        <h2>
          Cargando resultado...
        </h2>
      </section>
    );
  }

  if (
    error ||
    !data
  ) {
    return (
      <section className="companyParticipantState companyParticipantState--error">
        <h2>
          Resultado no disponible
        </h2>

        <p>
          {error ||
            "No se encontró el resultado solicitado."}
        </p>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/resultados-empresa/${token}`,
            )
          }
        >
          Volver a resultados
        </button>
      </section>
    );
  }

  return (
    <section className="companyParticipantResult">
      <header className="companyParticipantHero">
        <div>
          <span className="companyParticipantEyebrow">
            Proyecto Pensar ·
            Resultado individual
          </span>

          <h1>
            {participantName}
          </h1>

          <p>
            {company.nombre ||
              company.nombreComercial ||
              company.razonSocial ||
              "Empresa"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              `/resultados-empresa/${token}`,
            )
          }
        >
          ← Volver a empresa
        </button>
      </header>

      <section className="companyParticipantIdentity">
        <article>
          <span>
            Correo
          </span>

          <strong>
            {user.email ||
              "—"}
          </strong>
        </article>

        <article>
          <span>
            Sección
          </span>

          <strong>
            {user.seccion
              ?.nombre ||
              "—"}
          </strong>
        </article>

        <article>
          <span>
            Género
          </span>

          <strong>
            {user.genre ||
              "—"}
          </strong>
        </article>

        <article>
          <span>
            Rango etario
          </span>

          <strong>
            {user.rangoEtarioLabel ||
              "—"}
          </strong>

          {user.edad !==
            null &&
            user.edad !==
              undefined && (
              <small>
                {user.edad} años
              </small>
            )}
        </article>

        <article>
          <span>
            Finalización
          </span>

          <strong>
            {formatDate(
              evaluation.fechaFinalizacion,
            )}
          </strong>
        </article>
      </section>

      <section className="companyParticipantCards">
        <ResultCard
          label="Animodo"
          value={
            result?.animodo
              ?.animal ||
            result?.animodoCategoria ||
            result?.animodo
              ?.personalityAnimal
          }
          color={getResultColor(
            "animodo",
            result?.animodo
              ?.animal ||
              result?.animodoCategoria ||
              result?.animodo
                ?.personalityAnimal,
          )}
        />

        <ResultCard
          label="Comunicación"
          value={
            result?.communication
              ?.dominantColor
          }
          detail={
            result?.communication
              ?.communicationType
          }
          color={getResultColor(
            "comunicacion",
            result?.communication
              ?.dominantColor,
          )}
        />

        <ResultCard
          label="Tipo de cerebro"
          value={
            result?.brain
              ?.brainCategory
          }
          detail={
            result?.brain
              ?.brainType
          }
          color={getResultColor(
            "cerebro",
            result?.brain
              ?.brainCategory,
          )}
        />

        <ResultCard
          label="Negociación"
          value={
            result?.negotiation
              ?.classification
          }
          detail={
            result?.negotiation
              ?.totalScore !==
              undefined
              ? `${result.negotiation.totalScore} puntos`
              : null
          }
        />

        <ResultCard
          label="VAK"
          value={
            result?.vak
              ?.dominantStyle
          }
          detail={
            result?.vak
              ?.tied
              ? `Empate: ${(result.vak.tiedCategories || []).join(" / ")}`
              : null
          }
          color={getResultColor(
            "vak",
            result?.vak
              ?.dominantStyle,
          )}
        />

        <ResultCard
          label="Persistencia"
          value={
            result?.persistence
              ?.level
          }
          detail={
            result?.persistence
              ?.score !==
              undefined
              ? `${result.persistence.score}/4`
              : null
          }
          color={getResultColor(
            "persistencia",
            result?.persistence
              ?.level,
          )}
        />

        <ResultCard
          label="Productividad"
          value={
            result
              ?.productivityIndex
              ?.classification
          }
          detail={
            result
              ?.productivityIndex
              ?.percentage !==
              undefined
              ? `${result.productivityIndex.percentage}%`
              : null
          }
        />

        <ResultCard
          label="Personalidad"
          value={
            result?.personality
              ?.nombre ||
            result?.personality
              ?.codigo
          }
          detail={
            result?.personality
              ?.codigo &&
            result?.personality
              ?.nombre
              ? `Código ${result.personality.codigo}`
              : null
          }
        />
      </section>

      <section className="companyParticipantNumericGrid">
        <PercentageBlock
          title="Comunicación"
          values={
            result?.communication
              ?.percentages
          }
        />

        <PercentageBlock
          title="Tipo de cerebro"
          values={
            result?.brain
              ?.percentages
          }
        />

        <PercentageBlock
          title="VAK"
          values={
            result?.vak
              ?.percentages
          }
        />

        <article className="companyParticipantPercentages">
          <h3>
            Productividad
          </h3>

          <div>
            <span>
              Puntaje
            </span>

            <strong>
              {result
                ?.productivityIndex
                ?.score ??
                "—"}
              /
              {result
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
              {result
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
              {result
                ?.productivityIndex
                ?.classification ||
                "—"}
            </strong>
          </div>
        </article>
      </section>

      {result?.personality && (
        <section className="companyParticipantPersonality">
          <span className="companyParticipantEyebrow">
            Perfil de personalidad
          </span>

          <h2>
            {result.personality
              .nombre ||
              "Personalidad"}
          </h2>

          {result.personality
            .descripcion && (
              <p>
                {
                  result.personality
                    .descripcion
                }
              </p>
            )}
        </section>
      )}

      {Array.isArray(
        result?.recommendations,
      ) &&
        result.recommendations
          .length >
          0 && (
          <section className="companyParticipantRecommendations">
            <span className="companyParticipantEyebrow">
              Enfoque de mejora
            </span>

            <h2>
              Recomendaciones
            </h2>

            <div className="companyParticipantRecommendations__grid">
              {result.recommendations.map(
                (
                  item,
                  index,
                ) => (
                  <article
                    key={`${item?.skill || "recommendation"}-${index}`}
                  >
                    <span>
                      {item?.skill ||
                        item?.habilidad ||
                        "Recomendación"}
                    </span>

                    <strong>
                      {item?.recommendation ||
                        item?.recomendacion ||
                        item?.text ||
                        "—"}
                    </strong>

                    {(item?.trigger ||
                      item?.resultado) && (
                      <small>
                        {item?.trigger ||
                          item?.resultado}
                      </small>
                    )}
                  </article>
                ),
              )}
            </div>
          </section>
        )}

      <footer className="companyParticipantFooter">
        <strong>
          iDr.Mind
        </strong>

        <span>
          Proyecto Pensar · Resultado
          psicométrico individual
        </span>
      </footer>
    </section>
  );
};

export default PsychometricCompanyParticipantResult;
