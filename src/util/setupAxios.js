import axios from "axios";
import router from "@/router/router";
import store from "@/store";
import { clearAuthToken, getAuthToken, isAuthTokenValid } from "@/util/auth";

let isHandlingUnauthorized = false;
let lastForbiddenToastAt = 0;
let forbiddenNotifyHandler = null;

export function setForbiddenNotifyHandler(handler) {
  forbiddenNotifyHandler = handler;
}

const PUBLIC_AUTH_PATHS = ["/login", "/signup"];

function shouldHandleUnauthorized(error) {
  const url = error.config?.url || "";
  return !PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function notifyForbidden(error) {
  const now = Date.now();
  if (now - lastForbiddenToastAt < 2000) {
    return;
  }
  lastForbiddenToastAt = now;

  const message =
    error.response?.data?.error ||
    "No estas autorizado para realizar esta accion!";

  if (forbiddenNotifyHandler) {
    forbiddenNotifyHandler(message);
  }
}

export function handleUnauthorized() {
  if (isHandlingUnauthorized) {
    return;
  }

  isHandlingUnauthorized = true;
  clearAuthToken();
  delete axios.defaults.headers.common.Authorization;

  const onLoginPage = router.currentRoute?.name === "Login";
  if (!onLoginPage) {
    store.commit("resetUserInfo");
  }

  setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 500);
}

export function setupAxios() {
  axios.interceptors.request.use((config) => {
    const url = config.url || "";
    const isPublic = PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
    const token = getAuthToken();

    if (!isPublic && token && isAuthTokenValid(token)) {
      config.headers.Authorization = token;
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && shouldHandleUnauthorized(error)) {
        handleUnauthorized();
      } else if (
        error.response?.status === 403 &&
        shouldHandleUnauthorized(error)
      ) {
        notifyForbidden(error);
      }
      return Promise.reject(error);
    }
  );
}
