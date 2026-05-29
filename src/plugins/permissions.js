import { can } from "@/util/permissions";

export default {
  install(Vue) {
    Vue.prototype.$can = function (permission) {
      return can(this.$store.getters.currentUser, permission);
    };
  },
};
