import axios from "axios";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

function authConfig() {
  const token = localStorage.getItem("auth_token");
  return {
    headers: {
      Authorization: token,
      Accept: "application/json",
    },
  };
}

export default {
  list() {
    return axios.get(`${BASE_URL}/users`, authConfig());
  },
  get(id) {
    return axios.get(`${BASE_URL}/users/${id}`, authConfig());
  },
  create(payload) {
    return axios.post(`${BASE_URL}/users`, { user: payload }, authConfig());
  },
  update(id, payload) {
    return axios.patch(`${BASE_URL}/users/${id}`, { user: payload }, authConfig());
  },
  remove(id) {
    return axios.delete(`${BASE_URL}/users/${id}`, authConfig());
  },
};
