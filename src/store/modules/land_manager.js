import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  lands: [],
  land: {
    id: "",
    land_code: "",
    address: "",
    block: "",
    size: "",
    price: "",
    house_number: "",
    residential_id: "",
    residential_name: "",
    client_name: "",
  },
};

const getters = {
  getLands(state) {
    return state.lands;
  },
  getLandById(state) {
    return state.land;
  },
};

const actions = {
  fetchLands({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/lands`, config)
      .then((response) => {
        const formatedLands = response.data.map((land) => {
          return {
            id: land.id,
            land_code: land.land_code,
            address: land.address,
            block: land.block,
            size: land.size,
            price: land.price,
            house_number: land.house_number,
            residential_id: land.residential_id,
            residential_name: land.residential_name,
            client_name: land.client_name,
          };
        });
        commit("setLands", formatedLands);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchLandById({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/lands/${id}`, config)
        .then((response) => {
          const land = {
            id: response.data.id,
            land_code: response.data.land_code,
            address: response.data.address,
            block: response.data.block,
            size: response.data.size,
            price: response.data.price,
            house_number: response.data.house_number,
            residential_id: response.data.residential_id,
            residential_name: response.data.residential_name,
            client_name: response.data.client_name,
          };
          commit("setLand", land);
          resolve(land);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  createLand({ commit }, lands) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .post(`${BASE_URL}/lands`, lands, config)
        .then((response) => {
          state.lands.push(response.data);
          commit("setLands", state.lands);
          router.push("/lands");
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  updateLand({ commit }, payload) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .put(`${BASE_URL}/lands/${payload.land.id}`, payload, config)
        .then((response) => {
          commit("setLandUpdate", response.data);
          router.push("/lands");
          resolve(response);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  deleteLand({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .delete(`${BASE_URL}/lands/${id}`, config)
        .then((response) => {
          commit("deleteLand", id);
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
};

const mutations = {
  setLands(state, lands) {
    state.lands = lands;
  },
  setLand(state, land) {
    state.land = land;
  },
  setLandUpdate(state, land) {
    const index = state.lands.findIndex((l) => l.id === land.id);
    if (index !== -1) {
      state.lands.splice(index, 1, land);
    }
  },
  deleteLand(state, id) {
    const index = state.lands.findIndex((element) => element.id === id);
    if (index !== -1) {
      state.lands.splice(index, 1);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
