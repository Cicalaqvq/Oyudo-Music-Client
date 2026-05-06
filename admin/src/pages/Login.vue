<template>
  <el-row class="min-w-screen min-h-screen bg-indigo-500">
    <el-col :lg="16" :md="12" class="flex items-center justify-center">
      <div>
        <div class="font-bold text-5xl text-light-50 mb-4">欢迎光临</div>
        <div class="text-gray-200 text-sm">此站点是Oyudo Music后台管理地址</div>
      </div>
    </el-col>
    <el-col :lg="8" class="bg-light-50 flex items-center justify-center flex-col">
      <h2 class="font-bold text-3xl text-gray-800">欢迎回来</h2>
      <div class="flex items-center justify-center my-5 text-gray-300 space-x-2">
        <span class="h-[1px] w-16 bg-gray-200"></span>
        <span>账号密码登录</span>
        <span class="h-[1px] w-16 bg-gray-200"></span>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" class="w-[250px]">
        <el-form-item prop="username">
          <el-input v-model="form.username" clearable placeholder="请输入用户名">
            <template #prefix>
              <el-icon>
                <User/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" clearable placeholder="请输入密码" show-password type="password">
            <template #prefix>
              <el-icon>
                <Lock/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" class="w-[250px]" color="#626aef" round type="primary" @click="onSubmit">登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script setup>
import {reactive, ref} from 'vue'
import {useStore} from "vuex";
import {useRouter} from "vue-router";

const store = useStore()
const router = useRouter()


const form = reactive({
  username: "",
  password: ""
})

const formRef = ref(null)
const loading = ref(false)


const rules = {
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
  ]
}

const onSubmit = () => {
  loading.value = true
  formRef.value.validate(async (valid) => {
    if (!valid) {
      return false;
    }
    // 登录
    await store.dispatch('adminLogin', form);
    await store.dispatch('getAdminInfo');
    await router.push('/');
  }).finally(() => {
    loading.value = false;
  })
}


</script>