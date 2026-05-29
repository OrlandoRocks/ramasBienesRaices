import {
  ALLOWED_DOCUMENT_TYPES,
  CLIENT_DOCUMENTS,
  MAX_DOCUMENT_BYTES,
} from "@/constants/clientDocuments";

const EXTENSION_TO_MIME = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

function mimeFromFilename(filename) {
  if (!filename) {
    return null;
  }
  const ext = filename.split(".").pop()?.toLowerCase();
  return EXTENSION_TO_MIME[ext] || null;
}

export function validateClientDocumentFile(file, doc) {
  const label = doc?.label || "documento";
  if (!file) {
    return null;
  }

  const type = file.type || mimeFromFilename(file.name);
  if (!type || !ALLOWED_DOCUMENT_TYPES.includes(type)) {
    return `${label}: solo se permiten archivos PDF, JPG o PNG.`;
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    return `${label}: el archivo no debe superar 10 MB.`;
  }

  return null;
}

/**
 * @param {Record<string, File|null|undefined>} files keyed by param (ine_document, ...)
 * @param {{ requireAll?: boolean }} options
 * @returns {string[]} Spanish error messages
 */
export function validateClientDocuments(files = {}, { requireAll = false } = {}) {
  const errors = [];

  CLIENT_DOCUMENTS.forEach((doc) => {
    const file = files[doc.param];
    if (!file) {
      if (requireAll) {
        errors.push(`${doc.label}: debe adjuntar un archivo.`);
      }
      return;
    }
    const message = validateClientDocumentFile(file, doc);
    if (message) {
      errors.push(message);
    }
  });

  return errors;
}

export function formatDocumentByteSize(bytes) {
  const size = Number(bytes);
  if (!size || Number.isNaN(size)) {
    return "—";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
