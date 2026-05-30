import VueRouter from "vue-router";
import routes from "./routes";
import store from "@/store";
import { isAuthTokenValid, clearAuthToken, getAuthToken } from "@/util/auth";
import { canAccessRoute } from "@/util/permissions";
import { getDefaultRouteForUser } from "@/util/userSession";

const router = new VueRouter({
  routes,
  linkActiveClass: "active",
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { x: 0, y: 0 };
  },
});

let profileLoadPromise = null;

function ensureProfileLoaded() {
  if (store.getters.currentUser?.roleName) {
    return Promise.resolve(store.getters.currentUser);
  }

  const token = getAuthToken();
  if (!token || !isAuthTokenValid(token)) {
    return Promise.resolve(null);
  }

  if (!profileLoadPromise) {
    profileLoadPromise = store
      .dispatch("loginUserWithToken", { auth_token: token })
      .then(() => store.getters.currentUser)
      .catch((error) => {
        profileLoadPromise = null;
        clearAuthToken();
        store.commit("resetUserInfo");
        throw error;
      });
  }

  return profileLoadPromise;
}

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const hasToken = isAuthTokenValid();

  const proceed = (user) => {
    const isAuthPage = to.name === "Login" || to.name === "Register";

    if (requiresAuth && !hasToken) {
      clearAuthToken();
      return next({ name: "Login" });
    }

    if (!requiresAuth && hasToken && isAuthPage && user?.roleName) {
      return next(getDefaultRouteForUser(user));
    }

    if (requiresAuth && hasToken && user?.roleName) {
      const target = to.matched[to.matched.length - 1];
      if (!canAccessRoute(user, target)) {
        const fallback = getDefaultRouteForUser(user);
        if (to.name === fallback.name) {
          clearAuthToken();
          store.commit("resetUserInfo");
          return next({ name: "Login" });
        }
        return next({ ...fallback, replace: true });
      }
    }

    next();
  };

  if (
    hasToken &&
    (requiresAuth || to.name === "Login" || to.name === "Register")
  ) {
    ensureProfileLoaded()
      .then((user) => proceed(user))
      .catch(() => next({ name: "Login" }));
    return;
  }

  proceed(store.getters.currentUser);
});

export default router;
