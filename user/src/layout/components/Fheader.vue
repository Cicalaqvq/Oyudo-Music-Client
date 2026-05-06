<template>
  <el-card
      :body-style="{
      display: 'flex',
      'box-shadow': '0',
      'justify-content': 'space-between',
      border: 'none',
      'align-items': 'center',
      padding: '5px',
      '--el-card-border-color': 'transparent',
    }"
  >
    <div class="header-left">
      <div class="search">
        <el-form-item>
          <el-input
              v-model="searchValue"
              placeholder="搜索歌曲..."
              prefix-icon="Search"
              @keydown.enter="handleSearch"
          />
        </el-form-item>
      </div>
    </div>
    <div class="header-right">
      <el-dropdown v-if="userInfo">
        <span class="dropdown">
          <el-avatar
              :src="userInfo.userAvatar || '/defaultAvatar.png'"
              class="avatar"
          />
          <span style="margin-left: 5px">{{ userInfo.username }}</span>
          <el-icon class="el-icon--right">
            <arrow-down/>
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/user')">个人信息</el-dropdown-item>
            <el-dropdown-item @click="dialogVisible = true">意见反馈</el-dropdown-item>
            <el-dropdown-item @click="userLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div v-else>
        <el-button
            style="border-radius: 10px; margin-right: 10px"
            type="primary"
            @click="openLoginDialog"
        >
          <el-icon>
            <UserFilled/>
          </el-icon>
          <span class="redirect-button">登录</span>
        </el-button>
      </div>
    </div>
    <el-dialog align-center v-model="dialogVisible" title="意见反馈" width="400px">
      <el-form ref="feedbackFormRef" :model="feedbackForm" :rules="rules" label-position="right" label-width="auto">
        <el-form-item label="反馈内容" prop="feedback">
          <el-input v-model="feedbackForm.feedback" autocomplete="off" placeholder="请输入反馈内容..." type="textarea"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseDialog">取消</el-button>
        <el-button v-loading="loading" type="primary" @click="handleCommit">提交</el-button>
      </template>
    </el-dialog>
    <login-dialog ref="loginRef"></login-dialog>
  </el-card>
</template>
<script setup>
import {computed, reactive, ref, watch} from "vue";
import {UserFilled} from "@element-plus/icons-vue";
import {message, messageBox} from "../../utils/message.js";
import LoginDialog from "./LoginDialog.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {addFeedback} from "../../api/manage.js";

const router = useRouter();
const store = useStore();
const loginRef = ref(null);
const feedbackFormRef = ref(null);
const searchValue = ref("");
const dialogVisible = ref(false);
const loading = ref(false);
const feedbackForm = reactive({
  feedback: null,
});
const rules = {
  feedback: [
    {
      required: true,
      message: "请输入反馈内容",
      trigger: "blur",
    },
  ],
};
const userInfo = computed(() => store.state.USER_INFO);

const handleSearch = async () => {
  if (searchValue.value != null && searchValue.value !== "") {
    await router.push({
      path: "/library",
      query: {
        name: searchValue.value,
      },
      replace: true,
    });
  } else {
    await router.push("/library")
  }
};

const userLogout = () => {
  messageBox("确定要退出登录吗？", "提示", "warning", true).then(async () => {
    await router.push("/");
    await store.dispatch("userLogout");
  });
};

const openLoginDialog = () => {
  loginRef.value.handleOpen();
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
  feedbackFormRef.value?.resetFields();
};

const handleCommit = () => {
  loading.value = true;
  feedbackFormRef.value.validate().then(async () => {
    const res = await addFeedback(feedbackForm);
    if (res.data.code === 200) {
      message("提交成功！");
      handleCloseDialog();
    }
    loading.value = false;
  });
};

watch(
    () => store.state.IS_LOGIN,
    (newVal) => {
      if (!newVal && loginRef.value && store.state.SHOW_LOGIN_DIALOG) {
        loginRef.value.handleOpen();
      }
    },
    {immediate: true},
);
</script>
<style scoped>
.header-left {
  display: flex;
  align-items: center;

  .search {
    width: 250px;
    transition: width 0.5s ease;

    .el-form-item {
      margin: 0;
    }

    :deep(.el-input__wrapper) {
      background-color: #e3e3e3 !important;
    }
  }

  .search:focus-within {
    width: 300px;
  }

  .icon-btn {
    padding-top: 4px;
    cursor: pointer;
    margin-left: 30px;
  }
}


.header-right {
  display: flex;
  align-items: center;
}

.dropdown {
  @apply flex items-center justify-center mx-5;
  cursor: pointer;
}

.dropdown:focus {
  outline: none;
}

.dropdown:hover {
  background-color: transparent;
}
</style>
