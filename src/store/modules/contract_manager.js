import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;
const state = {
  contracts: [],
  contract: {
    id: 0,
    client_id: 0,
    client_name: "",
    land_id: 0,
    land_code: "",
    contract_date: "0000-00-00",
    type: "",
    total_price: 0.0,
    total_paid: 0.0,
    down_payment: 0.0,
    monthly_payment: 0.0,
    yearly_payment: 0.0,
    payments: [],
    months: 0,
    penalty_interest: 0.0,
    extraordinary_payment: 0.0,
  },
  payments_by_month: "",
  lands_sold: 0,
  total_paid: "",
  pdf_content: "",
};

const getters = {
  getContracts(state) {
    return state.contracts;
  },
  getContractById(state) {
    return state.contract;
  },
  getContractPayments(state) {
    let total = state.contract.total_price - state.contract.down_payment;
    console.log(state.contract);
    return state.contract.payments.map((payment, index) => {
      payment.total = total;
      total -= payment.amount;
      payment.row_number = index + 1;
      return payment;
    });
  },
  getUserContracts(state) {
    return state.contracts;
  },
  getPaymentsByMonth(state) {
    return state.payments_by_month;
  },
  getLandsSold(state) {
    return state.lands_sold;
  },
  getTotalPaid(state) {
    return state.total_paid;
  },
  getContractPdf(state) {
    return state.pdf_content;
  },
};

const actions = {
  fetchContracts({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/contracts`, config)
      .then((response) => {
        const formatedContracts = response.data.map((contract) => {
          return {
            id: contract.id,
            client_id: contract.client_id,
            client_name: contract.client_name,
            land_id: contract.land_id,
            land_code: contract.land_code,
            contract_date: contract.contract_date,
            type: contract.type,
            total_price: contract.total_price,
            total_paid: contract.total_paid,
            down_payment: contract.down_payment,
            monthly_payment: contract.monthly_payment,
            yearly_payment: contract.yearly_payment,
            months: contract.months,
            penalty_interest: contract.penalty_interest,
            extraordinary_payment: contract.extraordinary_payment,
          };
        });
        commit("setContracts", formatedContracts);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchContractById({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/contracts/${id}`, config)
        .then((response) => {
          const contract = response.data;
          commit("setContract", {
            id: contract.id,
            client_id: contract.client_id,
            land_id: contract.land_id,
            contract_date: contract.contract_date,
            type: contract.type,
            down_payment: contract.down_payment,
            monthly_payment: contract.monthly_payment,
            total_price: contract.total_price,
            payments: contract.payments,
            total_paid: contract.total_paid,
            yearly_payment: contract.yearly_payment,
            months: contract.months,
            penalty_interest: contract.penalty_interest,
            extraordinary_payment: contract.extraordinary_payment,
          });
          resolve(contract);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  createContract({ commit }, contract) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .post(`${BASE_URL}/contracts`, contract, config)
        .then((response) => {
          state.contracts.push(response.data);
          commit("setContracts", state.contracts);
          router.push("/contracts");
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  updateContract({ commit }, payload) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .put(`${BASE_URL}/contracts/${payload.contract.id}`, payload, config)
        .then((response) => {
          commit("setContractUpdate", response.data);
          router.push("/contracts");
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  deleteContract({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .delete(`${BASE_URL}/contracts/${id}`, config)
        .then((response) => {
          commit("setDeleteContract", id);
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  fetchUserContracts({ commit }, user_id) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/user_contracts/${user_id}`, config)
      .then((response) => {
        const formatedContracts = response.data.data.map((contract) => {
          return {
            id: contract.id,
            client_id: contract.attributes["client-id"],
            client_name: contract.attributes["client-name"],
            land_id: contract.attributes["land_id"],
            land_code: contract.attributes["land-code"],
            contract_date: contract.attributes["contract-date"],
            type: contract.attributes["contract-type"],
            total_price: contract.attributes["total-price"],
            total_paid: contract.attributes["total-paid"],
            down_payment: contract.attributes["down-payment"],
            monthly_payment: contract.attributes["monthly-payment"],
            yearly_payment: contract.attributes["yearly-payment"],
            months: contract.attributes["months"],
            penalty_interest: contract.attributes["penalty-interest"],
            extraordinary_payment: contract.attributes["extraordinary-payment"],
            payments: contract.attributes["payments"],
            progress:
              (contract.attributes["total-paid"] * 100) /
              contract.attributes["total-price"],
          };
        });
        commit("setUserContracts", formatedContracts);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchPaymentsByMonth({ commit }) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/current_month_payments`, config)
        .then((response) => {
          const formatedPayments = response.data;
          commit("setPaymentsByMonth", formatedPayments);
          resolve(formatedPayments);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  fetchLandsSold({ commit }) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/lands_sold`, config)
        .then((response) => {
          const formatedLandsSold = response.data;
          commit("setLandsSold", formatedLandsSold);
          resolve(formatedLandsSold);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  fetchTotalPaid({ commit }) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/total_paid`, config)
        .then((response) => {
          const formatedTotalPaid = response.data;
          commit("setTotalPaid", formatedTotalPaid);
          resolve(formatedTotalPaid);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  fetchContractPdf({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/contracts/${id}/preview_template`, config)
        .then((response) => {
          const rawHtml = response.data.html;
          commit("setContractPdf", rawHtml);
          resolve(rawHtml);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  fetchContractTemplate({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/contracts/${id}/preview_template`, config)
        .then((response) => {
          resolve(response.data.html);
        })
        .catch((error) => {
          console.error("Error cargando plantilla:", error);
          reject(error);
        });
    });
  },

  generateContractPdf({ commit }, { id, html_content }) {
    return new Promise((resolve, reject) => {
      const config = {
        responseType: "blob", // MUY IMPORTANTE para descargar archivos
        headers: {
          Authorization: localStorage.getItem("auth_token"),
          Accept: "application/pdf",
        },
      };
      axios
        .post(
          `${BASE_URL}/contracts/${id}/generate_custom_pdf.pdf`,
          { html_content },
          config
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error generando PDF:", error);
          reject(error);
        });
    });
  },
  saveContractVersion({ commit }, { id, html_content }) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .post(
          `${BASE_URL}/contracts/${id}/save_version`,
          { html_content },
          config
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error guardando versión:", error);
          reject(error);
        });
    });
  },
};

const mutations = {
  setContracts(state, contracts) {
    state.contracts = contracts;
  },
  setContract(state, contract) {
    state.contract = contract;
  },
  setContractUpdate(state, contract) {
    const index = state.contracts.findIndex((c) => c.id === contract.id);
    if (index !== -1) {
      state.contracts.splice(index, 1, contract);
    }
  },
  setDeleteContract(state, id) {
    const index = state.contracts.findIndex((c) => c.id === id);
    if (index !== -1) {
      state.contracts.splice(index, 1);
    }
  },
  setUserContracts(state, contracts) {
    state.contracts = contracts;
  },
  setPaymentsByMonth(state, payments) {
    state.payments_by_month = payments;
  },
  setLandsSold(state, lands_sold) {
    state.lands_sold = lands_sold;
  },
  setTotalPaid(state, payments) {
    state.total_paid = payments;
  },
  setContractPdf(state, pdf) {
    state.pdf_content = pdf;
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
