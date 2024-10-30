import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  residentials: [],
  residentials_list: [],
  residential: {
    id: "",
    name: "",
    lands_count: "",
    lands: [],
    total_expenses: "",
    total_payments: "",
    cost: "",
    net_balance: "",
    payments_by_month: "",
    expenses_by_month: ""
  },
};

const getters = {
  getBalanceResidentials(state) {
    return state.residentials;
  },
  getBalanceData(state){
    return state.residentials;
  },
  getResidentialsList(state){
    return state.residentials_list;
  }
};

const actions = {
  fetchBalanceResidentials({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/balance`, config)
      .then((response) => {
        const formatedResidentials = response.data.data.map((residential) => {
          return {
            id: residential.attributes.id,
            name: residential.attributes.name,
            address: residential.attributes.address,
            user_id: residential.attributes["user-id"],
            user_name: residential.attributes["user-full-name"],
            lands_count: residential.attributes["lands-count"],
            total_expenses: residential.attributes["total-expenses"],
            total_payments: residential.attributes["total-payments"],
            cost: residential.attributes.cost,
            net_balance: residential.attributes["total-payments"] - residential.attributes["total-expenses"]
          };
        });
        commit("setResidentials", formatedResidentials);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchBalanceData({ commit }, data) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/get_balance_data?residential_id=${data.residential_id}&month=${data.month}&year=${data.year}`, config)
      .then((response) => {
        //let residential = response.data.data[0];
        const formatedResidentials = response.data.data.map((residential) => {
          return {
            id: residential.attributes.id,
            name: residential.attributes.name,
            address: residential.attributes.address,
            user_id: residential.attributes["user-id"],
            user_name: residential.attributes["user-full-name"],
            lands_count: residential.attributes["lands-count"],
            payments_by_month: "$" + residential.attributes["payments-by-month"],
            expenses_by_month: "$" + residential.attributes["expenses-by-month"],
            cost: residential.attributes.cost,
            net_balance: (residential.attributes["payments-by-month"] - residential.attributes["expenses-by-month"])
          };
        });
        /* const formatedResidentials = {
            id: residential.id,
            name: residential.attributes.name,
            address: residential.attributes.address,
            user_id: residential.attributes["user-id"],
            user_name: residential.attributes["user-full-name"],
            lands_count: residential.attributes["lands-count"],
            payments_by_month: residential.attributes["payments-by-month"],
            expenses_by_month: residential.attributes["expenses-by-month"],
            cost: residential.attributes.cost,
            net_balance: residential.attributes["total-payments"] - residential.attributes["total-expenses"]
          }; */
        commit("setBalanceInfo", formatedResidentials);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  residentialsList({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return new Promise((resolve, reject) => {
      axios
        .get(`${BASE_URL}/residentials-list`, config)
        .then((response) => {
          const formatedResidentials = response.data.data.map((residential) => {
            return {
              id: residential.id,
              name: residential.attributes.name,
            };
          });
          commit("setResidentialsList", formatedResidentials);
          resolve(response);
        })
        .catch((error) => {
          commit("setError", error);
          reject(error);
        });
    });
  }
};

const mutations = {
  setResidentials(state, residentials) {
    state.residentials = residentials;
  },
  setBalanceInfo(state, data) {
    state.residentials = data;
  },
  setResidentialsList(state, data) {
    state.residentials_list = data;
  }
};

export default {
  state,
  getters,
  actions,
  mutations,
};
