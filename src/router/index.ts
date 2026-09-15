import { createRouter, createWebHistory } from "vue-router";
import { useAppStore } from "@/stores/app";
import { OPS_URL } from "@/config/env";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
    { path: "/contest", name: "contest", component: () => import("@/views/ContestView.vue") },
    { path: "/login", name: "login", component: () => import("@/views/LoginView.vue"), meta: { guest: true } },
    { path: "/register", name: "register", component: () => import("@/views/RegisterView.vue"), meta: { guest: true } },
    {
      path: "/apply",
      name: "apply",
      component: () => import("@/views/ApplyView.vue"),
      meta: { auth: true, roles: ["user"] },
    },
    {
      path: "/demand",
      name: "demand",
      component: () => import("@/views/DemandView.vue"),
      meta: { auth: true, roles: ["user"] },
    },
    {
      path: "/tracks/:key",
      name: "track-detail",
      component: () => import("@/views/TrackDetailView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/DashboardView.vue"),
      meta: { auth: true, roles: ["user"] },
    },
    { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("@/views/NotFoundView.vue") },
  ],
});

router.beforeEach((to) => {
  const store = useAppStore();
  if (!store.hydrated) store.hydrate();
  const user = store.currentUser;
  if (to.meta.guest && user) {
    if (user.role === "admin" || user.role === "judge") {
      window.location.assign(`${OPS_URL}/login`);
      return false;
    }
    return "/";
  }
  if (to.meta.auth && !user) {
    return { path: "/login", query: { next: to.fullPath } };
  }
  const roles = to.meta.roles as string[] | undefined;
  if (roles && user && !roles.includes(user.role)) {
    if (user.role === "admin" || user.role === "judge") {
      window.location.assign(`${OPS_URL}/login`);
      return false;
    }
    return "/";
  }
  return true;
});

export default router;
