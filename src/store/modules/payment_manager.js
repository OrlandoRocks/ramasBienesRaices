import axios from "axios";
import router from "@/router/router";
import paymentsService from "@/services/paymentsService";
import { formatPaymentFromApi } from "@/util/paymentApi";

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
    return axios
      .get(`${BASE_URL}/payments`, config)
      .then((response) => {
        const formatedPayments = response.data.map((payment) =>
          formatPaymentFromApi(payment)
        );
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
          const payment = formatPaymentFromApi(response.data);
          commit("setPayment", payment);
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
      const paymentId = payload.id || payload.payment?.id;
      const normalizedId = paymentId != null ? String(paymentId).trim() : "";
      if (!normalizedId || normalizedId === "undefined" || normalizedId === "null") {
        return reject(new Error("Payment id is required"));
      }

      const paymentBody = payload.payment || payload;
      const usePatch = payload.usePatch === true;

      const request = usePatch
        ? paymentsService.patch(normalizedId, paymentBody)
        : axios.put(
            `${BASE_URL}/payments/${normalizedId}`,
            payload,
            {
              headers: {
                Authorization: localStorage.getItem("auth_token"),
              },
            }
          );

      request
        .then((response) => {
          const formatted = formatPaymentFromApi(response.data) || response.data;
          commit("setPaymentUpdate", formatted);
          commit("setPayment", formatted);
          resolve(formatted);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  patchPayment({ commit }, { id, payment }) {
    return paymentsService.patch(id, payment).then((response) => {
      const formatted = formatPaymentFromApi(response.data);
      commit("setPaymentUpdate", formatted);
      commit("setPayment", formatted);
      return formatted;
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
