import { extractApiErrors } from "@/util/userApi";

export const PAYMENT_STATUSES = [
  "Pendiente",
  "Pagado",
  "Fallo",
  "Regrezado",
  "Cancelado",
];

const STATUS_ALIASES = {
  "0": "Pendiente",
  "1": "Pagado",
  "2": "Fallo",
  "3": "Regrezado",
  "4": "Cancelado",
  pending: "Pendiente",
  paid: "Pagado",
};

export function coercePaymentStatus(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return "Pendiente";
  }
  const value = String(raw).trim();
  if (PAYMENT_STATUSES.includes(value)) {
    return value;
  }
  return STATUS_ALIASES[value] || STATUS_ALIASES[value.toLowerCase()] || "Pendiente";
}

export function isPaidStatus(status) {
  return coercePaymentStatus(status) === "Pagado";
}

export function statusBadgeClass(status) {
  const map = {
    Pagado: "badge badge-success",
    Pendiente: "badge badge-warning",
    Fallo: "badge badge-danger",
    Regrezado: "badge badge-info",
    Cancelado: "badge badge-secondary",
  };
  return map[status] || "badge badge-default";
}

export function formatPaymentFromApi(payment) {
  if (!payment) {
    return null;
  }
  const status = coercePaymentStatus(
    payment.payment_status_name || payment.status_name || payment.status
  );

  return {
    id: payment.id,
    amount: payment.amount,
    payment_date: payment.payment_date,
    payment_type: payment.payment_type || "",
    comments: payment.comments || "",
    image_url: payment.image_url || "",
    status,
    payment_status_name: status,
    contract_id: payment.contract_id || payment.contract?.id,
    contract: payment.contract || {},
    land_code: payment.land_code || "",
    land_address: payment.land_address || "",
    client_name: payment.client_name || "",
    residential_name: payment.residential_name || "",
  };
}

export function emptyEditForm() {
  return {
    amount: "",
    payment_date: "",
    payment_type: "",
    comments: "",
    image_url: "",
    status: "Pendiente",
  };
}

export function normalizePaymentAmount(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const num = Number(value);
  return Number.isNaN(num) ? "" : num;
}

export function editFormFromPayment(payment) {
  return {
    amount: normalizePaymentAmount(payment.amount),
    payment_date: payment.payment_date || "",
    payment_type: payment.payment_type || "",
    comments: payment.comments || "",
    image_url: payment.image_url || "",
    status: payment.payment_status_name || payment.status || "Pendiente",
  };
}

export { extractApiErrors };
