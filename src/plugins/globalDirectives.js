import clickOutside from "src/directives/click-ouside.js";
import permissions from "src/directives/permission.js";

/**
 * You can register global directives here and use them as a plugin in your main Vue instance
 */

const GlobalDirectives = {
  install(Vue) {
    Vue.directive("click-outside", clickOutside);
    Vue.directive("permission", permissions);
  },
};

export default GlobalDirectives;
