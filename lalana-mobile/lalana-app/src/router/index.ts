import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { auth } from "@/services/firebase/firebase";

// Lazy loading des vues pour de meilleures performances
const Login = () => import("@/views/LoginRefactored.vue");
const MapPage = () => import("@/views/MapPage.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: "/map",
    name: "Map",
    component: MapPage,
    meta: { requiresAuth: false } // Accessible en mode visiteur
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation Guard pour protéger les routes
router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser;
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  if (requiresGuest && currentUser) {
    next('/map');
  } else {
    next();
  }
});

export default router;
