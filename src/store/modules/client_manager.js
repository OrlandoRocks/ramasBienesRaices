import axios from "axios";
import router from "@/router/router";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

const state = {
  clients: [],
  client: {
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
    birthday: "0000-00-00",
    nationality: "",
    civil_status: "",
    spouse: "",
    economic_dependants: false,
    home_owner: false,
    occupation: "",
    company: "",
    company_address: "",
    company_phone: "",
    monthly_income: 0.0,
    monthly_expenses: 0.0,
    comments: "",
    image: "",
  },
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
    const config = {
      headers: {
        Authorization: localStorage.getItem("auth_token"),
      },
    };
    axios
      .get(`${BASE_URL}/clients`, config)
      .then((response) => {
        const formatedClients = response.data.map((client) => {
          return {
            id: client.id,
            code: client.code,
            full_name: client.full_name,
            identification_card: client.identification_card,
            rfc: client.rfc,
            address: client.address,
            colony: client.colony,
            zip_code: client.zip_code,
            phone_number: client.phone_number,
            city: client.city,
            state: client.state,
            country: client.country,
            assignee: client.assignee,
            email: client.email,
            birthday: client.birthday,
            nationality: client.nationality,
            civil_status: client.civil_status,
            spouse: client.spouse,
            economic_dependants: client.economic_dependants,
            home_owner: client.home_owner,
            occupation: client.occupation,
            company: client.company,
            company_address: client.company_address,
            company_phone: client.company_phone,
            monthly_income: client.monthly_income,
            monthly_expenses: client.monthly_expenses,
            comments: client.comments,
            image: client.image,
          };
        });
        commit("setClients", formatedClients);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  fetchClientById({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .get(`${BASE_URL}/clients/${id}`, config)
        .then((response) => {
          const client = response.data;
          commit("setClient", {
            id: client.id,
            code: client.code,
            full_name: client.full_name,
            identification_card: client.identification_card,
            rfc: client.rfc,
            address: client.address,
            colony: client.colony,
            zip_code: client.zip_code,
            phone_number: client.phone_number,
            city: client.city,
            state: client.state,
            country: client.country,
            assignee: client.assignee,
            email: client.email,
            birthday: client.birthday,
            nationality: client.nationality,
            civil_status: client.civil_status,
            spouse: client.spouse,
            economic_dependants: client.economic_dependants,
            home_owner: client.home_owner,
            occupation: client.occupation,
            company: client.company,
            company_address: client.company_address,
            company_phone: client.company_phone,
            monthly_income: client.monthly_income,
            monthly_expenses: client.monthly_expenses,
            comments: client.comments,
            image: client.image,
          });
          resolve(client);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  createClient({ commit }, client) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .post(`${BASE_URL}/clients`, client, config)
        .then((response) => {
          state.clients.push(response.data);
          commit("setClients", state.clients);
          router.push("/clients");
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  updateClient({ commit }, client) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .put(`${BASE_URL}/clients/${client.id}`, client, config)
        .then((response) => {
          commit("setClientUpdate", response.data);
          router.push("/clients");
          resolve(response.data);
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  },
  deleteClient({ commit }, id) {
    return new Promise((resolve, reject) => {
      const config = {
        headers: {
          Authorization: localStorage.getItem("auth_token"),
        },
      };
      axios
        .delete(`${BASE_URL}/clients/${id}`, config)
        .then((response) => {
          commit("setDeleteClient", id);
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
