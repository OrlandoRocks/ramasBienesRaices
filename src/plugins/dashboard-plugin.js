// Polyfills for js features used in the Dashboard but not supported in some browsers (mainly IE)
import "src/polyfills";
// Notifications plugin. Used on Notifications page
import Notifications from "src/components/NotificationPlugin";
// Validation plugin used to validate forms
import * as VeeValidate from "vee-validate";
import { localize } from "vee-validate";
import es from "vee-validate/dist/locale/es.json";
// A plugin file where you could register global components used across the app
import GlobalComponents from "./globalComponents";
// A plugin file where you could register global directives
import GlobalDirectives from "./globalDirectives";
// Sidebar on the right. Used as a local plugin in DashboardLayout.vue
import SideBar from "src/components/SidebarPlugin";
// RTL (right to left plugin to support rtl layout). If you don't need support for rtl, remove this plugin

import RTLPlugin from "./RTLPlugin";
// element ui language configuration
import lang from "element-ui/lib/locale/lang/es";
import locale from "element-ui/lib/locale";
locale.use(lang);
localize("es", es);
// asset imports
import "src/assets/sass/black-dashboard-pro.scss";
import "src/assets/css/nucleo-icons.css";
import "src/assets/css/demo.css";

export default {
  install(Vue) {
    Vue.use(GlobalComponents);
    Vue.use(GlobalDirectives);
    Vue.use(RTLPlugin);
    Vue.use(SideBar);
    Vue.use(Notifications);
    Vue.use(VeeValidate, { fieldsBagName: "veeFields" });
  },
};
