import AuthService from "../services/auth.service";
import { defineStore } from "pinia";
import { ref, onMounted } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const loggedIn = ref(false);
  const username = ref(null); // 只存儲 username
  const error = ref(null);

  async function login(userInfo) {
    try {
      if (!userInfo.phoneNumber || !userInfo.password) {
        throw new Error("手機號碼和密碼為必填！");
      }

      const response = await AuthService.login(userInfo);
      if (response.message === "Login success") {
        loggedIn.value = true;
        username.value = response.username; // 從後端獲取 username
      } else {
        throw new Error("登入失敗，請檢查手機號碼或密碼");
      }
    } catch (error) {
      loggedIn.value = false;
      username.value = null;
      error.value = error.message || "登入過程中發生錯誤";
      throw error;
    }
  }

  function logout() {
    AuthService.logout();
    loggedIn.value = false;
    username.value = null; // 清除 username
    error.value = null;
  }

  async function checkAuth() {
    try {
      const response = await AuthService.checkAuth(); // 假設 checkAuth 返回當前使用者
      loggedIn.value = true;
      username.value = response.username || null; // 從後端獲取 username
      error.value = null;
    } catch (error) {
      handleAuthError(error);
    }
  }

  function handleAuthError(error) {
    if (error.response && error.response.status === 401) {
      console.log("Redirecting to login page...", error.response.data);
      error.value = { status: 401, message: "未授權，請重新登入" };
      loggedIn.value = false;
      username.value = null;
      logout();
    } else {
      console.error("發生錯誤:", error.message);
      error.value = { status: 500, message: error.message || "伺服器錯誤" };
    }
  }

  async function register(userData) {
    try {
      if (!userData.phoneNumber || !userData.userName || !userData.password) {
        throw new Error("手機號碼、使用者名稱和密碼為必填！");
      }

      const response = await AuthService.register(userData);
      loggedIn.value = false;
      username.value = null; // 註冊後未登入，清除 username
      error.value = null;
      return response;
    } catch (error) {
      loggedIn.value = false;
      error.value = error.message || "註冊過程中發生錯誤";
      throw error;
    }
  }

  function restoreSession() {
    checkAuth().catch(() => {
      loggedIn.value = false;
      username.value = null;
    });
  }

  onMounted(() => {
    restoreSession();
  });

  return {
    loggedIn,
    username, // 提供 username 給前端使用
    error,
    login,
    logout,
    register,
    checkAuth,
  };
});