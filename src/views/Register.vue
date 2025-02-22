<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import authService from "../services/auth.service";

const router = useRouter();
const successful = ref(false);
const loading = ref(false);
const message = ref("");
const defaultImageStatus = ref(true); // 定義 defaultImageStatus 為 true，表示使用預設圖片

// 表單驗證規則
const schema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("手機號碼為必填！")
    .min(3, "必須至少 3 個字元！")
    .max(10, "最多 10 個字元！"),
  username: yup
    .string()
    .required("使用者名稱為必填！")
    .min(3, "必須至少 3 個字元！")
    .max(20, "最多 20 個字元！"),
  password: yup
    .string()
    .required("密碼為必填！")
    .min(6, "必須至少 6 個字元！")
    .max(40, "最多 40 個字元！"),
});

function handleRegister(user) {
  loading.value = true;
  message.value = "";
  successful.value = false;

  // 準備數據發送到後端（JSON 格式）
  const data = {
    phoneNumber: user.phoneNumber,
    userName: user.username, // 確保與後端字段一致
    password: user.password,
  };

  authService
    .register(data)
    .then((data) => {
      message.value = data.message || "註冊成功！";
      successful.value = true;
      loading.value = false;
      router.push("/signin");
    })
    .catch((error) => {
      loading.value = false;
      message.value =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      successful.value = false;
    });
}

function back() {
  router.go(-1);
}
</script>

<template>
  <div class="card-container">
    <div class="card-img">
      <img src="../assets/image/test.jpg" alt="" />
    </div>
    <div class="card-form">
      <div class="card-nav">
        <p class="card-nav-svg" @click="back()">
          <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24">
            <rect fill="none" height="24" width="24" />
            <g>
              <polygon points="17.77,3.77 16,2 6,12 16,22 17.77,20.23 9.54,12" />
            </g>
          </svg>
          <span>Back</span>
        </p>
        
      </div>

      <div class="card-context">
        <div>
          <p>註冊個人帳號！</p>
          <p>為符合行業規範，您的詳細資訊是必要的。</p>
          <p class="card-line"></p>
          <Form @submit="handleRegister" :validation-schema="schema">
            <div v-if="!successful">
              <div class="card-field">
                <label for="phoneNumber">手機號碼*</label>
                <Field id="phoneNumber" name="phoneNumber" type="text" class="form-control" placeholder=" " />
                <ErrorMessage name="phoneNumber" class="error-feedback" />
              </div>
              <div class="card-field">
                <label for="username">使用者名稱*</label>
                <Field id="username" name="username" type="text" class="form-control" placeholder=" " /> <!-- 修正 type="username" 為 "text" -->
                <ErrorMessage name="username" class="error-feedback" />
              </div>
              <div class="card-field">
                <label for="password">密碼*</label>
                <Field id="password" name="password" type="password" class="form-control" placeholder=" " />
                <ErrorMessage name="password" class="error-feedback" />
              </div>

              <div class="card-button-field">
                <button class="card-button" :disabled="loading">
                  <span v-show="loading" class="spinner-border spinner-border-sm"></span>
                  註冊帳號
                </button>
              </div>
            </div>
          </Form>

          <div v-if="message" class="alert" :class="successful ? 'alert-success' : 'alert-danger'">
            {{ message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/card";

.error-feedback,
.alert {
  color: red;
  margin-top: 5px;
}

.alert-success {
  color: green;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}
</style>