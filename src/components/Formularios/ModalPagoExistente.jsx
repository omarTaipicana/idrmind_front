import React from "react";
import "./styles/ModalPagoExistente.css";

const ModalPagoExistente = ({ pagos, onClose, onRegistrarNuevo, inscrito }) => {
  const pagosOrdenados = [...(pagos || [])]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .filter((pago) => pago.inscripcionId === inscrito.id);

  const esTrue = (valor) => {
    return (
      valor === true ||
      valor === "true" ||
      valor === 1 ||
      valor === "1"
    );
  };

  const obtenerCertificados = (pago) => {

    const certificados = [];

    if (esTrue(pago.cert_emp)) {
      certificados.push("Certificado Empresarial iDr.Mind.");
    }

    if (esTrue(pago.cert_mdt) || esTrue(pago.sPolicial)) {
      certificados.push("Certificado por el Ministerio de Trabajo");
    }

    if (esTrue(pago.cert_int) || esTrue(pago.oProfesionales)) {
      certificados.push("Certificado internacional");
    }

    if (certificados.length === 0) {
      certificados.push("Certificado");
    }

    return certificados;
  };

  return (
    <div className="modal_pago_overlay">
      <div className="modal_pago_content">
        <h2>⚠️ Pagos Registrados</h2>

        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeeba",
            padding: "1em",
            borderRadius: "8px",
            marginBottom: "1.5em",
            color: "#856404",
            fontSize: "0.95em",
            lineHeight: "1.5",
          }}
        >
          📌 <strong>Importante:</strong> Para verificar tus comprobantes de
          pago, accede a la plataforma <strong>iDr.Mind.</strong> con el{" "}
          <strong>mismo correo</strong> con el que te inscribiste. Ahí podrás
          visualizar el estado y detalles de tus pagos realizados.
        </div>

        {pagosOrdenados?.map((pago, i) => {
          const certificados = obtenerCertificados(pago);

          const extras = [];

          if (esTrue(pago.moneda)) extras.push("moneda");
          if (esTrue(pago.distintivo)) extras.push("distintivo");

          const descripcionPago = [
            certificados.join(", "),
            extras.length > 0 ? `incluyendo ${extras.join(" y ")}` : "",
          ]
            .filter(Boolean)
            .join(", ");

          return (
            <div key={i} className="pago_item">
              <p>
                Pago #{i + 1}: <strong>{descripcionPago}</strong>.
              </p>

              <p>
                Estado:{" "}
                {pago.verificado ? "✅ Verificado" : "⏳ Por verificar"}
              </p>

              <p>Monto: ${pago.valorDepositado}</p>

              <hr />
            </div>
          );
        })}

        <p>
          Si deseas registrar un nuevo pago por otro certificado, moneda o
          distintivo, haz clic en el botón <strong>Nuevo Pago</strong>, caso
          contrario cierra esta ventana.
        </p>

        <div className="modal_pago_botones">
          <button className="modal_pago_cerrar" onClick={onClose}>
            Cancelar
          </button>

          <button className="modal_pago_nuevo" onClick={onRegistrarNuevo}>
            Nuevo pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPagoExistente;