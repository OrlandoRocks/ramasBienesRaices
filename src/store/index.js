import Vue from "vue";
import Vuex from "vuex";
import sessionManager from "@/store/modules/session_manager";
import residentialManager from "@/store/modules/residential_manager";
import clientManager from "@/store/modules/client_manager";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  getters: {},
  mutations: {},
  actions: {},
  modules: {
    sessionManager,
    residentialManager,
    clientManager,
  },
});
