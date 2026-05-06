<template>
  <el-dialog
      v-model="store.state.SHOW_LOGIN_DIALOG"
      :title="dialogTitle"
      width="500px"
      @close="handleClose"

  >
    <el-tabs
        v-model="activeName"
        @tab-click="handleTabChange"
    >
      <el-tab-pane label="登录" name="login">
        <div
            v-if="loginType === 1"
            style="margin-top: 20px;text-align: center"
        >
          <span style="font-size: 15px">使用验证码登录时，未注册用户将自动注册</span>
        </div>
        <div class="login-form">
          <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules">
            <el-form-item prop="email">
              <el-input
                  v-model="loginForm.email"
                  :prefix-icon="Message"
                  placeholder="邮箱"
              />
            </el-form-item>
            <el-form-item v-if="loginType === 1" prop="code">
              <el-input
                  v-model="loginForm.code"
                  :prefix-icon="Lock"
                  placeholder="验证码"
                  style="max-width: 400px"
                  @keydown.enter="userLogin"
              >
                <template #append>
                  <el-button v-if="!isSendCode" slot="append" @click="sendCode"
                  >获取验证码
                  </el-button
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
                  placeholder="密码"
                  show-password
                  type="password"
                  @keydown.enter="userLogin"
              />
            </el-form-item>
            <div style="padding-bottom: 10px;display: flex; justify-content: space-between">
              <div v-if="loginType === 1">
                <el-button type="text" @click="loginType = 0"
                >使用密码登录
                </el-button
                >
              </div>
              <div v-else>
                <el-button type="text" @click="loginType = 1"
                >使用验证码登录
                </el-button
                >
              </div>
              <el-button style="color: #7f7f7f" type="text" @click="activeName = 'resetPwd'">忘记密码？</el-button>
            </div>
          </el-form>
        </div>
        <div class="login-form-footer">
          <div>
            <el-button v-loading="loading" type="primary" @click="userLogin"
            >登录
            </el-button
            >
          </div>
          <div class="redirect-button">
            没有账户？
            <button style="color: blue" @click="activeName = 'register'">注册</button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="注册" name="register">
        <div class="login-form">
          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules">
            <el-form-item prop="username">
              <el-input
                  v-model="registerForm.username"
                  :prefix-icon="User"
                  placeholder="用户名"
              />
            </el-form-item>
            <el-form-item prop="email">
              <el-input
                  v-model="registerForm.email"
                  :prefix-icon="Message"
                  placeholder="邮箱"
              />
            </el-form-item>
            <el-form-item prop="code">
              <el-input
                  v-model="registerForm.code"
                  :prefix-icon="Lock"
                  placeholder="验证码"
                  style="max-width: 400px"
              >
                <template #append>
                  <el-button v-if="!isSendCode" slot="append" v-loading="sendCodeLoading"
                             @click="sendCode"
                  >获取验证码
                  </el-button
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
            <el-form-item prop="password">
              <el-input
                  v-model="registerForm.password"
                  :prefix-icon="Lock"
                  placeholder="密码"
                  show-password
                  type="password"
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                  v-model="registerForm.confirmPassword"
                  :prefix-icon="Lock"
                  placeholder="确认密码"
                  show-password
                  type="password"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="login-form-footer">
          <div>
            <el-button v-loading="loading" type="primary" @click="userRegister"
            >注册
            </el-button
            >
          </div>
          <div class="redirect-button">
            已有账户？
            <button style="color: blue" @click="activeName = 'login'">登录</button>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="重置密码" name="resetPwd">
        <div class="login-form">
          <el-form ref="resetPwdFormRef" :model="resetPwdForm" :rules="resetPwdRules">
            <el-form-item prop="email">
              <el-input
                  v-model="resetPwdForm.email"
                  :prefix-icon="Message"
                  placeholder="邮箱"
              />
            </el-form-item>
            <el-form-item prop="code">
              <el-input
                  v-model="resetPwdForm.code"
                  :prefix-icon="Lock"
                  placeholder="验证码"
                  style="max-width: 400px"
              >
                <template #append>
                  <el-button v-if="!isSendCode" slot="append" v-loading="sendCodeLoading"
                             @click="sendCode"
                  >获取验证码
                  </el-button
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
            <el-form-item prop="password">
              <el-input
                  v-model="resetPwdForm.newPassword"
                  :prefix-icon="Lock"
                  placeholder="新密码"
                  show-password
                  type="password"
              />
            </el-form-item>
            <el-form-item prop="confirmPassword">
              <el-input
                  v-model="resetPwdForm.confirmPassword"
                  :prefix-icon="Lock"
                  placeholder="确认密码"
                  show-password
                  type="password"
              />
            </el-form-item>
          </el-form>
        </div>
        <div class="login-form-footer">
          <div>
            <el-button v-loading="loading" type="primary" @click="userResetPwd"
            >重置密码
            </el-button
            >
          </div>
          <div class="redirect-button" style="margin-top: 10px">
            记起密码了？
            <button style="color: blue" @click="activeName = 'login'">返回登录</button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>
<script setup>
import {Lock, Message, User} from "@element-plus/icons-vue";
import {useStore} from "vuex";
import {computed, reactive, ref} from "vue";

const store = useStore();
const activeName = ref("login");
const dialogTitle = computed(() => {
  switch (activeName.value) {
    case "login":
      return "登录";
    case "register":
      return "注册";
    case "resetPwd":
      return "重置密码";
  }
})
const loginType = ref(0);
const isSendCode = ref(false);
const loading = ref(false);
const sendCodeLoading = ref(false);
const loginFormRef = ref(null);
const registerFormRef = ref(null);
const resetPwdFormRef = ref(null);
const countDownTime = ref(Date.now() + 2 * 60 * 1000);

const handleOpen = () => {
  activeName.value = "login";
  store.commit("SET_SHOW_LOGIN_DIALOG", true);
};

const handleClose = () => {
  store.commit("SET_SHOW_LOGIN_DIALOG", false);
  loginFormRef.value.resetFields();
  registerFormRef.value.resetFields();
  resetPwdFormRef.value.resetFields();
  activeName.value = "login";
};

const loginForm = reactive({
  email: "",
  password: "",
  code: "",
  type: computed(() => loginType.value)
});

const registerForm = reactive({
  username: "",
  email: "",
  code: "",
  password: "",
  confirmPassword: "",
});

const resetPwdForm = reactive({
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
});

const loginRules = {
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  password: [{required: true, message: "请输入密码", trigger: "blur"}],
  code: [{required: true, message: "请输入验证码", trigger: "blur"}],
};

const registerRules = {
  username: [{required: true, message: "请输入用户名", trigger: "blur"}],
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  code: [{required: true, message: "请输入验证码", trigger: "blur"}],
  password: [{required: true, message: "请输入密码", trigger: "blur"}],
  confirmPassword: [
    {required: true, message: "请输入确认密码", trigger: "blur"},
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
}

const resetPwdRules = {
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  code: [{required: true, message: "请输入验证码", trigger: "blur"}],
  newPassword: [{required: true, message: "请输入密码", trigger: "blur"}],
  confirmPassword: [
    {required: true, message: "请输入确认密码", trigger: "blur"},
    {
      validator: (rule, value, callback) => {
        if (value !== resetPwdForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ]
}

const userLogin = () => {
  loading.value = true;
  loginFormRef.value
      .validate()
      .then(async () => {
        await store.dispatch("userLogin", loginForm);
        await store.dispatch("getUserInfo");
        await store.dispatch("getUserFavoritePlaylists");
        loginFormRef.value.resetFields();
        store.commit("SET_SHOW_LOGIN_DIALOG", false);
      })
      .finally(() => {
        loading.value = false;
      });
};

const userRegister = () => {
  loading.value = true;
  registerFormRef.value
      .validate()
      .then(async () => {
        await store.dispatch("userRegister", registerForm);
        loginForm.email = registerForm.email;
        registerFormRef.value.resetFields();
        activeName.value = "login";
      })
      .finally(() => {
        loading.value = false;
      });
};

const userResetPwd = () => {
  loading.value = true;
  resetPwdFormRef.value.validate().then(async () => {
    await store.dispatch("userResetPwd", resetPwdForm);
    loginForm.email = resetPwdForm.email;
    resetPwdFormRef.value.resetFields();
    activeName.value = "login";
  }).finally(() => {
    loading.value = false;
  });

};

const sendCode = () => {
  let formRef;
  let form;

  switch (activeName.value) {
    case 'login':
      formRef = loginFormRef;
      form = loginForm;
      break;
    case 'register':
      formRef = registerFormRef;
      form = registerForm;
      break;
    case 'resetPwd':
      formRef = resetPwdFormRef;
      form = resetPwdForm;
      break;
    default:
      return;
  }

  sendCodeLoading.value = true;
  formRef.value.validateField("email").then(async () => {
    await store.dispatch("userGetCode", form.email);
    isSendCode.value = true;
    countDownTime.value = Date.now() + 2 * 60 * 1000;
  }).catch((err) => {
    isSendCode.value = true;
    countDownTime.value = err.message;
  }).finally(() => {
    sendCodeLoading.value = false;
  });
};

const handleTabChange = () => {
  isSendCode.value = false;
};

defineExpose({handleOpen});
</script>
<style scoped>
:deep(.el-tabs__content) {
  display: flex;
  justify-content: center;
  text-align: center;
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}

:deep(.el-tabs__nav ) {
  width: 100%;
  display: flex;
  justify-content: center;
}

:deep(.el-tab-pane) {
  width: 75%;
  min-height: 300px;
}

.login-form {

  .el-form {
    padding-top: 20px;
  }

  .el-form-item {
    margin-bottom: 20px;
  }

}

.redirect-button {
  font-size: 14px;
  margin-top: 20px;
  padding-bottom: 20px;
}

.login-form-footer {
  display: flex;
  text-align: center;
  flex-direction: column;

  .el-button {
    width: 100%;
  }
}


</style>
