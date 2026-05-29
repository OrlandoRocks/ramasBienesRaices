import axios from "axios";
import router from "@/router/router";
import { formatPaymentFromApi } from "@/util/paymentApi";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

function normalizeContractPayments(payments) {
  return (payments || []).map((payment) => {
    const formatted = formatPaymentFromApi(payment);
    return {
      ...payment,
      ...formatted,
    };
  });
}

function fetchContractPaymentsFromApi(contractId, config) {
  return axios
    .get(`${BASE_URL}/contracts/${contractId}/payments`, config)
    .then((response) => normalizeContractPayments(response.data));
}

function mapClientFromContractResponse(client) {
  if (!client) {
    return null;
  }
  return {
    id: client.id,
    code: client.code || "",
    full_name: client.full_name || "",
    identification_card: client.identification_card || "",
    rfc: client.rfc || "",
    address: client.address || "",
    colony: client.colony || "",
    zip_code: client.zip_code || "",
    phone_number: client.phone_number || "",
    city: client.city || "",
    state: client.state || "",
    country: client.country || "",
    assignee: client.assignee || "",
    email: client.email || "",
    birthday: client.birthday || "",
    nationality: client.nationality || "",
    civil_status: client.civil_status || "",
    spouse: client.spouse || "",
    economic_dependants: client.economic_dependants ?? false,
    home_owner: client.home_owner ?? false,
    occupation: client.occupation || "",
    company: client.company || "",
    company_address: client.company_address || "",
    company_phone: client.company_phone || "",
    monthly_income: client.monthly_income ?? 0,
    monthly_expenses: client.monthly_expenses ?? 0,
    comments: client.comments || "",
    image: client.image || "",
  };
}

function mapLandFromContractResponse(land) {
  if (!land) {
    return null;
  }
  const residentialName =
    land.residential_name ||
    land.residential?.name ||
    "";
  return {
    id: land.id,
    land_code: land.land_code || "",
    address: land.address || "",
    block: land.block || "",
    size: land.size || "",
    price: land.price || "",
    house_number: land.house_number || "",
    residential_id: land.residential_id || land.residential?.id || "",
    residential_name: residentialName,
    client_name: land.client_name || "",
    client_id: land.client_id ?? null,
    contract_id: land.contract_id ?? null,
  };
}
const state = {
  contracts: [],
  contract: {
    id: 0,
    client_id: 0,
    client_name: "",
    land_id: 0,
    land_code: "",
    contract_date: "0000-00-00",
    contract_type: "",
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
};

const getters = {
  getContracts(state) {
    return state.contracts;
  },
  getContractById(state) {
    return state.contract;
  },
  getContractPayments(state) {
    const payments = state.contract.payments || [];
    let total = state.contract.total_price - state.contract.down_payment;
    return payments.map((payment, index) => {
      const row = { ...payment };
      row.total = total;
      total -= Number(row.amount) || 0;
      row.row_number = index + 1;
      return row;
    });
  },
};

const actions = {
  fetchContracts({ commit }) {
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return axios
      .get(`${BASE_URL}/contracts`, config)
      .then((response) => {
        const formatedContracts = response.data.map((contract) => {
          return {
            id: contract.id,
            client_id: contract.client_id,
            client_name: contract.client_name,
            land_id: contract.land_id,
            land_code: contract.land_code,
            land_address: contract.land_address || "",
            contract_date: contract.contract_date,
            contract_type: contract.contract_type,
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
          const mappedClient = mapClientFromContractResponse(contract.client);
          const mappedLand = mapLandFromContractResponse(contract.land);

          if (mappedClient) {
            commit("setClient", mappedClient);
          }
          if (mappedLand) {
            commit("setLand", mappedLand);
          }

          return fetchContractPaymentsFromApi(id, config).then((normalizedPayments) => {
            commit("setContract", {
              id: contract.id,
              client_id: contract.client_id,
              land_id: contract.land_id,
              contract_date: contract.contract_date,
              contract_type: contract.contract_type,
              down_payment: contract.down_payment,
              monthly_payment: contract.monthly_payment,
              total_price: contract.total_price,
              payments: normalizedPayments,
              total_paid: contract.total_paid,
              yearly_payment: contract.yearly_payment,
              months: contract.months,
              penalty_interest: contract.penalty_interest,
              extraordinary_payment: contract.extraordinary_payment,
            });
            resolve({
              ...contract,
              client: mappedClient || contract.client,
              land: mappedLand || contract.land,
              payments: normalizedPayments,
            });
          });
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  createContract({ commit, dispatch }, contract) {
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
          dispatch("fetchLands").finally(() => {
            resolve(response.data);
          });
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
  refreshContractPayments({ commit, state }, contractId) {
    const id = contractId || state.contract?.id;
    if (!id) {
      return Promise.resolve([]);
    }
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    return fetchContractPaymentsFromApi(id, config).then((payments) => {
      commit("mergeContractPayments", payments);
      return payments;
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
};

const mutations = {
  setContracts(state, contracts) {
    state.contracts = contracts;
  },
  setContract(state, contract) {
    state.contract = contract;
  },
  mergeContractPayments(state, payments) {
    if (!state.contract) {
      return;
    }
    state.contract = {
      ...state.contract,
      payments: [...payments],
    };
  },
  updateContractPayment(state, payment) {
    if (!state.contract?.payments?.length) {
      return;
    }
    const formatted = formatPaymentFromApi(payment);
    const index = state.contract.payments.findIndex(
      (row) => String(row.id) === String(formatted.id)
    );
    if (index === -1) {
      return;
    }
    const updated = {
      ...state.contract.payments[index],
      ...formatted,
    };
    state.contract.payments.splice(index, 1, updated);
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
};

export default {
  state,
  getters,
  actions,
  mutations,
};
