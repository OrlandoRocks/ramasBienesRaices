import Vue from "vue";
import VueRouter from "vue-router";
import RouterPrefetch from "vue-router-prefetch";
import DashboardPlugin from "./plugins/dashboard-plugin";
import App from "./App.vue";
import router from "./router/router";
import store from "./store";
import i18n from "./i18n";
import "./registerServiceWorker";
import currencyMixin from "./util/currency_mixin";
import { getAuthToken, isAuthTokenValid, clearAuthToken } from "@/util/auth";
import { setupAxios, setForbiddenNotifyHandler } from "@/util/setupAxios";
import PermissionsPlugin from "@/plugins/permissions";

setupAxios();
Vue.use(PermissionsPlugin);

Vue.mixin(currencyMixin);

Vue.config.productionTip = false;

Vue.use(DashboardPlugin);
Vue.use(VueRouter);
Vue.use(RouterPrefetch);

const app = new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
  i18n,
  store,
});

setForbiddenNotifyHandler((message) => {
  app.$notify({
    title: "Sin permiso",
    type: "warning",
    message,
    icon: "tim-icons icon-lock-circle",
  });
});

store.commit("restoreUserFromStorage");

const localAuthToken = getAuthToken();
if (localAuthToken && !isAuthTokenValid(localAuthToken)) {
  clearAuthToken();
  store.commit("resetUserInfo");
}


