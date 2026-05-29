export function normalizeRoleName(roleName) {
  if (!roleName) {
    return null;
  }
  return String(roleName).trim().toLowerCase();
}

export function roleFlags(roleName) {
  const role = normalizeRoleName(roleName);
  return {
    roleName: role,
    isSuperUser: role === "super_user",
    isAdmin: role === "admin",
    isStaff: role === "super_user" || role === "admin",
    isSeller: role === "user",
    isClient: role === "client",
  };
}

/**
 * Ensures role booleans are set (e.g. after loading from localStorage).
 */
export function normalizeUser(user) {
  if (!user) {
    return emptyUser();
  }

  const roleName = normalizeRoleName(user.roleName || user.role_name);
  if (!roleName) {
    return emptyUser();
  }

  return {
    ...user,
    ...roleFlags(roleName),
  };
}

/**
 * Extracts the JSON:API user resource from login, signup, or member-data payloads.
 * Accepts the API body `{ data: resource, meta? }` or the resource itself.
 */
function extractUserResource(response) {
  if (!response) {
    return null;
  }
  if (response.attributes) {
    return response;
  }
  const inner = response.data;
  if (inner?.attributes) {
    return inner;
  }
  if (inner?.data?.attributes) {
    return inner.data;
  }
  return null;
}

/**
 * Maps JSON:API user payloads from login, signup, and member-data.
 */
export function parseUserFromApiResponse(response) {
  const resource = extractUserResource(response);
  if (!resource) {
    return emptyUser();
  }
  const attributes = resource.attributes || {};

  const roleName = normalizeRoleName(
    attributes["role-name"] || attributes.role_name || attributes.roleName
  );
  const roleId =
    attributes["role-id"] || attributes.role_id || attributes.roleId || null;
  const clientId =
    attributes["client-id"] || attributes.client_id || attributes.clientId || null;

  return {
    id: resource?.id || attributes.id || null,
    name: attributes.name || "",
    lastName: attributes["last-name"] || attributes.last_name || "",
    email: attributes.email || "",
    roleId,
    clientId: clientId || null,
    ...roleFlags(roleName),
  };
}

export function emptyUser() {
  return {
    id: null,
    name: "",
    lastName: "",
    email: "",
    roleId: null,
    roleName: null,
    clientId: null,
    isSuperUser: false,
    isAdmin: false,
    isStaff: false,
    isSeller: false,
    isClient: false,
  };
}

export function getDefaultRouteForUser(user) {
  if (!user) {
    return { name: "Login" };
  }
  if (user.isClient) {
    return { name: "ClientPortal" };
  }
  if (user.isSeller) {
    return { name: "Contracts" };
  }
  return { name: "Dashboard" };
}
