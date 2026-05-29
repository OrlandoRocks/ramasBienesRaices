import axios from "axios";
import router from "@/router/router";
import {
  parseUserFromApiResponse,
  emptyUser,
  getDefaultRouteForUser,
  normalizeUser,
} from "@/util/userSession";
import { can } from "@/util/permissions";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  auth_token: null,
  errors: null,
  user: emptyUser(),
};

const getters = {
  getAuthToken(state) {
    return state.auth_token;
  },
  currentUser(state) {
    return normalizeUser(state.user);
  },
  getUserEmail(state) {
    return state.user?.email;
  },
  getUserName(state) {
    const name = state.user?.name || "";
    const last = state.user?.lastName || "";
    return `${name} ${last}`.trim();
  },
  getUserID(state) {
    return state.user?.id;
  },
  getError(state) {
    return state.errors;
  },
  isLoggedIn(state) {
    return Boolean(state.auth_token);
  },
  roleName: (state) => state.user?.roleName,
  roleId: (state) => state.user?.roleId,
  clientId: (state) => state.user?.clientId,
  isSuperUser: (state) => state.user?.isSuperUser,
  isAdmin: (state) => state.user?.isAdmin,
  isStaff: (state) => state.user?.isStaff,
  isSeller: (state) => state.user?.isSeller,
  isClient: (state) => state.user?.isClient,
  can: (state) => (permission) => can(state.user, permission),
};

const actions = {
  registerUser({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${BASE_URL}/signup`, payload)
        .then((response) => {
          commit("setUserInfo", response);
          resolve(response);
        })
        .catch((error) => {
          commit("setError", error);
          reject(error);
        });
    });
  },
  loginUser({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${BASE_URL}/login`, payload)
        .then((response) => {
          commit("setUserInfo", response);
          resolve(response);
        })
        .catch((error) => {
          commit("setError", error);
          reject(error);
        });
    });
  },
  logoutUser({ commit }) {
    const config = {
      headers: {
        Authorization: state.auth_token,
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .post(`${BASE_URL}/logout`, {}, config)
        .then(() => {
          commit("resetUserInfo");
          resolve();
        })
        .catch(() => {
          commit("resetUserInfo");
          resolve();
        });
    });
  },
  loginUserWithToken({ commit }, payload) {
    const config = {
      headers: {
        Authorization: payload.auth_token,
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_URL}/member-data`, config)
        .then((response) => {
          commit("setUserInfoFromToken", response);
          resolve(response);
        })
        .catch((error) => {
          if (error.response?.status === 401) {
            commit("resetUserInfo");
          } else {
            commit("setError", error);
          }
          reject(error);
        });
    });
  },
};

const mutations = {
  setUserInfo(state, data) {
    const token = data.data.meta.token;
    state.user = parseUserFromApiResponse(data.data);
    state.auth_token = token;
    axios.defaults.headers.common.Authorization = token;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(state.user));
  },
  setError(state, error) {
    state.errors = error;
  },
  setUserInfoFromToken(state, data) {
    state.user = parseUserFromApiResponse(data.data);
    state.auth_token = localStorage.getItem("auth_token");
    localStorage.setItem("auth_user", JSON.stringify(state.user));
  },
  resetUserInfo(state) {
    state.user = emptyUser();
    state.auth_token = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    delete axios.defaults.headers.common.Authorization;
    const routeName = router.currentRoute?.name;
    if (routeName !== "Login" && routeName !== "Register") {
      router.push({ name: "Login" }).catch(() => {});
    }
  },
  restoreUserFromStorage(state) {
    const raw = localStorage.getItem("auth_user");
    if (!raw) {
      return;
    }
    try {
      state.user = normalizeUser(JSON.parse(raw));
    } catch {
      state.user = emptyUser();
    }
  },
};

export { getDefaultRouteForUser };

export default {
  state,
  getters,
  actions,
  mutations,
};
