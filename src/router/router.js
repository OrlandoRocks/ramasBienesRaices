import VueRouter from "vue-router";
import routes from "./routes";

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
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: "Login" });
    } else {
      next();
    }
  } else {
    if (isAuthenticated && to.name === "Login") {
      next({ name: "Dashboard" });
    } else {
      next();
    }
  }
});

export default router;
