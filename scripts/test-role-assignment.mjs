/**
 * Verifies API role-name vs frontend role flags (same logic as userSession.js + permissions.js).
 * Run: node scripts/test-role-assignment.mjs [BASE_URL]
 */

const BASE_URL = process.argv[2] || process.env.VUE_APP_BACKEND_URL || "http://localhost:3000";

function normalizeRoleName(roleName) {
  if (!roleName) return null;
  return String(roleName).trim().toLowerCase();
}

function roleFlags(roleName) {
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

function extractUserResource(response) {
  if (!response) return null;
  if (response.attributes) return response;
  const inner = response.data;
  if (inner?.attributes) return inner;
  if (inner?.data?.attributes) return inner.data;
  return null;
}

function parseUserFromApiResponse(response) {
  const resource = extractUserResource(response);
  if (!resource) {
    return { roleName: null, isSuperUser: false, isAdmin: false, isStaff: false, isSeller: false, isClient: false };
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

function normalizeUser(user) {
  if (!user) return { roleName: null };
  const roleName = normalizeRoleName(user.roleName || user.role_name);
  return { ...user, ...roleFlags(roleName) };
}

function hasFullAccess(user) {
  return normalizeUser(user).isStaff;
}

function canRecordPayments(u) {
  return hasFullAccess(u);
}

const RULES = {
  "users.index": (u) => u.isSuperUser,
  "payments.capture": (u) => canRecordPayments(u),
  "contracts.create": (u) => u.isStaff || u.isSeller,
  "clients.create": (u) => u.isStaff,
};

function can(user, permission) {
  const u = normalizeUser(user);
  if (hasFullAccess(u)) return true;
  const rule = RULES[permission];
  if (!rule) return false;
  return Boolean(rule(u));
}

function getDefaultRouteForUser(user) {
  if (!user) return { name: "Login" };
  if (user.isClient) return { name: "ClientPortal" };
  if (user.isSeller) return { name: "Contracts" };
  return { name: "Dashboard" };
}

const ACCOUNTS = [
  {
    label: "Super user",
    email: "superuser@example.com",
    password: "qwe123",
    expectedRole: "super_user",
    expected: {
      isSuperUser: true,
      isAdmin: false,
      isStaff: true,
      isSeller: false,
      isClient: false,
      hasFullAccess: true,
      defaultRoute: "Dashboard",
    },
  },
  {
    label: "Admin",
    email: "admin@user.com",
    password: "password",
    expectedRole: "admin",
    expected: {
      isSuperUser: false,
      isAdmin: true,
      isStaff: true,
      isSeller: false,
      isClient: false,
      hasFullAccess: true,
      defaultRoute: "Dashboard",
    },
  },
  {
    label: "Seller",
    email: "seller@example.com",
    password: "password",
    expectedRole: "user",
    expected: {
      isSuperUser: false,
      isAdmin: false,
      isStaff: false,
      isSeller: true,
      isClient: false,
      hasFullAccess: false,
      defaultRoute: "Contracts",
    },
  },
  {
    label: "Client",
    email: "jane.client@example.com",
    password: "password123",
    expectedRole: "client",
    expected: {
      isSuperUser: false,
      isAdmin: false,
      isStaff: false,
      isSeller: false,
      isClient: true,
      hasFullAccess: false,
      defaultRoute: "ClientPortal",
    },
  },
];

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ auth: { email, password } }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function memberData(token) {
  const res = await fetch(`${BASE_URL}/member-data`, {
    headers: { Authorization: token, Accept: "application/json" },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function apiRoleFromPayload(payload) {
  const attrs = payload?.data?.attributes || {};
  return attrs["role-name"] ?? attrs.role_name ?? attrs.roleName ?? null;
}

function checkAccount(account, apiBody, parsed, source) {
  const apiRole = normalizeRoleName(apiRoleFromPayload(apiBody));
  const issues = [];

  if (apiRole !== account.expectedRole) {
    issues.push(`API role-name "${apiRole}" !== expected "${account.expectedRole}"`);
  }
  if (parsed.roleName !== account.expectedRole) {
    issues.push(`parsed.roleName "${parsed.roleName}" !== expected "${account.expectedRole}"`);
  }

  for (const [key, expected] of Object.entries(account.expected)) {
    if (key === "defaultRoute") continue;
    const actual = key === "hasFullAccess" ? hasFullAccess(parsed) : parsed[key];
    if (Boolean(actual) !== Boolean(expected)) {
      issues.push(`${key}: got ${actual}, expected ${expected}`);
    }
  }

  const defaultRoute = getDefaultRouteForUser(parsed).name;
  if (defaultRoute !== account.expected.defaultRoute) {
    issues.push(`defaultRoute: got ${defaultRoute}, expected ${account.expected.defaultRoute}`);
  }

  // Staff use hasFullAccess bypass in permissions.js (UI allows all; API may still 403 users)
  const samplePerms = {
    "users.index": account.expected.hasFullAccess || account.expected.isSuperUser,
    "payments.capture": account.expected.isStaff,
    "contracts.create": account.expected.isStaff || account.expected.isSeller,
    "clients.create": account.expected.isStaff,
  };
  for (const [perm, expected] of Object.entries(samplePerms)) {
    const actual = can(parsed, perm);
    if (Boolean(actual) !== Boolean(expected)) {
      issues.push(`can('${perm}'): got ${actual}, expected ${expected}`);
    }
  }

  const restored = normalizeUser(JSON.parse(JSON.stringify(parsed)));
  if (restored.roleName !== parsed.roleName) {
    issues.push("localStorage round-trip changed roleName");
  }

  return {
    source,
    apiRole,
    parsed: {
      email: parsed.email,
      roleName: parsed.roleName,
      roleId: parsed.roleId,
      clientId: parsed.clientId,
      isSuperUser: parsed.isSuperUser,
      isAdmin: parsed.isAdmin,
      isStaff: parsed.isStaff,
      isSeller: parsed.isSeller,
      isClient: parsed.isClient,
      hasFullAccess: hasFullAccess(parsed),
      defaultRoute,
    },
    ok: issues.length === 0,
    issues,
  };
}

async function testAccount(account) {
  const loginRes = await login(account.email, account.password);
  if (loginRes.status < 200 || loginRes.status >= 300) {
    return {
      label: account.label,
      ok: false,
      issues: [`Login failed HTTP ${loginRes.status}: ${JSON.stringify(loginRes.body)}`],
    };
  }

  const token = loginRes.body?.meta?.token;
  if (!token) {
    return { label: account.label, ok: false, issues: ["Login response missing meta.token"] };
  }

  const parsedFromLogin = parseUserFromApiResponse(loginRes.body);
  const loginCheck = checkAccount(account, loginRes.body, parsedFromLogin, "login");

  const memberRes = await memberData(token);
  if (memberRes.status < 200 || memberRes.status >= 300) {
    return {
      label: account.label,
      ok: false,
      issues: [`member-data failed HTTP ${memberRes.status}`],
      login: loginCheck,
    };
  }

  const parsedFromMember = parseUserFromApiResponse(memberRes.body);
  const memberCheck = checkAccount(account, memberRes.body, parsedFromMember, "member-data");

  if (parsedFromLogin.roleName !== parsedFromMember.roleName) {
    memberCheck.issues.push(
      `login vs member-data role mismatch: ${parsedFromLogin.roleName} vs ${parsedFromMember.roleName}`
    );
    memberCheck.ok = false;
  }

  return {
    label: account.label,
    ok: loginCheck.ok && memberCheck.ok,
    login: loginCheck,
    memberData: memberCheck,
  };
}

console.log(`Testing roles against ${BASE_URL}\n`);

const results = [];
for (const account of ACCOUNTS) {
  results.push(await testAccount(account));
}

let allOk = true;
for (const r of results) {
  console.log(`--- ${r.label} ---`);
  if (r.login) {
    console.log("Login parse:", JSON.stringify(r.login.parsed, null, 2));
    console.log(`API role-name (login): ${r.login.apiRole}`);
  }
  if (r.memberData) {
    console.log(`API role-name (member-data): ${r.memberData.apiRole}`);
  }
  if (r.ok) {
    console.log("PASS\n");
  } else {
    allOk = false;
    console.log("FAIL");
    for (const issue of r.issues || []) console.log(`  - ${issue}`);
    for (const block of [r.login, r.memberData]) {
      if (block?.issues?.length) {
        for (const issue of block.issues) console.log(`  [${block.source}] ${issue}`);
      }
    }
    console.log("");
  }
}

process.exit(allOk ? 0 : 1);
