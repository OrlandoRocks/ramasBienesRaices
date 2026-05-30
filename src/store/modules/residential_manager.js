import axios from "axios";
import router from "@/router/router";
import { normalizeResidentialFromApi } from "@/util/residentialApi";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

function authConfig() {
  return {
    headers: {
      Authorization: localStorage.getItem("auth_token"),
    },
  };
}

const state = {
  residentials: [],
  residential: {
    id: "",
    name: "",
    address: "",
    user_ids: [],
    assigned_users: [],
    user_id: "",
    user_name: "",
    assignees_label: "",
    lands_count: "",
    lands: [],
    total_expenses: "",
    cost: "",
  },
};

const getters = {
  getResidentials(state) {
    return state.residentials;
  },
  getResidentialById(state) {
    return state.residential;
  },
};

const actions = {
  fetchResidentials({ commit }) {
    return axios
      .get(`${BASE_URL}/residentials`, authConfig())
      .then((response) => {
        const formatted = (response.data || []).map(
          normalizeResidentialFromApi
        );
        commit("setResidentials", formatted);
        return formatted;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  fetchResidentialById({ commit }, id) {
    return axios
      .get(`${BASE_URL}/residentials/${id}`, authConfig())
      .then((response) => {
        const formatted = normalizeResidentialFromApi(response.data);
        commit("setResidential", formatted);
        return formatted;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  createResidential(_, payload) {
    return axios
      .post(`${BASE_URL}/residentials`, payload, authConfig())
      .then((response) => {
        router.push("/residentials");
        return normalizeResidentialFromApi(response.data);
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  updateResidential({ commit }, payload) {
    const id = payload.residential?.id;
    return axios
      .patch(`${BASE_URL}/residentials/${id}`, payload, authConfig())
      .then((response) => {
        const formatted = normalizeResidentialFromApi(response.data);
        commit("setResidentialsUpdate", formatted);
        router.push("/residentials");
        return formatted;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  deleteResidential({ commit }, id) {
    return axios
      .delete(`${BASE_URL}/residentials/${id}`, authConfig())
      .then((response) => {
        commit("deleteResidential", id);
        return response;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
};

const mutations = {
  setResidentials(state, residentials) {
    state.residentials = residentials;
  },
  setResidential(state, residential) {
    state.residential = residential;
  },
  setResidentialsUpdate(state, residential) {
    const index = state.residentials.findIndex(
      (element) => String(element.id) === String(residential.id)
    );
    if (index !== -1) {
      state.residentials.splice(index, 1, residential);
    }
  },
  deleteResidential(state, id) {
    const index = state.residentials.findIndex(
      (element) => String(element.id) === String(id)
    );
    if (index !== -1) {
      state.residentials.splice(index, 1);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
