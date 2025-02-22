<script setup>
import { RouterLink } from "vue-router";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.module";
import { computed, onMounted } from "vue";

// 移除或確保 useUploadInfo 模組存在（如果不需使用，移除以下行）
// import { useUploadInfo } from "../stores/upload.module"; 
// const uploadTab = useUploadInfo();

const authStore = useAuthStore();
const router = useRouter();

const username = computed(() => authStore.username); // 使用 username 代替 currentUser

function logOut() {
  authStore.logout();
  router.push("/");
}

// 移除不必要的 setSelectedTab 和 alertLogin（如果不需使用）
// function setSelectedTab(tab) {
//   uploadTab.setSelectedTab(tab);
// }

function checkAuth() {
  authStore.checkAuth();
}

// function alertLogin() {
//   if (!username.value) {
//     alert("Please sign in first.");
//     router.push("/signin");
//   }
// }

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <nav class="nav">
    <ul class="navbar-logo">
      <li>
        <RouterLink to="/">
          <img src="../assets/image/logo4.png" alt="ESUN Library Logo" />
        </RouterLink>
      </li>
      <li>
        <RouterLink to="/books" class="nav-link nav-home">
          <strong>ESUN</strong>LiBrarys
        </RouterLink>
      </li>
    </ul>

    <ul class="navbar-nav">
      <li class="nav-item">
        <RouterLink to="/history" class="nav-link">
          <font-awesome-icon icon="book" /> History
        </RouterLink>
      </li>

      <li class="nav-item" v-if="!username">
        <RouterLink to="/signin" class="nav-link">
          <font-awesome-icon icon="sign-in-alt" /> Sign in
        </RouterLink>
      </li>

      <li class="nav-user" v-if="username">
        {{ username || "User" }} <!-- 顯示 username -->
      </li>

      <li class="nav-item" @click.prevent="logOut" v-if="username">
        <a class="nav-link">
          <font-awesome-icon icon="sign-in-alt" /> Sign out
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
@import "../assets/styles/app";
@import "../assets/styles/layout/navbar";
</style>