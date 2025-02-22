<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useAuthStore } from "../stores/auth.module";
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";

const authStore = useAuthStore();
const router = useRouter();

const schema = yup.object().shape({
  phoneNumber: yup.string().required("手機號碼為必填！"), // 確保與後端一致
  password: yup.string().required("密碼為必填！"),
});
const loading = ref(false);
const message = ref("");

const loggedIn = computed(() => authStore.loggedIn); // 使用簡化的 loggedIn

function back() {
  router.go(-1);
}

function register() {
  router.push("/register");
}

function handleLogin(user) {
  loading.value = true;
  authStore
    .login(user)
    .then(() => {
      router.push("/books");
    })
    .catch((error) => {
      loading.value = false;
      message.value = authStore.error?.message || "登入過程中發生意外錯誤。";
    });
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            enable-background="new 0 0 24 24"
            height="24"
            viewBox="0 0 24 24"
            width="24"
          >
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
          <p>登入個人帳號！</p>
          <p>為符合行業規範，您的詳細資訊是必要的。</p>
          <p class="card-line"></p>

          <transition name="fade-up">
            <div
              v-if="message"
              class="login-alert"
              role="alert"
              :class="{ active: message }"
            >
              <font-awesome-icon icon="triangle-exclamation" />
              {{ message }}
            </div>
          </transition>

          <Form @submit="handleLogin" :validation-schema="schema">
            <div class="card-field">
              <label for="phoneNumber">手機號碼</label>
              <Field id="phoneNumber" name="phoneNumber" type="text" class="form-control" placeholder=" " />
              <ErrorMessage name="phoneNumber" class="error-feedback" />
            </div>
            <div class="card-field">
              <label for="password">密碼</label>
              <Field id="password" name="password" type="password" class="form-control" placeholder=" " />
              <ErrorMessage name="password" class="error-feedback" />
            </div>

            <div class="card-button-field">
              <button class="card-button" :disabled="loading">
                <span v-show="loading" class="spinner-border spinner-border-sm"></span>
                登入帳號
              </button>
              <div class="card-line-or">
                <p class="card-line"></p>
              </div>
            </div>
          </Form>

          <p class="card-register" @click="register()">
            還沒有帳號嗎？<span>我要註冊！</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/layout/_card.scss";

.error-feedback {
  color: red;
  margin-top: 5px;
}

.login-alert {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #fad4d1;
  border-radius: 5px;
  color: #d42212;
  padding: 10px 0 10px 15px;
  margin: 20px 0 20px 0;
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>