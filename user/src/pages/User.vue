<template>
  <el-card :body-class="'user-container'">
    <template #header>
      <div class="user-header">
        <span>个人中心</span>
      </div>
    </template>
    <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-position="top"
    >
      <el-form-item label="头像" prop="userAvatar">
        <el-image
            :src="userForm.userAvatar || '/defaultAvatar.png'"
            fit="cover"
            style="width: 100px; height: 100px"
        />
        <el-button @click="openCropper">更换头像</el-button>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" placeholder="请输入用户名"/>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email" placeholder="请输入邮箱"/>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="userForm.phone" placeholder="请输入联系电话"/>
      </el-form-item>
      <el-form-item label="简介" prop="introduction">
        <el-input
            v-model="userForm.introduction"
            :rows="3"
            maxlength="100"
            placeholder="请输入简介"
            resize="none"
            show-word-limit
            type="textarea"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="user-footer">
        <el-button type="primary" @click="commit">更新信息</el-button>
        <el-button type="danger" @click="reset">注销账号</el-button>
      </div>
    </template>
    <el-dialog
        v-model="showDialogVisible"
        title="验证邮箱"
        width="auto"
        @close="closeDialog"
    >
      <el-form
          ref="authEmailFormRef"
          :model="authEmailForm"
          :rules="authEmailFormRules"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="authEmailForm.email" disabled/>
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input v-model="authEmailForm.code" placeholder="请输入验证码"/>
        </el-form-item>
      </el-form>
    </el-dialog>
    <img-cropper ref="imgCropperRef" @crop-complete="cropComplete"/>
  </el-card>
</template>
<script setup>
import {nextTick, onMounted, reactive, ref} from "vue";
import {useStore} from "vuex";
import {message, messageBox} from "../utils/message.js";
import ImgCropper from "../layout/components/ImgCropper.vue";

const imgCropperRef = ref(null);

const store = useStore();
const userForm = reactive({
  userAvatar: null,
  username: "",
  email: "",
  phone: "",
  introduction: "",
});
const authEmailForm = reactive({
  email: userForm.email,
  code: null,
});
const userFormRef = ref(null);
const authEmailFormRef = ref(null);
const showDialogVisible = ref(false);
const userFormRules = {
  username: [
    {required: true, message: "请输入用户名", trigger: "blur"},
    {min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur"},
  ],
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  phone: [
    {
      pattern: /^1[3456789]\d{9}$/,
      message: "请输入正确的手机号码",
      trigger: ["blur", "change"],
    },
  ],
  introduction: [
    {max: 100, message: "长度不能超过 100 个字符", trigger: "blur"},
  ],
};
const authEmailFormRules = {
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {
      type: "email",
      message: "请输入正确的邮箱地址",
      trigger: ["blur", "change"],
    },
  ],
  code: [{required: true, message: "请输入验证码", trigger: "change"}],
};
const commit = async () => {
  const valid = await userFormRef.value?.validate().catch(() => false);
  if (!valid) {
    return false;
  }
  if (store.state.USER_INFO.email !== userForm.email) {
    messageBox("新的邮箱需要验证，是否继续？", "检测到您修改了邮箱", "warning")
        .then(() => {
          showDialogVisible.value = true;
        })
        .catch(() => {
          userForm.email = store.state.USER_INFO.email;
          message("邮箱信息已恢复", "info");
        });
  } else {
    await store.dispatch("updateUserInfo", userForm);
  }
};

const openCropper = () => {
  imgCropperRef.value.open(0);
};

const cropComplete = (data) => {
  userForm.userAvatar = data;
};

const closeDialog = () => {
  messageBox("邮箱尚未验证，是否退出？", "退出验证确认", "warning").then(() => {
    showDialogVisible.value = false;
    userForm.email = store.state.USER_INFO.email;
    message("邮箱信息已恢复", "info");
  }).catch(() => {
  });
};

const reset = async () => {
  await messageBox("确定要注销账号吗？", "提示", "warning");
  await store.dispatch("userLogout");
};

const initData = () => {
  nextTick(() => {
    if (!store.state.USER_INFO) {
      return;
    }
    Object.assign(userForm, store.state.USER_INFO);
    authEmailForm.email = store.state.USER_INFO.email;
  });
};

onMounted(() => {
  initData();
});
</script>
<style scoped>
.el-card {
  margin: 0 auto;
  width: 1000px !important;
}

.el-card /deep/ .el-card__header {
  border: none;
}

.el-card /deep/ .el-card__footer {
  border: none;
}

.user-header {
  font-weight: bold;
  font-size: 20px;
}

.user-footer {
  display: flex;
  justify-content: space-between;
}
</style>
