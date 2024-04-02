import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  residentials: [],
};

const getters = {
  getResidentials(state) {
    return state.residentials;
  },
  getResidentialById: (state) => (id) => {
    return state.residentials.find((residential) => residential.id === id);
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
            lands: residential.lands_count,
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
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/residentials/${id}`, config)
      .then((response) => {
        commit("setResidentials", response.data.data);
      })
      .catch((error) => {
        console.error(error);
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
          router.push("/residentials");
          resolve(response);
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
        .put(`${BASE_URL}/residentials/${payload.id}`, payload, config)
        .then((response) => {
          commit("setResidentials", response.data);
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
          commit("setResidentials", response.data);
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
};

export default {
  state,
  getters,
  actions,
  mutations,
};
