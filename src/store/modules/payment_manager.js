import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;
const state = {
  payments: [],
  payment: {
    id: 0,
    amount: 0.0,
    payment_date: "0000-00-00",
    payment_type: "",
    comments: "",
    image_url: "",
    status: "",
    payment_status_name: "",
    contract_id: 0,
    contract: {},
    land_code: "",
    land_address: "",
    client_name: "",
    residential_name: "",
  },
};

const getters = {
  getPayments(state) {
    return state.payments;
  },
  getPaymentById(state) {
    return state.payment;
  },
};

const actions = {
  fetchPayments({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/payments`, config)
      .then((response) => {
        const formatedPayments = response.data.map((payment) => {
          return {
            id: payment.id,
            amount: payment.amount,
            payment_date: payment.payment_date,
            payment_type: payment.payment_type,
            comments: payment.comments,
            image_url: payment.image_url,
            status: payment.status,
            payment_status_name: payment.payment_status_name,
            contract: payment.contract,
            land_code: payment.land_code,
            land_address: payment.land_address,
            client_name: payment.client_name,
            residential_name: payment.residential_name,
            contract_id: payment.contract_id,
          };
        });
        commit("setPayments", formatedPayments);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchPaymentById({ commit }, payment_id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/payments/${payment_id}`, config)
        .then((response) => {
          const payment = response.data;
          commit("setPayment", {
            id: payment.id,
            amount: payment.amount,
            payment_date: payment.payment_date,
            payment_type: payment.payment_type,
            comments: payment.comments,
            image_url: payment.image_url,
            status: payment.status,
            payment_status_name: payment.payment_status_name,
            contract: payment.contract,
            land_code: payment.land_code,
            land_address: payment.land_address,
            client_name: payment.client_name,
            residential_name: payment.residential_name,
            contract_id: payment.contract_id,
          });
          resolve(payment);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  fetchPaymentsByContractId({ commit }, contract_id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/contracts/${contract_id}/payments`, config)
        .then((response) => {
          const payment = response.data;
          commit("setPayment", {
            id: payment.id,
            amount: payment.amount,
            payment_date: payment.payment_date,
            payment_type: payment.payment_type,
            comments: payment.comments,
            image_url: payment.image_url,
            status: payment.status,
            contract_id: payment.contract_id,
          });
          resolve(payment);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  createPayment({ commit }, payment) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .post(`${BASE_URL}/payments`, payment, config)
        .then((response) => {
          state.payments.push(response.data);
          commit("setPayments", state.payments);
          router.push("/payments");
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  updatePayment({ commit }, payload) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .put(`${BASE_URL}/payments/${payload.payment.id}`, payload, config)
        .then((response) => {
          commit("setPaymentUpdate", response.data);
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  deletePayement({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .delete(`${BASE_URL}/payements/${id}`, config)
        .then((response) => {
          commit("setDeletePayement", id);
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
  setPayments(state, payments) {
    state.payments = payments;
  },
  setPayment(state, payment) {
    state.payment = payment;
  },
  setPaymentUpdate(state, payment) {
    const index = state.payments.findIndex((c) => c.id === payment.id);
    if (index !== -1) {
      state.payments.splice(index, 1, payment);
    }
  },
  setDeletePayment(state, id) {
    const index = state.payments.findIndex((c) => c.id === id);
    if (index !== -1) {
      state.payments.splice(index, 1);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
