import { emptyUser, normalizeUser } from "@/util/userSession";

/** Super user and admin get full UI access (routes, sidebar, action icons). */
export function hasFullAccess(user) {
  const u = normalizeUser(user);
  return u.isStaff;
}

/** Staff (admin + super_user) can capture and update payments (Pundit: manage_business_resources). */
function canRecordPayments(u) {
  return hasFullAccess(u);
}

/**
 * Permission rules aligned with RamasBackend Pundit policies.
 * Usage: can(user, 'contracts.create') or can(user, 'route', 'Dashboard')
 */
const RULES = {
  "dashboard.view": (u) => u.isStaff || u.isSeller,
  "balance.view": (u) => u.isStaff || u.isSeller,

  "residentials.index": (u) => !u.isClient,
  "residentials.show": (u) => u.isStaff || u.isSeller,
  "residentials.create": (u) => u.isStaff,
  "residentials.update": (u) => u.isStaff,
  "residentials.destroy": (u) => u.isStaff,
  "residentials.import_lands": (u) => u.isStaff || u.isSeller,
  "residentials.import_geo_layers": (u) => u.isStaff || u.isSeller,

  "lands.index": (u) => !u.isClient,
  "lands.show": (u) => u.isStaff || u.isSeller,
  "lands.create": (u) => u.isStaff || u.isSeller,
  "lands.update": (u) => u.isStaff,
  "lands.destroy": (u) => u.isStaff,

  "clients.index": (u) => u.isStaff || u.isSeller,
  "clients.show": (u) => u.isStaff || u.isSeller,
  "clients.create": (u) => u.isStaff,
  "clients.update": (u) => u.isStaff,
  "clients.destroy": (u) => u.isStaff,

  "contracts.index": (u) => u.isStaff || u.isSeller || u.isClient,
  "contracts.show": (u) => u.isStaff || u.isSeller || u.isClient,
  "contracts.create": (u) => u.isStaff || u.isSeller,
  "contracts.update": (u) => u.isStaff,
  "contracts.destroy": (u) => u.isStaff,
  "contracts.payments": (u) => u.isStaff || u.isSeller || u.isClient,

  "payments.index": (u) => u.isStaff || u.isSeller,
  "payments.show": (u) => u.isStaff || u.isSeller || u.isClient,
  "payments.create": (u) => canRecordPayments(u) || u.isSeller,
  "payments.update": (u) => canRecordPayments(u),
  "payments.capture": (u) => canRecordPayments(u),
  "payments.destroy": (u) => canRecordPayments(u),

  "expenses.index": (u) => !u.isClient,
  "expenses.show": (u) => u.isStaff || u.isSeller,
  "expenses.create": (u) => u.isStaff || u.isSeller,
  "expenses.update": (u) => u.isStaff,
  "expenses.destroy": (u) => u.isStaff,

  "users.manage": (u) => u.isSuperUser,
  "users.index": (u) => u.isSuperUser,

  /** Creative Tim demo pages (charts, calendar, components, etc.) — super_user only. */
  "ui.demo.view": (u) => u.isSuperUser,

  "s3.upload": (u) => !u.isClient,
  "geo_layers.index": (u) => !u.isClient,
};

/** Routes for Creative Tim template/demo sections (not business app). */
export const DEMO_ROUTE_NAMES = new Set([
  "Calendar",
  "Charts",
  "Widgets",
  "Components",
  "Buttons",
  "Grid System",
  "Panels",
  "Sweet Alert",
  "Notifications",
  "Icons",
  "Typography",
  "Forms",
  "Regular Forms",
  "Extended Forms",
  "Validation Forms",
  "Wizard",
  "Tables",
  "Regular Tables",
  "Extended Tables",
  "Paginated Tables",
  "Maps",
  "Google Maps",
  "Full Screen Map",
  "Vector Map",
]);

function isStaffBypassExcluded(permission) {
  return permission.startsWith("users.") || permission === "ui.demo.view";
}

export const ROUTE_PERMISSIONS = {
  Dashboard: "dashboard.view",
  Calendar: "ui.demo.view",
  Charts: "ui.demo.view",
  Widgets: "ui.demo.view",
  Components: "ui.demo.view",
  Buttons: "ui.demo.view",
  "Grid System": "ui.demo.view",
  Panels: "ui.demo.view",
  "Sweet Alert": "ui.demo.view",
  Notifications: "ui.demo.view",
  Icons: "ui.demo.view",
  Typography: "ui.demo.view",
  Forms: "ui.demo.view",
  "Regular Forms": "ui.demo.view",
  "Extended Forms": "ui.demo.view",
  "Validation Forms": "ui.demo.view",
  Wizard: "ui.demo.view",
  Tables: "ui.demo.view",
  "Regular Tables": "ui.demo.view",
  "Extended Tables": "ui.demo.view",
  "Paginated Tables": "ui.demo.view",
  Maps: "ui.demo.view",
  "Google Maps": "ui.demo.view",
  "Full Screen Map": "ui.demo.view",
  "Vector Map": "ui.demo.view",
  Residentials: "residentials.index",
  CreateResidential: "residentials.create",
  EditResidential: "residentials.update",
  ResidentialDashboard: "residentials.show",
  Lands: "lands.index",
  CreateLand: "lands.create",
  EditLand: ["lands.update", "payments.capture"],
  Clients: "clients.index",
  CreateClient: "clients.create",
  EditClient: "clients.update",
  ShowClient: "clients.show",
  Expenses: "expenses.index",
  CreateExpense: "expenses.create",
  EditExpense: "expenses.update",
  Contracts: "contracts.index",
  CreateContract: "contracts.create",
  ShowContract: "contracts.show",
  Payments: "payments.index",
  EditPayment: ["payments.update", "payments.capture"],
  BalanceHome: "balance.view",
  ClientPortal: "contracts.index",
  Users: "users.manage",
  CreateUser: "users.manage",
  EditUser: "users.manage",
};

export const SIDEBAR_LINKS = [
  {
    nameKey: "sidebar.dashboard",
    icon: "tim-icons icon-chart-pie-36",
    path: "/dashboard",
    routeName: "Dashboard",
    permission: "dashboard.view",
  },
  {
    nameKey: "sidebar.neighborhood",
    icon: "tim-icons icon-square-pin",
    path: "/residentials",
    routeName: "Residentials",
    permission: "residentials.index",
  },
  {
    nameKey: "sidebar.lands",
    icon: "tim-icons icon-vector",
    path: "/lands",
    routeName: "Lands",
    permission: "lands.index",
  },
  {
    nameKey: "sidebar.clients",
    icon: "tim-icons icon-badge",
    path: "/clients",
    routeName: "Clients",
    permission: "clients.index",
  },
  {
    nameKey: "sidebar.expenses",
    icon: "tim-icons icon-money-coins",
    path: "/expenses",
    routeName: "Expenses",
    permission: "expenses.index",
  },
  {
    nameKey: "sidebar.contracts",
    icon: "tim-icons icon-paper",
    path: "/contracts",
    routeName: "Contracts",
    permission: "contracts.index",
  },
  {
    name: "Pagos",
    icon: "tim-icons icon-money-coins",
    path: "/payments",
    routeName: "Payments",
    permission: "payments.index",
  },
  {
    name: "Mi contrato",
    icon: "tim-icons icon-paper",
    path: "/portal",
    routeName: "ClientPortal",
    permission: "contracts.index",
    clientOnly: true,
  },
  {
    nameKey: "sidebar.balance",
    icon: "tim-icons icon-chart-bar-32",
    path: "/balance",
    routeName: "BalanceHome",
    permission: "balance.view",
  },
  {
    nameKey: "sidebar.users",
    icon: "tim-icons icon-single-02",
    path: "/admin/users",
    routeName: "Users",
    permission: "users.manage",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.charts",
    icon: "tim-icons icon-chart-pie-36",
    path: "/charts",
    routeName: "Charts",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.calendar",
    icon: "tim-icons icon-time-alarm",
    path: "/calendar",
    routeName: "Calendar",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.widgets",
    icon: "tim-icons icon-settings-gear-63",
    path: "/widgets",
    routeName: "Widgets",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.components",
    icon: "tim-icons icon-molecule-40",
    path: "/components/buttons",
    routeName: "Buttons",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.forms",
    icon: "tim-icons icon-notes",
    path: "/forms/regular",
    routeName: "Regular Forms",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.tables",
    icon: "tim-icons icon-puzzle-10",
    path: "/table-list/regular",
    routeName: "Regular Tables",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.maps",
    icon: "tim-icons icon-world",
    path: "/maps/google",
    routeName: "Google Maps",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
  {
    nameKey: "sidebar.icons",
    icon: "tim-icons icon-atom",
    path: "/components/icons",
    routeName: "Icons",
    permission: "ui.demo.view",
    superUserOnly: true,
  },
];

export function can(user, permission) {
  const u = normalizeUser(user);
  const rule = RULES[permission];
  if (!rule) {
    return false;
  }
  // Super_user-only features — never grant via admin staff bypass.
  if (isStaffBypassExcluded(permission)) {
    return Boolean(rule(u));
  }
  if (hasFullAccess(u)) {
    return true;
  }
  return Boolean(rule(u));
}

function canAny(user, permissions) {
  return permissions.some((permission) => can(user, permission));
}

export function canAccessRoute(user, route) {
  if (!route || !route.meta || route.meta.requiresAuth === false) {
    return true;
  }

  const u = normalizeUser(user);

  if (route.name && DEMO_ROUTE_NAMES.has(route.name)) {
    return can(u, "ui.demo.view");
  }

  const permission =
    route.meta.permission || ROUTE_PERMISSIONS[route.name] || null;

  if (!permission) {
    if (hasFullAccess(u)) {
      return true;
    }
    return true;
  }

  if (Array.isArray(permission)) {
    return canAny(u, permission);
  }

  return can(u, permission);
}

export function filterSidebarLinks(user, translate) {
  const u = normalizeUser(user);

  return SIDEBAR_LINKS.filter((link) => {
    if (link.clientOnly) {
      return u.isClient;
    }
    if (u.isClient) {
      return false;
    }
    if (link.superUserOnly && !u.isSuperUser) {
      return false;
    }
    if (hasFullAccess(u) && !link.superUserOnly) {
      return true;
    }
    if (u.isSuperUser && link.superUserOnly) {
      return true;
    }
    return can(u, link.permission);
  }).map((link) => ({
    name: link.name || (link.nameKey && translate(link.nameKey)) || link.routeName,
    icon: link.icon,
    path: link.path,
  }));
}
