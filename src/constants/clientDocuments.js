export const CLIENT_DOCUMENTS = [
  {
    key: "ine",
    param: "ine_document",
    label: "Credencial (INE)",
    statusField: "ine_verification_status",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "tax_document",
    param: "tax_document",
    label: "Constancia de Situación Fiscal",
    statusField: "tax_document_verification_status",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
  {
    key: "proof_of_address",
    param: "proof_of_address_document",
    label: "Comprobante de domicilio",
    statusField: "proof_of_address_verification_status",
    accept: ".pdf,.jpg,.jpeg,.png",
  },
];

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export const VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

export const VERIFICATION_STATUS_LABELS = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
};

export const VERIFICATION_STATUS_BADGE_CLASS = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-danger",
};

export function emptyDocumentsPayload() {
  return {
    ine: { attached: false, verification_status: "pending" },
    tax_document: { attached: false, verification_status: "pending" },
    proof_of_address: { attached: false, verification_status: "pending" },
  };
}
