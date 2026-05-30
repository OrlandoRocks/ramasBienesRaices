import {
  can,
  canManageResidentialAssignments,
  canManageClientResidentialLinks,
  canManageUserResidentialAssignments,
} from "@/util/permissions";

export default {
  install(Vue) {
    Vue.prototype.$can = function (permission) {
      return can(this.$store.getters.currentUser, permission);
    };
    Vue.prototype.$canManageResidentialAssignments = function () {
      return canManageResidentialAssignments(this.$store.getters.currentUser);
    };
    Vue.prototype.$canManageClientResidentialLinks = function () {
      return canManageClientResidentialLinks(this.$store.getters.currentUser);
    };
    Vue.prototype.$canManageUserResidentialAssignments = function () {
      return canManageUserResidentialAssignments(
        this.$store.getters.currentUser
      );
    };
  },
};
