<template>
  <el-card
      :body-style="{'display': 'flex','box-shadow': '0','justify-content': 'space-between','border': 'none','align-items': 'center','padding': '5px','--el-card-border-color': 'transparent'}">
    <div class="header-left">
      <div class="search">
        <el-form-item>
          <el-input v-model="searchValue" placeholder="搜索..." prefix-icon="Search"/>
        </el-form-item>
      </div>
    </div>
    <div class="header-right">
      <el-dropdown v-if="userInfo">
        <span class="dropdown">
        <el-avatar class="avatar"
                   :src="userInfo.userAvatar || '/defaultAvatar.png'"/>
          {{ userInfo.username }}
          <el-icon class="el-icon--right">
          <arrow-down/>
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="">个人中心</el-dropdown-item>
            <el-dropdown-item command="">意见反馈</el-dropdown-item>
            <el-dropdown-item @click="userLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div v-else>
        <el-button style="border-radius: 10px;margin-right: 10px" type="primary" @click="openLoginDialog">
          <el-icon>
            <UserFilled/>
          </el-icon>
          <span class="font">登录</span>
        </el-button>
      </div>
    </div>
    <login-dialog ref="loginRef"></login-dialog>
  </el-card>
</template>
<script setup>
import {computed, ref, watch} from "vue";
import {UserFilled} from '@element-plus/icons-vue'
import {messageBox} from "../../utils/message.js";
import LoginDialog from "./LoginDialog.vue";
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const router = useRouter()
const store = useStore()
const loginRef = ref(null)

const userInfo = computed(() => store.state.USER_INFO)
const userLogout = () => {
  messageBox("确定要退出登录吗？", "提示", "warning", true).then(async () => {
    await router.push("/")
    await store.dispatch("userLogout")
  })
}

const openLoginDialog = () => {
  loginRef.value.handleOpen();
}

watch(() => store.state.IS_LOGIN, (newVal) => {
  if (!newVal && loginRef.value && store.state.SHOW_LOGIN_DIALOG) {
    loginRef.value.handleOpen();
  }
}, {immediate: true});

</script>
<style scoped>
.header-left {
  display: flex;
  align-items: center;

  .search {
    width: 250px;

    .el-form-item {
      margin: 0;
    }

    /deep/ .el-input__wrapper {
      background-color: #e3e3e3 !important;
    }
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