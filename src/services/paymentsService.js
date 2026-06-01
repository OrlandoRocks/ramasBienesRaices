import axios from "axios";
import {
  adjustedPaymentsCountFromResponse,
  formatPaymentFromApi,
} from "@/util/paymentApi";

const BASE_URL = process.env.VUE_APP_BACKEND_URL;

function authConfig() {
  return {
    headers: {
      Authorization: localStorage.getItem("auth_token"),
      Accept: "application/json",
    },
  };
}

/**
 * PATCH /payments/:id — server may rebalance other Pendiente rows when amount changes.
 * @returns {{ payment: object, adjustedCount: number, response: import('axios').AxiosResponse }}
 */
export async function updatePayment(id, paymentPayload) {
  const response = await axios.patch(
    `${BASE_URL}/payments/${id}`,
    { payment: paymentPayload },
    authConfig()
  );
  return {
    payment: formatPaymentFromApi(response.data),
    adjustedCount: adjustedPaymentsCountFromResponse(response),
    response,
  };
}

/**
 * GET /contracts/:contractId/payments — full schedule after an amount edit.
 */
export function fetchContractPayments(contractId, config = authConfig()) {
  return axios
    .get(`${BASE_URL}/contracts/${contractId}/payments`, config)
    .then((res) => res.data);
}

export default {
  list() {
    return axios.get(`${BASE_URL}/payments`, authConfig());
  },
  get(id) {
    return axios.get(`${BASE_URL}/payments/${id}`, authConfig());
  },
  patch(id, payment) {
    return updatePayment(id, payment).then(({ response }) => response);
  },
  updatePayment,
  fetchContractPayments,
};
