import axios from "axios";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

function authConfig() {
  return {
    headers: {
      Authorization: localStorage.getItem("auth_token"),
      Accept: "application/json",
    },
  };
}

export default {
  list() {
    return axios.get(`${BASE_URL}/payments`, authConfig());
  },
  get(id) {
    return axios.get(`${BASE_URL}/payments/${id}`, authConfig());
  },
  patch(id, payment) {
    return axios.patch(
      `${BASE_URL}/payments/${id}`,
      {
        payment,
        amount: payment.amount,
      },
      authConfig()
    );
  },
};
