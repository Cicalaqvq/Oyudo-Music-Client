<template>
  <el-dialog
    v-model="store.state.SHOW_LOGIN_DIALOG"
    width="20%"
    @close="handleClose"
  >
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="登录" name="login">
        <div
          v-if="loginType === 1"
          style="padding-bottom: 10px; text-align: center"
        >
          <span class="font">使用验证码登录时，未注册用户将自动注册</span>
        </div>
        <div class="login-form">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
            <el-form-item prop="email">
              <el-input
                v-model="loginForm.email"
                :prefix-icon="Message"
                clearable
                placeholder="邮箱"
              />
            </el-form-item>
            <el-form-item v-if="loginType === 1" prop="code">
              <el-input
                v-model="loginForm.code"
                :prefix-icon="Lock"
                clearable
                placeholder="验证码"
                style="max-width: 400px"
              >
                <template #append>
                  <el-button v-if="!isSendCode" slot="append" @click="sendCode"
                    >获取验证码</el-button
                  >
                  <el-button v-else slot="append" disabled>
                    <el-countdown
                      :value="countDownTime"
                      format="ss"
                      value-style="color:#606266;font-size: 16px"
                      @finish="isSendCode = false"
                    />
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item v-else prop="password">
              <el-input
                v-model="loginForm.password"
                :prefix-icon="Lock"
                clearable
                placeholder="密码"
                show-password
                type="password"
              />
            </el-form-item>
            <div style="display: flex; justify-content: space-between">
              <div v-if="loginType === 1">
                <el-button type="text" @click="loginType = 0"
                  >使用密码登录</el-button
                >
              </div>
              <div v-else>
                <el-button type="text" @click="loginType = 1"
                  >使用验证码登录</el-button
                >
              </div>
              <button class="font" @click="openResetPwd">忘记密码？</button>
            </div>
          </el-form>
        </div>
        <div class="login-form-footer">
          <div>
            <el-button v-loading="loading" type="primary" @click="userLogin"
              >登录</el-button
            >
          </div>
          <div class="font" style="margin-top: 10px">
            没有账户？
            <button style="color: blue" @click="openRegister">注册</button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="注册" name="register">注册</el-tab-pane>
      <el-tab-pane label="重置密码" name="resetPwd">重置密码</el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script setup>
import { Lock, Message } from "@element-plus/icons-vue";
import { useStore } from "vuex";
import { reactive, ref } from "vue";
import { message } from "../../utils/message.js";

const store = useStore();
const activeName = ref("login");
const loginType = ref(0);
const isSendCode = ref(false);
const loading = ref(false);
const loginFormRef = ref(null);
const countDownTime = ref(Date.now() + 2 * 60 * 1000);

const handleOpen = () => {
  activeName.value = "login";
  store.commit("SET_SHOW_LOGIN_DIALOG", true);
};

const handleClose = () => {
  store.commit("SET_SHOW_LOGIN_DIALOG", false);
};

const loginForm = reactive({
  email: "",
  password: "",
  code: "",
  type: loginType.value,
});

const loginRules = {
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
  code: [{ required: true, message: "请输入验证码", trigger: "blur" }],
};

const userLogin = () => {
  loading.value = true;
  loginFormRef.value
    .validate()
    .then(async () => {
      await store.dispatch("userLogin", loginForm);
      store.commit("SET_SHOW_LOGIN_DIALOG", false);
      await store.dispatch("getUserInfo");
      await store.dispatch("getUserFavoritePlaylists");
    })
    .finally(() => {
      loading.value = false;
    });
};

const handleClick = (tab, event) => {
  console.log(tab, event);
};

const sendCode = () => {
  loginFormRef.value.validateField("email").then(() => {
    message("验证码发送成功，请查看邮箱");
    isSendCode.value = true;
    countDownTime.value = Date.now() + 2 * 60 * 1000;
  });
};

const openRegister = () => {
  activeName.value = "register";
};

const openResetPwd = () => {
  activeName.value = "resetPwd";
};

defineExpose({ handleOpen });
</script>
<style scoped>
:deep(.el-tabs__content) {
  display: flex;
  justify-content: center;
  text-align: center;
}

.login-form-footer {
  display: flex;
  text-align: center;
  flex-direction: column;

  .el-button {
    width: 70%;
  }
}

.login-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  .font {
    font-size: 12px;
  }
}

:deep(.el-tabs__item) {
  padding-left: 25px;
  margin-left: 25px;
}
</style>
