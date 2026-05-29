import paymentsService from "@/services/paymentsService";
import { swalAboveDialog } from "@/util/swalDialog";
import {
  formatPaymentFromApi,
  isPaidStatus,
  extractApiErrors,
} from "@/util/paymentApi";

function formatCurrency(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) {
    return amount;
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(num);
}

async function confirmPagadoToPendiente() {
  const result = await swalAboveDialog.fire({
    title: "¿Marcar como Pendiente?",
    text:
      "Se borrarán el tipo de pago, comentarios y comprobante asociados a este pago.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "btn btn-warning btn-fill",
      cancelButton: "btn btn-default btn-fill",
    },
    buttonsStyling: false,
  });
  return Boolean(result.value);
}

async function confirmGeneralSave({ captureMode, payload }) {
  const result = await swalAboveDialog.fire({
    title: captureMode ? "¿Capturar este pago?" : "¿Guardar cambios?",
    html: `Monto: <strong>${formatCurrency(payload.amount)}</strong><br/>Fecha: <strong>${
      payload.payment_date || "—"
    }</strong>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: captureMode ? "Sí, capturar" : "Sí, guardar",
    cancelButtonText: "Cancelar",
    customClass: {
      confirmButton: "btn btn-success btn-fill",
      cancelButton: "btn btn-default btn-fill",
    },
    buttonsStyling: false,
  });
  return Boolean(result.value);
}

/**
 * Close payment form first, then confirm, then PATCH.
 * @returns {{ cancelled: boolean, payment?: object, errors?: string[] }}
 */
export async function runPaymentSaveFlow({
  paymentId,
  payload,
  originalStatus,
  captureMode,
}) {
  const needsPendienteConfirm =
    isPaidStatus(originalStatus) && payload.status === "Pendiente";

  if (needsPendienteConfirm) {
    const confirmed = await confirmPagadoToPendiente();
    if (!confirmed) {
      return { cancelled: true };
    }
  } else if (captureMode) {
    const confirmed = await confirmGeneralSave({ captureMode, payload });
    if (!confirmed) {
      return { cancelled: true };
    }
  }

  try {
    const response = await paymentsService.patch(paymentId, payload);
    return {
      cancelled: false,
      payment: formatPaymentFromApi(response.data),
    };
  } catch (error) {
    return {
      cancelled: false,
      failed: true,
      errors: extractApiErrors(error),
    };
  }
}
