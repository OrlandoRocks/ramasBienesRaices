import axios from "axios";
import router from "@/router/router";

//const BASE_URL = "http://localhost:3000/";
const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  auth_token: null,
  errors: null,
  user: {
    id: null,
    name: null,
    last_name: null,
    email: null,
  },
  users: [],
  residentials: [],
};
const getters = {
  getAuthToken(state) {
    return state.auth_token;
  },
  getUserEmail(state) {
    return state.user?.email;
  },
  getUserName(state) {
    return state.user?.name + " " + state.user?.last_name;
  },
  getUsersList(state) {
    return state.users;
  },
  getUserID(state) {
    return state.user?.id;
  },
  getError(state) {
    return state.errors;
  },
  isLoggedIn(state) {
    const loggedOut =
      state.auth_token == null || state.auth_token == JSON.stringify(null);
    return !loggedOut;
  },
  getResidentialsList(state) {
    return state.residentials;
  },
};
const actions = {
  registerUser({ commit }, payload) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${BASE_URL}/signup`, payload)
        .then((response) => {
          commit("setUserInfo", response);
          router.push("/dashboard");
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
          console.log(response);
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
        .catch((error) => {
          commit("setError", error);
          reject(error);
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
          commit("setError", error);
          reject(error);
        });
    });
  },
  usersList({ commit }) {
    const config = {
      headers: {
        Authorization: state.auth_token,
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_URL}/users`, config)
        .then((response) => {
          const formattedUsers = response.data.data.map((user) => {
            const name = user.attributes.name || "Sin nombre";
            const lastName = user.attributes["last-name"] || "Sin apellido";

            const fullName = `${name} ${lastName}`.trim();

            return {
              id: user.id,
              name: name,
              last_name: lastName,
              full_name: fullName,
              email: user.attributes.email || "No email",
            };
          });
          commit("setUsers", formattedUsers);
          resolve(response);
        })
        .catch((error) => {
          commit("setError", error);
          reject(error);
        });
    });
  },
  residentialsList({ commit }) {
    const config = {
      headers: {
        Authorization: state.auth_token,
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_URL}/residentials-data`, config)
        .then((response) => {
          const formattedResidentials = response.data.data.map((residential) => {
            const name = residential.attributes.name || "Sin nombre";
            
            return {
              id: residential.id,
              name: name
            };
          });
          commit("setResidentials", formattedResidentials);
          resolve(response);
        })
        .catch((error) => {
          commit("setError", error);
          reject(error);
        });
    });
  },
};
const mutations = {
  setUserInfo(state, data) {
    state.user = data.data.data.attributes;
    state.user.last_name = data.data.data.attributes["last-name"];
    state.auth_token = data.data.meta.token;
    axios.defaults.headers.common["Authorization"] = state.auth_token;
    localStorage.setItem("auth_token", state.auth_token);
  },
  setError(state, error) {
    state.errors = error;
  },
  setUserInfoFromToken(state, data) {
    state.user = data.data.data.attributes;
    state.user.last_name = data.data.data.attributes["last-name"];
    state.auth_token = localStorage.getItem("auth_token");
  },
  setUsers(state, data) {
    state.users = data;
  },
  resetUserInfo(state) {
    state.user = {
      id: null,
      name: null,
      last_name: null,
      email: null,
    };
    state.auth_token = null;
    localStorage.removeItem("auth_token");
    axios.defaults.headers.common["Authorization"] = null;
    router.push({ name: "Login" });
  },
  setResidentials(state, data) {
    state.residentials = data;
  },
};
export default {
  state,
  getters,
  actions,
  mutations,
};
