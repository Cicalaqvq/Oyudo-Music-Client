<template>
  <div>
    <el-card :body-style="{ 'padding-bottom': '0px','padding-top': '15px'}" class="search-form">
      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" clearable placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="searchForm.phone" clearable placeholder="请输入手机号码"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" clearable placeholder="请选择状态">
            <el-option :value="0" label="启用"/>
            <el-option :value="1" label="禁用"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 用户列表 -->
    <el-card>
      <div class="flex items-left mb-3">用户列表</div>
      <el-scrollbar height="auto">
        <el-table v-if="userList.length"
                  v-loading="tableLoading"
                  :cell-style="{ 'text-align': 'center' }"
                  :data="userList"
                  :header-cell-style="{ 'text-align': 'center' }"
                  :row-style="{'height':'auto'}"
                  element-loading-text="Loading..."
                  height="613"
                  style="width: 100%"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50"/>
          <el-table-column v-for="column in columns" :key="column.prop" :label="column.label" :prop="column.prop"
                           :width="column.width || 'auto'">
            <template #default="{ row }">
              <el-avatar v-if="column.slot" :src="row.userAvatar" alt="User Avatar">
                <el-image fit="cover"
                          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"/>
              </el-avatar>
              <template v-else>{{ row[column.prop] }}</template>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-switch
                  ref="switchRef"
                  v-model="row.status"
                  v-loading="loading"
                  inline-prompt
                  style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                  @change="(value) => handleStatusChange(row, value)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button size="small" type="text" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="text" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!userList.length" :image-size="200" description="暂无数据"/>
      </el-scrollbar>
      <!-- 批量操作和分页 -->
      <div class="table-footer">
        <div class="flex items-center">
          <el-button :disabled="!selectedRows.length" type="danger" @click="handleDeleteBatch">批量删除</el-button>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
        <el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 30, 40]" :total="total"
                       background
                       layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                       @current-change="handlePageChange"/>
      </div>
    </el-card>
    <!-- 编辑/新增用户的弹窗 -->
    <el-dialog v-model="dialogVisible" :title="editForm.formTitle" width="500px">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="头像" prop="userAvatar">
          <el-image v-show="editForm.userAvatar" :src="editForm.userAvatar" fit="cover"
                    style="width: 80px; height: 80px; border-radius: 50%;"/>
          <el-button v-if="editForm.userAvatar" class="ml-2" @click="openCropper">修改头像</el-button>
          <el-button v-else @click="openCropper">上传头像</el-button>
        </el-form-item>
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="editForm.username" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="密码" prop="password" required>
          <el-input v-model="editForm.password" clearable placeholder="请输入密码" show-password type="password"/>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号码"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" required>
          <el-input v-model="editForm.email" placeholder="请输入邮箱"/>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEdit">取消</el-button>
        <el-button :loading="loading" type="primary" @click="onSubmit">确定</el-button>
      </span>
      </template>
    </el-dialog>
    <img-cropper ref="ImgCropperRef" @crop-complete="handleCropComplete"/>
  </div>


</template>

<script setup>
import {nextTick, onMounted, reactive, ref} from "vue";
import {message, messageBox} from "../../utils/message.js";
import {addUser, deleteUsers, getUserList, updateUser} from "../../api/manage.js";
import {formatDate} from "@vueuse/shared";
import ImgCropper from "../../layout/components/ImgCropper.vue";


// 编辑相关
const dialogVisible = ref(false)

const editForm = reactive({
  id: null,
  formTitle: null,
  username: null,
  password: null,
  phone: null,
  email: null,
  userAvatar: null,
});

const rules = {
  username: [
    {required: true, message: "请输入用户名", trigger: "blur"},
    {min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur"},
  ],
  password: [
    {required: true, message: "请输入密码", trigger: "blur"},
    {min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur"},
  ],
  phone: [
    {pattern: /^1[3456789]\d{9}$/, message: "请输入正确的手机号码", trigger: "blur"},
  ],
  email: [
    {required: true, message: "请输入邮箱", trigger: "blur"},
    {type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"]},
  ],
}

const formRef = ref(null);
const switchRef = ref(null);

// 搜索相关
const searchForm = reactive({
  username: null,
  phone: null,
  status: null,
  pageSize: 10,
  pageNum: 1,
});

// 用户列表数据
const userList = ref([]);

// 分页相关
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);

// 加载数据
const tableLoading = ref(false);
const loading = ref(false);

// 表格列配置
const columns = [
  {label: "用户编号", prop: "id", width: 85},
  {label: "用户头像", prop: "userAvatar", slot: true},
  {label: "用户名", prop: "username"},
  {label: "手机号码", prop: "phone"},
  {label: "邮箱", prop: "email", width: 200},
  {label: "创建时间", prop: "createTime"},
  {label: "修改时间", prop: "updateTime"},
];

// 选中行数据
const selectedRows = ref([]);

// 获取用户数据
const fetchUserList = async () => {
  tableLoading.value = true;
  await getUserList(searchForm).then(res => {
    userList.value = res.data.data.records;
    userList.value.forEach(item => {
      item.createTime = formatDate(new Date(item.createTime), "YYYY-MM-DD HH:mm:ss");
      item.updateTime = formatDate(new Date(item.updateTime), "YYYY-MM-DD HH:mm:ss");
      item.status = item.status === 0;
    });
    total.value = res.data.data.total;
  }).finally(() => {
    tableLoading.value = false;
  })
};

// 搜索
const handleSearch = () => {
  searchForm.pageNum = 1;
  fetchUserList();
};

const handleReset = () => {
  searchForm.username = null;
  searchForm.phone = null;
  searchForm.status = null;
  handleSearch();
};

// 启用禁用
const handleStatusChange = (row, value) => {
  const status = !value ? 1 : 0;
  editForm.id = row.id;
  editForm.status = status;
  loading.value = true;
  updateUser(editForm).then(res => {
    if (res.data.code === 200) {
      if (status === 0) {
        message("用户已启用，可以登录客户端");
      } else {
        message("用户已禁用，禁止登录客户端", 'warning');
      }
    }
  }).finally(() => {
    loading.value = false;
    fetchUserList();
  })
};

// 图片裁剪与上传
const ImgCropperRef = ref(false);

const openCropper = () => {
  ImgCropperRef.value.open(editForm.userAvatar, 0);
};

const handleCropComplete = (imgUrl) => {
  editForm.userAvatar = imgUrl;
};

// 编辑和新增
const handleEdit = (row) => {
  dialogVisible.value = true;
  nextTick(() => {
    editForm.id = row.id;
    editForm.userAvatar = row.userAvatar;
    editForm.formTitle = "编辑用户";
    editForm.username = row.username;
    editForm.password = "************";
    editForm.phone = row.phone;
    editForm.email = row.email;
  })
};

const handleAdd = () => {
  dialogVisible.value = true;
  nextTick(() => {
    editForm.formTitle = "新增用户";
  });
};

const cancelEdit = () => {
  dialogVisible.value = false;
  formRef.value.resetFields();
  return 'done';
};

const onSubmit = () => {
  loading.value = true;
  formRef.value.validate().then((valid) => {
    if (!valid) {
      return false;
    }
    if (editForm.formTitle === "编辑用户") {
      updateUser(editForm).then(res => {
        if (res.data.code === 200) {
          message("用户信息修改成功！")
          cancelEdit();
          fetchUserList();
        }
      })
    }
    if (editForm.formTitle === "新增用户") {
      addUser(editForm).then(res => {
        if (res.data.code === 200) {
          message("用户添加成功！")
          cancelEdit();
          fetchUserList();
        }
      })
    }
  }).finally(() => {
    loading.value = false;
  })
};

// 删除和批量删除
const handleDelete = (row) => {
  messageBox(`确定删除编号为${row.id}的用户吗？删除后对应的评论、收藏等数据都会被删除！`, "删除确认", "warning", true)
      .then(() => {
        const ids = [row.id];
        deleteUsers(ids).then(res => {
          if (res.data.code === 200) {
            message("用户已删除！")
            fetchUserList();
          }
        })
      })
      .catch(() => {
        message("已取消删除", "info");
      });
};

const handleDeleteBatch = () => {
  messageBox("确定批量删除选中的用户吗？删除后对应的评论、收藏、反馈等数据都会被删除！", "删除确认", "warning", true)
      .then(() => {
        const ids = selectedRows.value.map((row) => row.id);
        deleteUsers(ids).then(res => {
          if (res.data.code === 200) {
            message("用户已删除！")
            fetchUserList();
          }
        })
      })
      .catch(() => {
        message("已取消删除", "info");
      });
};


// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page;
  searchForm.pageNum = page;
  fetchUserList();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  searchForm.pageSize = size;
  fetchUserList();
};

// 监听选中行变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

const initData = () => {
  fetchUserList();
};

// 初始化数据
onMounted(() => {
  initData();
});
</script>

<style scoped>

.search-form {
  height: auto;
  margin-bottom: 20px;

  .el-form {
    display: flex;
  }

  .el-input {
    min-width: 300px;
  }

  .el-select {
    min-width: 150px;
  }
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
}

</style>