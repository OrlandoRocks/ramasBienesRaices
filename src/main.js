import Vue from "vue";
import VueRouter from "vue-router";
import RouterPrefetch from "vue-router-prefetch";
import DashboardPlugin from "./plugins/dashboard-plugin";
import App from "./App.vue";
import router from "./router/router";
import store from "./store";
import i18n from "./i18n";
import "./registerServiceWorker";

Vue.config.productionTip = false;

Vue.use(DashboardPlugin);
Vue.use(VueRouter);
Vue.use(RouterPrefetch);

new Vue({
  el: "#app",
  render: (h) => h(App),
  router,
  i18n,
  store,
});

let localAuthToken = localStorage.getItem("auth_token");
if (localAuthToken && localAuthToken !== "undefined") {
  const payload = localAuthToken.split(".")[1];
  let exp = null;

  if (payload) {
    try {
      const decoded = JSON.parse(atob(payload));
      exp = decoded.exp;
    } catch (error) {
      console.error("Error decodificando el token:", error);
    }
  }

  if (exp) {
    const now = Math.floor(Date.now() / 1000);
    if (now > exp) {
      console.log("El token ha expirado.");
      localStorage.removeItem("auth_token");
    } else {
      console.log("El token es válido.");
      store.dispatch("loginUserWithToken", { auth_token: localAuthToken });
    }
  } else {
    console.log("No se pudo obtener la fecha de expiración del token.");
  }
} else {
  console.log("No hay token en localStorage.");
}
