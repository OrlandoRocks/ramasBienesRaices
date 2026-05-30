import axios from "axios";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

function authConfig(extra = {}) {
  return {
    headers: {
      Authorization: localStorage.getItem("auth_token"),
      Accept: "application/json",
      ...extra.headers,
    },
    ...extra,
  };
}

export function buildClientFormData(
  clientPayload,
  files = {},
  { requireDocuments = false } = {}
) {
  const form = new FormData();
  if (requireDocuments) {
    form.append("client[require_documents]", "true");
  }
  const { residential_ids: residentialIds, ...scalarFields } =
    clientPayload || {};

  Object.entries(scalarFields).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === "boolean") {
      form.append(`client[${key}]`, value ? "1" : "0");
      return;
    }
    form.append(`client[${key}]`, value);
  });

  if (Array.isArray(residentialIds)) {
    residentialIds.forEach((id) => {
      form.append("client[residential_ids][]", id);
    });
  }
  Object.entries(files).forEach(([param, file]) => {
    if (file) {
      form.append(`client[${param}]`, file);
    }
  });
  return form;
}

export function listClients() {
  return axios.get(`${BASE_URL}/clients`, authConfig());
}

export function getClient(id) {
  return axios.get(`${BASE_URL}/clients/${id}`, authConfig());
}

export function createClient({ client, files, requireDocuments }) {
  return axios.post(
    `${BASE_URL}/clients`,
    buildClientFormData(client, files, { requireDocuments }),
    authConfig()
  );
}

export function updateClient(id, { client, files, requireDocuments }) {
  return axios.patch(
    `${BASE_URL}/clients/${id}`,
    buildClientFormData(client, files, { requireDocuments }),
    authConfig()
  );
}

export function deleteClient(id) {
  return axios.delete(`${BASE_URL}/clients/${id}`, authConfig());
}

export function downloadClientDocument(clientId, documentType, options = {}) {
  const disposition = options.disposition || "attachment";
  return axios.get(
    `${BASE_URL}/clients/${clientId}/documents/${documentType}`,
    authConfig({
      responseType: "blob",
      maxRedirects: 5,
      params: { disposition },
    })
  );
}

export function documentDownloadUrl(clientId, documentType) {
  return `${BASE_URL}/clients/${clientId}/documents/${documentType}`;
}
