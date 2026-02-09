import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import { auth } from "@/services/firebase/firebase";

// Lazy loading des vues pour de meilleures performances
const Login = () => import("@/views/LoginRefactored.vue");
const MapPage = () => import("@/views/MapPage.vue");
const NotificationHistoryPage = () => import("@/views/NotificationHistoryPage.vue");

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
  },
  {
    path: "/notifications",
    name: "NotificationHistory",
    component: NotificationHistoryPage,
    meta: { requiresAuth: true }
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
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !currentUser) {
    // Route protégée mais utilisateur non connecté
    next('/login');
  } else if (requiresGuest && currentUser) {
    // Page de connexion mais utilisateur déjà connecté
    next('/map');
  } else {
    next();
  }
});

export default router;
