<template>
  <el-card
      :body-style="{'display': 'flex','justify-content': 'space-between','align-items': 'center','padding': '0px'}">
    <div style="padding-left: 20px"> 当前位置：
      <transition mode="out-in" name="fade">
      <span :key="router.currentRoute.value.meta.title">
            {{ router.currentRoute.value.meta.title }}
      </span>
      </transition>
    </div>
    <div class="header-right">
      <el-tooltip class="box-item" content="搜索" effect="light" placement="bottom">
        <el-icon class="icon-btn" @click="handleClickSearch">
          <Search/>
        </el-icon>
      </el-tooltip>
      <el-tooltip :content="!isFullscreen ? '全屏' : '退出全屏'" class="box-item" effect="light" placement="bottom">
        <el-icon class="icon-btn" @click="toggle">
          <FullScreen v-if="!isFullscreen"/>
          <Aim v-else/>
        </el-icon>
      </el-tooltip>
      <el-dropdown class="dropdown" @command="handleCommand">
        <span>
          {{ store.state.ADMIN_INFO.username }}
          <el-icon class="el-icon--right">
            <arrow-down/>
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="rePassword">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>


    </div>
    <el-drawer v-model="drawerVisible" :modal="false" modal-penetrable title="修改密码">
      <el-form ref="formRef" :model="form" :rules="rules" class="demo-ruleForm" label-width="auto" status-icon
               style="max-width: 600px">
        <el-form-item label="旧密码" prop="oldPass">
          <el-input v-model="form.oldPass" autocomplete="off" clearable show-password type="password"/>
        </el-form-item>
        <el-form-item label="新密码" prop="newPass">
          <el-input v-model="form.newPass" autocomplete="off" clearable show-password type="password"/>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input v-model="form.checkPass" autocomplete="off" clearable type="password"/>
        </el-form-item>
      </el-form>


      <template #footer>
        <div class="drawer-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button @click="resetForm">全部重置</el-button>
          <el-button :loading="loading" type="primary" @click="submitForm">
            确认
          </el-button>
        </div>
      </template>
    </el-drawer>
    <el-dialog v-model="dialogVisible" width="300px">
      <el-form style="margin-top: 10px">
        <el-form-item prop="name" size="default">
          <el-input ref="inputRef" v-model="searchForm.name" clearable placeholder="搜索功能"
                    @clear="handleSearchPages"
                    @input="handleSearchPages"
          >
            <template #prefix>
              <el-icon class="el-icon--left">
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <el-scrollbar height="auto">
        <el-table v-if="searchPages.length"
                  ref="table"
                  :cell-style="{'text-align': 'left','padding': '5px','border-bottom': 'none','padding-bottom': '20px'}"
                  :data="searchPages"
                  :row-style="{'height': '20px'}"
                  :show-header="false"
                  border
                  fit
                  height="300"
                  highlight-current-row
                  style="text-align: left"
                  @row-click="handleRowClick"
        >
          <el-table-column>
            <template #default="scope">
              <el-icon>
                <component :is="scope.row.icon"/>
              </el-icon>
              <span style="margin-left: 10px">{{ scope.row.title }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-dialog>
  </el-card>
</template>
<script setup>
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import {useFullscreen} from "@vueuse/core";
import {messageBox, notification} from "../../utils/message.js";
import {updatePassword} from "../../api/manage.js";
import {reactive, ref} from "vue";
import {menuList} from "../../utils/menus.js";
import {removeLoginState} from "../../utils/auth.js";

const {isFullscreen, toggle} = useFullscreen()

const loading = ref(false)
const router = useRouter()
const store = useStore()
const drawerVisible = ref(false)
const form = reactive({
  oldPass: '',
  newPass: '',
  checkPass: ''
})
const formRef = ref(null)
const rules = {
  oldPass: [
    {required: true, message: '请输入密码', trigger: 'blur'},
  ],
  newPass: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能小于6位', trigger: 'blur'}
  ],
  checkPass: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, message: '密码长度不能小于6位', trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPass) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }
    }
  ]
}
const dialogVisible = ref(false)
const searchPages = ref([])
const searchForm = reactive({
  name: null
})
const inputRef = ref(null)

const submitForm = () => {
  formRef.value.validate((valid) => {
    loading.value = true
    if (!valid) {
      loading.value = false
      return false
    }
    updatePassword(form.oldPass, form.newPass).then(async res => {
      if (res.data.code === 200) {
        removeLoginState();
        await router.push('/login');
        drawerVisible.value = false;
        notification('修改密码成功', '请重新登录');
      }
    }).finally(() => {
      loading.value = false;
    })
  })
}
const resetForm = () => {
  formRef.value.resetFields()
}

const handleClickSearch = () => {
  dialogVisible.value = true;
  searchPages.value = menuList;
}

const handleSearchPages = () => {
  searchPages.value = menuList.filter(item => item.title.includes(searchForm.name));
}

const handleRowClick = (row) => {
  router.push(row.path)
  dialogVisible.value = false
}

const handleCommand = (command) => {
  if (command === 'logout') {
    messageBox('确定要退出登录吗？').then(async () => {
      await store.dispatch('adminLogout');
      await router.push('/login');
      notification("退出登录成功", "", "success");
    }).catch(() => {
    })
  }
  if (command === 'rePassword') {
    drawerVisible.value = true
  }
}

</script>
<style scoped>

.header-right {
  @apply flex items-center;
}

.icon-btn {
  @apply flex items-center justify-center hover:bg-blue-100;
  width: 42px;
  height: 64px;
  cursor: pointer;
}


.f-header .dropdown {
  @apply flex items-center justify-center;
  cursor: pointer;
}

.dropdown:hover {
  @apply bg-light-blue-100;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>