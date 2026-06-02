import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  users: [],
  user: {
    id: "",
    name: "",
    last_name: "",
    full_name: "",
    email: "",
    role_id: 0,
    role_name: "",
  },
};

const getters = {
  getUsers(state) {
    return state.users;
  },
  getUserById(state) {
    return state.user;
  },
};

const actions = {
  fetchUsers({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/users`, config)
      .then((response) => {
        const formatedUsers = response.data.map((user) => {
          const name = user.attributes.name || "Sin nombre";
          const lastName = user.attributes["last-name"] || "Sin apellido";
          const fullName = `${name} ${lastName}`.trim();

          return {
            id: user.id,
            name: name,
            last_name: lastName,
            full_name: fullName,
            email: user.attributes.email || "No email",
            role_id: user.role_id,
            role_name: user.role_name,
          };
        });
        commit("setUsers", formatedUsers);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchUserById({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/profile/${id}`, config)
        .then((response) => {
          const data = response.data.data.attributes;
          const formatedUser = {
            id: response.data.data.id,
            full_name: data["full-name"],
            name: data.name,
            last_name: data["last-name"],
            email: data.email,
            role_id: data["role-id"],
            role_name: data["role-name"],
          };
          commit("setUser", formatedUser);
          resolve(formatedUser);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  updateUser({ commit }, payload) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .put(`${BASE_URL}/user/${payload.user.id}`, payload, config)
        .then((response) => {
          commit("setUserUpdate", response.data);
          // router.push(`/profile/${response.data.id}/edit`);
          router.push(`/`);
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  deleteUser({ commit }, id) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .delete(`${BASE_URL}/users/${id}`, config)
        .then((response) => {
          commit("deleteUser", id);
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
};

const mutations = {
  setUsers(state, users) {
    state.users = users;
  },
  setUser(state, user) {
    state.user = user;
  },
  setUserUpdate(state, user) {
    const index = state.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      state.users.splice(index, 1, user);
    }
  },
  deleteUser(state, id) {
    const index = state.users.findIndex((element) => element.id === id);
    if (index !== -1) {
      state.users.splice(index, 1);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
