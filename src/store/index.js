import Vue from "vue";
import Vuex from "vuex";
import sessionManager from "@/store/modules/session_manager";
import residentialManager from "@/store/modules/residential_manager";
import clientManager from "@/store/modules/client_manager";
import expenseManager from "@/store/modules/expense_manager";
import landManager from "@/store/modules/land_manager";
import contractManager from "@/store/modules/contract_manager";
import paymentManager from "@/store/modules/payment_manager";
import balanceManager from "@/store/modules/balance_manager";
import s3 from "@/store/modules/s3";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    s3,
    sessionManager,
    residentialManager,
    landManager,
    clientManager,
    expenseManager,
    contractManager,
    paymentManager,
    balanceManager
  },
});
