import Vue from "vue";
import Router from "vue-router";
// import DashboardLayout from "./../pages/Starter/SampleLayout.vue";
// import Starter from "./../pages/Starter/SamplePage.vue";
import AuthLayout from "@/pages/Pages/AuthLayout";
const Login = () =>
  import(/* webpackChunkName: "pages" */ "src/pages/Pages/Login.vue");
const Register = () =>
  import(/* webpackChunkName: "pages" */ "src/pages/Pages/Register.vue");

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      component: AuthLayout,
      name: "Authentication",
      children: [
        {
          path: "/login",
          name: "Login",
          component: Login,
        },
        {
          path: "/register",
          name: "Register",
          component: Register,
        },
      ],
    },
  ],
  linkActiveClass: "active",
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});
