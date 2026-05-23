import VueRouter from "vue-router";
import routes from "./routes";
import store from "@/store";
import { Message } from "element-ui";

// configure router
const router = new VueRouter({
  routes, // short for routes: routes
  linkActiveClass: "active",
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("auth_token");
  const permission = to.meta.permission;
  const hasAccess =
    permission.model === "dashboard"
      ? true
      : store.getters["hasPermission"](permission.model, permission.action);

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: "Login" });
    } else {
      if (!hasAccess) {
        Message.error("No tienes permiso para acceder a esta página.");
        next({ name: "Dashboard" });
      } else {
        next();
      }
    }
  } else {
    if (isAuthenticated && to.name === "Login") {
      next({ name: "Dashboard" });
    } else {
      if (!hasAccess) {
        next({ name: "Dashboard" });
      } else {
        next();
      }
    }
  }
});

export default router;
