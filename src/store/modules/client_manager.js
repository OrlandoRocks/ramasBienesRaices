import router from "@/router/router";
import {
  listClients,
  getClient,
  createClient as createClientApi,
  updateClient as updateClientApi,
  deleteClient as deleteClientApi,
} from "@/services/clientsService";
import { normalizeClientFromApi } from "@/util/clientApi";
import { emptyDocumentsPayload } from "@/constants/clientDocuments";

const emptyClient = () => ({
  id: 0,
  code: "",
  full_name: "",
  identification_card: "",
  rfc: "",
  address: "",
  colony: "",
  zip_code: "",
  phone_number: "",
  city: "",
  state: "",
  country: "",
  assignee: "",
  email: "",
  birthday: "",
  nationality: "",
  civil_status: "",
  spouse: "",
  economic_dependants: false,
  home_owner: false,
  occupation: "",
  company: "",
  company_address: "",
  company_phone: "",
  monthly_income: 0,
  monthly_expenses: 0,
  comments: "",
  image: "",
  documents: emptyDocumentsPayload(),
  ine_verification_status: "pending",
  tax_document_verification_status: "pending",
  proof_of_address_verification_status: "pending",
  residential_ids: [],
});

const state = {
  clients: [],
  client: emptyClient(),
};

const getters = {
  getClients(state) {
    return state.clients;
  },
  getClientById(state) {
    return state.client;
  },
};

const actions = {
  fetchClients({ commit }) {
    return listClients()
      .then((response) => {
        const formatted = (response.data || []).map(normalizeClientFromApi);
        commit("setClients", formatted);
        return formatted;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  fetchClientById({ commit }, id) {
    return getClient(id)
      .then((response) => {
        const client = normalizeClientFromApi(response.data);
        commit("setClient", client);
        return client;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  createClient({ commit, state }, payload) {
    return createClientApi(payload)
      .then((response) => {
        const client = normalizeClientFromApi(response.data);
        commit("setClients", [...state.clients, client]);
        router.push("/clients");
        return client;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  updateClient({ commit }, payload) {
    const id = payload.id || payload.client?.id;
    return updateClientApi(id, payload)
      .then((response) => {
        const client = normalizeClientFromApi(response.data);
        commit("setClientUpdate", client);
        commit("setClient", client);
        router.push("/clients");
        return client;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
  updateClientProfile({ commit }, payload) {
    const id = payload.id || payload.client?.id;
    return updateClientApi(id, payload).then((response) => {
      const client = normalizeClientFromApi(response.data);
      commit("setClient", client);
      return client;
    });
  },
  deleteClient({ commit }, id) {
    return deleteClientApi(id)
      .then((response) => {
        commit("setDeleteClient", id);
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  },
};

const mutations = {
  setClients(state, clients) {
    state.clients = clients;
  },
  setClient(state, client) {
    state.client = client;
  },
  setClientUpdate(state, client) {
    const index = state.clients.findIndex((c) => c.id === client.id);
    if (index !== -1) {
      state.clients.splice(index, 1, client);
    }
  },
  setDeleteClient(state, id) {
    const index = state.clients.findIndex((c) => c.id === id);
    if (index !== -1) {
      state.clients.splice(index, 1);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};
