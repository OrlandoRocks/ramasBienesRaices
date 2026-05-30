/**
 * JSON:API helpers for super-user user management (/users).
 */

export const ROLE_LABELS = {
  super_user: "Super usuario",
  admin: "Administrador",
  user: "Vendedor",
  client: "Cliente",
};

export function roleLabel(roleName) {
  if (!roleName) {
    return "";
  }
  return ROLE_LABELS[roleName] || roleName;
}

export function parseManagedUser(resource) {
  const attributes = resource?.attributes || {};
  const lastName = attributes["last-name"] || attributes.last_name || "";
  const name = attributes.name || "";

  const residentialIds =
    attributes["residential_ids"] || attributes.residential_ids;

  return {
    id: resource?.id || attributes.id,
    name,
    lastName,
    fullName: `${name} ${lastName}`.trim(),
    email: attributes.email || "",
    roleId: attributes["role-id"] ?? attributes.role_id ?? null,
    roleName: attributes["role-name"] || attributes.role_name || null,
    clientId: attributes["client-id"] ?? attributes.client_id ?? null,
    residentialIds: Array.isArray(residentialIds)
      ? residentialIds.map((id) => Number(id))
      : [],
    createdAt: attributes["created-at"] || attributes.created_at || null,
    updatedAt: attributes["updated-at"] || attributes.updated_at || null,
  };
}

export function parseManagedUserList(response) {
  const data = response?.data?.data || [];
  const roles = response?.data?.meta?.roles || [];
  return {
    users: data.map(parseManagedUser),
    roles,
  };
}

export function parseManagedUserShow(response) {
  const resource = response?.data?.data;
  const roles = response?.data?.meta?.roles || [];
  return {
    user: resource ? parseManagedUser(resource) : null,
    roles,
  };
}

export function extractApiErrors(error) {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors)) {
    return data.errors.map((e) => (typeof e === "string" ? e : String(e)));
  }
  if (typeof data?.error === "string") {
    return [data.error];
  }
  if (data?.errors && typeof data.errors === "object") {
    return Object.values(data.errors).flat();
  }
  return ["Ocurrió un error inesperado."];
}

export function formatCreatedAt(isoString) {
  if (!isoString) {
    return "";
  }
  try {
    return new Date(isoString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}
