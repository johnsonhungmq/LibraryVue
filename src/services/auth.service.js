import axios from "axios";
import API_URL from "./Unify_API/API_URL";
axios.defaults.withCredentials = true; // 確保帶上 cookie

class AuthService {
  // 註冊
  register(userData) {
    const data = {
      phoneNumber: userData.phoneNumber,
      userName: userData.userName,
      password: userData.password,
    };
    return axios.post(API_URL + "/api/auth/signup", data, {
      headers: {
        "Content-Type": "application/json", // 發送 JSON 格式
      },
    });
  }

  // 其他方法保持不變...
  // 登入
  async login(user) {
    try {
      const response = await axios.post(API_URL + "/api/auth/signin", {
        phoneNumber: user.phoneNumber,
        password: user.password,
      });
      return response.data; // 後端返回 "Login success"
    } catch (error) {
      throw error;
    }
  }

  // 登出
  async logout() {
    try {
      const response = await axios.post(API_URL + "/api/auth/logout");
      return response.data; // 後端返回 "Logout successful"
    } catch (error) {
      throw error;
    }
  }

  // 檢查身份驗證
  checkAuth() {
    return axios.get(API_URL + "/api/auth/checkAuth");
  }
}

export default new AuthService();