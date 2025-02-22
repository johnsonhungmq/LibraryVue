import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Books from "@/views/Books.vue";
import History from "@/views/History.vue";

import Register from "@/views/Register.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/home",
      component: Home,
    },
    {
      path: "/signin",
      name: "signin",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/books",
      name: "books",
      component: Books,
    }, 
    {
      path: "/history",
      name: "history",
      component: History,
    }, 
  ],
});

// router.beforeEach(async (to) => {
//   if (to.meta.requiresAuth) {
//     const roomCode = to.params.roomCode;
//     try {
//       await BoardUploadService.verifyCookie(roomCode)
//     } catch (error) {
//       if (error.response.status !== 200 && to.name !== "BulletinLogin") {
//         console.log("error", error);
//         return { name: "BulletinLogin" };
//       }
//     }
//   }
// });

export default router;
