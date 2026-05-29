export function getAuthToken() {
  const token = localStorage.getItem("auth_token");
  if (!token || token === "undefined") {
    return null;
  }
  return token;
}

export function isAuthTokenValid(token = getAuthToken()) {
  if (!token) {
    return false;
  }

  const payload = token.split(".")[1];
  if (!payload) {
    return false;
  }

  try {
    const decoded = JSON.parse(atob(payload));
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAuthToken() {
  localStorage.removeItem("auth_token");
}
