import { normalizeUser } from "@/util/userSession";
import { roleLabel } from "@/util/userApi";

export const ROLE = {
  SUPER: "super_user",
  ADMIN: "admin",
  SELLER: "user",
  CLIENT: "client",
};

const STAFF_ROLES = [ROLE.SUPER, ROLE.ADMIN, ROLE.SELLER];

export function canManageResidentialAssignments(user) {
  const u = normalizeUser(user);
  return u.isSuperUser || u.isAdmin;
}

export function canManageClientResidentialLinks(user) {
  const u = normalizeUser(user);
  return u.isSuperUser || u.isAdmin;
}

export function canManageUserResidentialAssignments(user) {
  const u = normalizeUser(user);
  return u.isSuperUser;
}

export function isStaffAssignableRole(roleName) {
  return STAFF_ROLES.includes(roleName);
}

export function formatAssignedUserName(user) {
  if (!user) {
    return "";
  }
  const name = `${user.name || ""} ${
    user.last_name || user.lastName || ""
  }`.trim();
  return name || user.email || `#${user.id}`;
}

export function formatAssignedUserLabel(user) {
  const name = formatAssignedUserName(user);
  const email = user.email || "";
  const role = roleLabel(user.role_name || user.roleName);
  if (email && role) {
    return `${name} (${email}) — ${role}`;
  }
  if (email) {
    return `${name} (${email})`;
  }
  return name;
}

export function formatAssigneesList(assignedUsers, fallbackName) {
  if (assignedUsers?.length) {
    return assignedUsers.map((u) => formatAssignedUserName(u)).join(", ");
  }
  return fallbackName || "—";
}

/**
 * Merge staff options from API users list and residential assigned_users blobs.
 */
export function buildStaffSelectOptions({
  apiUsers = [],
  assignedUsers = [],
} = {}) {
  const map = new Map();

  const add = (user) => {
    if (!user?.id) {
      return;
    }
    const roleName = user.role_name || user.roleName;
    if (roleName && !isStaffAssignableRole(roleName)) {
      return;
    }
    const id = Number(user.id);
    map.set(String(id), {
      id,
      label: formatAssignedUserLabel(user),
    });
  };

  apiUsers.forEach(add);
  assignedUsers.forEach(add);

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "es")
  );
}
