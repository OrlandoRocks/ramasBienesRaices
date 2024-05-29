import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  residentials: [],
  residential: {
    id: "",
    name: "",
    address: "",
    user_id: "",
    user_name: "",
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
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/residentials`, config)
      .then((response) => {
        const formatedResidentials = response.data.map((residential) => {
          return {
            id: residential.id,
            name: residential.name,
            address: residential.address,
            user_id: residential.user_id,
            user_name: residential.user_full_name,
            lands_count: residential.lands_count,
            total_expenses: residential.total_expenses,
            cost: residential.cost,
          };
        });
        commit("setResidentials", formatedResidentials);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchResidentialById({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/residentials/${id}`, config)
        .then((response) => {
          const formatedResidential = {
            id: response.data.id,
            name: response.data.name,
            address: response.data.address,
            user_id: response.data.user_id,
            user_name: response.data.user_full_name,
            lands_count: response.data.lands_count,
            lands: response.data.lands,
            total_expenses: response.data.total_expenses,
            cost: response.data.cost,
          };
          commit("setResidential", formatedResidential);
          resolve(formatedResidential);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  // eslint-disable-next-line no-empty-pattern
  createResidential({}, payload) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .post(`${BASE_URL}/residentials`, payload, config)
        .then((response) => {
          state.residentials.push(response.data);
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  updateResidential({ commit }, payload) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .put(
          `${BASE_URL}/residentials/${payload.residential.id}`,
          payload,
          config
        )
        .then((response) => {
          commit("setResidentialsUpdate", response.data);
          router.push("/residentials");
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  deleteResidential({ commit }, id) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .delete(`${BASE_URL}/residentials/${id}`, config)
        .then((response) => {
          commit("deleteResidential", id);
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
  setResidentials(state, residentials) {
    state.residentials = residentials;
  },
  setResidential(state, residential) {
    state.residential = residential;
  },
  setResidentialsUpdate(state, residential) {
    const index = state.residentials.findIndex(
      (element) => element.id === residential.id
    );
    if (index !== -1) {
      state.residentials.splice(index, 1, residential);
    }
  },
  deleteResidential(state, id) {
    const index = state.residentials.findIndex((element) => element.id === id);
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
